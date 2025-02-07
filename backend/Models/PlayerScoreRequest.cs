namespace backend.Models
{
    public record PlayerScoreRequest
    {
        public string? PlayerName { get; set; }
        public int Score { get; set; }
    }
}