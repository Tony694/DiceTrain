// Game state and logic for Dice Train

import { Player } from './player.js';
import { createDeck, drawCards } from './cards.js';
import { getPurchasableCars } from './trainCar.js';

export const PHASES = {
    ROLL: 'roll',
    STATION: 'station',
    SHOP: 'shop'
};

export const GAME_STATES = {
    SETUP: 'setup',
    PLAYING: 'playing',
    ENDED: 'ended'
};

export class Game {
    constructor() {
        this.reset();
    }

    reset() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.currentRound = 1;
        this.totalRounds = 10;
        this.phase = PHASES.ROLL;
        this.gameState = GAME_STATES.SETUP;
        this.deck = [];
        this.availableCards = [];
        this.availableCars = [];
        this.lastStationEarnings = null;
    }

    // Initialize game with players
    initialize(playerNames, totalRounds) {
        this.reset();
        this.totalRounds = totalRounds;

        // Create players
        playerNames.forEach((name, index) => {
            this.players.push(new Player(index + 1, name));
        });

        // Setup shop
        this.deck = createDeck();
        this.availableCards = drawCards(this.deck, 3);
        this.availableCars = getPurchasableCars();

        this.gameState = GAME_STATES.PLAYING;
        this.phase = PHASES.ROLL;

        return this;
    }

    // Get current player
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    // Roll dice for current player
    rollDice() {
        if (this.phase !== PHASES.ROLL) return null;
        const player = this.getCurrentPlayer();
        return player.roll();
    }

    // Reroll a die for current player
    rerollDie(dieIndex) {
        if (this.phase !== PHASES.ROLL) return false;
        const player = this.getCurrentPlayer();
        return player.rerollDie(dieIndex);
    }

    // Move to station phase
    advanceToStation() {
        if (this.phase !== PHASES.ROLL) return false;

        const player = this.getCurrentPlayer();
        const distance = player.move();
        this.phase = PHASES.STATION;

        // Calculate station earnings
        this.lastStationEarnings = player.calculateStationGold();
        player.gainGold(this.lastStationEarnings.total);

        return {
            distance,
            earnings: this.lastStationEarnings
        };
    }

    // Move to shop phase
    advanceToShop() {
        if (this.phase !== PHASES.STATION) return false;
        this.phase = PHASES.SHOP;
        return true;
    }

    // Purchase a train car
    purchaseTrainCar(carId) {
        if (this.phase !== PHASES.SHOP) return false;

        const car = this.availableCars.find(c => c.id === carId);
        if (!car) return false;

        const player = this.getCurrentPlayer();
        return player.purchaseTrainCar(car);
    }

    // Purchase an enhancement card
    purchaseCard(cardIndex) {
        if (this.phase !== PHASES.SHOP) return false;
        if (cardIndex < 0 || cardIndex >= this.availableCards.length) return false;

        const card = this.availableCards[cardIndex];
        const player = this.getCurrentPlayer();

        if (player.purchaseCard(card)) {
            // Remove card from available and draw new one
            this.availableCards.splice(cardIndex, 1);
            const newCards = drawCards(this.deck, 1);
            this.availableCards.push(...newCards);
            return true;
        }

        return false;
    }

    // End turn and move to next player
    endTurn() {
        if (this.phase !== PHASES.SHOP) return false;

        this.currentPlayerIndex++;

        // Check if round is complete
        if (this.currentPlayerIndex >= this.players.length) {
            this.currentPlayerIndex = 0;
            this.currentRound++;

            // Check if game is over
            if (this.currentRound > this.totalRounds) {
                this.endGame();
                return { gameEnded: true };
            }
        }

        this.phase = PHASES.ROLL;
        return { gameEnded: false };
    }

    // End the game
    endGame() {
        this.gameState = GAME_STATES.ENDED;
    }

    // Get final standings sorted by distance
    getStandings() {
        return [...this.players]
            .sort((a, b) => b.totalDistance - a.totalDistance)
            .map((player, index) => ({
                rank: index + 1,
                ...player.getSummary()
            }));
    }

    // Get game state summary
    getState() {
        return {
            gameState: this.gameState,
            phase: this.phase,
            currentRound: this.currentRound,
            totalRounds: this.totalRounds,
            currentPlayer: this.getCurrentPlayer()?.getSummary(),
            players: this.players.map(p => p.getSummary()),
            availableCards: this.availableCards,
            availableCars: this.availableCars
        };
    }
}
