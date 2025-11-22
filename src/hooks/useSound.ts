import { useCallback, useRef, useEffect } from 'react';

// Sound settings from localStorage
const getSoundSettings = () => {
    const settings = localStorage.getItem('soundSettings');
    if (settings) {
        return JSON.parse(settings);
    }
    return { enabled: true, volume: 0.7 };
};

const setSoundSettings = (settings: { enabled: boolean; volume: number }) => {
    localStorage.setItem('soundSettings', JSON.stringify(settings));
};

export const useSound = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const settingsRef = useRef(getSoundSettings());

    useEffect(() => {
        // Initialize AudioContext on first user interaction
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
        };

        document.addEventListener('click', initAudio, { once: true });
        return () => document.removeEventListener('click', initAudio);
    }, []);

    // Play a synthesized sound
    const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volumeMultiplier: number = 1) => {
        const settings = settingsRef.current;
        if (!settings.enabled || !audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        const volume = settings.volume * volumeMultiplier;
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }, []);

    // Predefined sound effects
    const sounds = {
        // Quiz & Learning
        correct: useCallback(() => {
            // Happy ascending notes
            playTone(523.25, 0.1, 'sine', 0.3); // C5
            setTimeout(() => playTone(659.25, 0.1, 'sine', 0.3), 80); // E5
            setTimeout(() => playTone(783.99, 0.15, 'sine', 0.4), 160); // G5
        }, [playTone]),

        wrong: useCallback(() => {
            // Gentle descending note
            playTone(392, 0.15, 'sine', 0.25); // G4
            setTimeout(() => playTone(329.63, 0.2, 'sine', 0.2), 100); // E4
        }, [playTone]),

        complete: useCallback(() => {
            // Victory fanfare
            playTone(523.25, 0.1, 'square', 0.3); // C5
            setTimeout(() => playTone(659.25, 0.1, 'square', 0.3), 100); // E5
            setTimeout(() => playTone(783.99, 0.1, 'square', 0.3), 200); // G5
            setTimeout(() => playTone(1046.5, 0.3, 'sine', 0.4), 300); // C6
        }, [playTone]),

        xpGain: useCallback(() => {
            // Quick ascending arpeggio
            playTone(523.25, 0.08, 'triangle', 0.25);
            setTimeout(() => playTone(659.25, 0.08, 'triangle', 0.25), 60);
            setTimeout(() => playTone(783.99, 0.12, 'triangle', 0.3), 120);
        }, [playTone]),

        levelUp: useCallback(() => {
            // Epic achievement sound
            playTone(392, 0.1, 'square', 0.3);
            setTimeout(() => playTone(523.25, 0.1, 'square', 0.3), 100);
            setTimeout(() => playTone(659.25, 0.1, 'square', 0.3), 200);
            setTimeout(() => playTone(783.99, 0.15, 'square', 0.35), 300);
            setTimeout(() => playTone(1046.5, 0.3, 'sine', 0.4), 400);
        }, [playTone]),

        // Flashcard
        cardFlip: useCallback(() => {
            // Quick whoosh
            playTone(800, 0.05, 'sawtooth', 0.15);
            setTimeout(() => playTone(400, 0.08, 'sawtooth', 0.1), 40);
        }, [playTone]),

        markKnown: useCallback(() => {
            // Confirmation beep
            playTone(880, 0.1, 'sine', 0.25);
            setTimeout(() => playTone(1046.5, 0.12, 'sine', 0.3), 80);
        }, [playTone]),

        nextCard: useCallback(() => {
            // Subtle click
            playTone(600, 0.05, 'square', 0.15);
        }, [playTone]),

        // UI Interactions
        click: useCallback(() => {
            // Subtle click
            playTone(800, 0.04, 'square', 0.12);
        }, [playTone]),

        success: useCallback(() => {
            // Success chime
            playTone(659.25, 0.1, 'sine', 0.3);
            setTimeout(() => playTone(783.99, 0.15, 'sine', 0.35), 80);
        }, [playTone]),

        error: useCallback(() => {
            // Gentle error tone
            playTone(300, 0.2, 'sine', 0.2);
        }, [playTone]),

        notification: useCallback(() => {
            // Notification ping
            playTone(880, 0.08, 'sine', 0.25);
            setTimeout(() => playTone(1046.5, 0.1, 'sine', 0.25), 100);
        }, [playTone]),

        // Gamification
        streak: useCallback(() => {
            // Fire sound effect
            playTone(220, 0.1, 'sawtooth', 0.3);
            setTimeout(() => playTone(440, 0.1, 'sawtooth', 0.3), 80);
            setTimeout(() => playTone(880, 0.15, 'triangle', 0.35), 160);
        }, [playTone]),

        badge: useCallback(() => {
            // Badge unlock
            playTone(523.25, 0.1, 'sine', 0.3);
            setTimeout(() => playTone(659.25, 0.1, 'sine', 0.3), 100);
            setTimeout(() => playTone(783.99, 0.1, 'sine', 0.3), 200);
            setTimeout(() => playTone(1046.5, 0.2, 'sine', 0.4), 300);
            setTimeout(() => playTone(1318.5, 0.25, 'sine', 0.45), 400);
        }, [playTone]),
    };

    // Settings management
    const updateSettings = useCallback((newSettings: Partial<{ enabled: boolean; volume: number }>) => {
        const current = settingsRef.current;
        const updated = { ...current, ...newSettings };
        settingsRef.current = updated;
        setSoundSettings(updated);
    }, []);

    const getSettings = useCallback(() => settingsRef.current, []);

    return {
        play: sounds,
        updateSettings,
        getSettings,
    };
};
