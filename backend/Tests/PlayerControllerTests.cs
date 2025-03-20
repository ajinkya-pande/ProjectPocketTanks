using backend.Controllers;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace backend.Tests
{
    public class PlayerControllerTests
    {
        private readonly PlayerController _controller;
        private readonly ApplicationDbContext _context;

        public PlayerControllerTests()
        {
            // Set up InMemory DbContext
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb")
                .Options;

            _context = new ApplicationDbContext(options);
            _controller = new PlayerController(_context);

            // Add some test data to the in-memory database
            _context.UserProfiles.AddRange(new List<UserProfile>
            {
                new UserProfile { PlayerName = "Player1", HighScore = 100 },
                new UserProfile { PlayerName = "Player2", HighScore = 200 }
            });
            _context.SaveChanges();
        }

        // Test for RegisterPlayer (Check if Player1 already exists)
        [Fact]
        public async Task RegisterPlayer_ReturnsBadRequest_WhenPlayer1NameAlreadyExists()
        {
            var request = new PlayerNameRequest
            {
                Player1Name = "Player1",
                Player2Name = "NewPlayer"
            };

            var result = await _controller.RegisterPlayer(request);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var value = badRequestResult.Value as dynamic;
            Assert.Equal("Player 1 name already exists", value?.message);
        }

        // Test for RegisterPlayer (Check if Player2 already exists)
        [Fact]
        public async Task RegisterPlayer_ReturnsBadRequest_WhenPlayer2NameAlreadyExists()
        {
            // Ensure Player2 exists in the database first
            _context.UserProfiles.Add(new UserProfile { PlayerName = "Player2", HighScore = 200 });
            await _context.SaveChangesAsync();

            var request = new PlayerNameRequest
            {
                Player1Name = "NewPlayer1Test",  
                Player2Name = "Player2"
            };

            var result = await _controller.RegisterPlayer(request);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var value = badRequestResult.Value as dynamic;
            Assert.Equal("Player 2 name already exists", value?.message);
        }

        // Test for RegisterPlayer (Successful registration)
        [Fact]
        public async Task RegisterPlayer_ReturnsOkResult_WhenPlayersAreRegisteredSuccessfully()
        {
            var request = new PlayerNameRequest
            {
                Player1Name = "NewPlayer1",
                Player2Name = "NewPlayer2"
            };

            var result = await _controller.RegisterPlayer(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value as dynamic;
            Assert.Equal("New players registered successfully", value?.message);
        }

        // Test for SubmitScore (Create a new player if they don't exist)
        [Fact]
        public async Task SubmitScore_CreatesNewPlayer_WhenPlayerDoesNotExist()
        {
            var scoreRequest = new PlayerScoreRequest
            {
                PlayerName = "NewPlayer",
                Score = 150
            };

            var result = await _controller.SubmitScore(scoreRequest);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value as dynamic;
            Assert.Equal("Score submitted successfully!", value?.message);
        }

        // Test for SubmitScore (Valid score submission)
        [Fact]
        public async Task SubmitScore_ReturnsOkResult_WhenScoreIsSubmittedSuccessfully()
        {
            var scoreRequest = new PlayerScoreRequest
            {
                PlayerName = "Player1",
                Score = 300
            };

            var result = await _controller.SubmitScore(scoreRequest);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value as dynamic;
            Assert.Equal("Score submitted successfully!", value?.message);
        }

        // Test for SubmitScore (Invalid score data)
        [Fact]
        public async Task SubmitScore_ReturnsBadRequest_WhenScoreIsInvalid()
        {
            var scoreRequest = new PlayerScoreRequest
            {
                PlayerName = "Player1",
                Score = -50 // Invalid score
            };

            var result = await _controller.SubmitScore(scoreRequest);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var value = badRequestResult.Value as string;  // The BadRequestObjectResult is returning a string message
            Assert.Equal("Invalid score data.", value);
        }
    }
}
