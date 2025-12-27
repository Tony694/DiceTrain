// Shop system for Dice Train

import { UNLOCK_TIERS } from './trainCar.js';

// Train car icons mapping
const TRAIN_CAR_ICONS = {
    // Coal/Engine types
    coalTender: '\u{1F6D2}',      // Shopping cart (coal bin)
    expressEngine: '\u{1F682}',   // Steam locomotive
    tankCar: '\u{1F6E2}\uFE0F',   // Oil drum
    coalHopper: '\u{1F4A8}',      // Steam/smoke
    waterTower: '\u{1F4A7}',      // Water droplet
    steamBoiler: '\u{2699}\uFE0F', // Gear (machinery)

    // Passenger types
    passengerCar: '\u{1F68B}',    // Tram car
    luxurySleeper: '\u{1F6CF}\uFE0F', // Bed
    diningCar: '\u{1F37D}\uFE0F', // Fork and knife with plate
    observationDeck: '\u{1F50D}', // Magnifying glass
    firstClassCar: '\u{1F451}',   // Crown
    pullmanCar: '\u{2B50}',       // Star
    mailCar: '\u{1F4EC}',         // Mailbox

    // Freight types
    freightCar: '\u{1F4E6}',      // Package
    cargoHold: '\u{1F4E6}',       // Package
    stockCar: '\u{1F404}',        // Cow
    boxcar: '\u{1F4E6}',          // Package
    gondolaCar: '\u{26CF}\uFE0F', // Pick (mining)

    // Special types
    caboose: '\u{1F69D}'          // Monorail (tail car)
};

// Get icon for a train car
function getCarIcon(carId) {
    return TRAIN_CAR_ICONS[carId] || '\u{1F683}'; // Default to railway car
}

// Render train cars for purchase (4x4 grid with tier unlocks)
export function renderTrainCarShop(container, cars, playerGold, playerDistance, onPurchase) {
    container.innerHTML = '';

    // Group cars by unlock tier
    UNLOCK_TIERS.forEach(tier => {
        const tierCars = cars.filter(car => (car.unlockDistance || 0) === tier.distance);

        if (tierCars.length === 0) return;

        const isLocked = playerDistance < tier.distance;
        const milesNeeded = tier.distance - playerDistance;

        // Create tier header
        const header = document.createElement('div');
        header.className = 'shop-tier-header';
        if (isLocked) {
            header.classList.add('locked');
            header.innerHTML = `<span class="tier-label">${tier.label}</span><span class="tier-unlock">(${milesNeeded} mi to unlock)</span>`;
        } else {
            header.textContent = tier.distance === 0 ? 'Available Now' : `Unlocked (${tier.distance} mi)`;
        }
        container.appendChild(header);

        // Create tier row
        const tierRow = document.createElement('div');
        tierRow.className = 'shop-tier-row';
        if (isLocked) tierRow.classList.add('locked');

        // Sort cars within tier by cost
        const sortedTierCars = [...tierCars].sort((a, b) => a.cost - b.cost);

        sortedTierCars.forEach(car => {
            const item = document.createElement('div');
            item.className = 'shop-car-item';

            const canAfford = playerGold >= car.cost;
            const canBuy = canAfford && !isLocked;

            if (!canAfford) item.classList.add('disabled');
            if (isLocked) item.classList.add('locked');

            // Build special info string based on car abilities
            let specialInfo = '';
            if (car.special === 'selfBonus') {
                specialInfo = `<span class="car-special-tag">+${car.selfBonus} to this die</span>`;
            } else if (car.special === 'lowestDieBonus') {
                specialInfo = '<span class="car-special-tag">+1 Lowest Die</span>';
            } else if (car.special === 'freeReroll') {
                specialInfo = '<span class="car-special-tag">1 Free Reroll</span>';
            } else if (car.special === 'passengerSynergy') {
                specialInfo = '<span class="car-special-tag">+1g/Passenger</span>';
            } else if (car.special === 'perCarGold') {
                specialInfo = '<span class="car-special-tag">+1g/Car</span>';
            } else if (car.special === 'maxDie') {
                specialInfo = '<span class="car-special-tag">Max Any Die</span>';
            } else if (car.fuelPerStation) {
                specialInfo = `<span class="car-fuel-tag">+${car.fuelPerStation} Fuel/Stn</span>`;
            } else if (car.stationGold > 0) {
                specialInfo = `<span class="car-gold-tag">+${car.stationGold}g/Stn</span>`;
            }

            const icon = getCarIcon(car.id);

            item.innerHTML = `
                <div class="car-icon">${icon}</div>
                <div class="car-cost">${car.cost}g</div>
                <div class="car-name">${car.name}</div>
                <div class="car-die">${car.die}</div>
                ${specialInfo}
            `;

            if (canBuy) {
                item.addEventListener('click', () => onPurchase(car.id));
            }

            tierRow.appendChild(item);
        });

        container.appendChild(tierRow);
    });
}

// Render enhancement cards for purchase (all cost 5g, one-time effects)
export function renderEnhancementShop(container, cards, playerGold, deckSize, onPurchase, onDrawRandom) {
    container.innerHTML = '';

    // Add "Draw Random Card" option at the top
    const randomOption = document.createElement('div');
    randomOption.className = 'shop-item shop-item-random';
    if (playerGold < 5 || deckSize === 0) {
        randomOption.classList.add('disabled');
    }

    randomOption.innerHTML = `
        <div class="shop-item-header">
            <span class="shop-item-name">Draw Random Card</span>
            <span class="shop-item-cost">5g</span>
        </div>
        <div class="shop-item-desc">Draw a random card from the deck (${deckSize} cards remaining)</div>
        <div class="shop-item-type card-random">Random</div>
    `;

    if (playerGold >= 5 && deckSize > 0) {
        randomOption.addEventListener('click', () => onDrawRandom());
    }
    container.appendChild(randomOption);

    // Show available cards
    if (cards.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'shop-item-desc';
        emptyMsg.textContent = 'No cards on display';
        container.appendChild(emptyMsg);
        return;
    }

    cards.forEach((card, index) => {
        const item = document.createElement('div');
        item.className = 'shop-item';
        if (playerGold < card.cost) {
            item.classList.add('disabled');
        }

        // Add multiplayer indicator for multiplayer cards
        const typeLabel = card.multiplayer ? 'Multiplayer' : 'One-Time';
        const typeClass = card.multiplayer ? 'card-multiplayer' : 'card-onetime';

        item.innerHTML = `
            <div class="shop-item-header">
                <span class="shop-item-name">${card.name}</span>
                <span class="shop-item-cost">${card.cost}g</span>
            </div>
            <div class="shop-item-desc">${card.description}</div>
            <div class="shop-item-type ${typeClass}">${typeLabel}</div>
        `;

        if (playerGold >= card.cost) {
            item.addEventListener('click', () => onPurchase(index));
        }

        container.appendChild(item);
    });
}

// Check if player can afford any purchases
export function canAffordAnything(cars, cards, playerGold, playerDistance) {
    // Only consider unlocked cars
    const unlockedCars = cars.filter(car => (car.unlockDistance || 0) <= playerDistance);
    const cheapestCar = unlockedCars.length > 0 ? Math.min(...unlockedCars.map(c => c.cost)) : Infinity;
    const cheapestCard = cards.length > 0 ? Math.min(...cards.map(c => c.cost)) : Infinity;
    return playerGold >= Math.min(cheapestCar, cheapestCard);
}
