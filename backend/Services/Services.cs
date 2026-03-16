using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using RentAPlace.API.Models;
using MailKit.Net.Smtp;
using MimeKit;

namespace RentAPlace.API.Services;

public interface IAuthService
{
    string GenerateToken(User user);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _config;
    public AuthService(IConfiguration config) => _config = config;

    public string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
        };
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string HashPassword(string password) => BCrypt.Net.BCrypt.HashPassword(password);
    public bool VerifyPassword(string password, string hash) => BCrypt.Net.BCrypt.Verify(password, hash);
}

public interface IEmailService
{
    Task SendReservationNotificationAsync(string ownerEmail, string ownerName, string guestName, string propertyTitle, DateTime checkIn, DateTime checkOut, decimal totalPrice);
    Task SendReservationStatusUpdateAsync(string guestEmail, string guestName, string propertyTitle, string status);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendReservationNotificationAsync(string ownerEmail, string ownerName, string guestName, string propertyTitle, DateTime checkIn, DateTime checkOut, decimal totalPrice)
    {
        var subject = $"New Reservation for {propertyTitle}";
        var body = $@"
            <h2>New Reservation Received!</h2>
            <p>Dear {ownerName},</p>
            <p>You have a new reservation request for <strong>{propertyTitle}</strong>.</p>
            <ul>
                <li><strong>Guest:</strong> {guestName}</li>
                <li><strong>Check-in:</strong> {checkIn:MMMM dd, yyyy}</li>
                <li><strong>Check-out:</strong> {checkOut:MMMM dd, yyyy}</li>
                <li><strong>Total Price:</strong> ₹{totalPrice:N0}</li>
            </ul>
            <p>Please log in to RentAPlace to confirm or manage this reservation.</p>
        ";
        await SendEmailAsync(ownerEmail, subject, body);
    }

    public async Task SendReservationStatusUpdateAsync(string guestEmail, string guestName, string propertyTitle, string status)
    {
        var subject = $"Reservation {status} - {propertyTitle}";
        var body = $@"
            <h2>Reservation Update</h2>
            <p>Dear {guestName},</p>
            <p>Your reservation for <strong>{propertyTitle}</strong> has been <strong>{status}</strong>.</p>
            <p>Thank you for using RentAPlace!</p>
        ";
        await SendEmailAsync(guestEmail, subject, body);
    }

    private async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        var enabled = _config.GetValue<bool>("Email:Enabled");
        if (!enabled)
        {
            _logger.LogInformation("Email (disabled - would send to {To}): {Subject}", to, subject);
            return;
        }
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("RentAPlace", _config["Email:From"]));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };

            using var client = new SmtpClient();
            await client.ConnectAsync(_config["Email:SmtpHost"], int.Parse(_config["Email:SmtpPort"]!), false);
            await client.AuthenticateAsync(_config["Email:From"], _config["Email:Password"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", to);
        }
    }
}
