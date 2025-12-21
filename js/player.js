// Player class for Dice Train

import { getStartingCars } from './trainCar.js';
import { rollDice, applyModifiers, calculateTotal, getDiceFromCars } from './dice.js';

export class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.gold = 0;
        this.totalDistance = 0;
        this.trainCars = getStartingCars();
        this.enhancementCards = [];
        this.lastRollResults = [];
        this.rerollsRemaining = 0;
    }

    // Roll all dice from train cars
    roll() {
        const diceList = getDiceFromCars(this.trainCars);
        const results = rollDice(diceList);
        this.lastRollResults = applyModifiers(results, this.enhancementCards, this.trainCars);

        // Check for reroll cards
        this.rerollsRemaining = this.enhancementCards
            .filter(card => card.effect.type === 'reroll')
            .reduce((sum, card) => sum + card.effect.count, 0);

        return this.lastRollResults;
    }

    // Reroll a specific die
    rerollDie(dieIndex) {
        if (this.rerollsRemaining <= 0 || dieIndex >= this.lastRollResults.length) {
            return false;
        }

        const die = this.lastRollResults[dieIndex];
        const newRoll = Math.floor(Math.random() * parseInt(die.type.slice(1))) + 1;
        die.baseValue = newRoll;

        // Reapply modifiers
        this.lastRollResults = applyModifiers(
            this.lastRollResults.map(d => ({ ...d, bonus: 0, finalValue: 0 })),
            this.enhancementCards,
            this.trainCars
        );

        this.rerollsRemaining--;
        return true;
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

        // Apply enhancement card bonuses
        for (const card of this.enhancementCards) {
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

            if (effect.type === 'doubleGold' && effect.uses > 0) {
                const doubleAmount = gold; // Double current gold
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

    // Purchase an enhancement card
    purchaseCard(card) {
        if (this.gold < card.cost) {
            return false;
        }
        this.gold -= card.cost;
        this.enhancementCards.push({ ...card });
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
            totalDistance: this.totalDistance,
            trainCars: this.trainCars.length,
            enhancementCards: this.enhancementCards.length
        };
    }
}
