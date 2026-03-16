using Microsoft.EntityFrameworkCore;
using RentAPlace.Messaging.Models;

namespace RentAPlace.Messaging.Data;

public class MessagingDbContext : DbContext
{
    public MessagingDbContext(DbContextOptions<MessagingDbContext> options) : base(options) { }
    public DbSet<Message> Messages { get; set; }
}
