// Train Car definitions for Dice Train

export const TRAIN_CARS = {
    // Starting cars (given to all players)
    coalTender: {
        id: 'coalTender',
        name: 'Coal Tender',
        description: 'Provides fuel for your journey. Each fuel adds +1 distance, or spend 1 to reroll.',
        die: 'd6',
        stationGold: 0,
        cost: 0,
        isStarting: true,
        type: 'coal',
        startingFuel: 2,
        fuelPerStation: 0
    },
    passengerCar: {
        id: 'passengerCar',
        name: 'Passenger Car',
        description: 'Carries travelers who pay for their journey.',
        die: 'd6',
        stationGold: 2,
        cost: 0,
        isStarting: true,
        type: 'passenger'
    },
    freightCar: {
        id: 'freightCar',
        name: 'Freight Car',
        description: 'Hauls valuable cargo. Earns half your roll in gold (rounded up).',
        die: 'd6',
        stationGold: 0,
        cost: 0,
        isStarting: true,
        type: 'freight',
        special: 'halfRollGold'
    },

    // Purchasable cars (all grant at least d6)
    luxurySleeper: {
        id: 'luxurySleeper',
        name: 'Luxury Sleeper',
        description: 'Premium accommodations for wealthy travelers.',
        die: 'd6',
        stationGold: 4,
        cost: 10,
        isStarting: false,
        type: 'passenger'
    },
    cargoHold: {
        id: 'cargoHold',
        name: 'Cargo Hold',
        description: 'Massive storage for heavy freight. Fast but no gold.',
        die: 'd10',
        stationGold: 0,
        cost: 8,
        isStarting: false,
        type: 'freight'
    },
    diningCar: {
        id: 'diningCar',
        name: 'Dining Car',
        description: 'Fine dining on rails. Passengers pay well to eat.',
        die: 'd6',
        stationGold: 3,
        cost: 9,
        isStarting: false,
        type: 'passenger'
    },
    expressEngine: {
        id: 'expressEngine',
        name: 'Express Engine',
        description: 'An extra engine for maximum speed.',
        die: 'd12',
        stationGold: 0,
        cost: 14,
        isStarting: false,
        type: 'coal'
    },
    mailCar: {
        id: 'mailCar',
        name: 'Mail Car',
        description: 'Delivers letters and small packages for steady income.',
        die: 'd6',
        stationGold: 2,
        cost: 6,
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
        die: 'd6',
        stationGold: 1,
        cost: 5,
        isStarting: false,
        type: 'special',
        special: 'lowestDieBonus'
    },
    tankCar: {
        id: 'tankCar',
        name: 'Tank Car',
        description: 'Transports fuel. Adds +2 fuel at each station.',
        die: 'd6',
        stationGold: 0,
        cost: 8,
        isStarting: false,
        type: 'coal',
        fuelPerStation: 2
    },
    stockCar: {
        id: 'stockCar',
        name: 'Stock Car',
        description: 'Transports livestock. Earns half your roll in gold.',
        die: 'd8',
        stationGold: 0,
        cost: 11,
        isStarting: false,
        type: 'freight',
        special: 'halfRollGold'
    },
    coalHopper: {
        id: 'coalHopper',
        name: 'Coal Hopper',
        description: 'Extra coal storage. Adds +1 fuel at each station.',
        die: 'd6',
        stationGold: 0,
        cost: 6,
        isStarting: false,
        type: 'coal',
        fuelPerStation: 1
    },
    firstClassCar: {
        id: 'firstClassCar',
        name: 'First Class Car',
        description: 'The finest accommodations on the rails.',
        die: 'd6',
        stationGold: 5,
        cost: 12,
        isStarting: false,
        type: 'passenger'
    },
    refrigeratorCar: {
        id: 'refrigeratorCar',
        name: 'Refrigerator Car',
        description: 'Keeps cargo fresh for premium prices.',
        die: 'd6',
        stationGold: 3,
        cost: 9,
        isStarting: false,
        type: 'freight'
    },
    baggageCar: {
        id: 'baggageCar',
        name: 'Baggage Car',
        description: 'Carries traveler luggage for tips.',
        die: 'd6',
        stationGold: 1,
        cost: 4,
        isStarting: false,
        type: 'passenger'
    },
    boxcar: {
        id: 'boxcar',
        name: 'Boxcar',
        description: 'Basic enclosed freight carrier.',
        die: 'd6',
        stationGold: 1,
        cost: 4,
        isStarting: false,
        type: 'freight'
    },
    locomotiveExtra: {
        id: 'locomotiveExtra',
        name: 'Locomotive',
        description: 'A powerful second engine for your train.',
        die: 'd10',
        stationGold: 0,
        cost: 10,
        isStarting: false,
        type: 'coal'
    },
    pullmanCar: {
        id: 'pullmanCar',
        name: 'Pullman Car',
        description: 'The famous luxury sleeper. Premium comfort.',
        die: 'd6',
        stationGold: 6,
        cost: 15,
        isStarting: false,
        type: 'passenger'
    },
    waterTower: {
        id: 'waterTower',
        name: 'Water Tower',
        description: 'Provides water for steam. +1 fuel per station.',
        die: 'd6',
        stationGold: 0,
        cost: 5,
        isStarting: false,
        type: 'coal',
        fuelPerStation: 1
    },
    gondolaCar: {
        id: 'gondolaCar',
        name: 'Gondola Car',
        description: 'Open-top car for bulk materials. Earns half roll gold.',
        die: 'd6',
        stationGold: 0,
        cost: 7,
        isStarting: false,
        type: 'freight',
        special: 'halfRollGold'
    }
};

// Get starting train cars (with instance-specific properties like fuel)
export function getStartingCars() {
    return [
        { ...TRAIN_CARS.coalTender, fuel: TRAIN_CARS.coalTender.startingFuel || 0 },
        { ...TRAIN_CARS.passengerCar },
        { ...TRAIN_CARS.freightCar }
    ];
}

// Get purchasable train cars (returns copies)
export function getPurchasableCars() {
    return Object.values(TRAIN_CARS)
        .filter(car => !car.isStarting)
        .map(car => ({ ...car }));
}

// Get car by ID (returns a copy)
export function getCarById(id) {
    return TRAIN_CARS[id] ? { ...TRAIN_CARS[id] } : null;
}
