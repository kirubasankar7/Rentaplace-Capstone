using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentAPlace.Messaging.Data;
using RentAPlace.Messaging.Models;

namespace RentAPlace.Messaging.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly MessagingDbContext _db;
    public MessagesController(MessagingDbContext db) => _db = db;
    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public class SendMessageDto
    {
        public int ReceiverId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public int PropertyId { get; set; }
        public string PropertyTitle { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }

    [HttpPost]
    public async Task<IActionResult> Send(SendMessageDto dto)
    {
        var senderId = GetUserId();
        var senderName = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
        var msg = new Message
        {
            SenderId = senderId,
            SenderName = senderName,
            ReceiverId = dto.ReceiverId,
            ReceiverName = dto.ReceiverName,
            PropertyId = dto.PropertyId,
            PropertyTitle = dto.PropertyTitle,
            Content = dto.Content
        };
        _db.Messages.Add(msg);
        await _db.SaveChangesAsync();
        return Ok(msg);
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var userId = GetUserId();
        var messages = await _db.Messages
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .ToListAsync();

        var conversations = messages
            .GroupBy(m => new
            {
                OtherId = m.SenderId == userId ? m.ReceiverId : m.SenderId,
                OtherName = m.SenderId == userId ? m.ReceiverName : m.SenderName,
                m.PropertyId,
                m.PropertyTitle
            })
            .Select(g => new
            {
                OtherId = g.Key.OtherId,
                OtherName = g.Key.OtherName,
                PropertyId = g.Key.PropertyId,
                PropertyTitle = g.Key.PropertyTitle,
                LastMessage = g.OrderByDescending(m => m.SentAt).First().Content,
                LastMessageAt = g.Max(m => m.SentAt),
                UnreadCount = g.Count(m => !m.IsRead && m.ReceiverId == userId)
            })
            .OrderByDescending(c => c.LastMessageAt)
            .ToList();

        return Ok(conversations);
    }

    [HttpGet("{otherUserId}/{propertyId}")]
    public async Task<IActionResult> GetThread(int otherUserId, int propertyId)
    {
        var userId = GetUserId();
        var msgs = await _db.Messages
            .Where(m => m.PropertyId == propertyId &&
                ((m.SenderId == userId && m.ReceiverId == otherUserId) ||
                 (m.SenderId == otherUserId && m.ReceiverId == userId)))
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        // Mark as read
        var unread = msgs.Where(m => m.ReceiverId == userId && !m.IsRead).ToList();
        unread.ForEach(m => m.IsRead = true);
        if (unread.Any()) await _db.SaveChangesAsync();

        return Ok(msgs);
    }
}
