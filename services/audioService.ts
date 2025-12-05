
import { generateSpeech } from './geminiService';

export type VibeType = 'hype' | 'calm' | 'intense' | 'focused';

const VIBE_TEMPLATES = {
    hype: "Yo {name}! Let's break limits today! Let’s GO!",
    calm: "Hey {name}, I have faith in you. Let’s show the world what you can do.",
    intense: "{name}, eyes on the prize. No mercy, just reps!",
    focused: "Dial in, {name}. It’s your moment. Make every second count."
};

const VIBE_VOICES: Record<VibeType, 'Puck' | 'Kore' | 'Fenrir' | 'Charon' | 'Aoede'> = {
    hype: 'Puck', // Energetic
    calm: 'Aoede', // Smooth
    intense: 'Fenrir', // Deep/Aggressive
    focused: 'Kore', // Clear/Direct
};

export const playVibeMessage = async (vibe: string, userName: string) => {
    const type = (vibe.toLowerCase() as VibeType) || 'hype';
    const template = VIBE_TEMPLATES[type] || VIBE_TEMPLATES.hype;
    const text = template.replace('{name}', userName);
    const voice = VIBE_VOICES[type] || 'Kore';

    console.log(`[AudioService] Generating vibe audio: "${text}" with voice ${voice}`);

    try {
        const base64Audio = await generateSpeech(text, voice);
        
        if (base64Audio) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioContext();
            
            // Resume context immediately (browser requirement for autoplay policy)
            if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
            }
            
            // Decode Base64
            const binaryString = atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Decode Audio Data
            try {
                const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.start(0);
                console.log("[AudioService] Audio started playing");
            } catch (decodeError) {
                console.error("[AudioService] Failed to decode audio data", decodeError);
            }
        } else {
            console.warn("[AudioService] No audio data returned from API");
        }
    } catch (error) {
        console.error("[AudioService] Failed to play vibe message", error);
    }
};
