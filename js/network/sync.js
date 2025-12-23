// Game state synchronization for Dice Train multiplayer
// Thin client model: Host is source of truth, clients just send inputs and render

import { peerManager } from './peer.js';
import { MessageTypes, createGameStateSync } from './messages.js';

class GameSync {
    constructor() {
        this.game = null;           // Reference to game instance (host only has full game)
        this.isHost = false;
        this.localPeerId = null;

        // Callbacks
        this.onStateReceived = null;    // Client: called when state received from host
        this.onGameEnd = null;          // Called when game ends
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

    // Setup message handlers for host (receives actions from clients)
    _setupHostHandlers() {
        peerManager.on(MessageTypes.ACTION_DRAFT_SELECT, (payload, fromPeerId) => {
            if (!this._isCurrentPlayer(fromPeerId)) return;
            this.game.toggleDraftSelection(payload.cardIndex);
            this.broadcastGameState();
        });

        peerManager.on(MessageTypes.ACTION_DRAFT_CONFIRM, (payload, fromPeerId) => {
            if (!this._isCurrentPlayer(fromPeerId)) return;
            this.game.confirmDraft();
            this.broadcastGameState();
        });

        peerManager.on(MessageTypes.ACTION_ROLL, (payload, fromPeerId) => {
            if (!this._isCurrentPlayer(fromPeerId)) return;
            this.game.rollDice();
            this.broadcastGameState();
        });

        peerManager.on(MessageTypes.ACTION_REROLL, (payload, fromPeerId) => {
            if (!this._isCurrentPlayer(fromPeerId)) return;
            this.game.rerollDie(payload.dieIndex);
            this.broadcastGameState();
        });

        peerManager.on(MessageTypes.ACTION_CONTINUE, (payload, fromPeerId) => {
            if (!this._isCurrentPlayer(fromPeerId)) return;
            if (payload.toPhase === 'station') {
                this.game.advanceToStation();
            } else if (payload.toPhase === 'shop') {
                this.game.advanceToShop();
            }
            this.broadcastGameState();
        });

        peerManager.on(MessageTypes.ACTION_PURCHASE_CAR, (payload, fromPeerId) => {
            if (!this._isCurrentPlayer(fromPeerId)) return;
            this.game.purchaseTrainCar(payload.carId);
            this.broadcastGameState();
        });

        peerManager.on(MessageTypes.ACTION_PURCHASE_CARD, (payload, fromPeerId) => {
            if (!this._isCurrentPlayer(fromPeerId)) return;
            this.game.purchaseCard(payload.cardIndex);
            this.broadcastGameState();
        });

        peerManager.on(MessageTypes.ACTION_PLAY_CARD, (payload, fromPeerId) => {
            if (!this._isCurrentPlayer(fromPeerId)) return;
            this.game.playCardFromHand(payload.cardIndex);
            this.broadcastGameState();
        });

        peerManager.on(MessageTypes.ACTION_END_TURN, (payload, fromPeerId) => {
            if (!this._isCurrentPlayer(fromPeerId)) return;
            const result = this.game.endTurn();
            this.broadcastGameState();

            if (result.gameEnded) {
                peerManager.broadcast(MessageTypes.GAME_END, {
                    standings: this.game.getStandings()
                });
                if (this.onGameEnd) this.onGameEnd({ standings: this.game.getStandings() });
            }
        });
    }

    // Setup message handlers for client (receives state from host)
    _setupClientHandlers() {
        peerManager.on(MessageTypes.GAME_STATE, (payload) => {
            if (this.onStateReceived) {
                this.onStateReceived(payload);
            }
        });

        peerManager.on(MessageTypes.GAME_END, (payload) => {
            if (this.onGameEnd) this.onGameEnd(payload);
        });
    }

    // Check if sender is the current player
    _isCurrentPlayer(peerId) {
        if (!this.game) return false;
        const currentPlayer = this.game.getCurrentPlayer();
        return currentPlayer && currentPlayer.peerId === peerId;
    }

    // Broadcast full game state to all clients (host only)
    broadcastGameState() {
        if (!this.isHost || !this.game) return;
        const state = createGameStateSync(this.game);
        peerManager.broadcast(MessageTypes.GAME_STATE, state);
    }

    // --- Client action senders (thin client just sends inputs) ---

    sendDraftSelect(cardIndex) {
        if (this.isHost) return;
        peerManager.sendToHost(MessageTypes.ACTION_DRAFT_SELECT, { cardIndex });
    }

    sendDraftConfirm() {
        if (this.isHost) return;
        peerManager.sendToHost(MessageTypes.ACTION_DRAFT_CONFIRM, {});
    }

    sendRoll() {
        if (this.isHost) return;
        peerManager.sendToHost(MessageTypes.ACTION_ROLL, {});
    }

    sendReroll(dieIndex) {
        if (this.isHost) return;
        peerManager.sendToHost(MessageTypes.ACTION_REROLL, { dieIndex });
    }

    sendContinue(toPhase) {
        if (this.isHost) return;
        peerManager.sendToHost(MessageTypes.ACTION_CONTINUE, { toPhase });
    }

    sendPurchaseCar(carId) {
        if (this.isHost) return;
        peerManager.sendToHost(MessageTypes.ACTION_PURCHASE_CAR, { carId });
    }

    sendPurchaseCard(cardIndex) {
        if (this.isHost) return;
        peerManager.sendToHost(MessageTypes.ACTION_PURCHASE_CARD, { cardIndex });
    }

    sendPlayCard(cardIndex) {
        if (this.isHost) return;
        peerManager.sendToHost(MessageTypes.ACTION_PLAY_CARD, { cardIndex });
    }

    sendEndTurn() {
        if (this.isHost) return;
        peerManager.sendToHost(MessageTypes.ACTION_END_TURN, {});
    }

    // Check if it's the local player's turn (for UI enable/disable)
    isMyTurn(currentPlayerPeerId) {
        return currentPlayerPeerId === this.localPeerId;
    }

    cleanup() {
        this.game = null;
        this.isHost = false;
        this.localPeerId = null;
    }
}

export const gameSync = new GameSync();
