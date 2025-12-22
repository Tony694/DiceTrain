// Dice system for Dice Train

// Die types and their max values
export const DIE_TYPES = {
    d4: 4,
    d6: 6,
    d8: 8,
    d10: 10,
    d12: 12
};

// Roll a single die
export function rollDie(dieType) {
    const max = DIE_TYPES[dieType];
    if (!max) {
        console.error(`Unknown die type: ${dieType}`);
        return 0;
    }
    return Math.floor(Math.random() * max) + 1;
}

// Roll multiple dice and return results
export function rollDice(diceList) {
    return diceList.map(die => ({
        type: die.type,
        carName: die.carName,
        carType: die.carType,
        baseValue: rollDie(die.type),
        bonus: 0,
        finalValue: 0
    }));
}

// Apply modifiers from enhancement cards to dice results
// fuel parameter adds a flat bonus to total distance
export function applyModifiers(diceResults, enhancementCards, trainCars, fuel = 0) {
    const modifiedResults = diceResults.map(die => ({ ...die }));

    // Store fuel bonus for display purposes (applied in calculateTotal)
    modifiedResults.fuelBonus = fuel;

    for (const card of enhancementCards) {
        const effect = card.effect;

        switch (effect.type) {
            case 'dieBonus':
                // +X to specific car type dice
                modifiedResults.forEach(die => {
                    if (die.carType === effect.carType) {
                        die.bonus += effect.bonus;
                    }
                });
                break;

            case 'allDieBonus':
                // +X to all dice
                modifiedResults.forEach(die => {
                    die.bonus += effect.bonus;
                });
                break;

            case 'minimumRoll':
                // Set minimum roll value
                modifiedResults.forEach(die => {
                    if (die.baseValue < effect.minimum) {
                        die.bonus += (effect.minimum - die.baseValue);
                    }
                });
                break;

            case 'highestDieBonus':
                // +X to highest die
                if (modifiedResults.length > 0) {
                    let highestIndex = 0;
                    let highestValue = modifiedResults[0].baseValue + modifiedResults[0].bonus;
                    modifiedResults.forEach((die, index) => {
                        const value = die.baseValue + die.bonus;
                        if (value > highestValue) {
                            highestValue = value;
                            highestIndex = index;
                        }
                    });
                    modifiedResults[highestIndex].bonus += effect.bonus;
                }
                break;
        }
    }

    // Apply caboose bonus (+1 to lowest die)
    const hasCaboose = trainCars.some(car => car.special === 'lowestDieBonus');
    if (hasCaboose && modifiedResults.length > 0) {
        let lowestIndex = 0;
        let lowestValue = modifiedResults[0].baseValue + modifiedResults[0].bonus;
        modifiedResults.forEach((die, index) => {
            const value = die.baseValue + die.bonus;
            if (value < lowestValue) {
                lowestValue = value;
                lowestIndex = index;
            }
        });
        modifiedResults[lowestIndex].bonus += 1;
    }

    // Calculate final values
    modifiedResults.forEach(die => {
        die.finalValue = die.baseValue + die.bonus;
    });

    return modifiedResults;
}

// Calculate total distance from dice results (includes fuel bonus)
export function calculateTotal(diceResults) {
    const diceTotal = diceResults.reduce((sum, die) => sum + die.finalValue, 0);
    const fuelBonus = diceResults.fuelBonus || 0;
    return diceTotal + fuelBonus;
}

// Get dice list from train cars
export function getDiceFromCars(trainCars) {
    return trainCars.map(car => ({
        type: car.die,
        carName: car.name,
        carType: car.type
    }));
}
