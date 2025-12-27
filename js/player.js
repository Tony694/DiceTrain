// Player class for Dice Train

import { getStartingCars } from './trainCar.js';
import { rollDice, applyModifiers, calculateTotal, getDiceFromCars, DIE_TYPES } from './dice.js';

export class Player {
    constructor(id, name, isAI = false, isLocal = true) {
        this.id = id;
        this.name = name;
        this.isAI = isAI;       // True for computer-controlled players
        this.isLocal = isLocal; // True for players running on this machine
        this.peerId = null;     // PeerJS peer ID for networked players
        this.gold = 3; // Start with 3 gold
        this.fuel = 0; // Fuel is tracked on player, initialized from Coal Tender
        this.totalDistance = 0;
        this.trainCars = getStartingCars();
        this.cardHand = []; // Cards in hand (all cards are now one-time use)
        this.activeCards = []; // Cards that have been played this turn
        this.lastRollResults = [];
        this.fuelRerollsRemaining = 0;

        // Turn state tracking
        this.usedFreeRerollThisTurn = false;
        this.usedMaxDieThisTurn = false;
        this.hasDiscount = 0; // Discount amount for next car purchase

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

    // Reset turn state at start of new turn
    resetTurnState() {
        this.usedFreeRerollThisTurn = false;
        this.usedMaxDieThisTurn = false;
        this.activeCards = []; // Clear active cards from previous turn
    }

    // Roll all dice from train cars
    roll() {
        const diceList = getDiceFromCars(this.trainCars);
        const results = rollDice(diceList);
        this.lastRollResults = applyModifiers(results, this.activeCards, this.trainCars, this.fuel);

        // Set up fuel-based rerolls
        this.fuelRerollsRemaining = this.fuel;

        return this.lastRollResults;
    }

    // Reapply modifiers to existing roll (used after playing cards)
    reapplyModifiers() {
        if (!this.lastRollResults || this.lastRollResults.length === 0) {
            return this.lastRollResults;
        }

        // Preserve base values, reset bonuses
        this.lastRollResults = applyModifiers(
            this.lastRollResults.map(d => ({ ...d, bonus: 0, finalValue: 0 })),
            this.activeCards,
            this.trainCars,
            this.fuel
        );

        return this.lastRollResults;
    }

    // Check if player has a free reroll available (Coal Hopper)
    hasFreeReroll() {
        return !this.usedFreeRerollThisTurn &&
               this.trainCars.some(car => car.special === 'freeReroll');
    }

    // Reroll a specific die
    rerollDie(dieIndex) {
        if (dieIndex >= this.lastRollResults.length) {
            return false;
        }

        // Try free reroll first (Coal Hopper), then fuel
        let usedFuel = false;
        if (this.hasFreeReroll()) {
            this.usedFreeRerollThisTurn = true;
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
        return this.hasFreeReroll() || (this.fuelRerollsRemaining > 0 && this.fuel > 0);
    }

    // Get total rerolls remaining
    getTotalRerollsRemaining() {
        const freeRerolls = this.hasFreeReroll() ? 1 : 0;
        return freeRerolls + Math.min(this.fuelRerollsRemaining, this.fuel);
    }

    // Check if player can use maxDie ability (Steam Boiler)
    canMaxDie() {
        return !this.usedMaxDieThisTurn &&
               this.fuel >= 2 &&
               this.trainCars.some(car => car.special === 'maxDie');
    }

    // Use maxDie ability - spend 2 fuel to set any die to its maximum
    useMaxDie(dieIndex) {
        if (!this.canMaxDie() || dieIndex >= this.lastRollResults.length) {
            return false;
        }

        this.fuel -= 2;
        this.usedMaxDieThisTurn = true;

        const die = this.lastRollResults[dieIndex];
        const maxValue = DIE_TYPES[die.type];
        die.baseValue = maxValue;

        // Reapply modifiers
        this.lastRollResults = applyModifiers(
            this.lastRollResults.map(d => ({ ...d, bonus: 0, finalValue: 0 })),
            this.activeCards,
            this.trainCars,
            this.fuel
        );

        return true;
    }

    // Get total distance from last roll
    getLastRollTotal() {
        return calculateTotal(this.lastRollResults);
    }

    // Move train and add to total distance
    move() {
        let distance = this.getLastRollTotal();

        // Add distance bonuses from active cards
        for (const card of this.activeCards) {
            if (card.effect.type === 'distanceBonus') {
                distance += card.effect.bonus;
            }
        }

        this.totalDistance += distance;
        return distance;
    }

    // Calculate gold earned at station
    calculateStationGold() {
        let gold = 0;
        const breakdown = [];

        // Base gold from each car's stationGold
        for (const car of this.trainCars) {
            if (car.stationGold > 0) {
                gold += car.stationGold;
                breakdown.push({
                    source: car.name,
                    amount: car.stationGold
                });
            }
        }

        // Observation Deck - passengerSynergy: +1g per OTHER passenger car
        const hasObservationDeck = this.trainCars.some(car => car.special === 'passengerSynergy');
        if (hasObservationDeck) {
            const otherPassengerCars = this.trainCars.filter(
                car => car.type === 'passenger' && car.special !== 'passengerSynergy'
            ).length;
            if (otherPassengerCars > 0) {
                gold += otherPassengerCars;
                breakdown.push({
                    source: 'Observation Deck',
                    amount: otherPassengerCars
                });
            }
        }

        // First Class Car - perCarGold: +1g per car owned
        const hasFirstClass = this.trainCars.some(car => car.special === 'perCarGold');
        if (hasFirstClass) {
            const bonus = this.trainCars.length;
            gold += bonus;
            breakdown.push({
                source: 'First Class Car',
                amount: bonus
            });
        }

        // Double gold from active cards (Gold Rush)
        const doubleGoldCard = this.activeCards.find(card => card.effect.type === 'doubleGold');
        if (doubleGoldCard) {
            const doubleAmount = gold;
            gold += doubleAmount;
            breakdown.push({
                source: 'Gold Rush (2x)',
                amount: doubleAmount
            });
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

    // Gain gold
    gainGold(amount) {
        this.gold += amount;
        return this.gold;
    }

    // Gain fuel
    gainFuel(amount) {
        this.fuel += amount;
        return this.fuel;
    }

    // Purchase a train car (with discount support)
    purchaseTrainCar(car) {
        const effectiveCost = Math.max(0, car.cost - this.hasDiscount);
        if (this.gold < effectiveCost) {
            return false;
        }
        this.gold -= effectiveCost;
        this.hasDiscount = 0; // Reset discount after use
        this.trainCars.push({ ...car });
        return true;
    }

    // Purchase an enhancement card (all cards go to hand now)
    purchaseCard(card) {
        if (this.gold < card.cost) {
            return false;
        }
        this.gold -= card.cost;
        this.cardHand.push({ ...card });
        return true;
    }

    // Add card directly to hand (for drafting/drawing)
    addCardToHand(card) {
        this.cardHand.push({ ...card });
    }

    // Play a card from hand (move to active for this turn)
    playCard(cardIndex) {
        if (cardIndex < 0 || cardIndex >= this.cardHand.length) {
            return null;
        }
        const card = this.cardHand.splice(cardIndex, 1)[0];
        this.activeCards.push(card);
        return card;
    }

    // Check if player can afford something
    canAfford(cost) {
        return this.gold >= cost;
    }

    // Check if player can afford a car (with discount)
    canAffordCar(car) {
        const effectiveCost = Math.max(0, car.cost - this.hasDiscount);
        return this.gold >= effectiveCost;
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
