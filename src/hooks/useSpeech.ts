import { useState, useCallback, useRef } from 'react';

export const useSpeech = () => {
    const [speaking, setSpeaking] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const speak = useCallback(async (text: string) => {
        // Check if Puter is loaded
        if (typeof (window as any).puter === 'undefined') {
            console.warn("Puter.js is not loaded yet or blocked.");
            return;
        }

        try {
            // Stop previous audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            setSpeaking(true);

            // Call Puter API
            const audio = await (window as any).puter.ai.txt2speech(text);
            audioRef.current = audio;

            audio.onended = () => {
                setSpeaking(false);
                audioRef.current = null;
            };

            audio.onerror = (e: any) => {
                console.error("Audio playback error", e);
                setSpeaking(false);
                audioRef.current = null;
            };

            await audio.play();
        } catch (error) {
            console.error("TTS Error:", error);
            setSpeaking(false);
        }
    }, []);

    const cancel = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setSpeaking(false);
    }, []);

    return { speak, speaking, cancel, supported: true };
};
