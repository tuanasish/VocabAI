import { useState, useCallback, useRef } from 'react';

const VOICERSS_API_KEY = import.meta.env.VITE_VOICERSS_API_KEY;

export const useSpeech = () => {
    const [speaking, setSpeaking] = useState(false);
    const [supported, setSupported] = useState(!!VOICERSS_API_KEY);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const speak = useCallback(async (text: string) => {
        if (!VOICERSS_API_KEY) {
            console.warn("VoiceRSS API key is not configured. Please add VITE_VOICERSS_API_KEY to your .env.local file.");
            return;
        }

        try {
            // Stop previous audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            setSpeaking(true);

            // Build VoiceRSS API URL
            const params = new URLSearchParams({
                key: VOICERSS_API_KEY,
                src: text,
                hl: 'en-us',           // Language: English (US)
                v: 'Linda',            // Voice: Linda (female, clear)
                c: 'MP3',              // Audio format
                f: '44khz_16bit_stereo', // High quality
                r: '-1',               // Slightly slower for clarity
            });

            const audioUrl = `https://api.voicerss.org/?${params.toString()}`;

            // Create and play audio
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                setSpeaking(false);
                audioRef.current = null;
            };

            audio.onerror = (e) => {
                console.error("VoiceRSS audio playback error:", e);
                setSpeaking(false);
                audioRef.current = null;
            };

            await audio.play();
        } catch (error) {
            console.error("VoiceRSS TTS Error:", error);
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

    return { speak, speaking, cancel, supported };
};
