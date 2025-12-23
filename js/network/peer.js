// PeerJS wrapper for Dice Train multiplayer
// Handles peer-to-peer WebRTC connections

import { createMessage } from './messages.js';

// Generate a random lobby code
function generateLobbyCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// PeerManager handles all peer-to-peer communication
export class PeerManager {
    constructor() {
        this.peer = null;
        this.connections = new Map(); // peerId -> DataConnection
        this.handlers = new Map();    // messageType -> handler function
        this.isHost = false;
        this.hostConnection = null;   // Client's connection to host
        this.peerId = null;
        this.onOpen = null;
        this.onError = null;
        this.onDisconnect = null;
        this.onPeerConnect = null;
        this.onPeerDisconnect = null;
    }

    // Initialize as host with a lobby code
    async initHost() {
        return new Promise((resolve, reject) => {
            const lobbyCode = 'DT-' + generateLobbyCode();

            // PeerJS is loaded via CDN, available as global
            this.peer = new Peer(lobbyCode, {
                debug: 1 // 0 = none, 1 = errors, 2 = warnings, 3 = all
            });

            this.isHost = true;

            this.peer.on('open', (id) => {
                this.peerId = id;
                console.log('Host peer opened with ID:', id);

                // Listen for incoming connections
                this.peer.on('connection', (conn) => {
                    this._handleIncomingConnection(conn);
                });

                if (this.onOpen) this.onOpen(id);
                resolve(id);
            });

            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                if (err.type === 'unavailable-id') {
                    // ID already taken, try again
                    this.peer.destroy();
                    this.initHost().then(resolve).catch(reject);
                } else {
                    if (this.onError) this.onError(err);
                    reject(err);
                }
            });

            this.peer.on('disconnected', () => {
                console.log('Peer disconnected from server');
                if (this.onDisconnect) this.onDisconnect();
            });
        });
    }

    // Initialize as client and connect to a host
    async initClient(hostId) {
        return new Promise((resolve, reject) => {
            // PeerJS is loaded via CDN, available as global
            this.peer = new Peer(null, { // null = auto-generate ID
                debug: 1
            });

            this.isHost = false;

            this.peer.on('open', (id) => {
                this.peerId = id;
                console.log('Client peer opened with ID:', id);

                // Connect to host
                const conn = this.peer.connect(hostId, {
                    reliable: true
                });

                conn.on('open', () => {
                    console.log('Connected to host:', hostId);
                    this.hostConnection = conn;
                    this._setupConnectionHandlers(conn, hostId);
                    if (this.onOpen) this.onOpen(id);
                    resolve(id);
                });

                conn.on('error', (err) => {
                    console.error('Connection error:', err);
                    if (this.onError) this.onError(err);
                    reject(err);
                });
            });

            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                if (this.onError) this.onError(err);
                reject(err);
            });

            this.peer.on('disconnected', () => {
                console.log('Peer disconnected from server');
                if (this.onDisconnect) this.onDisconnect();
            });
        });
    }

    // Handle incoming connection (host only)
    _handleIncomingConnection(conn) {
        console.log('Incoming connection from:', conn.peer);

        conn.on('open', () => {
            console.log('Connection opened with:', conn.peer);
            this.connections.set(conn.peer, conn);
            this._setupConnectionHandlers(conn, conn.peer);

            if (this.onPeerConnect) {
                this.onPeerConnect(conn.peer);
            }
        });
    }

    // Setup handlers for a connection
    _setupConnectionHandlers(conn, peerId) {
        conn.on('data', (data) => {
            this._handleMessage(data, peerId);
        });

        conn.on('close', () => {
            console.log('Connection closed with:', peerId);
            this.connections.delete(peerId);

            if (this.onPeerDisconnect) {
                this.onPeerDisconnect(peerId);
            }
        });

        conn.on('error', (err) => {
            console.error('Connection error with', peerId, ':', err);
        });
    }

    // Handle incoming message
    _handleMessage(data, fromPeerId) {
        if (typeof data !== 'object' || !data.type) {
            console.warn('Invalid message format:', data);
            return;
        }

        const handler = this.handlers.get(data.type);
        if (handler) {
            handler(data.payload, fromPeerId);
        } else {
            console.warn('No handler for message type:', data.type);
        }
    }

    // Register a message handler
    on(messageType, handler) {
        this.handlers.set(messageType, handler);
    }

    // Remove a message handler
    off(messageType) {
        this.handlers.delete(messageType);
    }

    // Send message to a specific peer
    send(peerId, type, payload = {}) {
        const conn = this.connections.get(peerId);
        if (conn && conn.open) {
            conn.send(createMessage(type, payload));
            return true;
        }
        return false;
    }

    // Send message to host (client only)
    sendToHost(type, payload = {}) {
        if (this.isHost) {
            console.warn('Host cannot send to host');
            return false;
        }
        if (this.hostConnection && this.hostConnection.open) {
            this.hostConnection.send(createMessage(type, payload));
            return true;
        }
        return false;
    }

    // Broadcast message to all connected peers (host only)
    broadcast(type, payload = {}) {
        if (!this.isHost) {
            console.warn('Only host can broadcast');
            return;
        }
        const message = createMessage(type, payload);
        for (const conn of this.connections.values()) {
            if (conn.open) {
                conn.send(message);
            }
        }
    }

    // Broadcast to all except one peer
    broadcastExcept(exceptPeerId, type, payload = {}) {
        if (!this.isHost) {
            console.warn('Only host can broadcast');
            return;
        }
        const message = createMessage(type, payload);
        for (const [peerId, conn] of this.connections.entries()) {
            if (peerId !== exceptPeerId && conn.open) {
                conn.send(message);
            }
        }
    }

    // Get list of connected peer IDs
    getConnectedPeers() {
        return Array.from(this.connections.keys());
    }

    // Get connection count
    getConnectionCount() {
        return this.connections.size;
    }

    // Check if a specific peer is connected
    isPeerConnected(peerId) {
        const conn = this.connections.get(peerId);
        return conn && conn.open;
    }

    // Disconnect a specific peer (host only)
    disconnectPeer(peerId) {
        const conn = this.connections.get(peerId);
        if (conn) {
            conn.close();
            this.connections.delete(peerId);
        }
    }

    // Destroy the peer connection (cleanup)
    destroy() {
        // Close all connections
        for (const conn of this.connections.values()) {
            conn.close();
        }
        this.connections.clear();

        // Close host connection if client
        if (this.hostConnection) {
            this.hostConnection.close();
            this.hostConnection = null;
        }

        // Destroy peer
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }

        this.peerId = null;
        this.isHost = false;
    }
}

// Export singleton for easy use
export const peerManager = new PeerManager();
