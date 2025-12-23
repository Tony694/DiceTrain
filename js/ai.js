// AI Player system for Dice Train
// Handles automated decision making for computer-controlled players

import { GameOptions, AI_SPEEDS } from './options.js';

// AI decision engine
export const AI = {
    // Get delay based on AI speed setting
    getDelay() {
        const speed = GameOptions.get('aiSpeed');
        return AI_SPEEDS[speed] || AI_SPEEDS.normal;
    },

    // Delay helper for pacing AI turns
    async delay() {
        const ms = this.getDelay();
        if (ms > 0) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    },

    // Execute a complete turn for an AI player
    async executeTurn(game, player, callbacks) {
        const { onRoll, onReroll, onContinueToStation, onContinueToShop, onPurchase, onEndTurn, onUpdate } = callbacks;

        // Roll Phase
        await this.delay();
        if (onRoll) await onRoll();

        // Decide on rerolls
        await this.handleRerolls(game, player, callbacks);

        // Continue to station
        await this.delay();
        if (onContinueToStation) await onContinueToStation();

        // Station phase completes automatically, continue to shop
        await this.delay();
        if (onContinueToShop) await onContinueToShop();

        // Shop Phase - make purchases
        await this.handlePurchases(game, player, callbacks);

        // End turn
        await this.delay();
        if (onEndTurn) await onEndTurn();
    },

    // Handle reroll decisions
    async handleRerolls(game, player, callbacks) {
        const { onReroll, onUpdate } = callbacks;

        while (player.canReroll()) {
            const dieToReroll = this.selectDieToReroll(player);
            if (dieToReroll === -1) break; // No dice worth rerolling

            await this.delay();
            if (onReroll) {
                await onReroll(dieToReroll);
            }
        }
    },

    // Select which die to reroll (returns -1 if none worth rerolling)
    selectDieToReroll(player) {
        const results = player.lastRollResults;
        if (!results || results.length === 0) return -1;

        let worstDieIndex = -1;
        let worstScore = Infinity;

        results.forEach((result, index) => {
            const score = this.evaluateDieRoll(result);
            if (score < worstScore && this.shouldReroll(result)) {
                worstScore = score;
                worstDieIndex = index;
            }
        });

        return worstDieIndex;
    },

    // Evaluate how good a die roll is (0-100)
    evaluateDieRoll(result) {
        const dieType = result.type;
        const maxValue = parseInt(dieType.slice(1)); // d6 -> 6, d12 -> 12
        const value = result.finalValue;

        // Score as percentage of max possible
        return (value / maxValue) * 100;
    },

    // Determine if a die should be rerolled
    shouldReroll(result) {
        const dieType = result.type;
        const maxValue = parseInt(dieType.slice(1));
        const value = result.finalValue;

        // Reroll if below 40% of max value
        const threshold = maxValue * 0.4;

        // Add some randomness to avoid predictable behavior
        const randomFactor = Math.random() * 0.15; // +/- 15%

        return value <= threshold * (1 + randomFactor);
    },

    // Handle shop purchases
    async handlePurchases(game, player, callbacks) {
        const { onPurchase, onUpdate } = callbacks;
        const state = game.getState();

        let purchaseMade = true;
        let purchaseCount = 0;
        const maxPurchases = 3; // Limit purchases per turn to avoid infinite loops

        while (purchaseMade && purchaseCount < maxPurchases) {
            purchaseMade = false;

            // Evaluate all available purchases
            const purchases = this.evaluateAllPurchases(state, player);

            if (purchases.length > 0) {
                // Sort by score, highest first
                purchases.sort((a, b) => b.score - a.score);

                const bestPurchase = purchases[0];

                // Only purchase if score is above threshold
                if (bestPurchase.score >= 25 && player.gold >= bestPurchase.cost) {
                    await this.delay();

                    if (onPurchase) {
                        const success = await onPurchase(bestPurchase.type, bestPurchase.id);
                        if (success) {
                            purchaseMade = true;
                            purchaseCount++;
                        }
                    }
                }
            }
        }
    },

    // Evaluate all available purchases
    evaluateAllPurchases(state, player) {
        const purchases = [];

        // Evaluate train cars
        state.availableCars.forEach(car => {
            if (player.gold >= car.cost) {
                const score = this.evaluateTrainCar(car, player, state);
                purchases.push({
                    type: 'car',
                    id: car.id,
                    cost: car.cost,
                    score: score,
                    name: car.name
                });
            }
        });

        // Evaluate enhancement cards
        state.availableCards.forEach((card, index) => {
            if (player.gold >= card.cost) {
                const score = this.evaluateCard(card, player, state);
                purchases.push({
                    type: 'card',
                    id: index,
                    cost: card.cost,
                    score: score,
                    name: card.name
                });
            }
        });

        return purchases;
    },

    // Evaluate a train car purchase (0-100 score)
    evaluateTrainCar(car, player, state) {
        let score = 0;

        // Base value from die type
        const dieValue = parseInt(car.die.slice(1));
        score += dieValue * 2.5; // d6 = 15, d12 = 30

        // Value station gold
        if (car.stationGold > 0) {
            score += car.stationGold * 6;
        }

        // Value fuel generation
        if (car.fuelPerStation) {
            score += car.fuelPerStation * 10;
        }

        // Value special abilities
        if (car.special === 'halfRollGold') {
            score += 18; // Good for gold generation
        } else if (car.special === 'lowestDieBonus') {
            score += 15; // Caboose effect is useful
        }

        // Cost efficiency penalty
        score -= car.cost * 1.5;

        // Adjust based on current gold reserves
        if (player.gold < 10) {
            score *= 0.7; // Be more conservative when low on gold
        } else if (player.gold > 25) {
            score *= 1.2; // Be more willing to spend when rich
        }

        // Consider game phase - prioritize income early, speed late
        const gameProgress = state.currentRound / state.totalRounds;
        if (gameProgress < 0.3) {
            // Early game: prioritize gold generation
            if (car.stationGold > 0 || car.special === 'halfRollGold') {
                score *= 1.3;
            }
        } else if (gameProgress > 0.7) {
            // Late game: prioritize distance
            score += dieValue * 1.5;
        }

        return Math.max(0, Math.min(100, score));
    },

    // Evaluate an enhancement card purchase (0-100 score)
    evaluateCard(card, player, state) {
        let score = 0;

        // Persistent cards are more valuable
        if (card.persistent) {
            score += 25;
        } else {
            score += 10;
        }

        // Evaluate based on effect type
        if (card.effect) {
            switch (card.effect.type) {
                case 'reroll':
                    // Reroll abilities are very valuable
                    score += (card.effect.count || 1) * 15;
                    break;

                case 'stationBonus':
                    // Station bonuses scale with remaining rounds
                    const remainingRounds = state.totalRounds - state.currentRound;
                    score += (card.effect.bonus || 1) * remainingRounds * 0.8;
                    break;

                case 'dieBonus':
                    // Die bonuses depend on matching cars
                    const matchingCars = player.trainCars.filter(c =>
                        !card.effect.carType || c.type === card.effect.carType
                    ).length;
                    score += (card.effect.bonus || 1) * matchingCars * 4;
                    break;

                case 'fuelBonus':
                    score += (card.effect.bonus || 1) * 8;
                    break;

                case 'distanceBonus':
                    // Distance bonuses are good late game
                    const progress = state.currentRound / state.totalRounds;
                    score += (card.effect.bonus || 5) * (1 + progress);
                    break;

                case 'goldBonus':
                    score += (card.effect.bonus || 5) * 2;
                    break;

                default:
                    score += 10; // Default value for unknown effects
            }
        }

        // Cost efficiency penalty
        score -= card.cost * 1.5;

        // Adjust based on gold reserves
        if (player.gold < 10) {
            score *= 0.6;
        }

        return Math.max(0, Math.min(100, score));
    },

    // Decide whether to play a card from hand (one-time cards)
    shouldPlayCard(card, player, state) {
        // Play distance bonus cards late in the game
        if (card.effect?.type === 'distanceBonus') {
            return state.currentRound >= state.totalRounds * 0.7;
        }

        // Play gold bonus cards if we need gold
        if (card.effect?.type === 'goldBonus') {
            return player.gold < 8;
        }

        // Generally play cards when available
        return Math.random() > 0.3;
    }
};
