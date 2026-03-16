using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentAPlace.API.Data;
using RentAPlace.API.DTOs;
using RentAPlace.API.Models;

namespace RentAPlace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertiesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public PropertiesController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] PropertySearchDto search)
    {
        var query = _db.Properties
            .Include(p => p.Images)
            .Include(p => p.Features)
            .Include(p => p.Owner)
            .Where(p => p.IsAvailable)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search.Location))
            query = query.Where(p => p.City.ToLower().Contains(search.Location.ToLower()) ||
                                      p.Location.ToLower().Contains(search.Location.ToLower()));

        if (!string.IsNullOrWhiteSpace(search.PropertyType))
            query = query.Where(p => p.PropertyType == search.PropertyType);

        if (search.Guests > 0)
            query = query.Where(p => p.MaxGuests >= search.Guests);

        if (search.MinPrice.HasValue)
            query = query.Where(p => p.PricePerNight >= search.MinPrice.Value);

        if (search.MaxPrice.HasValue)
            query = query.Where(p => p.PricePerNight <= search.MaxPrice.Value);

        if (search.Features != null && search.Features.Any())
            query = query.Where(p => p.Features.Any(f => search.Features.Contains(f.FeatureName)));

        if (search.CheckIn.HasValue && search.CheckOut.HasValue)
        {
            query = query.Where(p => !p.Reservations.Any(r =>
                r.Status != "Cancelled" &&
                r.CheckIn < search.CheckOut && r.CheckOut > search.CheckIn));
        }

        var props = await query.ToListAsync();
        return Ok(props.Select(MapToSummary));
    }

    [HttpGet("top-rated")]
    public async Task<IActionResult> GetTopRated()
    {
        var props = await _db.Properties
            .Include(p => p.Images)
            .Include(p => p.Features)
            .Include(p => p.Owner)
            .Where(p => p.IsAvailable)
            .OrderByDescending(p => p.Rating)
            .Take(8)
            .ToListAsync();
        return Ok(props.Select(MapToSummary));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var p = await _db.Properties
            .Include(p => p.Images.OrderBy(i => i.SortOrder))
            .Include(p => p.Features)
            .Include(p => p.Owner)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (p == null) return NotFound();
        return Ok(MapToDetail(p));
    }

    [HttpPost]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> Create(PropertyCreateDto dto)
    {
        var property = new Property
        {
            OwnerId = GetUserId(),
            Title = dto.Title,
            Description = dto.Description,
            Location = dto.Location,
            City = dto.City,
            PropertyType = dto.PropertyType,
            PricePerNight = dto.PricePerNight,
            MaxGuests = dto.MaxGuests,
            Bedrooms = dto.Bedrooms,
            Bathrooms = dto.Bathrooms
        };
        _db.Properties.Add(property);
        await _db.SaveChangesAsync();

        foreach (var feature in dto.Features)
            _db.PropertyFeatures.Add(new PropertyFeature { PropertyId = property.Id, FeatureName = feature });

        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = property.Id }, MapToSummary(property));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> Update(int id, PropertyUpdateDto dto)
    {
        var property = await _db.Properties.Include(p => p.Features)
            .FirstOrDefaultAsync(p => p.Id == id && p.OwnerId == GetUserId());
        if (property == null) return NotFound();

        property.Title = dto.Title;
        property.Description = dto.Description;
        property.Location = dto.Location;
        property.City = dto.City;
        property.PropertyType = dto.PropertyType;
        property.PricePerNight = dto.PricePerNight;
        property.MaxGuests = dto.MaxGuests;
        property.Bedrooms = dto.Bedrooms;
        property.Bathrooms = dto.Bathrooms;
        property.IsAvailable = dto.IsAvailable;

        _db.PropertyFeatures.RemoveRange(property.Features);
        foreach (var feature in dto.Features)
            _db.PropertyFeatures.Add(new PropertyFeature { PropertyId = property.Id, FeatureName = feature });

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> Delete(int id)
    {
        var property = await _db.Properties.FirstOrDefaultAsync(p => p.Id == id && p.OwnerId == GetUserId());
        if (property == null) return NotFound();
        _db.Properties.Remove(property);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/images")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> UploadImages(int id, [FromForm] List<IFormFile> files)
    {
        var property = await _db.Properties.FirstOrDefaultAsync(p => p.Id == id && p.OwnerId == GetUserId());
        if (property == null) return NotFound();

        var uploadsPath = Path.Combine(_env.WebRootPath, "uploads");
        Directory.CreateDirectory(uploadsPath);

        var existingCount = await _db.PropertyImages.CountAsync(i => i.PropertyId == id);
        var addedUrls = new List<string>();

        foreach (var file in files.Take(5 - existingCount))
        {
            if (file.Length > 0)
            {
                var ext = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(uploadsPath, fileName);
                using var stream = new FileStream(filePath, FileMode.Create);
                await file.CopyToAsync(stream);
                var url = $"/uploads/{fileName}";
                _db.PropertyImages.Add(new PropertyImage
                {
                    PropertyId = id,
                    ImageUrl = url,
                    IsMain = existingCount == 0 && addedUrls.Count == 0,
                    SortOrder = existingCount + addedUrls.Count + 1
                });
                addedUrls.Add(url);
            }
        }
        await _db.SaveChangesAsync();
        return Ok(new { urls = addedUrls });
    }

    [HttpGet("owner")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> GetOwnerProperties()
    {
        var ownerId = GetUserId();
        var props = await _db.Properties
            .Include(p => p.Images)
            .Include(p => p.Features)
            .Include(p => p.Owner)
            .Where(p => p.OwnerId == ownerId)
            .ToListAsync();
        return Ok(props.Select(MapToSummary));
    }

    private static PropertySummaryDto MapToSummary(Property p) => new()
    {
        Id = p.Id,
        Title = p.Title,
        Location = p.Location,
        City = p.City,
        PropertyType = p.PropertyType,
        PricePerNight = p.PricePerNight,
        MaxGuests = p.MaxGuests,
        Rating = p.Rating,
        ReviewCount = p.ReviewCount,
        IsAvailable = p.IsAvailable,
        MainImageUrl = p.Images.FirstOrDefault(i => i.IsMain)?.ImageUrl ?? p.Images.FirstOrDefault()?.ImageUrl,
        OwnerId = p.OwnerId,
        OwnerName = p.Owner != null ? $"{p.Owner.FirstName} {p.Owner.LastName}" : "",
        Features = p.Features.Select(f => f.FeatureName).ToList()
    };

    private static PropertyDetailDto MapToDetail(Property p) => new()
    {
        Id = p.Id,
        Title = p.Title,
        Description = p.Description,
        Location = p.Location,
        City = p.City,
        PropertyType = p.PropertyType,
        PricePerNight = p.PricePerNight,
        MaxGuests = p.MaxGuests,
        Bedrooms = p.Bedrooms,
        Bathrooms = p.Bathrooms,
        Rating = p.Rating,
        ReviewCount = p.ReviewCount,
        IsAvailable = p.IsAvailable,
        MainImageUrl = p.Images.FirstOrDefault(i => i.IsMain)?.ImageUrl ?? p.Images.FirstOrDefault()?.ImageUrl,
        ImageUrls = p.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).ToList(),
        OwnerId = p.OwnerId,
        OwnerName = p.Owner != null ? $"{p.Owner.FirstName} {p.Owner.LastName}" : "",
        Features = p.Features.Select(f => f.FeatureName).ToList()
    };
}
