# CLAUDE.md - Project Context for Claude

This file contains project context and decisions for the Dice Train game to help Claude understand the codebase in future sessions.

## Project Overview

**Dice Train** is a browser-based board game built with vanilla HTML, CSS, and JavaScript (ES6 modules). It's a train-building dice game for 1-4 players using hotseat multiplayer (same device, taking turns).

## Core Game Mechanics

### Players & Setup
- 1-4 players, configurable at game start
- Configurable round count: 5, 10, 15, or 20 rounds
- Each player starts with 3 train cars: Coal Tender, Passenger Car, Freight Car

### Round Structure (3 Phases per Player)
1. **Roll Phase**: Roll all dice from train cars, move forward by total miles
2. **Station Phase**: Automatically reach a station, gain gold based on train cars
3. **Shop Phase**: Spend gold on ONE purchase (train car OR enhancement card) or skip

### Win Condition
- Game ends after fixed number of rounds
- Winner is the player with the **most total distance traveled**
- Solo play is optimization-focused (no AI opponents)

## Train Cars

### Starting Cars (Given to All Players)
| Car | Die | Station Gold |
|-----|-----|--------------|
| Coal Tender | d6 | 1g |
| Passenger Car | d4 | 2g |
| Freight Car | d8 | 1g |

### Purchasable Cars (8 Total)
| Car | Cost | Die | Station Gold | Type |
|-----|------|-----|--------------|------|
| Luxury Sleeper | 8g | d4 | 4g | passenger |
| Cargo Hold | 6g | d10 | 0g | freight |
| Dining Car | 10g | d6 | 3g | passenger |
| Express Engine | 12g | d12 | 0g | coal |
| Mail Car | 5g | d4 | 2g | freight |
| Observation Deck | 7g | d6 | 2g | passenger |
| Caboose | 4g | d4 | 1g | special (+1 to lowest die) |
| Tank Car | 9g | d8 | 1g | freight |

## Enhancement Cards

12 cards in the deck with effects like:
- Die bonuses by car type (+1 to all Coal/Passenger/Freight dice)
- Station gold bonuses (+2 gold per station, +1 per car type)
- Dice manipulation (reroll, minimum roll of 2, +2 to highest die)
- One-time bonuses (double gold, +3 distance)

Cards are drawn 3 at a time; when one is purchased, a new one is drawn.

## File Structure

```
DiceTrain/
├── index.html          # Main game page with all screens
├── css/
│   └── style.css       # Dark theme, responsive layout
└── js/
    ├── main.js         # Entry point, event handlers, game flow
    ├── game.js         # Game state machine (PHASES, GAME_STATES)
    ├── player.js       # Player class (train, gold, distance, cards)
    ├── trainCar.js     # Train car definitions and helpers
    ├── dice.js         # Dice rolling and modifier application
    ├── cards.js        # Enhancement card definitions and deck management
    ├── shop.js         # Shop UI rendering
    └── ui.js           # All DOM manipulation and rendering
```

## Technical Decisions

- **Pure vanilla JavaScript** - no frameworks or build tools
- **ES6 modules** - requires serving via HTTP (not file://)
- **State-driven UI** - game.js holds state, ui.js renders based on state
- **CSS custom properties** - theming via CSS variables in :root

## Key Design Patterns

1. **Game State Machine**: `game.js` manages phases (roll → station → shop) and game states (setup → playing → ended)
2. **Separation of Concerns**: Logic in game/player/dice, rendering in ui/shop
3. **Immutable Data**: Train cars and cards are copied when assigned to players

## Future Considerations

If expanding the game, consider:
- Local storage for saving/loading games
- More train cars and enhancement cards
- Sound effects
- Visual train track display
- Achievements or challenges for solo mode
