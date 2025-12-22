// Game state and logic for Dice Train

import { Player } from './player.js';
import { createDeck, drawCards, shuffleDeck } from './cards.js';
import { getPurchasableCars } from './trainCar.js';

export const PHASES = {
    DRAFT: 'draft',
    ROLL: 'roll',
    STATION: 'station',
    SHOP: 'shop'
};

export const GAME_STATES = {
    SETUP: 'setup',
    DRAFTING: 'drafting',
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
        this.totalRounds = 12;
        this.phase = PHASES.DRAFT;
        this.gameState = GAME_STATES.SETUP;
        this.deck = [];
        this.availableCards = [];
        this.availableCars = [];
        this.lastStationEarnings = null;
        this.lastFuelGained = 0;
        this.draftCards = []; // Cards shown to current player for drafting
        this.draftSelections = []; // Selected card indices during draft
    }

    // Initialize game with players
    initialize(playerNames, totalRounds) {
        this.reset();
        this.totalRounds = totalRounds;

        // Create players
        playerNames.forEach((name, index) => {
            this.players.push(new Player(index + 1, name));
        });

        // Setup deck and shop
        this.deck = createDeck();
        this.availableCars = getPurchasableCars();

        // Start drafting phase
        this.gameState = GAME_STATES.DRAFTING;
        this.phase = PHASES.DRAFT;
        this.currentPlayerIndex = 0;
        this.startDraftForCurrentPlayer();

        return this;
    }

    // Start draft for current player - deal 3 cards
    startDraftForCurrentPlayer() {
        this.draftCards = drawCards(this.deck, 3);
        this.draftSelections = [];
    }

    // Toggle card selection during draft (select/deselect)
    toggleDraftSelection(cardIndex) {
        if (cardIndex < 0 || cardIndex >= this.draftCards.length) return false;

        const selIndex = this.draftSelections.indexOf(cardIndex);
        if (selIndex >= 0) {
            // Deselect
            this.draftSelections.splice(selIndex, 1);
        } else if (this.draftSelections.length < 2) {
            // Select (max 2)
            this.draftSelections.push(cardIndex);
        }
        return true;
    }

    // Confirm draft selections and move to next player or start game
    confirmDraft() {
        if (this.draftSelections.length !== 2) return false;

        const player = this.getCurrentPlayer();

        // Add selected cards to player's hand
        this.draftSelections.sort((a, b) => a - b);
        for (const idx of this.draftSelections) {
            player.addCardToHand(this.draftCards[idx]);
        }

        // Discard unselected card back to deck
        for (let i = 0; i < this.draftCards.length; i++) {
            if (!this.draftSelections.includes(i)) {
                this.deck.push(this.draftCards[i]);
            }
        }

        // Move to next player or start game
        this.currentPlayerIndex++;
        if (this.currentPlayerIndex >= this.players.length) {
            // All players drafted, start game
            this.currentPlayerIndex = 0;
            this.deck = shuffleDeck(this.deck);
            this.availableCards = drawCards(this.deck, 3);
            this.gameState = GAME_STATES.PLAYING;
            this.phase = PHASES.ROLL;
        } else {
            // Next player drafts
            this.startDraftForCurrentPlayer();
        }

        return true;
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

        // Gain fuel from coal cars
        this.lastFuelGained = player.gainFuelAtStation();

        return {
            distance,
            earnings: this.lastStationEarnings,
            fuelGained: this.lastFuelGained
        };
    }

    // Move to shop phase
    advanceToShop() {
        if (this.phase !== PHASES.STATION) return false;
        this.phase = PHASES.SHOP;

        // Shuffle remaining deck and any unpurchased cards back together, then draw 3
        this.deck = shuffleDeck([...this.deck, ...this.availableCards]);
        this.availableCards = drawCards(this.deck, 3);

        return true;
    }

    // Purchase a train car
    purchaseTrainCar(carId) {
        if (this.phase !== PHASES.SHOP) return false;

        const carIndex = this.availableCars.findIndex(c => c.id === carId);
        if (carIndex === -1) return false;

        const car = this.availableCars[carIndex];
        const player = this.getCurrentPlayer();

        if (player.purchaseTrainCar(car)) {
            // Remove car from available (cars are unique - once bought, gone forever)
            this.availableCars.splice(carIndex, 1);
            return true;
        }

        return false;
    }

    // Purchase an enhancement card
    purchaseCard(cardIndex) {
        if (this.phase !== PHASES.SHOP) return false;
        if (cardIndex < 0 || cardIndex >= this.availableCards.length) return false;

        const card = this.availableCards[cardIndex];
        const player = this.getCurrentPlayer();

        if (player.purchaseCard(card)) {
            // Remove card from available (no replacement during same shop phase)
            this.availableCards.splice(cardIndex, 1);
            return true;
        }

        return false;
    }

    // Play a card from current player's hand
    playCardFromHand(cardIndex) {
        const player = this.getCurrentPlayer();
        return player.playCard(cardIndex);
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
        const currentPlayer = this.getCurrentPlayer();
        return {
            gameState: this.gameState,
            phase: this.phase,
            currentRound: this.currentRound,
            totalRounds: this.totalRounds,
            currentPlayer: currentPlayer?.getSummary(),
            currentPlayerFull: currentPlayer, // Full player object for detailed UI
            players: this.players.map(p => p.getSummary()),
            availableCards: this.availableCards,
            availableCars: this.availableCars,
            // Draft state
            draftCards: this.draftCards,
            draftSelections: this.draftSelections
        };
    }
}
