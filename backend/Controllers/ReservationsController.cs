using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentAPlace.API.Data;
using RentAPlace.API.DTOs;
using RentAPlace.API.Models;
using RentAPlace.API.Services;

namespace RentAPlace.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReservationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;

    public ReservationsController(AppDbContext db, IEmailService email)
    {
        _db = db;
        _email = email;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> Create(ReservationCreateDto dto)
    {
        var property = await _db.Properties.Include(p => p.Owner).FirstOrDefaultAsync(p => p.Id == dto.PropertyId);
        if (property == null) return NotFound(new { message = "Property not found." });
        if (!property.IsAvailable) return BadRequest(new { message = "Property not available." });

        // Check for conflicting reservations
        var conflict = await _db.Reservations.AnyAsync(r =>
            r.PropertyId == dto.PropertyId &&
            r.Status != "Cancelled" &&
            r.CheckIn < dto.CheckOut && r.CheckOut > dto.CheckIn);
        if (conflict) return BadRequest(new { message = "Property already reserved for the selected dates." });

        var nights = (dto.CheckOut - dto.CheckIn).Days;
        if (nights <= 0) return BadRequest(new { message = "Check-out must be after check-in." });

        var reservation = new Reservation
        {
            UserId = GetUserId(),
            PropertyId = dto.PropertyId,
            CheckIn = dto.CheckIn,
            CheckOut = dto.CheckOut,
            Guests = dto.Guests,
            TotalPrice = property.PricePerNight * nights
        };
        _db.Reservations.Add(reservation);
        await _db.SaveChangesAsync();

        // Send email notification to owner
        if (property.Owner != null)
        {
            var user = await _db.Users.FindAsync(GetUserId());
            _ = _email.SendReservationNotificationAsync(
                property.Owner.Email,
                $"{property.Owner.FirstName} {property.Owner.LastName}",
                user != null ? $"{user.FirstName} {user.LastName}" : "Guest",
                property.Title, dto.CheckIn, dto.CheckOut, reservation.TotalPrice);
        }

        return CreatedAtAction(nameof(GetById), new { id = reservation.Id }, MapToDto(reservation, property, null));
    }

    [HttpGet]
    public async Task<IActionResult> GetMyReservations()
    {
        var userId = GetUserId();
        var role = User.FindFirstValue(ClaimTypes.Role);
        
        IQueryable<Reservation> query = _db.Reservations
            .Include(r => r.Property).ThenInclude(p => p.Images)
            .Include(r => r.User);

        query = role == "Owner"
            ? query.Where(r => r.Property.OwnerId == userId)
            : query.Where(r => r.UserId == userId);

        var reservations = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return Ok(reservations.Select(r => MapToDto(r, r.Property, r.User)));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        var r = await _db.Reservations
            .Include(r => r.Property).ThenInclude(p => p.Images)
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id && (r.UserId == userId || r.Property.OwnerId == userId));
        if (r == null) return NotFound();
        return Ok(MapToDto(r, r.Property, r.User));
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> UpdateStatus(int id, ReservationStatusDto dto)
    {
        var ownerId = GetUserId();
        var reservation = await _db.Reservations
            .Include(r => r.Property)
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id && r.Property.OwnerId == ownerId);
        if (reservation == null) return NotFound();

        reservation.Status = dto.Status;
        await _db.SaveChangesAsync();

        if (reservation.User != null)
            _ = _email.SendReservationStatusUpdateAsync(
                reservation.User.Email,
                $"{reservation.User.FirstName} {reservation.User.LastName}",
                reservation.Property.Title, dto.Status);

        return Ok(MapToDto(reservation, reservation.Property, reservation.User));
    }

    private static ReservationDto MapToDto(Reservation r, Property? p, User? u) => new()
    {
        Id = r.Id,
        PropertyId = r.PropertyId,
        PropertyTitle = p?.Title ?? "",
        PropertyLocation = p != null ? $"{p.Location}, {p.City}" : "",
        PropertyImage = p?.Images.FirstOrDefault(i => i.IsMain)?.ImageUrl ?? p?.Images.FirstOrDefault()?.ImageUrl,
        UserId = r.UserId,
        UserName = u != null ? $"{u.FirstName} {u.LastName}" : "",
        UserEmail = u?.Email ?? "",
        CheckIn = r.CheckIn,
        CheckOut = r.CheckOut,
        Guests = r.Guests,
        TotalPrice = r.TotalPrice,
        Status = r.Status,
        CreatedAt = r.CreatedAt
    };
}
