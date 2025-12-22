// Player class for Dice Train

import { getStartingCars } from './trainCar.js';
import { rollDice, applyModifiers, calculateTotal, getDiceFromCars } from './dice.js';

export class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.gold = 6; // Start with 6 gold
        this.fuel = 0; // Fuel is tracked on player, initialized from Coal Tender
        this.totalDistance = 0;
        this.trainCars = getStartingCars();
        this.cardHand = []; // Cards in hand (purchased but not played)
        this.activeCards = []; // Cards that have been played and are active
        this.lastRollResults = [];
        this.fuelRerollsRemaining = 0;
        this.cardRerollsRemaining = 0;

        // Initialize fuel from starting coal tender
        this.initializeFuel();
    }

    // Initialize fuel from coal cars with startingFuel
    initializeFuel() {
        for (const car of this.trainCars) {
            if (car.startingFuel) {
                this.fuel += car.startingFuel;
            }
        }
    }

    // Roll all dice from train cars
    roll() {
        const diceList = getDiceFromCars(this.trainCars);
        const results = rollDice(diceList);
        this.lastRollResults = applyModifiers(results, this.activeCards, this.trainCars, this.fuel);

        // Set up rerolls: fuel-based + card-based
        this.fuelRerollsRemaining = this.fuel; // Can spend any fuel for rerolls
        this.cardRerollsRemaining = this.activeCards
            .filter(card => card.effect.type === 'reroll')
            .reduce((sum, card) => sum + card.effect.count, 0);

        return this.lastRollResults;
    }

    // Reroll a specific die (prioritize card rerolls, then fuel)
    rerollDie(dieIndex) {
        if (dieIndex >= this.lastRollResults.length) {
            return false;
        }

        // Try card rerolls first (free), then fuel
        let usedFuel = false;
        if (this.cardRerollsRemaining > 0) {
            this.cardRerollsRemaining--;
        } else if (this.fuelRerollsRemaining > 0 && this.fuel > 0) {
            this.fuel--;
            this.fuelRerollsRemaining--;
            usedFuel = true;
        } else {
            return false;
        }

        const die = this.lastRollResults[dieIndex];
        const newRoll = Math.floor(Math.random() * parseInt(die.type.slice(1))) + 1;
        die.baseValue = newRoll;

        // Reapply modifiers (fuel bonus may have changed if we spent fuel)
        this.lastRollResults = applyModifiers(
            this.lastRollResults.map(d => ({ ...d, bonus: 0, finalValue: 0 })),
            this.activeCards,
            this.trainCars,
            this.fuel
        );

        return true;
    }

    // Check if player can reroll
    canReroll() {
        return this.cardRerollsRemaining > 0 || (this.fuelRerollsRemaining > 0 && this.fuel > 0);
    }

    // Get total rerolls remaining
    getTotalRerollsRemaining() {
        return this.cardRerollsRemaining + Math.min(this.fuelRerollsRemaining, this.fuel);
    }

    // Get total distance from last roll
    getLastRollTotal() {
        return calculateTotal(this.lastRollResults);
    }

    // Move train and add to total distance
    move() {
        const distance = this.getLastRollTotal();
        this.totalDistance += distance;
        return distance;
    }

    // Calculate gold earned at station
    calculateStationGold() {
        let gold = 0;
        const breakdown = [];

        // Base gold from each car
        for (const car of this.trainCars) {
            if (car.stationGold > 0) {
                gold += car.stationGold;
                breakdown.push({
                    source: car.name,
                    amount: car.stationGold
                });
            }
        }

        // Half roll gold from freight cars with that special ability
        for (let i = 0; i < this.trainCars.length; i++) {
            const car = this.trainCars[i];
            if (car.special === 'halfRollGold' && this.lastRollResults[i]) {
                const rollValue = this.lastRollResults[i].finalValue;
                const halfGold = Math.ceil(rollValue / 2);
                gold += halfGold;
                breakdown.push({
                    source: `${car.name} (half of ${rollValue})`,
                    amount: halfGold
                });
            }
        }

        // Apply active enhancement card bonuses
        for (const card of this.activeCards) {
            const effect = card.effect;

            if (effect.type === 'stationBonus') {
                gold += effect.bonus;
                breakdown.push({
                    source: card.name,
                    amount: effect.bonus
                });
            }

            if (effect.type === 'carTypeGoldBonus') {
                const matchingCars = this.trainCars.filter(car => car.type === effect.carType);
                const bonus = matchingCars.length * effect.bonus;
                if (bonus > 0) {
                    gold += bonus;
                    breakdown.push({
                        source: card.name,
                        amount: bonus
                    });
                }
            }

            if (effect.type === 'perCarGoldBonus') {
                const bonus = this.trainCars.length * effect.bonus;
                if (bonus > 0) {
                    gold += bonus;
                    breakdown.push({
                        source: card.name,
                        amount: bonus
                    });
                }
            }

            if (effect.type === 'doubleGold' && effect.uses > 0) {
                const doubleAmount = gold;
                gold += doubleAmount;
                breakdown.push({
                    source: card.name + ' (consumed)',
                    amount: doubleAmount
                });
                effect.uses--;
            }
        }

        return { total: gold, breakdown };
    }

    // Gain fuel at station from coal cars
    gainFuelAtStation() {
        let fuelGained = 0;
        for (const car of this.trainCars) {
            if (car.fuelPerStation) {
                fuelGained += car.fuelPerStation;
            }
        }
        this.fuel += fuelGained;
        return fuelGained;
    }

    // Gain gold at station
    gainGold(amount) {
        this.gold += amount;
        return this.gold;
    }

    // Purchase a train car
    purchaseTrainCar(car) {
        if (this.gold < car.cost) {
            return false;
        }
        this.gold -= car.cost;
        this.trainCars.push({ ...car });
        return true;
    }

    // Purchase an enhancement card (persistent cards auto-activate, others go to hand)
    purchaseCard(card) {
        if (this.gold < card.cost) {
            return false;
        }
        this.gold -= card.cost;
        this.addCard({ ...card });
        return true;
    }

    // Add card - persistent cards auto-activate, others go to hand
    addCard(card) {
        if (card.persistent) {
            this.activeCards.push(card);
        } else {
            this.cardHand.push(card);
        }
    }

    // Add card directly to hand (for drafting) - respects persistent flag
    addCardToHand(card) {
        this.addCard({ ...card });
    }

    // Play a card from hand (move to active)
    playCard(cardIndex) {
        if (cardIndex < 0 || cardIndex >= this.cardHand.length) {
            return false;
        }
        const card = this.cardHand.splice(cardIndex, 1)[0];
        this.activeCards.push(card);
        return true;
    }

    // Check if player can afford something
    canAfford(cost) {
        return this.gold >= cost;
    }

    // Get summary of player state
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            gold: this.gold,
            fuel: this.fuel,
            totalDistance: this.totalDistance,
            trainCars: this.trainCars.length,
            cardHand: this.cardHand.length,
            activeCards: this.activeCards.length
        };
    }
}
