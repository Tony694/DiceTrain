// Shop system for Dice Train

// Train car icons mapping
const TRAIN_CAR_ICONS = {
    // Coal/Engine types
    coalTender: '\u{1F6D2}',      // Shopping cart (coal bin)
    expressEngine: '\u{1F682}',   // Steam locomotive
    tankCar: '\u{1F6E2}\uFE0F',   // Oil drum
    coalHopper: '\u{1F4A8}',      // Steam/smoke
    locomotiveExtra: '\u{1F683}', // Railway car
    waterTower: '\u{1F4A7}',      // Water droplet

    // Passenger types
    passengerCar: '\u{1F68B}',    // Tram car
    luxurySleeper: '\u{1F6CF}\uFE0F', // Bed
    diningCar: '\u{1F37D}\uFE0F', // Fork and knife with plate
    observationDeck: '\u{1F50D}', // Magnifying glass
    firstClassCar: '\u{1F451}',   // Crown
    pullmanCar: '\u{2B50}',       // Star

    // Freight types
    freightCar: '\u{1F4E6}',      // Package
    cargoHold: '\u{1F4E6}',       // Package
    mailCar: '\u{1F4EC}',         // Mailbox
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

// Render train cars for purchase (4x4 grid, sorted by price)
export function renderTrainCarShop(container, cars, playerGold, onPurchase) {
    container.innerHTML = '';

    // Sort cars by cost (lowest to highest)
    const sortedCars = [...cars].sort((a, b) => a.cost - b.cost);

    sortedCars.forEach(car => {
        const item = document.createElement('div');
        item.className = 'shop-car-item';
        if (playerGold < car.cost) {
            item.classList.add('disabled');
        }

        // Build special info string
        let specialInfo = '';
        if (car.special === 'halfRollGold') {
            specialInfo = '<span class="car-special-tag">Half Roll = Gold</span>';
        } else if (car.special === 'lowestDieBonus') {
            specialInfo = '<span class="car-special-tag">+1 Lowest Die</span>';
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

        if (playerGold >= car.cost) {
            item.addEventListener('click', () => onPurchase(car.id));
        }

        container.appendChild(item);
    });
}

// Render enhancement cards for purchase
export function renderEnhancementShop(container, cards, playerGold, onPurchase) {
    container.innerHTML = '';

    if (cards.length === 0) {
        container.innerHTML = '<p class="shop-item-desc">No cards available</p>';
        return;
    }

    cards.forEach((card, index) => {
        const item = document.createElement('div');
        item.className = 'shop-item';
        if (playerGold < card.cost) {
            item.classList.add('disabled');
        }

        const cardType = card.persistent ? 'Permanent' : 'One-Time';
        const cardTypeClass = card.persistent ? 'card-persistent' : 'card-onetime';

        item.innerHTML = `
            <div class="shop-item-header">
                <span class="shop-item-name">${card.name}</span>
                <span class="shop-item-cost">${card.cost}g</span>
            </div>
            <div class="shop-item-desc">${card.description}</div>
            <div class="shop-item-type ${cardTypeClass}">${cardType}</div>
        `;

        if (playerGold >= card.cost) {
            item.addEventListener('click', () => onPurchase(index));
        }

        container.appendChild(item);
    });
}

// Check if player can afford any purchases
export function canAffordAnything(cars, cards, playerGold) {
    const cheapestCar = Math.min(...cars.map(c => c.cost));
    const cheapestCard = cards.length > 0 ? Math.min(...cards.map(c => c.cost)) : Infinity;
    return playerGold >= Math.min(cheapestCar, cheapestCard);
}
