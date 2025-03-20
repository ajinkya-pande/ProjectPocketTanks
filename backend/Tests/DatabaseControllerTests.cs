using backend.Controllers;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace backend.Tests
{
    public class DatabaseControllerTests
    {
        private readonly DatabaseController _controller;
        private readonly ApplicationDbContext _context;

        public DatabaseControllerTests()
        {
            // Set up InMemory DbContext
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb")
                .Options;

            _context = new ApplicationDbContext(options);
            _controller = new DatabaseController(_context);

            // Add some test data to the in-memory database
            _context.UserProfiles.AddRange(new List<UserProfile>
        {
            new UserProfile { PlayerName = "Player1", HighScore = 100 },
            new UserProfile { PlayerName = "Player2", HighScore = 200 }
        });
            _context.SaveChanges();
        }

        [Fact]
        public async Task TestDb_PerformsCrudOperations_ReturnsOkResult()
        {
            // Act
            var result = await _controller.TestDb();

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task ShowDb_ReturnsOkResult_WithUserProfiles()
        {
            // Act
            var result = await _controller.ShowDb();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var anonymousObject = okResult.Value as dynamic; 

            // Extract data from the anonymous object
            var data = anonymousObject?.data as List<UserProfile>;

            Assert.NotNull(data);
        }

        [Fact]
        public async Task GetLeaderboard_ReturnsTop10UserProfiles()
        {
            // Act
            var result = await _controller.GetLeaderboard();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var data = Assert.IsType<List<UserProfile>>(okResult.Value);

            Assert.True(data.Count <= 10);
        }
    }
}
