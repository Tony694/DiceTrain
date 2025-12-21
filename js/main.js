// Main entry point for Dice Train

import { Game, PHASES } from './game.js';
import {
    initUI,
    getElements,
    getPlayerNames,
    getRoundCount,
    showScreen,
    showPhase,
    updateRoundDisplay,
    updateCurrentPlayer,
    renderPlayerPanels,
    renderTrainCars,
    renderDicePreRoll,
    animateDiceRoll,
    renderDiceResults,
    renderStationEarnings,
    renderShop,
    renderStandings
} from './ui.js';

// Game instance
let game = new Game();
let elements;

// Initialize the application
function init() {
    elements = initUI();
    setupEventListeners();
    showScreen('setup');
}

// Setup event listeners
function setupEventListeners() {
    // Start game button
    elements.startGame.addEventListener('click', startGame);

    // Roll dice button
    elements.rollDiceBtn.addEventListener('click', handleRollDice);

    // Continue to station
    elements.continueToStation.addEventListener('click', handleContinueToStation);

    // Continue to shop
    elements.continueToShop.addEventListener('click', handleContinueToShop);

    // Skip shop
    elements.skipShop.addEventListener('click', handleEndTurn);

    // Play again
    elements.playAgain.addEventListener('click', handlePlayAgain);
}

// Start a new game
function startGame() {
    const playerNames = getPlayerNames();
    const roundCount = getRoundCount();

    game.initialize(playerNames, roundCount);

    showScreen('game');
    updateGameDisplay();
}

// Update the entire game display
function updateGameDisplay() {
    const state = game.getState();
    const player = game.getCurrentPlayer();

    updateRoundDisplay(state.currentRound, state.totalRounds);
    renderPlayerPanels(game.players, game.currentPlayerIndex);
    updateCurrentPlayer(player);

    showPhase(state.phase);

    switch (state.phase) {
        case PHASES.ROLL:
            renderTrainCars(player.trainCars);
            renderDicePreRoll(player.trainCars);
            break;
        case PHASES.STATION:
            // Already rendered when advancing to station
            break;
        case PHASES.SHOP:
            renderShop(
                player,
                state.availableCars,
                state.availableCards,
                handlePurchaseTrainCar,
                handlePurchaseCard
            );
            break;
    }
}

// Handle roll dice
async function handleRollDice() {
    elements.rollDiceBtn.disabled = true;

    // Start animation
    await animateDiceRoll(800);

    // Actually roll
    const results = game.rollDice();
    const player = game.getCurrentPlayer();
    const total = player.getLastRollTotal();
    const canReroll = player.rerollsRemaining > 0;

    renderDiceResults(results, total, canReroll);

    // Setup reroll handlers if available
    if (canReroll) {
        setupRerollHandlers();
    }

    elements.rollDiceBtn.disabled = false;
}

// Setup reroll click handlers
function setupRerollHandlers() {
    const diceElements = elements.diceContainer.querySelectorAll('.die');
    diceElements.forEach((dieEl, index) => {
        dieEl.addEventListener('click', () => handleReroll(index));
    });
}

// Handle reroll
async function handleReroll(dieIndex) {
    const player = game.getCurrentPlayer();
    if (player.rerollsRemaining <= 0) return;

    const success = game.rerollDie(dieIndex);
    if (success) {
        const results = player.lastRollResults;
        const total = player.getLastRollTotal();
        const canReroll = player.rerollsRemaining > 0;

        renderDiceResults(results, total, canReroll);

        if (canReroll) {
            setupRerollHandlers();
        }
    }
}

// Handle continue to station
function handleContinueToStation() {
    const result = game.advanceToStation();

    if (result) {
        renderStationEarnings(result.earnings);
        updateGameDisplay();
    }
}

// Handle continue to shop
function handleContinueToShop() {
    game.advanceToShop();
    updateGameDisplay();
}

// Handle purchase train car
function handlePurchaseTrainCar(carId) {
    const success = game.purchaseTrainCar(carId);
    if (success) {
        handleEndTurn();
    }
}

// Handle purchase card
function handlePurchaseCard(cardIndex) {
    const success = game.purchaseCard(cardIndex);
    if (success) {
        handleEndTurn();
    }
}

// Handle end turn
function handleEndTurn() {
    const result = game.endTurn();

    if (result.gameEnded) {
        handleGameEnd();
    } else {
        updateGameDisplay();
    }
}

// Handle game end
function handleGameEnd() {
    const standings = game.getStandings();
    renderStandings(standings);
    showScreen('end');
}

// Handle play again
function handlePlayAgain() {
    game = new Game();
    showScreen('setup');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
