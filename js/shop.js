// Shop system for Dice Train

// Render train cars for purchase
export function renderTrainCarShop(container, cars, playerGold, onPurchase) {
    container.innerHTML = '';

    cars.forEach(car => {
        const item = document.createElement('div');
        item.className = 'shop-item';
        if (playerGold < car.cost) {
            item.classList.add('disabled');
        }

        item.innerHTML = `
            <div class="shop-item-header">
                <span class="shop-item-name">${car.name}</span>
                <span class="shop-item-cost">${car.cost}g</span>
            </div>
            <div class="shop-item-desc">
                ${car.description}<br>
                <strong>${car.die}</strong> | Station: <strong>+${car.stationGold}g</strong>
            </div>
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

        item.innerHTML = `
            <div class="shop-item-header">
                <span class="shop-item-name">${card.name}</span>
                <span class="shop-item-cost">${card.cost}g</span>
            </div>
            <div class="shop-item-desc">${card.description}</div>
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
