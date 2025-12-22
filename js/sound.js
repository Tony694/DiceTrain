// Sound system for Dice Train
// Uses Web Audio API to generate sounds without external files

class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.volume = 0.5;
        this.muted = false;
        this.initialized = false;
    }

    // Initialize audio context (must be called after user interaction)
    init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    // Set volume (0-1)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    // Toggle mute
    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    // Play a tone with optional parameters
    playTone(frequency, duration, type = 'sine', attack = 0.01, decay = 0.1) {
        if (!this.initialized || this.muted || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, now + attack);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    // Button click sound
    playClick() {
        this.playTone(800, 0.08, 'square', 0.005, 0.05);
    }

    // Dice roll sound - multiple rapid clicks
    playDiceRoll() {
        if (!this.initialized || this.muted) return;

        const rollDuration = 800;
        const clickCount = 15;
        const interval = rollDuration / clickCount;

        for (let i = 0; i < clickCount; i++) {
            setTimeout(() => {
                const freq = 200 + Math.random() * 400;
                this.playTone(freq, 0.05, 'square', 0.005, 0.03);
            }, i * interval);
        }
    }

    // Purchase/coin sound
    playPurchase() {
        if (!this.initialized || this.muted) return;

        // Coin drop sound - two quick descending tones
        this.playTone(1200, 0.1, 'sine', 0.01, 0.08);
        setTimeout(() => {
            this.playTone(800, 0.15, 'sine', 0.01, 0.1);
        }, 80);
    }

    // Phase transition - pleasant chord
    playPhaseTransition() {
        if (!this.initialized || this.muted) return;

        // Play a nice chord
        this.playTone(440, 0.3, 'sine', 0.02, 0.2);
        setTimeout(() => this.playTone(554, 0.3, 'sine', 0.02, 0.2), 50);
        setTimeout(() => this.playTone(659, 0.3, 'sine', 0.02, 0.2), 100);
    }

    // Station arrival - train whistle
    playStationArrival() {
        if (!this.initialized || this.muted) return;

        // Two-tone whistle
        this.playTone(600, 0.4, 'sawtooth', 0.05, 0.3);
        setTimeout(() => {
            this.playTone(500, 0.5, 'sawtooth', 0.05, 0.4);
        }, 300);
    }

    // Card play sound
    playCardPlay() {
        if (!this.initialized || this.muted) return;

        // Swoosh-like sound
        this.playTone(400, 0.1, 'sine', 0.01, 0.08);
        setTimeout(() => this.playTone(600, 0.15, 'sine', 0.01, 0.1), 50);
    }

    // Game start fanfare
    playGameStart() {
        if (!this.initialized || this.muted) return;

        const notes = [523, 659, 784, 1047]; // C, E, G, C
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine', 0.02, 0.15);
            }, i * 150);
        });
    }

    // Draft selection sound
    playDraftSelect() {
        this.playTone(700, 0.1, 'sine', 0.01, 0.08);
    }

    // Error/invalid action sound
    playError() {
        this.playTone(200, 0.2, 'square', 0.01, 0.15);
    }
}

// Export singleton instance
export const soundSystem = new SoundSystem();
