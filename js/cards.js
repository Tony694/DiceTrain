// Enhancement Card definitions for Dice Train

export const ENHANCEMENT_CARDS = [
    {
        id: 'coalEfficiency',
        name: 'Coal Efficiency',
        description: '+1 to all Coal type dice',
        cost: 6,
        effect: {
            type: 'dieBonus',
            carType: 'coal',
            bonus: 1
        }
    },
    {
        id: 'passengerComfort',
        name: 'Passenger Comfort',
        description: '+1 to all Passenger type dice',
        cost: 6,
        effect: {
            type: 'dieBonus',
            carType: 'passenger',
            bonus: 1
        }
    },
    {
        id: 'freightOptimization',
        name: 'Freight Optimization',
        description: '+1 to all Freight type dice',
        cost: 6,
        effect: {
            type: 'dieBonus',
            carType: 'freight',
            bonus: 1
        }
    },
    {
        id: 'stationMaster',
        name: 'Station Master',
        description: '+2 gold at every station',
        cost: 8,
        effect: {
            type: 'stationBonus',
            bonus: 2
        }
    },
    {
        id: 'efficientEngine',
        name: 'Efficient Engine',
        description: '+1 to all dice rolls',
        cost: 15,
        effect: {
            type: 'allDieBonus',
            bonus: 1
        }
    },
    {
        id: 'luckyCharm',
        name: 'Lucky Charm',
        description: 'Re-roll one die per turn',
        cost: 7,
        effect: {
            type: 'reroll',
            count: 1
        }
    },
    {
        id: 'expressDelivery',
        name: 'Express Delivery',
        description: '+2 to your highest die roll',
        cost: 9,
        effect: {
            type: 'highestDieBonus',
            bonus: 2
        }
    },
    {
        id: 'goldRush',
        name: 'Gold Rush',
        description: 'Double gold from your next station (one-time)',
        cost: 5,
        effect: {
            type: 'doubleGold',
            uses: 1
        }
    },
    {
        id: 'steadyHand',
        name: 'Steady Hand',
        description: 'Minimum die roll of 2 on all dice',
        cost: 10,
        effect: {
            type: 'minimumRoll',
            minimum: 2
        }
    },
    {
        id: 'cargoMaster',
        name: 'Cargo Master',
        description: '+1 gold per Freight car at stations',
        cost: 7,
        effect: {
            type: 'carTypeGoldBonus',
            carType: 'freight',
            bonus: 1
        }
    },
    {
        id: 'vipService',
        name: 'VIP Service',
        description: '+1 gold per Passenger car at stations',
        cost: 7,
        effect: {
            type: 'carTypeGoldBonus',
            carType: 'passenger',
            bonus: 1
        }
    },
    {
        id: 'turboBoost',
        name: 'Turbo Boost',
        description: '+3 to total distance once per game',
        cost: 4,
        effect: {
            type: 'distanceBonus',
            bonus: 3,
            uses: 1
        }
    }
];

// Create a shuffled deck
export function createDeck() {
    const deck = ENHANCEMENT_CARDS.map(card => ({ ...card }));
    return shuffleDeck(deck);
}

// Shuffle deck using Fisher-Yates algorithm
export function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Draw cards from deck
export function drawCards(deck, count) {
    const drawn = [];
    for (let i = 0; i < count && deck.length > 0; i++) {
        drawn.push(deck.shift());
    }
    return drawn;
}

// Get card by ID
export function getCardById(id) {
    const card = ENHANCEMENT_CARDS.find(c => c.id === id);
    return card ? { ...card } : null;
}
