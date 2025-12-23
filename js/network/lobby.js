// Lobby management for Dice Train multiplayer
// Handles lobby creation, joining, and player management

import { peerManager } from './peer.js';
import { MessageTypes, createLobbyState } from './messages.js';

class LobbyManager {
    constructor() {
        this.lobbyState = null;
        this.isHost = false;
        this.localPlayerId = null;
        this.password = null;

        // Callbacks for UI updates
        this.onLobbyUpdate = null;      // Called when lobby state changes
        this.onPlayerJoined = null;     // Called when a player joins
        this.onPlayerLeft = null;       // Called when a player leaves
        this.onGameStart = null;        // Called when host starts game
        this.onKicked = null;           // Called when client is kicked
        this.onError = null;            // Called on errors
    }

    // Create a new lobby (host)
    async createLobby(config) {
        this.isHost = true;
        this.password = config.password || null;

        // Initialize peer as host
        const peerId = await peerManager.initHost();

        // Create initial lobby state
        this.lobbyState = createLobbyState({
            name: config.name || 'Game Lobby',
            hostName: config.hostName || 'Host',
            maxPlayers: config.maxPlayers || 4,
            hasPassword: !!this.password,
            roundCount: config.roundCount || 12,
            players: [{
                id: peerId,
                name: config.hostName || 'Host',
                isReady: true,
                isAI: false,
                isHost: true
            }],
            status: 'waiting'
        });

        this.localPlayerId = peerId;

        // Setup message handlers for host
        this._setupHostHandlers();

        // Setup peer connection handlers
        peerManager.onPeerConnect = (peerId) => {
            console.log('Peer connected:', peerId);
        };

        peerManager.onPeerDisconnect = (peerId) => {
            this._handlePeerDisconnect(peerId);
        };

        return {
            lobbyCode: peerId,
            lobbyState: this.lobbyState
        };
    }

    // Join an existing lobby (client)
    async joinLobby(lobbyCode, playerName, password = null) {
        this.isHost = false;

        // Initialize peer as client and connect to host
        const peerId = await peerManager.initClient(lobbyCode);
        this.localPlayerId = peerId;

        // Setup message handlers for client
        this._setupClientHandlers();

        // Send join request
        return new Promise((resolve, reject) => {
            // Set up one-time handlers for join response
            const timeout = setTimeout(() => {
                reject(new Error('Join request timed out'));
            }, 10000);

            peerManager.on(MessageTypes.JOIN_ACCEPTED, (payload) => {
                clearTimeout(timeout);
                this.lobbyState = payload.lobbyState;
                if (this.onLobbyUpdate) this.onLobbyUpdate(this.lobbyState);
                resolve(this.lobbyState);
            });

            peerManager.on(MessageTypes.JOIN_REJECTED, (payload) => {
                clearTimeout(timeout);
                reject(new Error(payload.reason || 'Join rejected'));
            });

            // Send join request to host
            peerManager.sendToHost(MessageTypes.JOIN_REQUEST, {
                playerName: playerName,
                password: password
            });
        });
    }

    // Setup message handlers for host
    _setupHostHandlers() {
        // Handle join requests
        peerManager.on(MessageTypes.JOIN_REQUEST, (payload, fromPeerId) => {
            this._handleJoinRequest(payload, fromPeerId);
        });
    }

    // Setup message handlers for client
    _setupClientHandlers() {
        // Handle lobby updates
        peerManager.on(MessageTypes.LOBBY_UPDATE, (payload) => {
            this.lobbyState = payload.lobbyState;
            if (this.onLobbyUpdate) this.onLobbyUpdate(this.lobbyState);
        });

        // Handle player joined
        peerManager.on(MessageTypes.PLAYER_JOINED, (payload) => {
            if (this.onPlayerJoined) this.onPlayerJoined(payload.player);
        });

        // Handle player left
        peerManager.on(MessageTypes.PLAYER_LEFT, (payload) => {
            if (this.onPlayerLeft) this.onPlayerLeft(payload.playerId);
        });

        // Handle game start
        peerManager.on(MessageTypes.GAME_START, (payload) => {
            this.lobbyState.status = 'playing';
            if (this.onGameStart) this.onGameStart(payload);
        });

        // Handle lobby closed
        peerManager.on(MessageTypes.LOBBY_CLOSED, () => {
            if (this.onKicked) this.onKicked('Lobby closed by host');
            this.cleanup();
        });
    }

    // Handle join request (host only)
    _handleJoinRequest(payload, fromPeerId) {
        const { playerName, password } = payload;

        // Check password
        if (this.password && password !== this.password) {
            peerManager.send(fromPeerId, MessageTypes.JOIN_REJECTED, {
                reason: 'Incorrect password'
            });
            return;
        }

        // Check if lobby is full
        if (this.lobbyState.players.length >= this.lobbyState.maxPlayers) {
            peerManager.send(fromPeerId, MessageTypes.JOIN_REJECTED, {
                reason: 'Lobby is full'
            });
            return;
        }

        // Check if game already started
        if (this.lobbyState.status !== 'waiting') {
            peerManager.send(fromPeerId, MessageTypes.JOIN_REJECTED, {
                reason: 'Game has already started'
            });
            return;
        }

        // Add player to lobby
        const newPlayer = {
            id: fromPeerId,
            name: playerName || `Player ${this.lobbyState.players.length + 1}`,
            isReady: false,
            isAI: false,
            isHost: false
        };

        this.lobbyState.players.push(newPlayer);

        // Send acceptance to joining player
        peerManager.send(fromPeerId, MessageTypes.JOIN_ACCEPTED, {
            lobbyState: this.lobbyState
        });

        // Notify all other players
        peerManager.broadcastExcept(fromPeerId, MessageTypes.PLAYER_JOINED, {
            player: newPlayer
        });

        // Broadcast updated lobby state
        peerManager.broadcast(MessageTypes.LOBBY_UPDATE, {
            lobbyState: this.lobbyState
        });

        if (this.onPlayerJoined) this.onPlayerJoined(newPlayer);
        if (this.onLobbyUpdate) this.onLobbyUpdate(this.lobbyState);
    }

    // Handle peer disconnect
    _handlePeerDisconnect(peerId) {
        if (!this.lobbyState) return;

        const playerIndex = this.lobbyState.players.findIndex(p => p.id === peerId);
        if (playerIndex === -1) return;

        const player = this.lobbyState.players[playerIndex];
        this.lobbyState.players.splice(playerIndex, 1);

        if (this.isHost) {
            // Broadcast player left to all remaining clients
            peerManager.broadcast(MessageTypes.PLAYER_LEFT, {
                playerId: peerId
            });

            // Broadcast updated lobby state
            peerManager.broadcast(MessageTypes.LOBBY_UPDATE, {
                lobbyState: this.lobbyState
            });
        }

        if (this.onPlayerLeft) this.onPlayerLeft(peerId);
        if (this.onLobbyUpdate) this.onLobbyUpdate(this.lobbyState);
    }

    // Add AI player to lobby (host only)
    addAIPlayer(name = null) {
        if (!this.isHost || !this.lobbyState) return null;

        if (this.lobbyState.players.length >= this.lobbyState.maxPlayers) {
            return null;
        }

        const aiPlayer = {
            id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: name || `AI ${this.lobbyState.players.filter(p => p.isAI).length + 1}`,
            isReady: true,
            isAI: true,
            isHost: false
        };

        this.lobbyState.players.push(aiPlayer);

        // Broadcast updated lobby state
        peerManager.broadcast(MessageTypes.LOBBY_UPDATE, {
            lobbyState: this.lobbyState
        });

        if (this.onLobbyUpdate) this.onLobbyUpdate(this.lobbyState);
        return aiPlayer;
    }

    // Remove AI player from lobby (host only)
    removeAIPlayer(playerId) {
        if (!this.isHost || !this.lobbyState) return false;

        const playerIndex = this.lobbyState.players.findIndex(
            p => p.id === playerId && p.isAI
        );
        if (playerIndex === -1) return false;

        this.lobbyState.players.splice(playerIndex, 1);

        // Broadcast updated lobby state
        peerManager.broadcast(MessageTypes.LOBBY_UPDATE, {
            lobbyState: this.lobbyState
        });

        if (this.onLobbyUpdate) this.onLobbyUpdate(this.lobbyState);
        return true;
    }

    // Kick a player (host only)
    kickPlayer(playerId) {
        if (!this.isHost || !this.lobbyState) return false;

        const playerIndex = this.lobbyState.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return false;

        const player = this.lobbyState.players[playerIndex];

        // Can't kick the host
        if (player.isHost) return false;

        // Remove from lobby state
        this.lobbyState.players.splice(playerIndex, 1);

        // If it's a real player, disconnect them
        if (!player.isAI) {
            peerManager.send(playerId, MessageTypes.LOBBY_CLOSED, {
                reason: 'You have been kicked'
            });
            peerManager.disconnectPeer(playerId);
        }

        // Broadcast updated lobby state
        peerManager.broadcast(MessageTypes.LOBBY_UPDATE, {
            lobbyState: this.lobbyState
        });

        if (this.onPlayerLeft) this.onPlayerLeft(playerId);
        if (this.onLobbyUpdate) this.onLobbyUpdate(this.lobbyState);
        return true;
    }

    // Update lobby settings (host only)
    updateSettings(settings) {
        if (!this.isHost || !this.lobbyState) return false;

        if (settings.name !== undefined) this.lobbyState.name = settings.name;
        if (settings.maxPlayers !== undefined) this.lobbyState.maxPlayers = settings.maxPlayers;
        if (settings.roundCount !== undefined) this.lobbyState.roundCount = settings.roundCount;
        if (settings.password !== undefined) {
            this.password = settings.password;
            this.lobbyState.hasPassword = !!settings.password;
        }

        // Broadcast updated lobby state
        peerManager.broadcast(MessageTypes.LOBBY_UPDATE, {
            lobbyState: this.lobbyState
        });

        if (this.onLobbyUpdate) this.onLobbyUpdate(this.lobbyState);
        return true;
    }

    // Start the game (host only)
    startGame() {
        if (!this.isHost || !this.lobbyState) return false;

        if (this.lobbyState.players.length < 2) {
            if (this.onError) this.onError('Need at least 2 players to start');
            return false;
        }

        this.lobbyState.status = 'starting';

        // Create player configs for game initialization
        const playerConfigs = this.lobbyState.players.map((player, index) => ({
            name: player.name,
            isAI: player.isAI,
            isLocal: player.isHost || player.isAI, // Host and AI are local
            peerId: player.id
        }));

        // Broadcast game start
        peerManager.broadcast(MessageTypes.GAME_START, {
            playerConfigs: playerConfigs,
            roundCount: this.lobbyState.roundCount
        });

        if (this.onGameStart) {
            this.onGameStart({
                playerConfigs: playerConfigs,
                roundCount: this.lobbyState.roundCount
            });
        }

        return true;
    }

    // Close the lobby (host only)
    closeLobby() {
        if (!this.isHost) return;

        // Notify all clients
        peerManager.broadcast(MessageTypes.LOBBY_CLOSED, {});

        this.cleanup();
    }

    // Leave the lobby (client only)
    leaveLobby() {
        if (this.isHost) {
            this.closeLobby();
        } else {
            this.cleanup();
        }
    }

    // Get current lobby state
    getLobbyState() {
        return this.lobbyState;
    }

    // Check if can start game
    canStartGame() {
        return this.isHost &&
               this.lobbyState &&
               this.lobbyState.players.length >= 2 &&
               this.lobbyState.status === 'waiting';
    }

    // Check if lobby is full
    isFull() {
        return this.lobbyState &&
               this.lobbyState.players.length >= this.lobbyState.maxPlayers;
    }

    // Cleanup
    cleanup() {
        peerManager.destroy();
        this.lobbyState = null;
        this.isHost = false;
        this.localPlayerId = null;
        this.password = null;
    }
}

// Export singleton
export const lobbyManager = new LobbyManager();
