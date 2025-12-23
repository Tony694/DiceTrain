// Message types for Dice Train multiplayer communication

export const MessageTypes = {
    // Lobby management
    JOIN_REQUEST: 'join_request',     // Client -> Host: Request to join lobby
    JOIN_ACCEPTED: 'join_accepted',   // Host -> Client: Join approved
    JOIN_REJECTED: 'join_rejected',   // Host -> Client: Join denied (wrong password, full, etc.)
    PLAYER_JOINED: 'player_joined',   // Host -> All: A player joined the lobby
    PLAYER_LEFT: 'player_left',       // Host -> All: A player left the lobby
    LOBBY_UPDATE: 'lobby_update',     // Host -> All: Lobby state changed (settings, players)
    LOBBY_CLOSED: 'lobby_closed',     // Host -> All: Host closed the lobby

    // Game flow
    GAME_START: 'game_start',         // Host -> All: Game is starting
    GAME_STATE: 'game_state',         // Host -> All: Full game state sync
    GAME_END: 'game_end',             // Host -> All: Game has ended

    // Draft actions
    ACTION_DRAFT_SELECT: 'action_draft_select',   // Client -> Host: Toggle draft card selection
    ACTION_DRAFT_CONFIRM: 'action_draft_confirm', // Client -> Host: Confirm draft selections

    // Turn actions
    ACTION_ROLL: 'action_roll',       // Client -> Host: Roll dice
    ACTION_REROLL: 'action_reroll',   // Client -> Host: Reroll specific die
    ACTION_CONTINUE: 'action_continue', // Client -> Host: Continue to next phase
    ACTION_PURCHASE_CAR: 'action_purchase_car',   // Client -> Host: Purchase train car
    ACTION_PURCHASE_CARD: 'action_purchase_card', // Client -> Host: Purchase enhancement card
    ACTION_PLAY_CARD: 'action_play_card',         // Client -> Host: Play card from hand
    ACTION_END_TURN: 'action_end_turn', // Client -> Host: End turn

    // Utility
    PING: 'ping',                     // Keep-alive
    PONG: 'pong',                     // Keep-alive response
    ERROR: 'error'                    // Error notification
};

// Create a message object
export function createMessage(type, payload = {}) {
    return {
        type,
        payload,
        timestamp: Date.now()
    };
}

// Lobby state for synchronization
export function createLobbyState(config) {
    return {
        name: config.name || 'Game Lobby',
        hostName: config.hostName || 'Host',
        maxPlayers: config.maxPlayers || 4,
        hasPassword: config.hasPassword || false,
        roundCount: config.roundCount || 12,
        players: config.players || [], // Array of { id, name, isReady, isAI }
        status: config.status || 'waiting' // waiting, starting, playing
    };
}

// Game state for synchronization (full state for thin clients)
export function createGameStateSync(game) {
    const state = game.getState();
    return {
        gameState: state.gameState,
        phase: state.phase,
        currentRound: state.currentRound,
        totalRounds: state.totalRounds,
        currentPlayerIndex: game.currentPlayerIndex,
        players: game.players.map(p => ({
            id: p.id,
            name: p.name,
            peerId: p.peerId,  // Include peerId so clients know which player is theirs
            isAI: p.isAI,
            isLocal: p.isLocal,
            gold: p.gold,
            fuel: p.fuel,
            totalDistance: p.totalDistance,
            trainCars: p.trainCars,
            cardHand: p.cardHand,
            activeCards: p.activeCards,
            lastRollResults: p.lastRollResults,
            fuelRerollsRemaining: p.fuelRerollsRemaining,
            cardRerollsRemaining: p.cardRerollsRemaining
        })),
        availableCards: state.availableCards,
        availableCars: state.availableCars,
        draftCards: state.draftCards,
        draftSelections: state.draftSelections,
        lastStationEarnings: game.lastStationEarnings,
        lastFuelGained: game.lastFuelGained
    };
}
