import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface UseLiveCoachReturn {
  isConnected: boolean;
  isTalking: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendVideoFrame: (base64Image: string) => void;
  error: string | null;
}

export const useLiveCoach = (): UseLiveCoachReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false); // Model is speaking
  const [error, setError] = useState<string | null>(null);
  
  // Refs to hold non-react state
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Helper to decode base64
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Helper to decode audio data
  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  // Helper to encode PCM for sending
  const encodePCM = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encodePCM(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
        // sessionRef.current.close(); 
    }
    
    // Stop mic
    if (inputSourceRef.current) {
        inputSourceRef.current.disconnect();
    }
    if (processorRef.current) {
        processorRef.current.disconnect();
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
    }
    
    // Stop playing audio
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();

    setIsConnected(false);
    setIsTalking(false);
  }, []);

  const sendVideoFrame = useCallback((base64Image: string) => {
    if (sessionRef.current) {
        // Remove data URL prefix if present
        const data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        sessionRef.current.then((session: any) => {
            session.sendRealtimeInput({ 
                media: {
                    mimeType: 'image/jpeg',
                    data: data
                }
            });
        });
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("No API Key found");

      const ai = new GoogleGenAI({ apiKey });
      
      // Setup Audio Contexts
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;
      outputNodeRef.current = audioCtx.createGain();
      outputNodeRef.current.connect(audioCtx.destination);
      nextStartTimeRef.current = audioCtx.currentTime;

      // Input Context (16kHz for Gemini)
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      inputSourceRef.current = source;
      processorRef.current = processor;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Live Session Opened');
            setIsConnected(true);
            
            // Connect Mic
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               setIsTalking(true);
               const audioBuffer = await decodeAudioData(
                 decode(base64Audio),
                 audioCtx,
                 24000,
                 1
               );
               
               const src = audioCtx.createBufferSource();
               src.buffer = audioBuffer;
               src.connect(outputNodeRef.current!);
               
               // Schedule
               const startTime = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
               src.start(startTime);
               nextStartTimeRef.current = startTime + audioBuffer.duration;
               
               sourcesRef.current.add(src);
               src.onended = () => {
                 sourcesRef.current.delete(src);
                 if (sourcesRef.current.size === 0) setIsTalking(false);
               };
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = audioCtx.currentTime;
                setIsTalking(false);
            }
          },
          onclose: () => {
            console.log('Live Session Closed');
            disconnect();
          },
          onerror: (err) => {
            console.error('Live Session Error', err);
            setError("Connection error");
            disconnect();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: "You are a MEAN, SARCASTIC, and RUTHLESS fitness heckler. You are watching a video stream of someone working out. Count their reps if you see them moving, but mostly make fun of their form. If they are not moving, yell at them to get moving. If they are moving slowly, call them a grandma. Be funny but brutal. Use slang like 'skill issue', 'mid', 'L'.",
        }
      });

      sessionRef.current = sessionPromise;

      // Send Audio Input
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        
        sessionPromise.then(session => {
            session.sendRealtimeInput({ media: pcmBlob });
        });
      };

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to Coach");
      disconnect();
    }
  }, [disconnect]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { isConnected, isTalking, connect, disconnect, sendVideoFrame, error };
};