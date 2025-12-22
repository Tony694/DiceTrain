// Main entry point for Dice Train

import { Game, PHASES, GAME_STATES } from './game.js';
import {
    initUI,
    getElements,
    getPlayerNames,
    getRoundCount,
    showScreen,
    showPhase,
    updateRoundDisplay,
    updateCurrentPlayer,
    updatePlayerResources,
    renderPlayerPanels,
    renderTrainCars,
    renderDicePreRoll,
    animateDiceRoll,
    renderDiceResults,
    renderStationEarnings,
    renderShop,
    renderStandings,
    renderDraftCards,
    updateDraftPlayer,
    renderCardHand
} from './ui.js';
import { soundSystem } from './sound.js';
import { initRailroadMap, updatePlayerPositions } from './map.js';

// Game instance
let game = new Game();
let elements;
let audioInitialized = false;

// Initialize the application
function init() {
    elements = initUI();
    setupEventListeners();
    showScreen('setup');
}

// Ensure audio is initialized on first user interaction
function ensureAudioInit() {
    if (!audioInitialized) {
        soundSystem.init();
        audioInitialized = true;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Start game button
    elements.startGame.addEventListener('click', () => {
        ensureAudioInit();
        soundSystem.playClick();
        startGame();
    });

    // Draft confirm
    elements.confirmDraft.addEventListener('click', () => {
        soundSystem.playClick();
        handleConfirmDraft();
    });

    // Roll dice button
    elements.rollDiceBtn.addEventListener('click', () => {
        soundSystem.playClick();
        handleRollDice();
    });

    // Continue to station
    elements.continueToStation.addEventListener('click', () => {
        soundSystem.playPhaseTransition();
        handleContinueToStation();
    });

    // Continue to shop
    elements.continueToShop.addEventListener('click', () => {
        soundSystem.playPhaseTransition();
        handleContinueToShop();
    });

    // Skip shop / End turn
    elements.skipShop.addEventListener('click', () => {
        soundSystem.playClick();
        handleEndTurn();
    });

    // Play again
    elements.playAgain.addEventListener('click', () => {
        soundSystem.playClick();
        handlePlayAgain();
    });

    // Back to main menu
    const backToMenuBtn = document.getElementById('back-to-menu');
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            soundSystem.playClick();
            handleBackToMenu();
        });
    }

    // Sound controls
    const soundToggle = document.getElementById('sound-toggle');
    const volumeSlider = document.getElementById('volume-slider');

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            ensureAudioInit();
            const muted = soundSystem.toggleMute();
            soundToggle.classList.toggle('muted', muted);
            soundToggle.querySelector('.sound-icon').textContent = muted ? '\u{1F507}' : '\u{1F50A}';
            if (!muted) soundSystem.playClick();
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            ensureAudioInit();
            const volume = parseInt(e.target.value) / 100;
            soundSystem.setVolume(volume);
        });
        // Set initial volume
        soundSystem.setVolume(0.5);
    }
}

// Handle back to main menu
function handleBackToMenu() {
    game = new Game();
    showScreen('setup');
}

// Start a new game
function startGame() {
    const playerNames = getPlayerNames();
    const roundCount = getRoundCount();

    game.initialize(playerNames, roundCount);

    soundSystem.playGameStart();

    // Go to draft screen
    showScreen('draft');
    updateDraftDisplay();
}

// Update draft display
function updateDraftDisplay() {
    const state = game.getState();
    const player = game.getCurrentPlayer();

    updateDraftPlayer(player.name);
    renderDraftCards(state.draftCards, state.draftSelections, handleToggleDraftCard);
}

// Handle toggling a draft card selection
function handleToggleDraftCard(cardIndex) {
    soundSystem.playDraftSelect();
    game.toggleDraftSelection(cardIndex);
    updateDraftDisplay();
}

// Handle confirming draft selections
function handleConfirmDraft() {
    const result = game.confirmDraft();

    if (game.gameState === GAME_STATES.PLAYING) {
        // All players drafted, start the game
        showScreen('game');

        // Initialize the railroad map
        const mapSvg = document.getElementById('railroad-svg');
        const positionsContainer = document.getElementById('player-positions');
        initRailroadMap(mapSvg);
        updatePlayerPositions(mapSvg, game.players, positionsContainer);

        updateGameDisplay();
    } else {
        // Next player drafts
        updateDraftDisplay();
    }
}

// Update the entire game display
function updateGameDisplay() {
    const state = game.getState();
    const player = game.getCurrentPlayer();

    updateRoundDisplay(state.currentRound, state.totalRounds);
    renderPlayerPanels(game.players, game.currentPlayerIndex);
    updateCurrentPlayer(player);
    updatePlayerResources(player);

    // Update railroad map
    const mapSvg = document.getElementById('railroad-svg');
    const positionsContainer = document.getElementById('player-positions');
    updatePlayerPositions(mapSvg, game.players, positionsContainer);

    // Render card hand
    renderCardHand(player.cardHand, handlePlayCard);

    showPhase(state.phase);

    switch (state.phase) {
        case PHASES.ROLL:
            renderTrainCars(player.trainCars);
            renderDicePreRoll(player.trainCars, player.fuel);
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

// Handle playing a card from hand
function handlePlayCard(cardIndex) {
    soundSystem.playCardPlay();
    const success = game.playCardFromHand(cardIndex);
    if (success) {
        updateGameDisplay();
    }
}

// Handle roll dice
async function handleRollDice() {
    elements.rollDiceBtn.disabled = true;

    // Start animation and sound
    soundSystem.playDiceRoll();
    await animateDiceRoll(800);

    // Actually roll
    const results = game.rollDice();
    const player = game.getCurrentPlayer();
    const total = player.getLastRollTotal();
    const rerollsRemaining = player.getTotalRerollsRemaining();
    const fuelBonus = player.fuel;

    renderDiceResults(results, total, rerollsRemaining, fuelBonus);

    // Setup reroll handlers if available
    if (rerollsRemaining > 0) {
        setupRerollHandlers();
    }

    // Update player resources (fuel may have changed display)
    updatePlayerResources(player);

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
    if (!player.canReroll()) return;

    soundSystem.playClick();
    const success = game.rerollDie(dieIndex);
    if (success) {
        const results = player.lastRollResults;
        const total = player.getLastRollTotal();
        const rerollsRemaining = player.getTotalRerollsRemaining();
        const fuelBonus = player.fuel;

        renderDiceResults(results, total, rerollsRemaining, fuelBonus);
        updatePlayerResources(player);

        if (rerollsRemaining > 0) {
            setupRerollHandlers();
        }
    }
}

// Handle continue to station
function handleContinueToStation() {
    const result = game.advanceToStation();

    if (result) {
        soundSystem.playStationArrival();
        renderStationEarnings(result.earnings, result.fuelGained);
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
        soundSystem.playPurchase();
        // Refresh shop display to show updated gold and remaining cars
        refreshShopDisplay();
    }
}

// Handle purchase card
function handlePurchaseCard(cardIndex) {
    const success = game.purchaseCard(cardIndex);
    if (success) {
        soundSystem.playPurchase();
        // Refresh shop display and card hand
        refreshShopDisplay();
        const player = game.getCurrentPlayer();
        renderCardHand(player.cardHand, handlePlayCard);
    }
}

// Refresh shop display after a purchase
function refreshShopDisplay() {
    const state = game.getState();
    const player = game.getCurrentPlayer();
    renderPlayerPanels(game.players, game.currentPlayerIndex);
    updatePlayerResources(player);
    renderShop(
        player,
        state.availableCars,
        state.availableCards,
        handlePurchaseTrainCar,
        handlePurchaseCard
    );
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
