/**
 * ? GAME
 * POCKET TANKS MINI
 * 
 * 
 * ? AUTHOR
 * AJINKYA PANDE
 * 
 * 
 * ? DESCRIPTION
 * Pocket Tanks Mini is a simple, turn-based artillery game where two players take control of tanks positioned on opposite ends of a battlefield. 
 * The objective is to shoot a single type of projectile at the opponent, adjusting the angle and power of the shot. 
 * The game progresses with alternating turns.
 * 
 * Players earn points and damage their opponent’s health when a shot hits the other player's tank. 
 * The game ends when one player's health reaches zero, and the other player is declared the winner. 
 * Players can then choose to replay the game or exit.
 * 
 * 
 * ? GAMEPLAY
 * * Movement:
 *   Tanks can move left and right during players turn using left-arrow-key and right-arrow-key respectively.
 * 
 * * Input:
 *   User has to provide input for power and angle in input fields.
 *   Power - Positive integer
 *   Angle - Integer between 0 and 180 degrees.
 * 
 * * Fire:
 *   The FIRE button is disabled until valid power and angle inputs are provided.
 *   Once enabled, user can click to fire the weapon.
 * 
 * * Win:
 *   First player to reach 100 points is winner.
 * 
 * 
 * ? FEATURES
 * * Tank Movement:
 *   Move your tank left or right to position yourself for the perfect shot, as well as stay away from enemy radar !!
 *   
 * * Weapons:
 *   Fire a basic projectile with adjustable power and angle to hit the opponent.
 * 
 * * Gravity and Physics:
 *   The projectile’s path is affected by gravity, adding a realistic arc to your shots.
 *   The power and angle inputs affect the projectile shot.
 * 
 * * Obstacles:
 *   Dynamic terrain is scattered across the battlefield, potentially blocking shots and adding an extra layer of strategy.
 * 
 * * Collision: 
 *   The projecitle hit to the oponent is analyzed and health and score are adjusted accordingly.
 * 
 * * Health and Score System:
 *   Each player starts with 100 health. 
 *   Deal damage to the opponent to lower their health and score points with successful hits.
 *   First player to reach score of 100 wins the game.
 * 
*/

// Load images
const player1Image = new Image();
const player2Image = new Image();
const grassImage = new Image();
const backgroundImage = new Image();

player1Image.src = 'images/TankPlayer1.png';
player2Image.src = 'images/TankPlayer2.png';
grassImage.src = 'images/grass.jpg';
backgroundImage.src = 'images/nightSkyBackground.jpg';


// Game Config
const gameConfig = {
    isPlayer1Turn: true,
    player1: {
        name: 'Player 1',
        score: 0,
        health: 100,
        x: 50,
    },
    player2: {
        name: 'Player 2',
        score: 0,
        health: 100,
        x: window.innerWidth - 150,
    },
    winner: null,
    tank: {
        width: 80,
        height: 50,
        isJumping: false
    },
    projectile: {
        radius: 5,
        color: "#ff0000",
    },
    font: {
        color: "#ffffff",
        style: "20px Arial",
    },
    projectileVelocity: 0.4,
    tankVelocity: 0.2,
    standardHit: 20,
    canvasHeight: window.innerHeight - 150,
    canvasWidth: window.innerWidth,
    groundHeight: 60,
    gravity: 0.5,
    movableArea: 200,
}


// Models
class Tank {
    constructor(x, y, isPlayer1) {
        this.width = gameConfig.tank.width;
        this.height = gameConfig.tank.height;
        this.x = x;
        this.y = y;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.isPlayer1 = isPlayer1;
        this.isJumping = gameConfig.tank.isJumping;
    }

    draw() {
        if (this.isPlayer1) {
            // Draw Player 1's tank image
            context.drawImage(player1Image, this.x, this.y, this.width, this.height);
        } else {
            // Draw Player 2's tank image
            context.drawImage(player2Image, this.x, this.y, this.width, this.height);
        }
    }

    applyGravity() {
        this.yVelocity += gameConfig.gravity;
    }

    updatePosition() {
        this.x += this.xVelocity;
    }

    handleMovement(keys, currentProjectile) {
        if (keys.left || keys.right) {
            if (keys.left)
                this.xVelocity -= gameConfig.tankVelocity;
            else {
                this.xVelocity += gameConfig.tankVelocity;
            }
        }
        else {
            this.xVelocity = 0;
            if (!isFiring)
                currentProjectile.x = gameConfig.isPlayer1Turn ? this.x + this.width : this.x;
        }
    }
}

class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = gameConfig.projectile.radius;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.isActive = false;
    }

    draw() {
        if (this.isActive) {
            context.beginPath();
            context.fillStyle = gameConfig.projectile.color;
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.fill();
        }
    }

    updatePosition() {
        if (this.isActive) {
            this.x += this.xVelocity;
            this.y += this.yVelocity;
            this.yVelocity += gameConfig.gravity;
        }
    }

    checkCollision(opponent) {
        const dx = this.x - (opponent.x + opponent.width / 2);
        const dy = this.y - (opponent.y + opponent.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + (opponent.height / 2));
    }
}

class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        context.drawImage(grassImage, this.x, this.y, this.width, this.height);
    }

    checkCollision(object) {
        if (
            (object.x > this.x || (object.x + object.width) > this.x) &&
            (object.x < this.x + this.width || (object.x + object.width) < this.x + this.width) &&
            object.y > this.y &&
            object.y < this.y + this.height
        ) {
            return true;
        }
        return false;
    }
}


// Set game canvas
const canvas = document.querySelector("#gameCanvas");
const context = canvas.getContext("2d");
canvas.height = gameConfig.canvasHeight;
canvas.width = gameConfig.canvasWidth;

// Inputs
const powerInput = document.getElementById('power');
const angleInput = document.getElementById('angle');
const fireButton = document.getElementById('fireButton');
const errorMessage = document.getElementById('errorMessage');

// New player objects
const tankPosition = gameConfig.canvasHeight - gameConfig.groundHeight - gameConfig.tank.height;
const player1Tank = new Tank(gameConfig.player1.x, tankPosition, true);
const player2Tank = new Tank(gameConfig.player2.x, tankPosition, false);
let currentProjectile = null;

// Track whether fire button is clicked
let isFiring = false;

// Array to hold obstacles
let obstacles = [];

const keys = { right: false, left: false };


// Game controller
const controller = {
    eventKeyListener: function (event) {
        switch (event.key) {
            case 'ArrowRight':
                keys.right = event.type === 'keydown';
                break;
            case 'ArrowLeft':
                keys.left = event.type === 'keydown';
                break;
        }
    }
};


// Change Player turn
function changePlayerTurn() {
    currentProjectile.isActive = false;
    gameConfig.isPlayer1Turn = !gameConfig.isPlayer1Turn;
    powerInput.value = '';
    angleInput.value = '';
    validateGameInputFields();
    startProjectile();
    isFiring = false;
}


// Function to generate obstacles with symmetrical height distribution
function generateObstacles() {
    obstacles = [];

    // Generate a random number of obstacles 
    const numObstacles = Math.floor(Math.random() * 100) + 100;
    const minX = gameConfig.player1.x + gameConfig.tank.width + gameConfig.movableArea;
    const maxX = gameConfig.player2.x - gameConfig.movableArea;

    const midX = (minX + maxX) / 2;

    const maxHeight = gameConfig.canvasHeight - gameConfig.groundHeight - 250;

    for (let i = 0; i < numObstacles; i++) {
        // Distribute obstacles randomly between minX and maxX
        const x = Math.random() * (maxX - minX) + minX;

        const distanceFromCenter = Math.abs(x - midX);
        const heightFactor = Math.random() * 0.2 + 15 / (distanceFromCenter + 1);
        const height = Math.min(heightFactor * maxHeight, maxHeight);

        const y = gameConfig.canvasHeight - gameConfig.groundHeight - height;
        const width = Math.random() * 60 + 30;

        obstacles.push(new Obstacle(x, y, width, height));
    }
}


// Start the projectile for the current player
function startProjectile() {
    currentProjectile = new Projectile(
        gameConfig.isPlayer1Turn ? player1Tank.x + player1Tank.width : player2Tank.x,
        gameConfig.isPlayer1Turn ? player1Tank.y - 10 : player2Tank.y - 10
    );

    currentProjectile.isActive = true;
}

function detectProjectileCollision() {
    const opponentTank = gameConfig.isPlayer1Turn ? player2Tank : player1Tank;

    // Check if projectile hits other player
    if (currentProjectile.checkCollision(opponentTank)) {
        // Update player scores and health
        if (gameConfig.isPlayer1Turn) {
            gameConfig.player1.score += gameConfig.standardHit;
            gameConfig.player2.health -= gameConfig.standardHit;
        }
        else {
            gameConfig.player2.score += gameConfig.standardHit;
            gameConfig.player1.health -= gameConfig.standardHit;
        }

        changePlayerTurn();
        return;
    }

    // Check if projectile hits any obstacle
    for (let obstacle of obstacles) {
        if (obstacle.checkCollision(currentProjectile)) {
            changePlayerTurn();
            return;
        }
    }
}

function fireProjectile() {
    if (currentProjectile && currentProjectile.isActive) {
        // Get the power and angle values directly from the input fields
        const power = parseFloat(document.getElementById('power').value) || 0;
        const angle = parseFloat(document.getElementById('angle').value) || 0;

        // Convert angle from degrees to radians
        const angleInRadians = angle * Math.PI / 180;

        // Calculate the projectile's projectileVelocity based on angle and power
        currentProjectile.xVelocity = (gameConfig.projectileVelocity * power * Math.cos(angleInRadians)) * (gameConfig.isPlayer1Turn ? 1 : -1);
        currentProjectile.yVelocity = -gameConfig.projectileVelocity * power * Math.sin(angleInRadians);

        isFiring = true;
    }
}

function handleFireButtonClick() {
    // Fire only when not already fired
    if (!isFiring)
        fireProjectile();
}


function displayPlayerTurn() {
    context.fillStyle = gameConfig.font.color;
    context.font = gameConfig.font.style;
    context.fillText((gameConfig.isPlayer1Turn ? gameConfig.player1.name : gameConfig.player2.name) + "'s Turn", gameConfig.canvasWidth / 2 - 60, 30);
}

function displayScores() {
    context.fillStyle = gameConfig.font.color;
    context.font = gameConfig.font.style;

    // Display Player 1's score
    context.fillText(gameConfig.player1.name + ": " + gameConfig.player1.score, 20, 30);
    // Display Player 2's score
    context.fillText(gameConfig.player2.name + ": " + gameConfig.player2.score, gameConfig.canvasWidth - 120, 30);
}

function checkGameEnd() {
    // Check health for each player and set the winner
    if (gameConfig.player1.health == 0)
        gameConfig.winner = 'Player 2';
    else if (gameConfig.player2.health == 0)
        gameConfig.winner = 'Player 1';

    if (gameConfig.winner) {
        // Show confirmation dialog if game is over
        const replay = window.confirm(gameConfig.winner + " wins! Do you want to play again?");
        // Reset game to start again
        if (replay) {
            gameConfig.isPlayer1Turn = true;
            player1Tank.x = gameConfig.player1.x;
            player2Tank.x = gameConfig.player2.x;
            gameConfig.player1.health = 100;
            gameConfig.player1.score = 0;
            gameConfig.player2.health = 100;
            gameConfig.player2.score = 0;
            gameConfig.winner = null;

            powerInput.value = '';
            angleInput.value = '';
            validateGameInputFields();
            generateObstacles();
            showOverlayDialog();
        }
    }
}

const validateGameInputFields = () => {
    const powerValue = parseInt(powerInput.value);
    const angleValue = parseInt(angleInput.value);
    let isValid = true;

    errorMessage.textContent = '';

    // Validate power input (>0)
    if (isNaN(powerValue) || powerValue < 0) {
        isValid = false;
        errorMessage.textContent = 'Power should be positive integer';
    }

    // Validate angle input (0-180)
    if (isNaN(angleValue) || angleValue < 0 || angleValue > 180) {
        isValid = false;
        errorMessage.textContent += '\nAngle should be between 0 and 180.';
    }

    // Enable/Disable the Fire button based on validation
    if (isValid) {
        fireButton.classList.add('enabled');
        fireButton.disabled = false;
    } else {
        fireButton.classList.remove('enabled');
        fireButton.disabled = true;
    }
};

function showOverlayDialog() {
    document.getElementById('overlay').style.display = 'flex';
}

function closeOverlayDialog() {
    document.getElementById('overlay').style.display = 'none';
}

function validateNameInputFields() {
    let player1 = document.getElementById('player1').value.trim();
    let player2 = document.getElementById('player2').value.trim();
    const startGameBtn = document.getElementById('startGameBtn');

    if (player1 && player2) {
        startGameBtn.disabled = false;
    } else {
        startGameBtn.disabled = true;
    }
}

function startGame() {
    let player1Value = document.getElementById('player1').value;
    let player2Value = document.getElementById('player2').value;

    if (player1Value && player2Value) {
        gameConfig.player1.name = player1Value;
        gameConfig.player2.name = player2Value;
        closeOverlayDialog();
    }
}


// Main game function
function gameLoop() {
    // Game background elements
    context.drawImage(backgroundImage, 0, 0, gameConfig.canvasWidth, gameConfig.canvasHeight - 40);
    context.drawImage(grassImage, 0, gameConfig.canvasHeight - gameConfig.groundHeight, gameConfig.canvasWidth, gameConfig.groundHeight);

    // Draw obstacles
    obstacles.forEach(obstacle => obstacle.draw());

    // Draw tanks
    player1Tank.draw();
    player2Tank.draw();

    // Apply gravity and update tank positions
    player1Tank.applyGravity();
    player1Tank.updatePosition();
    player2Tank.applyGravity();
    player2Tank.updatePosition();

    // Handle tank movement
    if (gameConfig.isPlayer1Turn)
        player1Tank.handleMovement(keys, currentProjectile);
    else
        player2Tank.handleMovement(keys, currentProjectile);

    // Tank bounds
    if (player1Tank.x > gameConfig.player1.x + gameConfig.movableArea - 10)
        player1Tank.x = gameConfig.player1.x + gameConfig.movableArea - 10;
    if (player1Tank.x < 0)
        player1Tank.x = 0;
    if (player2Tank.x < gameConfig.player2.x - gameConfig.movableArea + 10)
        player2Tank.x = gameConfig.player2.x - gameConfig.movableArea + 10;
    if (player2Tank.x > gameConfig.canvasWidth - gameConfig.tank.width)
        player2Tank.x = gameConfig.canvasWidth - gameConfig.tank.width;


    // Draw and update projectile if active
    if (currentProjectile && currentProjectile.isActive) {
        currentProjectile.draw();
        currentProjectile.updatePosition();
        detectProjectileCollision();
    }

    // Base for initial projectile
    if (!isFiring && currentProjectile && currentProjectile.y > tankPosition) {
        currentProjectile.y = tankPosition;
        currentProjectile.yVelocity = 0;
        currentProjectile.xVelocity = 0;
    }

    // End condition when projectile after firing
    if (isFiring && currentProjectile && currentProjectile.isActive && currentProjectile.y > tankPosition + 50) {
        currentProjectile.y = tankPosition + 50;
        changePlayerTurn();
    }

    displayPlayerTurn();
    displayScores();
    checkGameEnd();
    
    window.requestAnimationFrame(gameLoop);
}


// Event listeners
window.addEventListener('keydown', controller.eventKeyListener);
window.addEventListener('keyup', controller.eventKeyListener);
powerInput.addEventListener('input', validateGameInputFields);
angleInput.addEventListener('input', validateGameInputFields);
document.getElementById('fireButton').addEventListener('click', handleFireButtonClick);


startProjectile();
generateObstacles();
validateGameInputFields();
showOverlayDialog();

window.requestAnimationFrame(gameLoop);
