// Game Options system for Dice Train
// Manages persistent settings via localStorage

const STORAGE_KEY = 'dicetrain_options';

// AI speed delays in milliseconds
export const AI_SPEEDS = {
    slow: 2000,
    normal: 1000,
    fast: 500,
    instant: 0
};

// Default options
const defaults = {
    soundEnabled: true,
    soundVolume: 50,  // 0-100
    aiSpeed: 'normal' // 'slow', 'normal', 'fast', 'instant'
};

// Current options (loaded from storage or defaults)
let currentOptions = { ...defaults };

// Load options from localStorage
export function loadOptions() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            currentOptions = { ...defaults, ...parsed };
        }
    } catch (e) {
        console.warn('Failed to load options from localStorage:', e);
        currentOptions = { ...defaults };
    }
    return currentOptions;
}

// Save options to localStorage
export function saveOptions() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentOptions));
    } catch (e) {
        console.warn('Failed to save options to localStorage:', e);
    }
}

// Get a specific option value
export function getOption(key) {
    return currentOptions[key] ?? defaults[key];
}

// Set a specific option value
export function setOption(key, value) {
    if (key in defaults) {
        currentOptions[key] = value;
    }
}

// Get all options
export function getAllOptions() {
    return { ...currentOptions };
}

// Reset to defaults
export function resetOptions() {
    currentOptions = { ...defaults };
    saveOptions();
}

// GameOptions object for convenience (matches plan interface)
export const GameOptions = {
    defaults,
    AI_SPEEDS,
    load: loadOptions,
    save: saveOptions,
    get: getOption,
    set: setOption,
    getAll: getAllOptions,
    reset: resetOptions
};
