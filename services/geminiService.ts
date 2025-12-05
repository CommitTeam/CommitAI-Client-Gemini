
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a text roast based on workout performance.
 */
export const generateRoast = async (
  workoutTitle: string,
  result: 'success' | 'fail',
  betsCount: number
): Promise<string> => {
  try {
    const prompt = `
      You are a RUTHLESS, savage fitness heckler. A user just attempted a workout: "${workoutTitle}".
      Result: ${result.toUpperCase()}.
      ${betsCount} friends placed bets on this outcome.
      
      Give me a short, spicy, 2-sentence roast about their performance. 
      If they succeeded, act surprised and claim they cheated or it was too easy.
      If they failed, DESTROY them. Mock their weakness. Use Gen Z internet slang (skill issue, cringe, flop era).
      Do not be nice. Do not be encouraging. Be a hater.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "You're so bad the AI refused to roast you.";
  } catch (error) {
    console.error("Roast generation failed", error);
    return "Error generating roast. You got off easy this time.";
  }
};

/**
 * Generates a personalized daily tagline for the user profile.
 */
export const generateDailyTagline = async (
  userName: string,
  streak: number,
  totalWorkouts: number,
  recentFailure: boolean
): Promise<string> => {
  try {
    const prompt = `
      Generate a short, witty, one-sentence "Tagline of the Day" for a fitness app user named ${userName}.
      
      Context:
      - Current Streak: ${streak} days
      - Total Workouts: ${totalWorkouts}
      - Recently Failed a workout: ${recentFailure ? 'YES' : 'NO'}

      Tone: Neo-Brutalist, Gen Z, slightly roasting but motivating. 
      Examples:
      - "Current mood: Grinding until my legs fall off."
      - "Streak is alive, unlike your social life."
      - "You failed yesterday. Don't let it define your flop era."
      - "Move your ass, ${userName}."
      
      Return ONLY the tagline text. No quotes.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || `Move your ass, ${userName}.`;
  } catch (error) {
    console.error("Tagline generation failed", error);
    return `Welcome back, ${userName}. Now sweat.`;
  }
};

/**
 * Generates speech from text using Gemini TTS.
 */
export const generateRoastAudio = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' }, // Puck is usually cheeky
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS generation failed", error);
    return null;
  }
};

/**
 * Generic TTS function for motivating messages
 */
export const generateSpeech = async (text: string, voiceName: 'Puck' | 'Kore' | 'Fenrir' | 'Charon' | 'Aoede' = 'Kore'): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS generation failed", error);
    return null;
  }
};

/**
 * Edits an uploaded workout selfie (e.g., adding filters or elements).
 */
export const editWorkoutImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    // Determine mimeType from base64 string header usually, but we assume jpeg/png for simplicity or strip it
    // For the API, we need the raw base64 data without the "data:image/..." prefix
    const data = base64Image.split(',')[1];
    const mimeType = base64Image.substring(base64Image.indexOf(':') + 1, base64Image.indexOf(';'));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
            text: `Edit this image: ${prompt}. Return only the image.`,
          },
        ],
      },
    });

    // Check for inline data (image) in response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image editing failed", error);
    return null;
  }
};
