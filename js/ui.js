// UI rendering for Dice Train

import { PHASES, GAME_STATES } from './game.js';
import { renderTrainCarShop, renderEnhancementShop } from './shop.js';

// DOM element references
const elements = {
    // Screens
    setupScreen: null,
    gameScreen: null,
    endScreen: null,
    // Setup
    playerCount: null,
    roundCount: null,
    playerNames: null,
    startGame: null,
    // Game header
    currentRound: null,
    totalRounds: null,
    phaseIndicators: null,
    // Player panels
    playersContainer: null,
    currentPlayerName: null,
    // Roll phase
    rollPhase: null,
    trainCarsDisplay: null,
    diceContainer: null,
    rollTotal: null,
    totalMiles: null,
    rollDiceBtn: null,
    continueToStation: null,
    // Station phase
    stationPhase: null,
    earningsBreakdown: null,
    goldEarned: null,
    continueToShop: null,
    // Shop phase
    shopPhase: null,
    shopPlayerGold: null,
    trainCarShop: null,
    enhancementShop: null,
    skipShop: null,
    // End screen
    finalStandings: null,
    playAgain: null
};

// Initialize DOM references
export function initUI() {
    // Screens
    elements.setupScreen = document.getElementById('setup-screen');
    elements.gameScreen = document.getElementById('game-screen');
    elements.endScreen = document.getElementById('end-screen');
    // Setup
    elements.playerCount = document.getElementById('player-count');
    elements.roundCount = document.getElementById('round-count');
    elements.playerNames = document.getElementById('player-names');
    elements.startGame = document.getElementById('start-game');
    // Game header
    elements.currentRound = document.getElementById('current-round');
    elements.totalRounds = document.getElementById('total-rounds');
    elements.phaseIndicators = document.querySelectorAll('.phase-indicator .phase');
    // Player panels
    elements.playersContainer = document.getElementById('players-container');
    elements.currentPlayerName = document.getElementById('current-player-name');
    // Roll phase
    elements.rollPhase = document.getElementById('roll-phase');
    elements.trainCarsDisplay = document.getElementById('train-cars-display');
    elements.diceContainer = document.getElementById('dice-container');
    elements.rollTotal = document.getElementById('roll-total');
    elements.totalMiles = document.getElementById('total-miles');
    elements.rollDiceBtn = document.getElementById('roll-dice-btn');
    elements.continueToStation = document.getElementById('continue-to-station');
    // Station phase
    elements.stationPhase = document.getElementById('station-phase');
    elements.earningsBreakdown = document.getElementById('earnings-breakdown');
    elements.goldEarned = document.getElementById('gold-earned');
    elements.continueToShop = document.getElementById('continue-to-shop');
    // Shop phase
    elements.shopPhase = document.getElementById('shop-phase');
    elements.shopPlayerGold = document.getElementById('shop-player-gold');
    elements.trainCarShop = document.getElementById('train-car-shop');
    elements.enhancementShop = document.getElementById('enhancement-shop');
    elements.skipShop = document.getElementById('skip-shop');
    // End screen
    elements.finalStandings = document.getElementById('final-standings');
    elements.playAgain = document.getElementById('play-again');

    // Setup player name inputs
    elements.playerCount.addEventListener('change', updatePlayerNameInputs);
    updatePlayerNameInputs();

    return elements;
}

// Update player name inputs based on count
function updatePlayerNameInputs() {
    const count = parseInt(elements.playerCount.value);
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6'];

    elements.playerNames.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'player-name-input';
        div.innerHTML = `
            <div class="player-color" style="background: ${colors[i]}"></div>
            <input type="text" id="player-name-${i}" placeholder="Player ${i + 1}" value="Player ${i + 1}">
        `;
        elements.playerNames.appendChild(div);
    }
}

// Get player names from inputs
export function getPlayerNames() {
    const count = parseInt(elements.playerCount.value);
    const names = [];
    for (let i = 0; i < count; i++) {
        const input = document.getElementById(`player-name-${i}`);
        names.push(input.value || `Player ${i + 1}`);
    }
    return names;
}

// Get round count
export function getRoundCount() {
    return parseInt(elements.roundCount.value);
}

// Show a specific screen
export function showScreen(screenName) {
    elements.setupScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');
    elements.endScreen.classList.remove('active');

    switch (screenName) {
        case 'setup':
            elements.setupScreen.classList.add('active');
            break;
        case 'game':
            elements.gameScreen.classList.add('active');
            break;
        case 'end':
            elements.endScreen.classList.add('active');
            break;
    }
}

// Update round display
export function updateRoundDisplay(current, total) {
    elements.currentRound.textContent = current;
    elements.totalRounds.textContent = total;
}

// Update phase indicator
export function updatePhaseIndicator(phase) {
    elements.phaseIndicators.forEach(el => {
        el.classList.remove('active');
        if (el.dataset.phase === phase) {
            el.classList.add('active');
        }
    });
}

// Show the correct phase content
export function showPhase(phase) {
    elements.rollPhase.classList.add('hidden');
    elements.stationPhase.classList.add('hidden');
    elements.shopPhase.classList.add('hidden');

    switch (phase) {
        case PHASES.ROLL:
            elements.rollPhase.classList.remove('hidden');
            break;
        case PHASES.STATION:
            elements.stationPhase.classList.remove('hidden');
            break;
        case PHASES.SHOP:
            elements.shopPhase.classList.remove('hidden');
            break;
    }

    updatePhaseIndicator(phase);
}

// Render player panels
export function renderPlayerPanels(players, currentPlayerIndex) {
    elements.playersContainer.innerHTML = '';

    players.forEach((player, index) => {
        const card = document.createElement('div');
        card.className = `player-card player-${index + 1}`;
        if (index === currentPlayerIndex) {
            card.classList.add('active');
        }

        const trainCarsList = player.trainCars
            .map(car => `<span class="mini-car">${car.name}</span>`)
            .join('');

        card.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="player-stats">
                <div class="player-stat">
                    <span class="icon">🚂</span>
                    <span>${player.totalDistance} mi</span>
                </div>
                <div class="player-stat">
                    <span class="icon">💰</span>
                    <span>${player.gold}g</span>
                </div>
            </div>
            <div class="player-train">
                <small>Train (${player.trainCars.length} cars)</small>
                <div class="player-train-cars">${trainCarsList}</div>
            </div>
        `;

        elements.playersContainer.appendChild(card);
    });
}

// Update current player display
export function updateCurrentPlayer(player) {
    elements.currentPlayerName.textContent = player.name;
}

// Render train cars for current player
export function renderTrainCars(trainCars) {
    elements.trainCarsDisplay.innerHTML = '';

    trainCars.forEach(car => {
        const tile = document.createElement('div');
        tile.className = 'train-car-tile';
        tile.innerHTML = `
            <div class="car-name">${car.name}</div>
            <div class="car-die">${car.die}</div>
            <div class="car-gold">+${car.stationGold}g</div>
        `;
        elements.trainCarsDisplay.appendChild(tile);
    });
}

// Render dice (before rolling)
export function renderDicePreRoll(trainCars) {
    elements.diceContainer.innerHTML = '';

    trainCars.forEach(car => {
        const dieEl = document.createElement('div');
        dieEl.className = 'die';
        dieEl.innerHTML = `
            <span>?</span>
        `;
        const label = document.createElement('div');
        label.className = 'die-label';
        label.textContent = car.die;

        const wrapper = document.createElement('div');
        wrapper.style.textAlign = 'center';
        wrapper.appendChild(dieEl);
        wrapper.appendChild(label);

        elements.diceContainer.appendChild(wrapper);
    });

    elements.rollTotal.classList.add('hidden');
    elements.rollDiceBtn.classList.remove('hidden');
    elements.continueToStation.classList.add('hidden');
}

// Animate dice rolling
export function animateDiceRoll(duration = 1000) {
    const dice = elements.diceContainer.querySelectorAll('.die');
    dice.forEach(die => die.classList.add('rolling'));

    return new Promise(resolve => {
        setTimeout(() => {
            dice.forEach(die => die.classList.remove('rolling'));
            resolve();
        }, duration);
    });
}

// Render dice results
export function renderDiceResults(results, total, canReroll) {
    elements.diceContainer.innerHTML = '';

    results.forEach((result, index) => {
        const dieEl = document.createElement('div');
        dieEl.className = 'die rolled';
        if (canReroll) {
            dieEl.style.cursor = 'pointer';
            dieEl.title = 'Click to reroll';
        }

        let display = result.baseValue;
        if (result.bonus > 0) {
            display = `${result.baseValue}+${result.bonus}`;
        }

        dieEl.innerHTML = `<span>${result.finalValue}</span>`;

        const label = document.createElement('div');
        label.className = 'die-label';
        label.textContent = `${result.carName} (${result.type})`;

        const wrapper = document.createElement('div');
        wrapper.style.textAlign = 'center';
        wrapper.appendChild(dieEl);
        wrapper.appendChild(label);

        if (result.bonus > 0) {
            const bonusLabel = document.createElement('div');
            bonusLabel.className = 'die-label';
            bonusLabel.style.color = '#ffd700';
            bonusLabel.textContent = `+${result.bonus} bonus`;
            wrapper.appendChild(bonusLabel);
        }

        elements.diceContainer.appendChild(wrapper);
    });

    elements.totalMiles.textContent = total;
    elements.rollTotal.classList.remove('hidden');
    elements.rollDiceBtn.classList.add('hidden');
    elements.continueToStation.classList.remove('hidden');
}

// Render station earnings
export function renderStationEarnings(earnings) {
    elements.earningsBreakdown.innerHTML = '';

    earnings.breakdown.forEach(item => {
        const div = document.createElement('div');
        div.className = 'earning-item';
        div.innerHTML = `
            <span>${item.source}</span>
            <span>+${item.amount}g</span>
        `;
        elements.earningsBreakdown.appendChild(div);
    });

    elements.goldEarned.textContent = earnings.total;
}

// Render shop
export function renderShop(player, cars, cards, onPurchaseCar, onPurchaseCard) {
    elements.shopPlayerGold.textContent = player.gold;
    renderTrainCarShop(elements.trainCarShop, cars, player.gold, onPurchaseCar);
    renderEnhancementShop(elements.enhancementShop, cards, player.gold, onPurchaseCard);
}

// Render final standings
export function renderStandings(standings) {
    elements.finalStandings.innerHTML = '';

    standings.forEach(player => {
        const row = document.createElement('div');
        row.className = 'standing-row';
        row.innerHTML = `
            <span class="standing-rank">#${player.rank}</span>
            <span class="standing-name">${player.name}</span>
            <span class="standing-distance">${player.totalDistance} miles</span>
        `;
        elements.finalStandings.appendChild(row);
    });
}

// Get UI element references
export function getElements() {
    return elements;
}
