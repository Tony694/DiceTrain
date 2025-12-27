// Enhancement Card definitions for Dice Train
// All cards cost 5g and are one-time use effects

// Card definitions with copy counts for deck building
// multiplayer: true means card is removed from deck in single-player games
export const CARD_DEFINITIONS = [
    // ==========================================
    // FUEL STRATEGY CARDS (6 unique, 15 copies)
    // ==========================================
    {
        id: 'coalDelivery',
        name: 'Coal Delivery',
        description: 'Gain 3 fuel.',
        cost: 5,
        copies: 4,
        effect: { type: 'gainFuel', amount: 3 }
    },
    {
        id: 'emergencyCoal',
        name: 'Emergency Coal',
        description: 'Gain 5 fuel.',
        cost: 5,
        copies: 3,
        effect: { type: 'gainFuel', amount: 5 }
    },
    {
        id: 'precisionEngineering',
        name: 'Precision Engineering',
        description: 'Set any one die to exactly 4.',
        cost: 5,
        copies: 2,
        effect: { type: 'setDieValue', value: 4 }
    },
    {
        id: 'masterMechanic',
        name: 'Master Mechanic',
        description: 'Reroll ALL your dice. Keep the new results.',
        cost: 5,
        copies: 2,
        effect: { type: 'rerollAll' }
    },
    {
        id: 'fuelSurge',
        name: 'Fuel Surge',
        description: 'This turn, each fuel adds +2 distance instead of +1.',
        cost: 5,
        copies: 2,
        effect: { type: 'doubleFuelBonus' }
    },
    {
        id: 'overclockEngine',
        name: 'Overclock Engine',
        description: 'Double your total fuel distance bonus this turn.',
        cost: 5,
        copies: 2,
        effect: { type: 'doubleFuelTotal' }
    },

    // ==========================================
    // INCOME STRATEGY CARDS (6 unique, 15 copies)
    // ==========================================
    {
        id: 'smallLoan',
        name: 'Small Loan',
        description: 'Gain 5 gold immediately.',
        cost: 5,
        copies: 4,
        effect: { type: 'gainGold', amount: 5 }
    },
    {
        id: 'investorMeeting',
        name: 'Investor Meeting',
        description: 'Gain 8 gold immediately.',
        cost: 5,
        copies: 2,
        effect: { type: 'gainGold', amount: 8 }
    },
    {
        id: 'railroadSubsidy',
        name: 'Railroad Subsidy',
        description: 'Your next train car purchase costs 5 gold less.',
        cost: 5,
        copies: 3,
        effect: { type: 'discount', amount: 5 }
    },
    {
        id: 'goldRush',
        name: 'Gold Rush',
        description: 'Double gold earned at your next station.',
        cost: 5,
        copies: 2,
        effect: { type: 'doubleGold' }
    },
    {
        id: 'premiereTickets',
        name: 'Premiere Tickets',
        description: 'Gain +2 gold for each Passenger car you own.',
        cost: 5,
        copies: 2,
        effect: { type: 'passengerBonus', bonus: 2 }
    },
    {
        id: 'bankersContract',
        name: "Banker's Contract",
        description: 'Gain gold equal to your current gold (max 12).',
        cost: 5,
        copies: 2,
        effect: { type: 'matchGold', max: 12 }
    },

    // ==========================================
    // SPEED STRATEGY CARDS (6 unique, 15 copies)
    // ==========================================
    {
        id: 'quickStop',
        name: 'Quick Stop',
        description: 'Add +5 to your total distance this turn.',
        cost: 5,
        copies: 4,
        effect: { type: 'distanceBonus', bonus: 5 }
    },
    {
        id: 'turboBoost',
        name: 'Turbo Boost',
        description: 'Add +8 to your total distance this turn.',
        cost: 5,
        copies: 3,
        effect: { type: 'distanceBonus', bonus: 8 }
    },
    {
        id: 'tailwind',
        name: 'Tailwind',
        description: '+2 to every die this turn.',
        cost: 5,
        copies: 2,
        effect: { type: 'allDieBonus', bonus: 2 }
    },
    {
        id: 'goldenSpike',
        name: 'Golden Spike',
        description: 'Add +12 to your total distance this turn.',
        cost: 5,
        copies: 2,
        effect: { type: 'distanceBonus', bonus: 12 }
    },
    {
        id: 'expressRoute',
        name: 'Express Route',
        description: 'Roll twice this turn, keep the higher total.',
        cost: 5,
        copies: 2,
        effect: { type: 'doubleRoll' }
    },
    {
        id: 'perfectRun',
        name: 'Perfect Run',
        description: 'Set all dice to their maximum values.',
        cost: 5,
        copies: 2,
        effect: { type: 'maxAllDice' }
    },

    // ==========================================
    // MULTIPLAYER CARDS (6 unique, 15 copies)
    // These are removed from the deck in single-player
    // ==========================================
    {
        id: 'jointVenture',
        name: 'Joint Venture',
        description: 'Choose a player. You and that player each gain 5 gold.',
        cost: 5,
        copies: 3,
        multiplayer: true,
        effect: { type: 'jointGold', amount: 5 }
    },
    {
        id: 'tradeRoute',
        name: 'Trade Route',
        description: 'Steal 3 gold from target player.',
        cost: 5,
        copies: 3,
        multiplayer: true,
        effect: { type: 'stealGold', amount: 3 }
    },
    {
        id: 'derail',
        name: 'Derail',
        description: 'The player in the lead skips their next roll (goes straight to station). Only works if you are not in the lead.',
        cost: 5,
        copies: 2,
        multiplayer: true,
        effect: { type: 'derail' }
    },
    {
        id: 'sabotage',
        name: 'Sabotage',
        description: 'Target player loses 4 fuel.',
        cost: 5,
        copies: 2,
        multiplayer: true,
        effect: { type: 'sabotage', amount: 4 }
    },
    {
        id: 'alliance',
        name: 'Alliance',
        description: 'You and the player in last place each gain +6 distance.',
        cost: 5,
        copies: 3,
        multiplayer: true,
        effect: { type: 'alliance', bonus: 6 }
    },
    {
        id: 'tollRoad',
        name: 'Toll Road',
        description: 'All other players pay you 2 gold each.',
        cost: 5,
        copies: 2,
        multiplayer: true,
        effect: { type: 'tollRoad', amount: 2 }
    }
];

// Create a shuffled deck based on player count
// In single-player, multiplayer cards are removed
export function createDeck(playerCount = 1) {
    const deck = [];

    for (const cardDef of CARD_DEFINITIONS) {
        // Skip multiplayer cards in single-player
        if (cardDef.multiplayer && playerCount <= 1) {
            continue;
        }

        // Add the specified number of copies
        for (let i = 0; i < cardDef.copies; i++) {
            deck.push({
                ...cardDef,
                // Remove copies property from individual cards
                copies: undefined
            });
        }
    }

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

// Get card definition by ID
export function getCardById(id) {
    const card = CARD_DEFINITIONS.find(c => c.id === id);
    return card ? { ...card } : null;
}

// Get total cards in a full deck (for display purposes)
export function getDeckInfo(playerCount = 1) {
    let totalCards = 0;
    let uniqueCards = 0;

    for (const cardDef of CARD_DEFINITIONS) {
        if (cardDef.multiplayer && playerCount <= 1) {
            continue;
        }
        uniqueCards++;
        totalCards += cardDef.copies;
    }

    return { totalCards, uniqueCards };
}
