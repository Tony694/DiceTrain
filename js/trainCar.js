// Train Car definitions for Dice Train

export const TRAIN_CARS = {
    // Starting cars (given to all players)
    coalTender: {
        id: 'coalTender',
        name: 'Coal Tender',
        description: 'A basic coal car that keeps your engine running.',
        die: 'd6',
        stationGold: 1,
        cost: 0,
        isStarting: true,
        type: 'coal'
    },
    passengerCar: {
        id: 'passengerCar',
        name: 'Passenger Car',
        description: 'Carries travelers who pay for their journey.',
        die: 'd4',
        stationGold: 2,
        cost: 0,
        isStarting: true,
        type: 'passenger'
    },
    freightCar: {
        id: 'freightCar',
        name: 'Freight Car',
        description: 'Hauls cargo across long distances.',
        die: 'd8',
        stationGold: 1,
        cost: 0,
        isStarting: true,
        type: 'freight'
    },

    // Purchasable cars
    luxurySleeper: {
        id: 'luxurySleeper',
        name: 'Luxury Sleeper',
        description: 'Premium accommodations for wealthy travelers.',
        die: 'd4',
        stationGold: 4,
        cost: 8,
        isStarting: false,
        type: 'passenger'
    },
    cargoHold: {
        id: 'cargoHold',
        name: 'Cargo Hold',
        description: 'Massive storage for heavy freight. Fast but no gold.',
        die: 'd10',
        stationGold: 0,
        cost: 6,
        isStarting: false,
        type: 'freight'
    },
    diningCar: {
        id: 'diningCar',
        name: 'Dining Car',
        description: 'Fine dining on rails. Passengers pay well to eat.',
        die: 'd6',
        stationGold: 3,
        cost: 10,
        isStarting: false,
        type: 'passenger'
    },
    expressEngine: {
        id: 'expressEngine',
        name: 'Express Engine',
        description: 'An extra engine for maximum speed.',
        die: 'd12',
        stationGold: 0,
        cost: 12,
        isStarting: false,
        type: 'coal'
    },
    mailCar: {
        id: 'mailCar',
        name: 'Mail Car',
        description: 'Delivers letters and small packages.',
        die: 'd4',
        stationGold: 2,
        cost: 5,
        isStarting: false,
        type: 'freight'
    },
    observationDeck: {
        id: 'observationDeck',
        name: 'Observation Deck',
        description: 'Scenic views attract paying tourists.',
        die: 'd6',
        stationGold: 2,
        cost: 7,
        isStarting: false,
        type: 'passenger'
    },
    caboose: {
        id: 'caboose',
        name: 'Caboose',
        description: 'The classic tail car. Adds +1 to your lowest die roll.',
        die: 'd4',
        stationGold: 1,
        cost: 4,
        isStarting: false,
        type: 'special',
        special: 'lowestDieBonus'
    },
    tankCar: {
        id: 'tankCar',
        name: 'Tank Car',
        description: 'Transports fuel and liquids.',
        die: 'd8',
        stationGold: 1,
        cost: 9,
        isStarting: false,
        type: 'freight'
    }
};

// Get starting train cars
export function getStartingCars() {
    return [
        { ...TRAIN_CARS.coalTender },
        { ...TRAIN_CARS.passengerCar },
        { ...TRAIN_CARS.freightCar }
    ];
}

// Get purchasable train cars
export function getPurchasableCars() {
    return Object.values(TRAIN_CARS).filter(car => !car.isStarting);
}

// Get car by ID
export function getCarById(id) {
    return TRAIN_CARS[id] ? { ...TRAIN_CARS[id] } : null;
}
