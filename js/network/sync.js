// Game state synchronization for Dice Train multiplayer
// Host-authoritative model: Host runs game logic, clients send actions

import { peerManager } from './peer.js';
import { MessageTypes, createGameStateSync } from './messages.js';

class GameSync {
    constructor() {
        this.game = null;           // Reference to game instance
        this.isHost = false;
        this.localPeerId = null;

        // Callbacks for game events
        this.onStateUpdate = null;      // Called when game state is updated
        this.onDraftUpdate = null;      // Called during draft phase updates
        this.onRollResult = null;       // Called when dice are rolled
        this.onStationResult = null;    // Called at station phase
        this.onPurchase = null;         // Called on purchase
        this.onTurnEnd = null;          // Called when turn ends
        this.onGameEnd = null;          // Called when game ends
        this.onError = null;            // Called on errors
    }

    // Initialize sync system
    init(game, isHost, localPeerId) {
        this.game = game;
        this.isHost = isHost;
        this.localPeerId = localPeerId;

        if (isHost) {
            this._setupHostHandlers();
        } else {
            this._setupClientHandlers();
        }
    }

    // Setup message handlers for host
    _setupHostHandlers() {
        // Draft actions
        peerManager.on(MessageTypes.ACTION_DRAFT_SELECT, (payload, fromPeerId) => {
            this._hostHandleDraftSelect(payload, fromPeerId);
        });

        peerManager.on(MessageTypes.ACTION_DRAFT_CONFIRM, (payload, fromPeerId) => {
            this._hostHandleDraftConfirm(fromPeerId);
        });

        // Turn actions
        peerManager.on(MessageTypes.ACTION_ROLL, (payload, fromPeerId) => {
            this._hostHandleRoll(fromPeerId);
        });

        peerManager.on(MessageTypes.ACTION_REROLL, (payload, fromPeerId) => {
            this._hostHandleReroll(payload, fromPeerId);
        });

        peerManager.on(MessageTypes.ACTION_CONTINUE, (payload, fromPeerId) => {
            this._hostHandleContinue(payload, fromPeerId);
        });

        peerManager.on(MessageTypes.ACTION_PURCHASE_CAR, (payload, fromPeerId) => {
            this._hostHandlePurchaseCar(payload, fromPeerId);
        });

        peerManager.on(MessageTypes.ACTION_PURCHASE_CARD, (payload, fromPeerId) => {
            this._hostHandlePurchaseCard(payload, fromPeerId);
        });

        peerManager.on(MessageTypes.ACTION_PLAY_CARD, (payload, fromPeerId) => {
            this._hostHandlePlayCard(payload, fromPeerId);
        });

        peerManager.on(MessageTypes.ACTION_END_TURN, (payload, fromPeerId) => {
            this._hostHandleEndTurn(fromPeerId);
        });
    }

    // Setup message handlers for client
    _setupClientHandlers() {
        // Full game state sync
        peerManager.on(MessageTypes.GAME_STATE, (payload) => {
            this._clientHandleGameState(payload);
        });

        // Game end
        peerManager.on(MessageTypes.GAME_END, (payload) => {
            if (this.onGameEnd) this.onGameEnd(payload);
        });
    }

    // Verify it's the current player's turn
    _isCurrentPlayer(peerId) {
        if (!this.game) return false;
        const currentPlayer = this.game.getCurrentPlayer();
        return currentPlayer && currentPlayer.peerId === peerId;
    }

    // Broadcast game state to all clients
    broadcastGameState() {
        if (!this.isHost || !this.game) return;

        const state = createGameStateSync(this.game);
        peerManager.broadcast(MessageTypes.GAME_STATE, state);
    }

    // --- Host Action Handlers ---

    _hostHandleDraftSelect(payload, fromPeerId) {
        if (!this._isCurrentPlayer(fromPeerId)) return;

        const { cardIndex } = payload;
        this.game.toggleDraftSelection(cardIndex);
        this.broadcastGameState();
    }

    _hostHandleDraftConfirm(fromPeerId) {
        if (!this._isCurrentPlayer(fromPeerId)) return;

        const result = this.game.confirmDraft();
        this.broadcastGameState();

        if (this.onDraftUpdate) this.onDraftUpdate();
    }

    _hostHandleRoll(fromPeerId) {
        if (!this._isCurrentPlayer(fromPeerId)) return;

        const results = this.game.rollDice();
        this.broadcastGameState();

        if (this.onRollResult) this.onRollResult(results);
    }

    _hostHandleReroll(payload, fromPeerId) {
        if (!this._isCurrentPlayer(fromPeerId)) return;

        const { dieIndex } = payload;
        const success = this.game.rerollDie(dieIndex);
        if (success) {
            this.broadcastGameState();
        }
    }

    _hostHandleContinue(payload, fromPeerId) {
        if (!this._isCurrentPlayer(fromPeerId)) return;

        const { toPhase } = payload;

        if (toPhase === 'station') {
            const result = this.game.advanceToStation();
            this.broadcastGameState();
            if (this.onStationResult) this.onStationResult(result);
        } else if (toPhase === 'shop') {
            this.game.advanceToShop();
            this.broadcastGameState();
        }
    }

    _hostHandlePurchaseCar(payload, fromPeerId) {
        if (!this._isCurrentPlayer(fromPeerId)) return;

        const { carId } = payload;
        const success = this.game.purchaseTrainCar(carId);
        if (success) {
            this.broadcastGameState();
            if (this.onPurchase) this.onPurchase('car', carId);
        }
    }

    _hostHandlePurchaseCard(payload, fromPeerId) {
        if (!this._isCurrentPlayer(fromPeerId)) return;

        const { cardIndex } = payload;
        const success = this.game.purchaseCard(cardIndex);
        if (success) {
            this.broadcastGameState();
            if (this.onPurchase) this.onPurchase('card', cardIndex);
        }
    }

    _hostHandlePlayCard(payload, fromPeerId) {
        if (!this._isCurrentPlayer(fromPeerId)) return;

        const { cardIndex } = payload;
        const success = this.game.playCardFromHand(cardIndex);
        if (success) {
            this.broadcastGameState();
        }
    }

    _hostHandleEndTurn(fromPeerId) {
        if (!this._isCurrentPlayer(fromPeerId)) return;

        const result = this.game.endTurn();
        this.broadcastGameState();

        if (result.gameEnded) {
            peerManager.broadcast(MessageTypes.GAME_END, {
                standings: this.game.getStandings()
            });
            if (this.onGameEnd) this.onGameEnd({ standings: this.game.getStandings() });
        } else {
            if (this.onTurnEnd) this.onTurnEnd();
        }
    }

    // --- Client Action Senders ---

    // Send draft select action to host
    sendDraftSelect(cardIndex) {
        if (this.isHost) return false;
        return peerManager.sendToHost(MessageTypes.ACTION_DRAFT_SELECT, { cardIndex });
    }

    // Send draft confirm action to host
    sendDraftConfirm() {
        if (this.isHost) return false;
        return peerManager.sendToHost(MessageTypes.ACTION_DRAFT_CONFIRM, {});
    }

    // Send roll action to host
    sendRoll() {
        if (this.isHost) return false;
        return peerManager.sendToHost(MessageTypes.ACTION_ROLL, {});
    }

    // Send reroll action to host
    sendReroll(dieIndex) {
        if (this.isHost) return false;
        return peerManager.sendToHost(MessageTypes.ACTION_REROLL, { dieIndex });
    }

    // Send continue to phase action to host
    sendContinue(toPhase) {
        if (this.isHost) return false;
        return peerManager.sendToHost(MessageTypes.ACTION_CONTINUE, { toPhase });
    }

    // Send purchase car action to host
    sendPurchaseCar(carId) {
        if (this.isHost) return false;
        return peerManager.sendToHost(MessageTypes.ACTION_PURCHASE_CAR, { carId });
    }

    // Send purchase card action to host
    sendPurchaseCard(cardIndex) {
        if (this.isHost) return false;
        return peerManager.sendToHost(MessageTypes.ACTION_PURCHASE_CARD, { cardIndex });
    }

    // Send play card action to host
    sendPlayCard(cardIndex) {
        if (this.isHost) return false;
        return peerManager.sendToHost(MessageTypes.ACTION_PLAY_CARD, { cardIndex });
    }

    // Send end turn action to host
    sendEndTurn() {
        if (this.isHost) return false;
        return peerManager.sendToHost(MessageTypes.ACTION_END_TURN, {});
    }

    // --- Client State Handler ---

    _clientHandleGameState(state) {
        if (!this.game) return;

        // Update local game state from host
        this._applyGameState(state);

        if (this.onStateUpdate) this.onStateUpdate(state);
    }

    // Apply received game state to local game instance
    _applyGameState(state) {
        if (!this.game) return;

        // Update game properties
        this.game.gameState = state.gameState;
        this.game.phase = state.phase;
        this.game.currentRound = state.currentRound;
        this.game.totalRounds = state.totalRounds;
        this.game.currentPlayerIndex = state.currentPlayerIndex;
        this.game.availableCards = state.availableCards;
        this.game.availableCars = state.availableCars;
        this.game.draftCards = state.draftCards;
        this.game.draftSelections = state.draftSelections;
        this.game.lastStationEarnings = state.lastStationEarnings;
        this.game.lastFuelGained = state.lastFuelGained;

        // Update player states
        state.players.forEach((playerState, index) => {
            if (this.game.players[index]) {
                const player = this.game.players[index];
                player.gold = playerState.gold;
                player.fuel = playerState.fuel;
                player.totalDistance = playerState.totalDistance;
                player.trainCars = playerState.trainCars;
                player.cardHand = playerState.cardHand;
                player.activeCards = playerState.activeCards;
                player.lastRollResults = playerState.lastRollResults;
                player.fuelRerollsRemaining = playerState.fuelRerollsRemaining;
                player.cardRerollsRemaining = playerState.cardRerollsRemaining;
            }
        });
    }

    // Check if it's local player's turn
    isLocalPlayerTurn() {
        if (!this.game) return false;
        const currentPlayer = this.game.getCurrentPlayer();
        return currentPlayer && currentPlayer.peerId === this.localPeerId;
    }

    // Check if local player is the current player (for UI purposes)
    isLocalPlayer(player) {
        return player && player.peerId === this.localPeerId;
    }

    // Cleanup
    cleanup() {
        this.game = null;
        this.isHost = false;
        this.localPeerId = null;
    }
}

// Export singleton
export const gameSync = new GameSync();
