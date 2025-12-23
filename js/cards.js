// Enhancement Card definitions for Dice Train
// All cards are one-time use effects that can be played anytime during the player's turn

export const ENHANCEMENT_CARDS = [
    // ==========================================
    // FUEL STRATEGY CARDS (5)
    // ==========================================
    {
        id: 'emergencyCoal',
        name: 'Emergency Coal',
        description: 'Immediately gain 5 fuel.',
        cost: 4,
        persistent: false,
        effect: {
            type: 'gainFuel',
            amount: 5
        }
    },
    {
        id: 'precisionEngineering',
        name: 'Precision Engineering',
        description: 'Set any one die to exactly 4 before rolling.',
        cost: 5,
        persistent: false,
        effect: {
            type: 'setDieValue',
            value: 4
        }
    },
    {
        id: 'fuelSurge',
        name: 'Fuel Surge',
        description: 'This turn, each fuel spent adds +2 distance instead of +1.',
        cost: 6,
        persistent: false,
        effect: {
            type: 'doubleFuelBonus'
        }
    },
    {
        id: 'masterMechanic',
        name: 'Master Mechanic',
        description: 'Reroll ALL your dice once. Keep the new results.',
        cost: 7,
        persistent: false,
        effect: {
            type: 'rerollAll'
        }
    },
    {
        id: 'overclockEngine',
        name: 'Overclock Engine',
        description: 'Double your total fuel bonus this turn (after spending fuel).',
        cost: 8,
        persistent: false,
        effect: {
            type: 'doubleFuelTotal'
        }
    },

    // ==========================================
    // INCOME STRATEGY CARDS (5)
    // ==========================================
    {
        id: 'railroadSubsidy',
        name: 'Railroad Subsidy',
        description: 'Your next train car purchase costs 5 gold less.',
        cost: 3,
        persistent: false,
        effect: {
            type: 'discount',
            amount: 5
        }
    },
    {
        id: 'investorMeeting',
        name: 'Investor Meeting',
        description: 'Immediately gain 8 gold.',
        cost: 4,
        persistent: false,
        effect: {
            type: 'gainGold',
            amount: 8
        }
    },
    {
        id: 'goldRush',
        name: 'Gold Rush',
        description: 'Double gold earned at your next station.',
        cost: 5,
        persistent: false,
        effect: {
            type: 'doubleGold'
        }
    },
    {
        id: 'premiereTickets',
        name: 'Premiere Tickets',
        description: 'Gain +2 gold for each Passenger car you own (this station).',
        cost: 6,
        persistent: false,
        effect: {
            type: 'passengerBonus',
            bonus: 2
        }
    },
    {
        id: 'bankersContract',
        name: "Banker's Contract",
        description: 'Gain gold equal to your current gold (max 15).',
        cost: 8,
        persistent: false,
        effect: {
            type: 'matchGold',
            max: 15
        }
    },

    // ==========================================
    // SPEED STRATEGY CARDS (5)
    // ==========================================
    {
        id: 'turboBoost',
        name: 'Turbo Boost',
        description: 'Add +8 to your total distance this turn.',
        cost: 5,
        persistent: false,
        effect: {
            type: 'distanceBonus',
            bonus: 8
        }
    },
    {
        id: 'tailwind',
        name: 'Tailwind',
        description: '+2 to every die this turn.',
        cost: 6,
        persistent: false,
        effect: {
            type: 'allDieBonus',
            bonus: 2
        }
    },
    {
        id: 'expressRoute',
        name: 'Express Route',
        description: 'Roll twice this turn, keep the higher total.',
        cost: 7,
        persistent: false,
        effect: {
            type: 'doubleRoll'
        }
    },
    {
        id: 'goldenSpike',
        name: 'Golden Spike',
        description: 'Add +12 to your total distance this turn.',
        cost: 8,
        persistent: false,
        effect: {
            type: 'distanceBonus',
            bonus: 12
        }
    },
    {
        id: 'perfectRun',
        name: 'Perfect Run',
        description: 'Set all dice to their maximum values this turn.',
        cost: 12,
        persistent: false,
        effect: {
            type: 'maxAllDice'
        }
    },

    // ==========================================
    // UTILITY CARD (1)
    // ==========================================
    {
        id: 'wildCard',
        name: 'Wild Card',
        description: 'Choose one: +5 fuel, +10 gold, or +10 distance.',
        cost: 6,
        persistent: false,
        effect: {
            type: 'choice',
            options: [
                { label: '+5 Fuel', effectType: 'gainFuel', amount: 5 },
                { label: '+10 Gold', effectType: 'gainGold', amount: 10 },
                { label: '+10 Distance', effectType: 'distanceBonus', bonus: 10 }
            ]
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
