# Dice Train

A browser-based board game where players build trains, roll dice, and race to travel the farthest distance. It's cool.

## How to Play

### Setup
1. Open the game in a browser (see Running below)
2. Choose 1-4 players and enter names
3. Select number of rounds (5, 10, 15, or 20)
4. Click "Start Game"

### Gameplay

Each round, every player takes a turn with 3 phases:

**1. Roll Phase**
- Roll all your dice (one per train car)
- Your train moves forward by the total rolled
- If you have reroll abilities, click dice to reroll them

**2. Station Phase**
- Your train arrives at a station
- Earn gold based on your train cars
- Different cars earn different amounts

**3. Shop Phase**
- Spend gold to upgrade your train
- Buy ONE train car (adds a new die + station income)
- OR buy ONE enhancement card (permanent bonuses)
- Or skip and save your gold

### Winning

After all rounds are complete, the player with the **most total distance** wins!

## Train Cars

You start with 3 cars:
- **Coal Tender** - d6, +1 gold
- **Passenger Car** - d4, +2 gold
- **Freight Car** - d8, +1 gold

Buy more cars to add dice and increase gold income. Strategy tip: balance between fast cars (big dice, low gold) and profitable cars (small dice, high gold).

## Enhancement Cards

Cards give permanent bonuses like:
- +1 to specific dice types
- Extra gold at stations
- Reroll abilities
- Minimum roll guarantees

## Running the Game

The game uses ES6 modules, so it needs to be served via HTTP. Options:

```bash
# Using Node.js
npx serve .

# Using Python
python -m http.server 8000

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` (or the port shown) in your browser.

## Tech Stack

- Vanilla HTML/CSS/JavaScript
- No dependencies or build step required
- ES6 modules for code organization
