using Microsoft.EntityFrameworkCore;
using RentAPlace.API.Models;

namespace RentAPlace.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Property> Properties { get; set; }
    public DbSet<PropertyImage> PropertyImages { get; set; }
    public DbSet<PropertyFeature> PropertyFeatures { get; set; }
    public DbSet<Reservation> Reservations { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Property>()
            .HasOne(p => p.Owner)
            .WithMany(u => u.Properties)
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PropertyImage>()
            .HasOne(i => i.Property)
            .WithMany(p => p.Images)
            .HasForeignKey(i => i.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PropertyFeature>()
            .HasOne(f => f.Property)
            .WithMany(p => p.Features)
            .HasForeignKey(f => f.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reservations)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Reservation>()
            .HasOne(r => r.Property)
            .WithMany(p => p.Reservations)
            .HasForeignKey(r => r.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Property>()
            .Property(p => p.PricePerNight)
            .HasPrecision(10, 2);

        modelBuilder.Entity<Reservation>()
            .Property(r => r.TotalPrice)
            .HasPrecision(10, 2);

        // Seed data
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword("password123");

        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, FirstName = "Alice", LastName = "Renter", Email = "user@rentaplace.com", PasswordHash = hashedPassword, Role = "User", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 2, FirstName = "Bob", LastName = "Owner", Email = "owner@rentaplace.com", PasswordHash = hashedPassword, Role = "Owner", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<Property>().HasData(
            new Property { Id = 1, OwnerId = 2, Title = "Luxury Beachfront Villa", Description = "Stunning villa with direct beach access. Enjoy breathtaking ocean views from every room.", Location = "Kovalam Beach Road", City = "Chennai", PropertyType = "Villa", PricePerNight = 15000, MaxGuests = 8, Bedrooms = 4, Bathrooms = 3, Rating = 4.8, ReviewCount = 24, IsAvailable = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Property { Id = 2, OwnerId = 2, Title = "Modern City Apartment", Description = "Stylish apartment in the heart of the city with stunning skyline views.", Location = "Anna Nagar", City = "Chennai", PropertyType = "Apartment", PricePerNight = 4500, MaxGuests = 4, Bedrooms = 2, Bathrooms = 2, Rating = 4.5, ReviewCount = 18, IsAvailable = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Property { Id = 3, OwnerId = 2, Title = "Cozy Garden Flat", Description = "Charming flat with a private garden, perfect for a relaxing getaway.", Location = "Velachery", City = "Chennai", PropertyType = "Flat", PricePerNight = 2500, MaxGuests = 2, Bedrooms = 1, Bathrooms = 1, Rating = 4.3, ReviewCount = 12, IsAvailable = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Property { Id = 4, OwnerId = 2, Title = "Hill View Heritage Home", Description = "Traditional heritage property with modern amenities and panoramic hill views.", Location = "Ooty Road", City = "Coimbatore", PropertyType = "House", PricePerNight = 8000, MaxGuests = 6, Bedrooms = 3, Bathrooms = 2, Rating = 4.9, ReviewCount = 31, IsAvailable = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Property { Id = 5, OwnerId = 2, Title = "Pool Side Apartment", Description = "Modern apartment complex with a stunning rooftop pool and city views.", Location = "Race Course", City = "Coimbatore", PropertyType = "Apartment", PricePerNight = 5500, MaxGuests = 4, Bedrooms = 2, Bathrooms = 2, Rating = 4.7, ReviewCount = 22, IsAvailable = true, CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<PropertyFeature>().HasData(
            new PropertyFeature { Id = 1, PropertyId = 1, FeatureName = "Pool" },
            new PropertyFeature { Id = 2, PropertyId = 1, FeatureName = "BeachFacing" },
            new PropertyFeature { Id = 3, PropertyId = 1, FeatureName = "WiFi" },
            new PropertyFeature { Id = 4, PropertyId = 1, FeatureName = "AirConditioning" },
            new PropertyFeature { Id = 5, PropertyId = 2, FeatureName = "WiFi" },
            new PropertyFeature { Id = 6, PropertyId = 2, FeatureName = "AirConditioning" },
            new PropertyFeature { Id = 7, PropertyId = 2, FeatureName = "Parking" },
            new PropertyFeature { Id = 8, PropertyId = 3, FeatureName = "Garden" },
            new PropertyFeature { Id = 9, PropertyId = 3, FeatureName = "WiFi" },
            new PropertyFeature { Id = 10, PropertyId = 4, FeatureName = "Garden" },
            new PropertyFeature { Id = 11, PropertyId = 4, FeatureName = "Parking" },
            new PropertyFeature { Id = 12, PropertyId = 4, FeatureName = "WiFi" },
            new PropertyFeature { Id = 13, PropertyId = 5, FeatureName = "Pool" },
            new PropertyFeature { Id = 14, PropertyId = 5, FeatureName = "WiFi" },
            new PropertyFeature { Id = 15, PropertyId = 5, FeatureName = "Gym" },
            new PropertyFeature { Id = 16, PropertyId = 5, FeatureName = "Parking" }
        );

        modelBuilder.Entity<PropertyImage>().HasData(
            new PropertyImage { Id = 1, PropertyId = 1, ImageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800", IsMain = true, SortOrder = 1 },
            new PropertyImage { Id = 2, PropertyId = 1, ImageUrl = "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800", IsMain = false, SortOrder = 2 },
            new PropertyImage { Id = 3, PropertyId = 1, ImageUrl = "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800", IsMain = false, SortOrder = 3 },
            new PropertyImage { Id = 4, PropertyId = 1, ImageUrl = "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800", IsMain = false, SortOrder = 4 },
            new PropertyImage { Id = 5, PropertyId = 2, ImageUrl = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", IsMain = true, SortOrder = 1 },
            new PropertyImage { Id = 6, PropertyId = 2, ImageUrl = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", IsMain = false, SortOrder = 2 },
            new PropertyImage { Id = 7, PropertyId = 2, ImageUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", IsMain = false, SortOrder = 3 },
            new PropertyImage { Id = 8, PropertyId = 3, ImageUrl = "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", IsMain = true, SortOrder = 1 },
            new PropertyImage { Id = 9, PropertyId = 3, ImageUrl = "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800", IsMain = false, SortOrder = 2 },
            new PropertyImage { Id = 10, PropertyId = 4, ImageUrl = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800", IsMain = true, SortOrder = 1 },
            new PropertyImage { Id = 11, PropertyId = 4, ImageUrl = "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800", IsMain = false, SortOrder = 2 },
            new PropertyImage { Id = 12, PropertyId = 4, ImageUrl = "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800", IsMain = false, SortOrder = 3 },
            new PropertyImage { Id = 13, PropertyId = 5, ImageUrl = "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800", IsMain = true, SortOrder = 1 },
            new PropertyImage { Id = 14, PropertyId = 5, ImageUrl = "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=800", IsMain = false, SortOrder = 2 }
        );
    }
}
