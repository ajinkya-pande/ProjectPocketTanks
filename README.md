# Pocket Tanks Mini

## Author
Ajinkya Pande

## Description
Pocket Tanks Mini is a simple, turn-based artillery game where two players control tanks on opposite ends of a battlefield. The goal is to shoot a single type of projectile at the opponent, adjusting the shot's angle and power. Players alternate turns and earn points by successfully hitting their opponent's tank, damaging their health. The game ends when one player's health reaches zero, and the other is declared the winner.

After the game ends, players can choose to replay or exit.

## Gameplay
### Movement
- Players can move their tanks left or right during their turn using the **left-arrow key** and **right-arrow key**, respectively.

### Input
- The player must provide values for:
  - **Power**: A positive integer.
  - **Angle**: An integer between 0 and 180 degrees.
  
### Fire
- The **FIRE** button is disabled until valid power and angle inputs are provided.
- Once enabled, players can click the button to fire their weapon.

### Win Condition
- The first player to reach **100 points** wins the game.

## Features
- **Tank Movement**: Move your tank left or right to position yourself for the perfect shot while avoiding enemy attacks.
- **Weapons**: Fire a basic projectile with adjustable power and angle to hit your opponent.
- **Gravity and Physics**: The projectile’s path is affected by gravity, creating a realistic arc based on the power and angle inputs.
- **Obstacles**: Dynamic terrain may block shots and adds an extra layer of strategy.
- **Collision**: If the projectile hits the opponent, their health and score are adjusted.
- **Health and Score System**:
  - Both players start with **100 health**.
  - Deal damage to the opponent to lower their health and score points with successful hits.
  - The first player to reach **100 points** wins the game. 

## How to Play
1. Move your tank left or right.
2. Adjust the power and angle of your shot.
3. Press the **FIRE** button to launch your projectile.
4. Earn points and deal damage when you hit the opponent.
5. The game ends when a player reaches 100 points.

## Installation
1. Clone this repository to your local machine:
