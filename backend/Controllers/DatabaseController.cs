using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatabaseController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public DatabaseController(ApplicationDbContext db)
        {
            _db = db;
        }

        // To fetch entire table data
        [HttpGet("show-db")]
        public async Task<IActionResult> ShowDb()
        {
            var data = await _db.UserProfiles
                .ToListAsync();

            return Ok(new { data });
        }

        // To get the leaderboard (top 10 scores)
        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            var leaderboard = await _db.UserProfiles
                .OrderByDescending(u => u.HighScore)
                .Take(10)
                .ToListAsync();

            return Ok(leaderboard);
        }

        // Test the database for CRUD operations
        [HttpGet("test-db")]
        public async Task<IActionResult> TestDb()
        {
            // 1. Create
            var sampleData = new List<UserProfile>
            {
                new UserProfile { PlayerName = "Player1", HighScore = 100 },
                new UserProfile { PlayerName = "Player2", HighScore = 200 },
            };

            _db.UserProfiles.AddRange(sampleData);
            await _db.SaveChangesAsync();

            // 2. Delete 
            var player1 = await _db.UserProfiles
                .FirstOrDefaultAsync(u => u.PlayerName == "Player1");

            if (player1 != null)
            {
                _db.UserProfiles.Remove(player1);
                await _db.SaveChangesAsync();
            }

            // 3. Update
            var player2 = await _db.UserProfiles
                .FirstOrDefaultAsync(u => u.PlayerName == "Player2");

            if (player2 != null)
            {
                player2.PlayerName = "Player2Updated";
                await _db.SaveChangesAsync();
            }

            // 4. Read 
            var data = await _db.UserProfiles
                .ToListAsync();

            // Clear data generated
            var playerData = await _db.UserProfiles
                .Where(u => u.PlayerName == "Player1" || u.PlayerName == "Player2" || u.PlayerName == "Player2Updated")
                .ToListAsync();

            if (playerData != null)
            {
                _db.UserProfiles.RemoveRange(playerData);
                await _db.SaveChangesAsync();
            }

            return Ok(new { message = "Performed CRUD operations" });
        }
    }
}
