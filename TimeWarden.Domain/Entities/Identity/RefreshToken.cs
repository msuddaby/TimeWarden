using System.ComponentModel.DataAnnotations;

namespace TimeWarden.Domain.Entities.Identity;

public class RefreshToken
{
    [Key]
    public Guid Id { get; set; }
    [MaxLength(128)]
    public string TokenHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public Guid? ReplacedByTokenId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public bool IsActive => RevokedAt == null && ExpiresAt > DateTime.UtcNow;
}