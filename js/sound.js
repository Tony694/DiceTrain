// Sound system for Dice Train
// Uses Web Audio API to generate sounds without external files

import { GameOptions } from './options.js';

class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.volume = 0.5;
        this.musicVolume = 0.3;
        this.muted = false;
        this.musicMuted = false;
        this.initialized = false;

        // Background music state
        this.musicPlaying = false;
        this.musicNodes = [];
        this.musicIntervals = [];
        this.masterGain = null;
    }

    // Initialize audio context (must be called after user interaction)
    init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            // Load settings from options
            this.loadFromOptions();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    // Load settings from GameOptions
    loadFromOptions() {
        const soundEnabled = GameOptions.get('soundEnabled');
        const soundVolume = GameOptions.get('soundVolume');

        this.muted = !soundEnabled;
        this.volume = soundVolume / 100; // Convert 0-100 to 0-1
    }

    // Set volume (0-1)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    // Set enabled state
    setEnabled(enabled) {
        this.muted = !enabled;
    }

    // Toggle mute
    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    // Get current muted state
    isMuted() {
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

    // Dice roll sound - train wheels winding up
    playDiceRoll() {
        if (!this.initialized || this.muted || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.8;

        // Create chugging rhythm that speeds up (train wheels winding up)
        const chugs = 8;
        for (let i = 0; i < chugs; i++) {
            // Accelerating timing - starts slow, gets faster
            const progress = i / chugs;
            const delay = (1 - Math.pow(progress, 0.5)) * duration * 0.8 + (i * 0.03);

            setTimeout(() => {
                if (this.muted) return;

                // Low frequency thump for wheel rotation
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();

                osc.type = 'triangle';
                osc.frequency.value = 80 + (i * 15); // Pitch rises as it speeds up

                filter.type = 'lowpass';
                filter.frequency.value = 300;

                const t = this.audioContext.currentTime;
                gain.gain.setValueAtTime(this.volume * 0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.start(t);
                osc.stop(t + 0.1);
            }, delay * 1000);
        }

        // Add metallic clank overlay
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                if (this.muted) return;
                this.playTone(400 + i * 50, 0.05, 'square', 0.005, 0.03);
            }, i * 150 + 100);
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

    // Station arrival - steam engine releasing steam
    playStationArrival() {
        if (!this.initialized || this.muted || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Create white noise for steam hiss
        const bufferSize = this.audioContext.sampleRate * 1.5;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

        // Bandpass filter for steam character
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 0.5;

        // Second filter for shaping
        const hipass = this.audioContext.createBiquadFilter();
        hipass.type = 'highpass';
        hipass.frequency.value = 800;

        const gain = this.audioContext.createGain();

        // Steam release envelope - quick burst then fade
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + 0.05);
        gain.gain.setValueAtTime(this.volume * 0.35, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(this.volume * 0.15, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        noise.connect(filter);
        filter.connect(hipass);
        hipass.connect(gain);
        gain.connect(this.audioContext.destination);

        noise.start(now);
        noise.stop(now + 1.5);

        // Add a low "pshhh" undertone
        const lowOsc = this.audioContext.createOscillator();
        const lowGain = this.audioContext.createGain();
        const lowFilter = this.audioContext.createBiquadFilter();

        lowOsc.type = 'sawtooth';
        lowOsc.frequency.value = 100;

        lowFilter.type = 'lowpass';
        lowFilter.frequency.value = 200;

        lowGain.gain.setValueAtTime(0, now);
        lowGain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.05);
        lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        lowOsc.connect(lowFilter);
        lowFilter.connect(lowGain);
        lowGain.connect(this.audioContext.destination);

        lowOsc.start(now);
        lowOsc.stop(now + 1);
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

    // ==========================================
    // BACKGROUND MUSIC - Chill Tavern Lofi Jazz
    // ==========================================

    // Set music volume (0-1)
    setMusicVolume(vol) {
        this.musicVolume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.musicVolume * 0.23, this.audioContext.currentTime);
        }
    }

    // Toggle music
    toggleMusic() {
        if (this.musicPlaying) {
            this.stopMusic();
        } else {
            this.startMusic();
        }
        return this.musicPlaying;
    }

    // Start background music
    startMusic() {
        if (!this.initialized || !this.audioContext || this.musicPlaying) return;

        this.musicPlaying = true;

        // Create master gain for music
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.setValueAtTime(this.musicVolume * 0.23, this.audioContext.currentTime);
        this.masterGain.connect(this.audioContext.destination);

        // Start the ambient layers
        this._startVinylCrackle();
        this._startBassDrone();
        this._startChordProgression();
        this._startMellowMelody();
    }

    // Stop background music
    stopMusic() {
        this.musicPlaying = false;

        // Clear all intervals
        this.musicIntervals.forEach(id => clearInterval(id));
        this.musicIntervals = [];

        // Stop and disconnect all nodes
        this.musicNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) {
                // Node may already be stopped
            }
        });
        this.musicNodes = [];

        if (this.masterGain) {
            this.masterGain.disconnect();
            this.masterGain = null;
        }
    }

    // Vinyl crackle for lofi feel
    _startVinylCrackle() {
        if (!this.musicPlaying) return;

        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Filter to make it crackly
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.02, this.audioContext.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        whiteNoise.start();
        this.musicNodes.push(whiteNoise, filter, gain);
    }

    // Warm bass drone
    _startBassDrone() {
        if (!this.musicPlaying) return;

        const bassNotes = [65.41, 73.42, 82.41, 87.31]; // C2, D2, E2, F2
        let noteIndex = 0;

        const playBass = () => {
            if (!this.musicPlaying) return;

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.value = bassNotes[noteIndex];

            filter.type = 'lowpass';
            filter.frequency.value = 200;

            const now = this.audioContext.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.5);
            gain.gain.setValueAtTime(0.4, now + 3);
            gain.gain.linearRampToValueAtTime(0, now + 4);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 4);

            this.musicNodes.push(osc, gain, filter);
            noteIndex = (noteIndex + 1) % bassNotes.length;
        };

        playBass();
        const intervalId = setInterval(playBass, 4000);
        this.musicIntervals.push(intervalId);
    }

    // Jazz chord progression
    _startChordProgression() {
        if (!this.musicPlaying) return;

        // Cmaj7, Dm7, Em7, Fmaj7 voicings
        const chords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [293.66, 349.23, 440.00, 523.25], // Dm7
            [329.63, 392.00, 493.88, 587.33], // Em7
            [349.23, 440.00, 523.25, 659.25], // Fmaj7
        ];
        let chordIndex = 0;

        const playChord = () => {
            if (!this.musicPlaying) return;

            const chord = chords[chordIndex];
            const now = this.audioContext.currentTime;

            chord.forEach((freq, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();

                // Use triangle for warm piano-like sound
                osc.type = 'triangle';
                osc.frequency.value = freq;

                filter.type = 'lowpass';
                filter.frequency.value = 800;

                // Soft attack, long sustain
                gain.gain.setValueAtTime(0, now + i * 0.05);
                gain.gain.linearRampToValueAtTime(0.08, now + 0.3 + i * 0.05);
                gain.gain.setValueAtTime(0.08, now + 3);
                gain.gain.linearRampToValueAtTime(0, now + 4);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.masterGain);

                osc.start(now + i * 0.05);
                osc.stop(now + 4.5);

                this.musicNodes.push(osc, gain, filter);
            });

            chordIndex = (chordIndex + 1) % chords.length;
        };

        // Start after 2 seconds, then every 4 seconds
        setTimeout(() => {
            if (this.musicPlaying) {
                playChord();
                const intervalId = setInterval(playChord, 4000);
                this.musicIntervals.push(intervalId);
            }
        }, 2000);
    }

    // Mellow melody line
    _startMellowMelody() {
        if (!this.musicPlaying) return;

        // Pentatonic scale notes
        const scale = [392.00, 440.00, 493.88, 587.33, 659.25, 783.99]; // G4 to G5

        const playNote = () => {
            if (!this.musicPlaying) return;

            // Random chance to play (sparse melody)
            if (Math.random() > 0.4) return;

            const freq = scale[Math.floor(Math.random() * scale.length)];
            const duration = 0.8 + Math.random() * 1.2;

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.value = freq;

            filter.type = 'lowpass';
            filter.frequency.value = 1200;

            const now = this.audioContext.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.06, now + 0.1);
            gain.gain.setValueAtTime(0.06, now + duration * 0.6);
            gain.gain.linearRampToValueAtTime(0, now + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + duration + 0.1);

            this.musicNodes.push(osc, gain, filter);
        };

        // Play random notes every 1-2 seconds
        const scheduleNext = () => {
            if (!this.musicPlaying) return;
            playNote();
            const delay = 1000 + Math.random() * 1500;
            const timeoutId = setTimeout(scheduleNext, delay);
            this.musicIntervals.push(timeoutId);
        };

        setTimeout(scheduleNext, 3000);
    }
}

// Export singleton instance
export const soundSystem = new SoundSystem();
