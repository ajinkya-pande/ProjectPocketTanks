using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Controllers 
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlayerController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public PlayerController(ApplicationDbContext db)
        {
            _db = db;
        }

        // Register player's name
        [HttpPost("new-players")]
        public async Task<IActionResult> RegisterPlayer([FromBody] PlayerNameRequest? request)
        {
            if (request == null)
            {
                return BadRequest();
            }

            var player1 = await _db.UserProfiles.FirstOrDefaultAsync(u => u.PlayerName == request.Player1Name);
            var player2 = await _db.UserProfiles.FirstOrDefaultAsync(u => u.PlayerName == request.Player2Name);

            if (player1 != null)
            {
                return BadRequest(new {message = "Player 1 name already exists"});
            }
            if (player2 != null)
            {
                return BadRequest(new {message = "Player 2 name already exists"});
            }

            var newUser1 = new UserProfile
            {
                PlayerName = request.Player1Name,
                HighScore = 0
            };
            var newUser2 = new UserProfile
            {
                PlayerName = request.Player2Name,
                HighScore = 0
            };
            _db.UserProfiles.Add(newUser1);
            _db.UserProfiles.Add(newUser2);
            await _db.SaveChangesAsync();

            return Ok(new { message = "New players registered successfully" });
        }

        // Endpoint to submit a player's score
        [HttpPost("submit-score")]
        public async Task<IActionResult> SubmitScore([FromBody] PlayerScoreRequest score)
        {
            if (string.IsNullOrEmpty(score.PlayerName) || score.Score < 0)
            {
                return BadRequest("Invalid score data.");
            }

            var userProfile = await _db.UserProfiles
                .FirstOrDefaultAsync(u => u.PlayerName == score.PlayerName);

            if (userProfile == null)
            {
                userProfile = new UserProfile
                {
                    PlayerName = score.PlayerName,
                    HighScore = score.Score
                };
                _db.UserProfiles.Add(userProfile);
            }
            else
            {
                if (score.Score > userProfile.HighScore)
                {
                    userProfile.HighScore = score.Score;
                }
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Score submitted successfully!" });
        }
    }
}
