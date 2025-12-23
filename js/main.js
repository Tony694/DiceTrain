// Main entry point for Dice Train

import { Game, PHASES, GAME_STATES } from './game.js';
import {
    initUI,
    getElements,
    getPlayerNames,
    getRoundCount,
    showScreen,
    showPhase,
    updateRoundDisplay,
    updateCurrentPlayer,
    updatePlayerResources,
    renderPlayerPanels,
    renderTrainCars,
    renderDicePreRoll,
    animateDiceRoll,
    renderDiceResults,
    renderStationEarnings,
    renderShop,
    renderStandings,
    renderDraftCards,
    updateDraftPlayer,
    renderCardHand
} from './ui.js';
import { soundSystem } from './sound.js';
import { initRailroadMap, updatePlayerPositions } from './map.js';
import { GameOptions } from './options.js';
import { AI } from './ai.js';
import { lobbyManager } from './network/lobby.js';
import { gameSync } from './network/sync.js';

// Game instance
let game = new Game();
let elements;
let audioInitialized = false;

// Game mode flags
let isMultiplayer = false;
let isHost = true;
let localPeerId = null;

// Initialize the application
function init() {
    // Load saved options
    GameOptions.load();

    elements = initUI();
    setupEventListeners();
    setupMenuListeners();
    setupOptionsListeners();

    // Start at main menu
    showScreen('menu');
}

// Ensure audio is initialized on first user interaction
function ensureAudioInit() {
    if (!audioInitialized) {
        soundSystem.init();
        audioInitialized = true;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Start game button
    elements.startGame.addEventListener('click', () => {
        ensureAudioInit();
        soundSystem.playClick();
        startGame();
    });

    // Draft confirm
    elements.confirmDraft.addEventListener('click', () => {
        soundSystem.playClick();
        handleConfirmDraft();
    });

    // Roll dice button
    elements.rollDiceBtn.addEventListener('click', () => {
        soundSystem.playClick();
        handleRollDice();
    });

    // Continue to station
    elements.continueToStation.addEventListener('click', () => {
        soundSystem.playPhaseTransition();
        handleContinueToStation();
    });

    // Continue to shop
    elements.continueToShop.addEventListener('click', () => {
        soundSystem.playPhaseTransition();
        handleContinueToShop();
    });

    // Skip shop / End turn
    elements.skipShop.addEventListener('click', () => {
        soundSystem.playClick();
        handleEndTurn();
    });

    // Play again
    elements.playAgain.addEventListener('click', () => {
        soundSystem.playClick();
        handlePlayAgain();
    });

    // Back to main menu
    const backToMenuBtn = document.getElementById('back-to-menu');
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            soundSystem.playClick();
            handleBackToMenu();
        });
    }

    // Sound controls
    const soundToggle = document.getElementById('sound-toggle');
    const volumeSlider = document.getElementById('volume-slider');

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            ensureAudioInit();
            const muted = soundSystem.toggleMute();
            soundToggle.classList.toggle('muted', muted);
            soundToggle.querySelector('.sound-icon').textContent = muted ? '\u{1F507}' : '\u{1F50A}';
            if (!muted) soundSystem.playClick();
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            ensureAudioInit();
            const volume = parseInt(e.target.value) / 100;
            soundSystem.setVolume(volume);
        });
        // Set initial volume
        soundSystem.setVolume(0.5);
    }
}

// Handle back to main menu
function handleBackToMenu() {
    game = new Game();
    isMultiplayer = false;
    isHost = true;
    showScreen('menu');
}

// Setup main menu listeners
function setupMenuListeners() {
    const menuSinglePlayer = document.getElementById('menu-single-player');
    const menuHostGame = document.getElementById('menu-host-game');
    const menuBrowseLobbies = document.getElementById('menu-browse-lobbies');
    const menuOptions = document.getElementById('menu-options');
    const backToMenuSetup = document.getElementById('back-to-menu-setup');
    const backToMenuBrowser = document.getElementById('back-to-menu-browser');

    if (menuSinglePlayer) {
        menuSinglePlayer.addEventListener('click', () => {
            ensureAudioInit();
            soundSystem.playClick();
            isMultiplayer = false;
            isHost = true;
            showScreen('setup');
        });
    }

    if (menuHostGame) {
        menuHostGame.addEventListener('click', () => {
            ensureAudioInit();
            soundSystem.playClick();
            handleHostMultiplayer();
        });
    }

    if (menuBrowseLobbies) {
        menuBrowseLobbies.addEventListener('click', () => {
            ensureAudioInit();
            soundSystem.playClick();
            showScreen('browser');
        });
    }

    if (menuOptions) {
        menuOptions.addEventListener('click', () => {
            ensureAudioInit();
            soundSystem.playClick();
            loadOptionsToUI();
            showScreen('options');
        });
    }

    if (backToMenuSetup) {
        backToMenuSetup.addEventListener('click', () => {
            soundSystem.playClick();
            showScreen('menu');
        });
    }

    if (backToMenuBrowser) {
        backToMenuBrowser.addEventListener('click', () => {
            soundSystem.playClick();
            showScreen('menu');
        });
    }

    // Lobby screen buttons
    const cancelLobby = document.getElementById('cancel-lobby');
    const copyLobbyCode = document.getElementById('copy-lobby-code');
    const startLobbyGame = document.getElementById('start-lobby-game');

    if (cancelLobby) {
        cancelLobby.addEventListener('click', () => {
            soundSystem.playClick();
            lobbyManager.closeLobby();
            isMultiplayer = false;
            isHost = true;
            showScreen('menu');
        });
    }

    if (copyLobbyCode) {
        copyLobbyCode.addEventListener('click', () => {
            soundSystem.playClick();
            const code = document.getElementById('lobby-code').textContent;
            navigator.clipboard.writeText(code).catch(() => {});
        });
    }

    if (startLobbyGame) {
        startLobbyGame.addEventListener('click', () => {
            soundSystem.playClick();
            lobbyManager.startGame();
        });
    }

    // Add AI player button
    const addAIPlayer = document.getElementById('add-ai-player');
    if (addAIPlayer) {
        addAIPlayer.addEventListener('click', () => {
            soundSystem.playClick();
            lobbyManager.addAIPlayer();
        });
    }

    // Browser screen buttons
    const joinLobbyBtn = document.getElementById('join-lobby-btn');
    if (joinLobbyBtn) {
        joinLobbyBtn.addEventListener('click', () => {
            soundSystem.playClick();
            handleJoinLobby();
        });
    }
}

// Setup options screen listeners
function setupOptionsListeners() {
    const soundEnabled = document.getElementById('option-sound-enabled');
    const volumeSlider = document.getElementById('option-volume');
    const volumeDisplay = document.getElementById('volume-display');
    const aiSpeed = document.getElementById('option-ai-speed');
    const saveOptions = document.getElementById('save-options');
    const resetOptions = document.getElementById('reset-options');

    if (soundEnabled) {
        soundEnabled.addEventListener('change', () => {
            const enabled = soundEnabled.checked;
            document.querySelector('.toggle-label').textContent = enabled ? 'On' : 'Off';
            // Preview sound if enabling
            if (enabled) {
                ensureAudioInit();
                soundSystem.setEnabled(true);
                soundSystem.playClick();
            } else {
                soundSystem.setEnabled(false);
            }
        });
    }

    if (volumeSlider && volumeDisplay) {
        volumeSlider.addEventListener('input', () => {
            const vol = volumeSlider.value;
            volumeDisplay.textContent = `${vol}%`;
            ensureAudioInit();
            soundSystem.setVolume(parseInt(vol) / 100);
        });
    }

    if (saveOptions) {
        saveOptions.addEventListener('click', () => {
            soundSystem.playClick();
            saveOptionsFromUI();
            showScreen('menu');
        });
    }

    if (resetOptions) {
        resetOptions.addEventListener('click', () => {
            soundSystem.playClick();
            GameOptions.reset();
            loadOptionsToUI();
            soundSystem.loadFromOptions();
        });
    }
}

// Load current options values to UI
function loadOptionsToUI() {
    const soundEnabled = document.getElementById('option-sound-enabled');
    const volumeSlider = document.getElementById('option-volume');
    const volumeDisplay = document.getElementById('volume-display');
    const aiSpeed = document.getElementById('option-ai-speed');
    const toggleLabel = document.querySelector('.toggle-label');

    if (soundEnabled) {
        soundEnabled.checked = GameOptions.get('soundEnabled');
        if (toggleLabel) {
            toggleLabel.textContent = soundEnabled.checked ? 'On' : 'Off';
        }
    }

    if (volumeSlider) {
        const vol = GameOptions.get('soundVolume');
        volumeSlider.value = vol;
        if (volumeDisplay) {
            volumeDisplay.textContent = `${vol}%`;
        }
    }

    if (aiSpeed) {
        aiSpeed.value = GameOptions.get('aiSpeed');
    }
}

// Save options from UI to storage
function saveOptionsFromUI() {
    const soundEnabled = document.getElementById('option-sound-enabled');
    const volumeSlider = document.getElementById('option-volume');
    const aiSpeed = document.getElementById('option-ai-speed');

    if (soundEnabled) {
        GameOptions.set('soundEnabled', soundEnabled.checked);
    }

    if (volumeSlider) {
        GameOptions.set('soundVolume', parseInt(volumeSlider.value));
    }

    if (aiSpeed) {
        GameOptions.set('aiSpeed', aiSpeed.value);
    }

    GameOptions.save();

    // Apply to sound system
    soundSystem.loadFromOptions();
}

// Handle host multiplayer button
async function handleHostMultiplayer() {
    isMultiplayer = true;
    isHost = true;

    // Get lobby config from UI
    const lobbyNameInput = document.getElementById('lobby-name');
    const lobbyPasswordInput = document.getElementById('lobby-password');
    const lobbyRoundsSelect = document.getElementById('lobby-rounds');
    const lobbyMaxPlayersSelect = document.getElementById('lobby-max-players');
    const lobbyCodeEl = document.getElementById('lobby-code');
    const startLobbyGameBtn = document.getElementById('start-lobby-game');

    if (lobbyCodeEl) {
        lobbyCodeEl.textContent = 'Connecting...';
    }

    showScreen('lobby');

    try {
        // Setup lobby callbacks
        lobbyManager.onLobbyUpdate = updateLobbyUI;
        lobbyManager.onPlayerJoined = (player) => {
            soundSystem.playClick();
            updateLobbyUI(lobbyManager.getLobbyState());
        };
        lobbyManager.onPlayerLeft = () => {
            updateLobbyUI(lobbyManager.getLobbyState());
        };
        lobbyManager.onError = (error) => {
            console.error('Lobby error:', error);
        };

        // Create the lobby
        const result = await lobbyManager.createLobby({
            name: lobbyNameInput?.value || 'Game Lobby',
            hostName: 'Host',
            password: lobbyPasswordInput?.value || null,
            maxPlayers: parseInt(lobbyMaxPlayersSelect?.value) || 4,
            roundCount: parseInt(lobbyRoundsSelect?.value) || 12
        });

        localPeerId = result.lobbyCode;

        if (lobbyCodeEl) {
            lobbyCodeEl.textContent = result.lobbyCode;
        }

        updateLobbyUI(result.lobbyState);

        // Setup game start handler
        lobbyManager.onGameStart = (data) => {
            startMultiplayerGame(data.playerConfigs, data.roundCount);
        };

    } catch (error) {
        console.error('Failed to create lobby:', error);
        if (lobbyCodeEl) {
            lobbyCodeEl.textContent = 'Error - Try Again';
        }
    }
}

// Update lobby UI
function updateLobbyUI(lobbyState) {
    if (!lobbyState) return;

    const playersContainer = document.getElementById('lobby-players');
    const startBtn = document.getElementById('start-lobby-game');
    const addAIBtn = document.getElementById('add-ai-player');

    if (playersContainer) {
        playersContainer.innerHTML = lobbyState.players.map(player => `
            <div class="lobby-player ${player.isHost ? 'host' : ''} ${player.isAI ? 'ai' : ''}">
                <span class="player-name">${player.name}</span>
                <span class="player-status">
                    ${player.isHost ? '(Host)' : ''}
                    ${player.isAI ? '(AI)' : ''}
                </span>
                ${isHost && !player.isHost ? `<button class="kick-btn" data-player-id="${player.id}">X</button>` : ''}
            </div>
        `).join('');

        // Add kick button handlers
        playersContainer.querySelectorAll('.kick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const playerId = btn.dataset.playerId;
                lobbyManager.kickPlayer(playerId);
            });
        });
    }

    if (startBtn) {
        startBtn.disabled = !lobbyManager.canStartGame();
    }

    if (addAIBtn) {
        addAIBtn.disabled = lobbyManager.isFull();
    }
}

// Handle join lobby
async function handleJoinLobby() {
    const codeInput = document.getElementById('join-code');
    const nameInput = document.getElementById('join-player-name');
    const passwordInput = document.getElementById('join-password');
    const statusDiv = document.getElementById('join-status');

    const code = codeInput?.value?.trim();
    const name = nameInput?.value?.trim() || 'Player';
    const password = passwordInput?.value || null;

    if (!code) {
        if (statusDiv) {
            statusDiv.classList.remove('hidden');
            statusDiv.textContent = 'Please enter a lobby code';
            statusDiv.className = 'join-status error';
        }
        return;
    }

    if (statusDiv) {
        statusDiv.classList.remove('hidden');
        statusDiv.textContent = 'Connecting...';
        statusDiv.className = 'join-status';
    }

    isMultiplayer = true;
    isHost = false;

    try {
        // Setup lobby callbacks for client
        lobbyManager.onLobbyUpdate = (state) => {
            // Client sees lobby updates while waiting
            console.log('Lobby updated:', state);
        };
        lobbyManager.onGameStart = (data) => {
            startMultiplayerGame(data.playerConfigs, data.roundCount);
        };
        lobbyManager.onKicked = (reason) => {
            if (statusDiv) {
                statusDiv.textContent = reason || 'Disconnected from lobby';
                statusDiv.className = 'join-status error';
            }
            showScreen('browser');
        };

        // Join the lobby
        const lobbyState = await lobbyManager.joinLobby(code, name, password);
        localPeerId = lobbyManager.localPlayerId;

        if (statusDiv) {
            statusDiv.textContent = 'Connected! Waiting for host to start...';
            statusDiv.className = 'join-status success';
        }

    } catch (error) {
        console.error('Failed to join lobby:', error);
        if (statusDiv) {
            statusDiv.textContent = error.message || 'Failed to connect';
            statusDiv.className = 'join-status error';
        }
        isMultiplayer = false;
        isHost = true;
    }
}

// AI thinking indicator
let aiThinkingElement = null;

function showAIThinking(playerName) {
    if (aiThinkingElement) return;

    aiThinkingElement = document.createElement('div');
    aiThinkingElement.className = 'ai-thinking';
    aiThinkingElement.innerHTML = `
        <div class="ai-thinking-text">${playerName} is thinking<span class="ai-thinking-dots">...</span></div>
    `;
    document.body.appendChild(aiThinkingElement);
}

function hideAIThinking() {
    if (aiThinkingElement) {
        aiThinkingElement.remove();
        aiThinkingElement = null;
    }
}

// Execute AI turn
async function executeAITurn(player) {
    showAIThinking(player.name);

    const callbacks = {
        onRoll: async () => {
            soundSystem.playDiceRoll();
            await animateDiceRoll(600);
            game.rollDice();
            updateGameDisplay();
        },
        onReroll: async (dieIndex) => {
            soundSystem.playClick();
            game.rerollDie(dieIndex);
            updateGameDisplay();
        },
        onContinueToStation: async () => {
            soundSystem.playPhaseTransition();
            const result = game.advanceToStation();
            if (result) {
                soundSystem.playStationArrival();
                renderStationEarnings(result.earnings, result.fuelGained);
                updateGameDisplay();
            }
        },
        onContinueToShop: async () => {
            soundSystem.playPhaseTransition();
            game.advanceToShop();
            updateGameDisplay();
        },
        onPurchase: async (type, id) => {
            let success = false;
            if (type === 'car') {
                success = game.purchaseTrainCar(id);
            } else {
                success = game.purchaseCard(id);
            }
            if (success) {
                soundSystem.playPurchase();
                updateGameDisplay();
            }
            return success;
        },
        onEndTurn: async () => {
            // Don't actually end turn here - let the caller handle it
        },
        onUpdate: () => {
            updateGameDisplay();
        }
    };

    await AI.executeTurn(game, player, callbacks);

    hideAIThinking();
}

// Execute AI draft
async function executeAIDraft(player) {
    showAIThinking(player.name);

    await AI.delay();

    // AI randomly selects 2 of 3 cards (simple strategy)
    const indices = [0, 1, 2];
    // Shuffle and pick first 2
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    game.toggleDraftSelection(indices[0]);
    await AI.delay();
    soundSystem.playDraftSelect();

    game.toggleDraftSelection(indices[1]);
    await AI.delay();
    soundSystem.playDraftSelect();

    hideAIThinking();

    // Confirm draft
    handleConfirmDraft();
}

// Check and execute AI turn if needed
async function checkForAITurn() {
    const player = game.getCurrentPlayer();

    if (player && player.isAI && player.isLocal) {
        if (game.gameState === GAME_STATES.PLAYING) {
            await executeAITurn(player);
            // After AI turn, end their turn
            const result = game.endTurn();
            if (result.gameEnded) {
                handleGameEnd();
            } else {
                updateGameDisplay();
                // Check if next player is also AI
                await checkForAITurn();
            }
        }
    }
}

// Client state - tracks what the client knows (thin client model)
let clientState = null;
let clientCurrentScreen = 'game';
let mapInitialized = false;

// Start a multiplayer game (called when host starts or client receives game start)
async function startMultiplayerGame(playerConfigs, roundCount) {
    mapInitialized = false;
    clientCurrentScreen = 'game';

    if (isHost) {
        // Host runs the actual game
        game = new Game();
        const playerNames = playerConfigs.map(p => p.name);
        game.initialize(playerNames, roundCount, playerConfigs);

        // Initialize game sync for host
        gameSync.init(game, isHost, localPeerId);

        // Update host UI when client actions are processed
        gameSync.onHostUpdate = () => {
            // Update display based on current game state
            if (game.gameState === GAME_STATES.PLAYING) {
                updateGameDisplay();
            }
        };

        gameSync.onGameEnd = (data) => {
            handleGameEnd();
        };

        soundSystem.playGameStart();

        // Go directly to game screen (skip draft - players already have 2 random cards)
        showScreen('game');

        // Initialize the railroad map
        const mapSvg = document.getElementById('railroad-svg');
        const positionsContainer = document.getElementById('player-positions');
        initRailroadMap(mapSvg);
        updatePlayerPositions(mapSvg, game.players, positionsContainer);
        mapInitialized = true;

        updateGameDisplay();

        // Broadcast initial state to clients
        gameSync.broadcastGameState();

        // Check for AI turns
        await checkForAITurn();
    } else {
        // Client is a thin client - just renders state from host
        game = null; // Client doesn't run game logic
        clientState = null;

        // Initialize game sync for client
        gameSync.init(null, isHost, localPeerId);

        // Client receives full state from host and renders it
        gameSync.onStateReceived = (state) => {
            clientState = state;
            renderClientState(state);
        };

        gameSync.onGameEnd = (data) => {
            renderStandings(data.standings);
            showScreen('end');
        };

        soundSystem.playGameStart();
        showScreen('game');
        // Client waits for first state broadcast from host
    }
}

// Render state received from host (thin client)
function renderClientState(state) {
    // Handle screen transitions
    if (state.gameState === GAME_STATES.PLAYING) {
        if (clientCurrentScreen !== 'game') {
            clientCurrentScreen = 'game';
            showScreen('game');

            // Initialize railroad map once
            if (!mapInitialized) {
                const mapSvg = document.getElementById('railroad-svg');
                initRailroadMap(mapSvg);
                mapInitialized = true;
            }
        }
        renderClientGame(state);
    } else if (state.gameState === GAME_STATES.ENDED) {
        showScreen('end');
    }
}

// Render draft screen from state (thin client)
function renderClientDraft(state) {
    const currentPlayer = state.players[state.currentPlayerIndex];
    updateDraftPlayer(currentPlayer.name);

    // Determine if it's our turn
    const isMyTurn = currentPlayer.peerId === localPeerId;

    renderDraftCards(
        state.draftCards,
        state.draftSelections,
        isMyTurn ? handleToggleDraftCard : null // Only allow interaction if our turn
    );

    // Update confirm button state
    if (elements.confirmDraft) {
        elements.confirmDraft.disabled = !isMyTurn || state.draftSelections.length !== 2;
    }
}

// Render game screen from state (thin client)
function renderClientGame(state) {
    const currentPlayer = state.players[state.currentPlayerIndex];
    const isMyTurn = currentPlayer.peerId === localPeerId;

    // Update round display
    updateRoundDisplay(state.currentRound, state.totalRounds);

    // Render player panels
    renderPlayerPanels(state.players, state.currentPlayerIndex);

    // Update current player display
    updateCurrentPlayer(currentPlayer);
    updatePlayerResources(currentPlayer);

    // Update railroad map
    const mapSvg = document.getElementById('railroad-svg');
    const positionsContainer = document.getElementById('player-positions');
    updatePlayerPositions(mapSvg, state.players, positionsContainer);

    // Render card hand (only interactive if our turn)
    renderCardHand(
        currentPlayer.cardHand,
        isMyTurn ? handlePlayCard : null
    );

    // Show current phase
    showPhase(state.phase);

    // Render phase-specific content
    switch (state.phase) {
        case PHASES.ROLL:
            renderTrainCars(currentPlayer.trainCars);
            if (currentPlayer.lastRollResults && currentPlayer.lastRollResults.length > 0) {
                // Show dice results
                const total = currentPlayer.lastRollResults.reduce((sum, d) => sum + d.finalValue, 0);
                const rerolls = currentPlayer.fuelRerollsRemaining + currentPlayer.cardRerollsRemaining;
                renderDiceResults(currentPlayer.lastRollResults, total, rerolls, currentPlayer.fuel);
                if (isMyTurn && rerolls > 0) {
                    setupRerollHandlers();
                }
            } else {
                renderDicePreRoll(currentPlayer.trainCars, currentPlayer.fuel);
            }
            // Enable/disable roll button
            if (elements.rollDiceBtn) {
                elements.rollDiceBtn.disabled = !isMyTurn;
            }
            break;

        case PHASES.STATION:
            if (state.lastStationEarnings) {
                renderStationEarnings(state.lastStationEarnings, state.lastFuelGained);
            }
            break;

        case PHASES.SHOP:
            renderShop(
                currentPlayer,
                state.availableCars,
                state.availableCards,
                isMyTurn ? handlePurchaseTrainCar : null,
                isMyTurn ? handlePurchaseCard : null
            );
            break;
    }

    // Enable/disable phase buttons based on turn
    if (elements.continueToStation) {
        elements.continueToStation.disabled = !isMyTurn;
    }
    if (elements.continueToShop) {
        elements.continueToShop.disabled = !isMyTurn;
    }
    if (elements.skipShop) {
        elements.skipShop.disabled = !isMyTurn;
    }
}

// Start a new game
async function startGame() {
    const playerNames = getPlayerNames();
    const roundCount = getRoundCount();

    // In single-player mode, first player is human, rest are AI
    if (!isMultiplayer) {
        const playerConfigs = playerNames.map((name, index) => ({
            name: name,
            isAI: index > 0, // First player is human, rest are AI
            isLocal: true    // All players run locally in single-player
        }));
        game.initialize(playerNames, roundCount, playerConfigs);
    } else {
        // Multiplayer initialization will be handled separately
        game.initialize(playerNames, roundCount);
    }

    soundSystem.playGameStart();

    // Go directly to game screen (skip draft - players already have 2 random cards)
    showScreen('game');

    // Initialize the railroad map
    const mapSvg = document.getElementById('railroad-svg');
    const positionsContainer = document.getElementById('player-positions');
    initRailroadMap(mapSvg);
    updatePlayerPositions(mapSvg, game.players, positionsContainer);

    updateGameDisplay();

    // Check if first player is AI
    await checkForAITurn();
}

// Update draft display
function updateDraftDisplay() {
    const state = game.getState();
    const player = game.getCurrentPlayer();

    updateDraftPlayer(player.name);
    renderDraftCards(state.draftCards, state.draftSelections, handleToggleDraftCard);
}

// Handle toggling a draft card selection
function handleToggleDraftCard(cardIndex) {
    // Client: send to host
    if (isMultiplayer && !isHost) {
        gameSync.sendDraftSelect(cardIndex);
        return;
    }

    // Host/single-player: run locally
    if (!isLocalPlayerTurn()) return;

    soundSystem.playDraftSelect();
    game.toggleDraftSelection(cardIndex);
    updateDraftDisplay();

    if (isMultiplayer) {
        gameSync.broadcastGameState();
    }
}

// Handle confirming draft selections
async function handleConfirmDraft() {
    // Client: send to host
    if (isMultiplayer && !isHost) {
        gameSync.sendDraftConfirm();
        return;
    }

    // Host/single-player: run locally
    if (!isLocalPlayerTurn()) return;

    const result = game.confirmDraft();

    if (isMultiplayer) {
        gameSync.broadcastGameState();
    }

    if (game.gameState === GAME_STATES.PLAYING) {
        // All players drafted, start the game
        showScreen('game');

        // Initialize the railroad map
        const mapSvg = document.getElementById('railroad-svg');
        const positionsContainer = document.getElementById('player-positions');
        initRailroadMap(mapSvg);
        updatePlayerPositions(mapSvg, game.players, positionsContainer);

        updateGameDisplay();

        // Check if first player is AI
        await checkForAITurn();
    } else {
        // Next player drafts
        updateDraftDisplay();

        // Check if next player is AI
        await checkForAITurn();
    }
}

// Update the entire game display
function updateGameDisplay() {
    const state = game.getState();
    const player = game.getCurrentPlayer();

    updateRoundDisplay(state.currentRound, state.totalRounds);
    renderPlayerPanels(game.players, game.currentPlayerIndex);
    updateCurrentPlayer(player);
    updatePlayerResources(player);

    // Update railroad map
    const mapSvg = document.getElementById('railroad-svg');
    const positionsContainer = document.getElementById('player-positions');
    updatePlayerPositions(mapSvg, game.players, positionsContainer);

    // Render card hand
    renderCardHand(player.cardHand, handlePlayCard);

    showPhase(state.phase);

    switch (state.phase) {
        case PHASES.ROLL:
            renderTrainCars(player.trainCars);
            renderDicePreRoll(player.trainCars, player.fuel);
            break;
        case PHASES.STATION:
            // Already rendered when advancing to station
            break;
        case PHASES.SHOP:
            renderShop(
                player,
                state.availableCars,
                state.availableCards,
                handlePurchaseTrainCar,
                handlePurchaseCard
            );
            break;
    }
}

// Check if it's the local player's turn (for host/single-player)
function isLocalPlayerTurn() {
    if (!game) return false;
    const player = game.getCurrentPlayer();
    if (!player) return false;

    // In single player, first player is always local human
    if (!isMultiplayer) {
        return !player.isAI;
    }

    // In multiplayer host, check peerId
    return player.peerId === localPeerId;
}

// Apply immediate card effects
function applyCardEffect(card, player) {
    const effect = card.effect;

    switch (effect.type) {
        case 'gainFuel':
            player.gainFuel(effect.amount);
            break;
        case 'gainGold':
            player.gainGold(effect.amount);
            break;
        case 'discount':
            player.hasDiscount = effect.amount;
            break;
        case 'distanceBonus':
            // Applied during move calculation - stored in activeCards
            break;
        case 'allDieBonus':
            // Applied during roll - stored in activeCards
            break;
        case 'doubleGold':
            // Applied at station - stored in activeCards
            break;
        case 'maxAllDice':
            // Set all dice to max - applied after roll
            if (player.lastRollResults && player.lastRollResults.length > 0) {
                player.lastRollResults.forEach(die => {
                    const maxValue = parseInt(die.type.slice(1));
                    die.baseValue = maxValue;
                    die.finalValue = maxValue + die.bonus;
                });
            }
            break;
        case 'rerollAll':
            // Reroll all dice
            if (player.lastRollResults && player.lastRollResults.length > 0) {
                player.roll();
            }
            break;
        case 'matchGold':
            // Gain gold equal to current gold (max specified)
            const goldGain = Math.min(player.gold, effect.max);
            player.gainGold(goldGain);
            break;
        case 'passengerBonus':
            // Gain gold per passenger car
            const passengerCount = player.trainCars.filter(car => car.type === 'passenger').length;
            player.gainGold(passengerCount * effect.bonus);
            break;
        case 'doubleFuelBonus':
        case 'doubleFuelTotal':
        case 'doubleRoll':
        case 'setDieValue':
        case 'choice':
            // These effects need more complex handling or UI interaction
            // For now, they are stored in activeCards
            break;
    }
}

// Handle playing a card from hand
function handlePlayCard(cardIndex) {
    // Client: send to host
    if (isMultiplayer && !isHost) {
        gameSync.sendPlayCard(cardIndex);
        return;
    }

    // Host/single-player: run locally
    if (!isLocalPlayerTurn()) return;

    soundSystem.playCardPlay();
    const player = game.getCurrentPlayer();
    const card = game.playCardFromHand(cardIndex);
    if (card) {
        applyCardEffect(card, player);
        updateGameDisplay();
        if (isMultiplayer) {
            gameSync.broadcastGameState();
        }
    }
}

// Handle roll dice
async function handleRollDice() {
    // Client: send to host
    if (isMultiplayer && !isHost) {
        gameSync.sendRoll();
        return;
    }

    // Host/single-player: run locally
    if (!isLocalPlayerTurn()) return;

    elements.rollDiceBtn.disabled = true;

    // Start animation and sound
    soundSystem.playDiceRoll();
    await animateDiceRoll(800);

    // Actually roll
    const results = game.rollDice();
    const player = game.getCurrentPlayer();
    const total = player.getLastRollTotal();
    const rerollsRemaining = player.getTotalRerollsRemaining();
    const fuelBonus = player.fuel;

    renderDiceResults(results, total, rerollsRemaining, fuelBonus);

    // Setup reroll handlers if available
    if (rerollsRemaining > 0) {
        setupRerollHandlers();
    }

    // Update player resources (fuel may have changed display)
    updatePlayerResources(player);

    if (isMultiplayer) {
        gameSync.broadcastGameState();
    }

    elements.rollDiceBtn.disabled = false;
}

// Setup reroll click handlers
function setupRerollHandlers() {
    const diceElements = elements.diceContainer.querySelectorAll('.die');
    diceElements.forEach((dieEl, index) => {
        dieEl.addEventListener('click', () => handleReroll(index));
    });
}

// Handle reroll
async function handleReroll(dieIndex) {
    // Client: send to host
    if (isMultiplayer && !isHost) {
        gameSync.sendReroll(dieIndex);
        return;
    }

    // Host/single-player: run locally
    if (!isLocalPlayerTurn()) return;

    const player = game.getCurrentPlayer();
    if (!player.canReroll()) return;

    soundSystem.playClick();
    const success = game.rerollDie(dieIndex);
    if (success) {
        const results = player.lastRollResults;
        const total = player.getLastRollTotal();
        const rerollsRemaining = player.getTotalRerollsRemaining();
        const fuelBonus = player.fuel;

        renderDiceResults(results, total, rerollsRemaining, fuelBonus);
        updatePlayerResources(player);

        if (rerollsRemaining > 0) {
            setupRerollHandlers();
        }

        if (isMultiplayer) {
            gameSync.broadcastGameState();
        }
    }
}

// Handle continue to station
function handleContinueToStation() {
    // Client: send to host
    if (isMultiplayer && !isHost) {
        gameSync.sendContinue('station');
        return;
    }

    // Host/single-player: run locally
    if (!isLocalPlayerTurn()) return;

    const result = game.advanceToStation();

    if (result) {
        soundSystem.playStationArrival();
        renderStationEarnings(result.earnings, result.fuelGained);
        updateGameDisplay();

        if (isMultiplayer) {
            gameSync.broadcastGameState();
        }
    }
}

// Handle continue to shop
function handleContinueToShop() {
    // Client: send to host
    if (isMultiplayer && !isHost) {
        gameSync.sendContinue('shop');
        return;
    }

    // Host/single-player: run locally
    if (!isLocalPlayerTurn()) return;

    game.advanceToShop();
    updateGameDisplay();

    if (isMultiplayer) {
        gameSync.broadcastGameState();
    }
}

// Handle purchase train car
function handlePurchaseTrainCar(carId) {
    // Client: send to host
    if (isMultiplayer && !isHost) {
        gameSync.sendPurchaseCar(carId);
        return;
    }

    // Host/single-player: run locally
    if (!isLocalPlayerTurn()) return;

    const success = game.purchaseTrainCar(carId);
    if (success) {
        soundSystem.playPurchase();
        refreshShopDisplay();

        if (isMultiplayer) {
            gameSync.broadcastGameState();
        }
    }
}

// Handle purchase card
function handlePurchaseCard(cardIndex) {
    // Client: send to host
    if (isMultiplayer && !isHost) {
        gameSync.sendPurchaseCard(cardIndex);
        return;
    }

    // Host/single-player: run locally
    if (!isLocalPlayerTurn()) return;

    const success = game.purchaseCard(cardIndex);
    if (success) {
        soundSystem.playPurchase();
        refreshShopDisplay();
        const player = game.getCurrentPlayer();
        renderCardHand(player.cardHand, handlePlayCard);

        if (isMultiplayer) {
            gameSync.broadcastGameState();
        }
    }
}

// Refresh shop display after a purchase
function refreshShopDisplay() {
    const state = game.getState();
    const player = game.getCurrentPlayer();
    renderPlayerPanels(game.players, game.currentPlayerIndex);
    updatePlayerResources(player);
    renderShop(
        player,
        state.availableCars,
        state.availableCards,
        handlePurchaseTrainCar,
        handlePurchaseCard
    );
}

// Handle end turn
async function handleEndTurn() {
    // Client: send to host
    if (isMultiplayer && !isHost) {
        gameSync.sendEndTurn();
        return;
    }

    // Host/single-player: run locally
    if (!isLocalPlayerTurn()) return;

    const result = game.endTurn();

    if (isMultiplayer) {
        gameSync.broadcastGameState();
    }

    if (result.gameEnded) {
        handleGameEnd();
    } else {
        updateGameDisplay();
        // Check if next player is AI
        await checkForAITurn();
    }
}

// Handle game end
function handleGameEnd() {
    const standings = game.getStandings();
    renderStandings(standings);
    showScreen('end');
}

// Handle play again
function handlePlayAgain() {
    game = new Game();
    isMultiplayer = false;
    isHost = true;
    showScreen('menu');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
