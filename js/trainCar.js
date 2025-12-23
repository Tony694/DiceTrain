// Train Car definitions for Dice Train

export const TRAIN_CARS = {
    // ==========================================
    // STARTING CARS (3 cars, each defines a playstyle)
    // ==========================================

    // Fuel Strategy - dice manipulation through fuel
    coalTender: {
        id: 'coalTender',
        name: 'Coal Tender',
        description: 'Fuel engine. Start with 3 fuel. Gain +1 fuel per station.',
        die: 'd6',
        stationGold: 0,
        cost: 0,
        isStarting: true,
        type: 'coal',
        startingFuel: 3,
        fuelPerStation: 1
    },

    // Income Strategy - gold generation
    passengerCar: {
        id: 'passengerCar',
        name: 'Passenger Car',
        description: 'Carry travelers. Earn 3 gold at each station.',
        die: 'd6',
        stationGold: 3,
        cost: 0,
        isStarting: true,
        type: 'passenger'
    },

    // Speed Strategy - consistent distance bonus
    freightCar: {
        id: 'freightCar',
        name: 'Freight Car',
        description: 'Heavy hauler. This die gets +1 to its roll.',
        die: 'd6',
        stationGold: 0,
        cost: 0,
        isStarting: true,
        type: 'freight',
        special: 'selfBonus',
        selfBonus: 1
    },

    // ==========================================
    // ROW 1 - Entry Level (Unlocked at 0 mi)
    // ==========================================

    boxcar: {
        id: 'boxcar',
        name: 'Boxcar',
        description: 'Reliable freight hauler. This die gets +1 to its roll.',
        die: 'd6',
        stationGold: 0,
        cost: 4,
        isStarting: false,
        type: 'freight',
        unlockDistance: 0,
        special: 'selfBonus',
        selfBonus: 1
    },

    mailCar: {
        id: 'mailCar',
        name: 'Mail Car',
        description: 'Steady postal income. +1 gold at each station.',
        die: 'd6',
        stationGold: 1,
        cost: 5,
        isStarting: false,
        type: 'passenger',
        unlockDistance: 0
    },

    waterTower: {
        id: 'waterTower',
        name: 'Water Tower',
        description: 'Steam supply car. +2 fuel at each station.',
        die: 'd4',
        stationGold: 0,
        cost: 5,
        isStarting: false,
        type: 'coal',
        unlockDistance: 0,
        fuelPerStation: 2
    },

    caboose: {
        id: 'caboose',
        name: 'Caboose',
        description: 'Tail car provides stability. +1 to your lowest die roll.',
        die: 'd6',
        stationGold: 0,
        cost: 6,
        isStarting: false,
        type: 'special',
        unlockDistance: 0,
        special: 'lowestDieBonus'
    },

    // ==========================================
    // ROW 2 - Mid Tier (Unlocked at 30 mi)
    // ==========================================

    stockCar: {
        id: 'stockCar',
        name: 'Stock Car',
        description: 'Livestock transport. Larger die for more distance.',
        die: 'd8',
        stationGold: 0,
        cost: 7,
        isStarting: false,
        type: 'freight',
        unlockDistance: 30
    },

    coalHopper: {
        id: 'coalHopper',
        name: 'Coal Hopper',
        description: 'Efficient coal storage. +1 fuel/station. First reroll each turn is free.',
        die: 'd6',
        stationGold: 0,
        cost: 7,
        isStarting: false,
        type: 'coal',
        unlockDistance: 30,
        fuelPerStation: 1,
        special: 'freeReroll'
    },

    diningCar: {
        id: 'diningCar',
        name: 'Dining Car',
        description: 'Fine dining attracts wealthy travelers. +2 gold at stations.',
        die: 'd6',
        stationGold: 2,
        cost: 8,
        isStarting: false,
        type: 'passenger',
        unlockDistance: 30
    },

    observationDeck: {
        id: 'observationDeck',
        name: 'Observation Deck',
        description: 'Scenic views attract tourists. +1 gold per other Passenger car at stations.',
        die: 'd6',
        stationGold: 0,
        cost: 8,
        isStarting: false,
        type: 'passenger',
        unlockDistance: 30,
        special: 'passengerSynergy'
    },

    // ==========================================
    // ROW 3 - Strong Tier (Unlocked at 60 mi)
    // ==========================================

    gondolaCar: {
        id: 'gondolaCar',
        name: 'Gondola Car',
        description: 'Open-top bulk hauler. This die gets +1 to its roll.',
        die: 'd8',
        stationGold: 0,
        cost: 9,
        isStarting: false,
        type: 'freight',
        unlockDistance: 60,
        special: 'selfBonus',
        selfBonus: 1
    },

    tankCar: {
        id: 'tankCar',
        name: 'Tank Car',
        description: 'Massive fuel reserves. +3 fuel at each station.',
        die: 'd6',
        stationGold: 0,
        cost: 10,
        isStarting: false,
        type: 'coal',
        unlockDistance: 60,
        fuelPerStation: 3
    },

    cargoHold: {
        id: 'cargoHold',
        name: 'Cargo Hold',
        description: 'Massive storage capacity. Roll d10 for maximum speed.',
        die: 'd10',
        stationGold: 0,
        cost: 10,
        isStarting: false,
        type: 'freight',
        unlockDistance: 60
    },

    luxurySleeper: {
        id: 'luxurySleeper',
        name: 'Luxury Sleeper',
        description: 'Premium accommodations. +4 gold at each station.',
        die: 'd6',
        stationGold: 4,
        cost: 11,
        isStarting: false,
        type: 'passenger',
        unlockDistance: 60
    },

    // ==========================================
    // ROW 4 - Elite Tier (Unlocked at 100 mi)
    // ==========================================

    steamBoiler: {
        id: 'steamBoiler',
        name: 'Steam Boiler',
        description: 'High-pressure power. Spend 2 fuel to set any die to its maximum (once/turn).',
        die: 'd6',
        stationGold: 0,
        cost: 12,
        isStarting: false,
        type: 'coal',
        unlockDistance: 100,
        special: 'maxDie',
        fuelPerStation: 1
    },

    firstClassCar: {
        id: 'firstClassCar',
        name: 'First Class Car',
        description: 'Railroad tycoon status. +1 gold per train car you own.',
        die: 'd6',
        stationGold: 0,
        cost: 13,
        isStarting: false,
        type: 'passenger',
        unlockDistance: 100,
        special: 'perCarGold'
    },

    expressEngine: {
        id: 'expressEngine',
        name: 'Express Engine',
        description: 'Pure power. Roll the mighty d12.',
        die: 'd12',
        stationGold: 0,
        cost: 14,
        isStarting: false,
        type: 'coal',
        unlockDistance: 100
    },

    pullmanCar: {
        id: 'pullmanCar',
        name: 'Pullman Car',
        description: 'The famous luxury sleeper. +6 gold at each station.',
        die: 'd6',
        stationGold: 6,
        cost: 15,
        isStarting: false,
        type: 'passenger',
        unlockDistance: 100
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

// Get cars filtered by unlock distance
export function getUnlockedCars(playerDistance) {
    return Object.values(TRAIN_CARS)
        .filter(car => !car.isStarting && (car.unlockDistance || 0) <= playerDistance)
        .map(car => ({ ...car }));
}

// Unlock distance tiers for UI display
export const UNLOCK_TIERS = [
    { distance: 0, label: 'Available Now' },
    { distance: 30, label: 'Unlocks at 30 mi' },
    { distance: 60, label: 'Unlocks at 60 mi' },
    { distance: 100, label: 'Unlocks at 100 mi' }
];
