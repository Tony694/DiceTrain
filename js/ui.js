// UI rendering for Dice Train

import { PHASES, GAME_STATES } from './game.js';
import { renderTrainCarShop, renderEnhancementShop } from './shop.js';

// DOM element references
const elements = {
    // Screens
    setupScreen: null,
    draftScreen: null,
    gameScreen: null,
    endScreen: null,
    // Setup
    playerCount: null,
    roundCount: null,
    playerNames: null,
    startGame: null,
    // Draft
    draftPlayerName: null,
    draftCards: null,
    confirmDraft: null,
    // Game header
    currentRound: null,
    totalRounds: null,
    phaseIndicators: null,
    // Player panels
    playersContainer: null,
    currentPlayerName: null,
    // Card hand
    cardHandSection: null,
    cardHand: null,
    handCount: null,
    // Roll phase
    rollPhase: null,
    playerFuel: null,
    playerGoldDisplay: null,
    trainCarsDisplay: null,
    diceContainer: null,
    fuelBonus: null,
    fuelBonusAmount: null,
    rollTotal: null,
    totalMiles: null,
    rerollInfo: null,
    rerollsRemaining: null,
    rollDiceBtn: null,
    continueToStation: null,
    // Station phase
    stationPhase: null,
    earningsBreakdown: null,
    goldEarned: null,
    fuelGained: null,
    fuelEarned: null,
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
    elements.draftScreen = document.getElementById('draft-screen');
    elements.gameScreen = document.getElementById('game-screen');
    elements.endScreen = document.getElementById('end-screen');
    // Setup
    elements.playerCount = document.getElementById('player-count');
    elements.roundCount = document.getElementById('round-count');
    elements.playerNames = document.getElementById('player-names');
    elements.startGame = document.getElementById('start-game');
    // Draft
    elements.draftPlayerName = document.getElementById('draft-player-name');
    elements.draftCards = document.getElementById('draft-cards');
    elements.confirmDraft = document.getElementById('confirm-draft');
    // Game header
    elements.currentRound = document.getElementById('current-round');
    elements.totalRounds = document.getElementById('total-rounds');
    elements.phaseIndicators = document.querySelectorAll('.phase-indicator .phase');
    // Player panels
    elements.playersContainer = document.getElementById('players-container');
    elements.currentPlayerName = document.getElementById('current-player-name');
    // Card hand
    elements.cardHandSection = document.getElementById('card-hand-section');
    elements.cardHand = document.getElementById('card-hand');
    elements.handCount = document.getElementById('hand-count');
    // Roll phase
    elements.rollPhase = document.getElementById('roll-phase');
    elements.playerFuel = document.getElementById('player-fuel');
    elements.playerGoldDisplay = document.getElementById('player-gold-display');
    elements.trainCarsDisplay = document.getElementById('train-cars-display');
    elements.diceContainer = document.getElementById('dice-container');
    elements.fuelBonus = document.getElementById('fuel-bonus');
    elements.fuelBonusAmount = document.getElementById('fuel-bonus-amount');
    elements.rollTotal = document.getElementById('roll-total');
    elements.totalMiles = document.getElementById('total-miles');
    elements.rerollInfo = document.getElementById('reroll-info');
    elements.rerollsRemaining = document.getElementById('rerolls-remaining');
    elements.rollDiceBtn = document.getElementById('roll-dice-btn');
    elements.continueToStation = document.getElementById('continue-to-station');
    // Station phase
    elements.stationPhase = document.getElementById('station-phase');
    elements.earningsBreakdown = document.getElementById('earnings-breakdown');
    elements.goldEarned = document.getElementById('gold-earned');
    elements.fuelGained = document.getElementById('fuel-gained');
    elements.fuelEarned = document.getElementById('fuel-earned');
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
    const colors = ['#8b0000', '#1a4a6e', '#2d5a3d', '#4a3728'];

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
    elements.draftScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');
    elements.endScreen.classList.remove('active');

    switch (screenName) {
        case 'setup':
            elements.setupScreen.classList.add('active');
            break;
        case 'draft':
            elements.draftScreen.classList.add('active');
            break;
        case 'game':
            elements.gameScreen.classList.add('active');
            break;
        case 'end':
            elements.endScreen.classList.add('active');
            break;
    }
}

// Render draft cards
export function renderDraftCards(cards, selections, onToggle) {
    elements.draftCards.innerHTML = '';

    cards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'draft-card';
        if (selections.includes(index)) {
            cardEl.classList.add('selected');
        }

        const cardType = card.persistent ? 'Permanent' : 'One-Time';
        const cardTypeClass = card.persistent ? 'card-persistent' : 'card-onetime';

        cardEl.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-desc">${card.description}</div>
            <div class="card-type ${cardTypeClass}">${cardType}</div>
        `;

        cardEl.addEventListener('click', () => onToggle(index));
        elements.draftCards.appendChild(cardEl);
    });

    // Update confirm button
    elements.confirmDraft.disabled = selections.length !== 2;
    elements.confirmDraft.textContent = `Confirm Selection (${selections.length}/2)`;
}

// Update draft player name
export function updateDraftPlayer(playerName) {
    elements.draftPlayerName.textContent = playerName;
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
                <div class="player-stat">
                    <span class="icon">⛽</span>
                    <span>${player.fuel}</span>
                </div>
                <div class="player-stat">
                    <span class="icon">🃏</span>
                    <span>${player.cardHand?.length ?? 0}</span>
                </div>
            </div>
        `;

        elements.playersContainer.appendChild(card);
    });
}

// Update current player display
export function updateCurrentPlayer(player) {
    elements.currentPlayerName.textContent = player.name;
}

// Update player resources display
export function updatePlayerResources(player) {
    if (elements.playerFuel) {
        elements.playerFuel.textContent = player.fuel;
    }
    if (elements.playerGoldDisplay) {
        elements.playerGoldDisplay.textContent = player.gold;
    }
}

// Render card hand
export function renderCardHand(cardHand, onPlayCard) {
    elements.cardHand.innerHTML = '';
    elements.handCount.textContent = `(${cardHand.length})`;

    if (cardHand.length === 0) {
        elements.cardHand.innerHTML = '<span class="no-cards">No cards in hand</span>';
        return;
    }

    cardHand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'hand-card';
        cardEl.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-desc">${card.description}</div>
            <button class="btn btn-secondary play-btn">Play Card</button>
        `;

        cardEl.querySelector('.play-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            onPlayCard(index);
        });

        elements.cardHand.appendChild(cardEl);
    });
}

// Train car icons mapping (same as shop.js)
const TRAIN_CAR_ICONS = {
    coalTender: '\u{1F6D2}',
    expressEngine: '\u{1F682}',
    tankCar: '\u{1F6E2}\uFE0F',
    coalHopper: '\u{1F4A8}',
    locomotiveExtra: '\u{1F683}',
    waterTower: '\u{1F4A7}',
    passengerCar: '\u{1F68B}',
    luxurySleeper: '\u{1F6CF}\uFE0F',
    diningCar: '\u{1F37D}\uFE0F',
    observationDeck: '\u{1F50D}',
    firstClassCar: '\u{1F451}',
    pullmanCar: '\u{2B50}',
    freightCar: '\u{1F4E6}',
    cargoHold: '\u{1F4E6}',
    mailCar: '\u{1F4EC}',
    stockCar: '\u{1F404}',
    boxcar: '\u{1F4E6}',
    gondolaCar: '\u{26CF}\uFE0F',
    caboose: '\u{1F69D}'
};

function getCarIcon(carId) {
    return TRAIN_CAR_ICONS[carId] || '\u{1F683}';
}

// Render train cars for current player
export function renderTrainCars(trainCars) {
    elements.trainCarsDisplay.innerHTML = '';

    trainCars.forEach(car => {
        const tile = document.createElement('div');
        tile.className = 'train-car-tile';

        let extraInfo = '';
        if (car.special === 'halfRollGold') {
            extraInfo = '<div class="car-special">½ roll = gold</div>';
        } else if (car.stationGold > 0) {
            extraInfo = `<div class="car-gold">+${car.stationGold}g</div>`;
        }
        if (car.fuelPerStation) {
            extraInfo += `<div class="car-fuel">+${car.fuelPerStation} fuel</div>`;
        }

        const icon = getCarIcon(car.id);

        tile.innerHTML = `
            <span class="car-icon">${icon}</span>
            <div class="car-name">${car.name}</div>
            <div class="car-die">${car.die}</div>
            ${extraInfo}
        `;
        elements.trainCarsDisplay.appendChild(tile);
    });
}

// Render dice (before rolling)
export function renderDicePreRoll(trainCars, fuel) {
    elements.diceContainer.innerHTML = '';

    trainCars.forEach(car => {
        const dieEl = document.createElement('div');
        dieEl.className = 'die';
        dieEl.innerHTML = `<span>?</span>`;

        const label = document.createElement('div');
        label.className = 'die-label';
        label.textContent = car.die;

        const wrapper = document.createElement('div');
        wrapper.style.textAlign = 'center';
        wrapper.appendChild(dieEl);
        wrapper.appendChild(label);

        elements.diceContainer.appendChild(wrapper);
    });

    // Show fuel bonus preview
    if (fuel > 0) {
        elements.fuelBonus.classList.remove('hidden');
        elements.fuelBonusAmount.textContent = fuel;
    } else {
        elements.fuelBonus.classList.add('hidden');
    }

    elements.rollTotal.classList.add('hidden');
    elements.rerollInfo.classList.add('hidden');
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
export function renderDiceResults(results, total, rerollsRemaining, fuelBonus) {
    elements.diceContainer.innerHTML = '';

    const canReroll = rerollsRemaining > 0;

    results.forEach((result, index) => {
        const dieEl = document.createElement('div');
        dieEl.className = 'die rolled';
        if (canReroll) {
            dieEl.style.cursor = 'pointer';
            dieEl.title = 'Click to reroll';
            dieEl.dataset.index = index;
        }

        dieEl.innerHTML = `<span>${result.finalValue}</span>`;

        const label = document.createElement('div');
        label.className = 'die-label';
        label.textContent = `${result.carName}`;

        const wrapper = document.createElement('div');
        wrapper.style.textAlign = 'center';
        wrapper.appendChild(dieEl);
        wrapper.appendChild(label);

        if (result.bonus > 0) {
            const bonusLabel = document.createElement('div');
            bonusLabel.className = 'die-label';
            bonusLabel.style.color = '#b5893a';
            bonusLabel.textContent = `+${result.bonus}`;
            wrapper.appendChild(bonusLabel);
        }

        elements.diceContainer.appendChild(wrapper);
    });

    // Show fuel bonus
    if (fuelBonus > 0) {
        elements.fuelBonus.classList.remove('hidden');
        elements.fuelBonusAmount.textContent = fuelBonus;
    } else {
        elements.fuelBonus.classList.add('hidden');
    }

    elements.totalMiles.textContent = total;
    elements.rollTotal.classList.remove('hidden');

    // Show reroll info
    if (canReroll) {
        elements.rerollInfo.classList.remove('hidden');
        elements.rerollsRemaining.textContent = rerollsRemaining;
    } else {
        elements.rerollInfo.classList.add('hidden');
    }

    elements.rollDiceBtn.classList.add('hidden');
    elements.continueToStation.classList.remove('hidden');
}

// Render station earnings
export function renderStationEarnings(earnings, fuelGained) {
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

    // Show fuel gained
    if (fuelGained > 0) {
        elements.fuelGained.classList.remove('hidden');
        elements.fuelEarned.textContent = fuelGained;
    } else {
        elements.fuelGained.classList.add('hidden');
    }
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
