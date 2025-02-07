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
        [HttpPost("new-player")]
        public async Task<IActionResult> RegisterPlayer([FromBody] PlayerNameRequest? request)
        {
            if (request == null || string.IsNullOrEmpty(request.PlayerName))
            {
                return BadRequest("Player name is required");
            }

            var existingUser = await _db.UserProfiles.FirstOrDefaultAsync(u => u.PlayerName == request.PlayerName);

            if (existingUser != null)
            {
                return BadRequest("Player name already exists");
            }

            var newUser = new UserProfile
            {
                PlayerName = request.PlayerName,
                HighScore = 0
            };

            _db.UserProfiles.Add(newUser);
            await _db.SaveChangesAsync();

            return Ok(new { message = "New player registered successfully" });
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
