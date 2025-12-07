// ============================================
// CommitAI Mobile - Gemini AI Service
// Text generation and AI features
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_CONFIG } from '@/constants';
import Constants from 'expo-constants';

// Initialize Gemini AI
const apiKey = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// ---------- Text Generation ----------

/**
 * Generates a text roast based on workout performance.
 */
export const generateRoast = async (
  workoutTitle: string,
  result: 'success' | 'fail',
  betsCount: number
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: API_CONFIG.GEMINI_MODEL });

    const prompt = `
      You are a RUTHLESS, savage fitness heckler. A user just attempted a workout: "${workoutTitle}".
      Result: ${result.toUpperCase()}.
      ${betsCount} friends placed bets on this outcome.
      
      Give me a short, spicy, 2-sentence roast about their performance. 
      If they succeeded, act surprised and claim they cheated or it was too easy.
      If they failed, DESTROY them. Mock their weakness. Use Gen Z internet slang (skill issue, cringe, flop era).
      Do not be nice. Do not be encouraging. Be a hater.
    `;

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    return text || "You're so bad the AI refused to roast you.";
  } catch (error) {
    console.error('Roast generation failed', error);
    return 'Error generating roast. You got off easy this time.';
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
    const model = genAI.getGenerativeModel({ model: API_CONFIG.GEMINI_MODEL });

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

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    return text || `Move your ass, ${userName}.`;
  } catch (error) {
    console.error('Tagline generation failed', error);
    return `Welcome back, ${userName}. Now sweat.`;
  }
};

/**
 * Generates motivational/trash talk messages during workout.
 */
export const generateWorkoutMotivation = async (
  exerciseType: string,
  currentReps: number,
  targetReps: number,
  timeRemaining: number
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: API_CONFIG.GEMINI_MODEL });

    const progress = Math.round((currentReps / targetReps) * 100);
    
    const prompt = `
      Generate a SHORT (max 10 words) motivational message for someone doing ${exerciseType}.
      Progress: ${currentReps}/${targetReps} reps (${progress}%)
      Time left: ${timeRemaining} seconds
      
      Tone: Drill sergeant meets Gen Z influencer. Be aggressive but funny.
      
      Examples:
      - "FASTER! My grandma moves quicker!"
      - "That's not a squat, that's a curtsy!"
      - "Halfway there! Don't you dare quit now!"
      - "10 more! Pain is just weakness leaving!"
      
      Return ONLY the message. No quotes. Keep it under 10 words.
    `;

    const response = await model.generateContent(prompt);
    return response.response.text() || 'Keep pushing!';
  } catch (error) {
    console.error('Motivation generation failed', error);
    return 'Keep pushing!';
  }
};

/**
 * Generates workout recommendations based on user history.
 */
export const generateWorkoutRecommendation = async (
  userName: string,
  recentWorkouts: string[],
  currentStreak: number
): Promise<{ type: string; target: string; reason: string }> => {
  try {
    const model = genAI.getGenerativeModel({ model: API_CONFIG.GEMINI_MODEL });

    const prompt = `
      Generate a workout recommendation for user ${userName}.
      
      Recent workouts: ${recentWorkouts.join(', ') || 'None yet'}
      Current streak: ${currentStreak} days
      
      Available workout types: Pushups, Squats, Jumping Jacks, Steps, Distance Walk, Calories
      
      Respond in this exact JSON format (no markdown, no code blocks):
      {"type": "workout_type", "target": "number", "reason": "short reason under 15 words"}
      
      Make it challenging but achievable. If they haven't done a type recently, recommend it.
    `;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    
    // Parse JSON response
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    return {
      type: parsed.type || 'Pushups',
      target: parsed.target || '20',
      reason: parsed.reason || 'Time to push yourself!',
    };
  } catch (error) {
    console.error('Recommendation generation failed', error);
    return {
      type: 'Pushups',
      target: '20',
      reason: 'A classic never fails!',
    };
  }
};

/**
 * Generates a summary/analysis of workout performance.
 */
export const generateWorkoutSummary = async (
  workoutTitle: string,
  completed: boolean,
  repsAchieved: number,
  targetReps: number,
  durationSeconds: number
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: API_CONFIG.GEMINI_MODEL });

    const prompt = `
      Generate a brief (2-3 sentences) workout summary.
      
      Workout: ${workoutTitle}
      Completed: ${completed ? 'YES' : 'NO'}
      Reps: ${repsAchieved}/${targetReps}
      Time taken: ${Math.floor(durationSeconds / 60)} minutes ${durationSeconds % 60} seconds
      
      If completed: Be impressed but still slightly roast them.
      If not completed: Roast them but end with motivation to try again.
      
      Tone: Sarcastic coach who secretly cares.
      Keep it under 50 words.
    `;

    const response = await model.generateContent(prompt);
    return response.response.text() || 'Workout complete. You survived. Barely.';
  } catch (error) {
    console.error('Summary generation failed', error);
    return completed 
      ? 'Nice work! But can you do it again tomorrow?' 
      : "Didn't quite make it, but at least you showed up. That's more than most.";
  }
};

// ---------- Fallback Messages ----------

export const FALLBACK_ROASTS = {
  success: [
    "You actually did it? The AI is checking for cheats...",
    "Congrats, you're slightly less pathetic than yesterday.",
    "Okay fine, you passed. Don't let it go to your head.",
  ],
  fail: [
    "Skill issue. Massive skill issue.",
    "Your flop era continues. Day unknown.",
    "Even my loading spinner works harder than you.",
  ],
};

export const FALLBACK_TAGLINES = [
  "Move your body or move out of the way.",
  "Sweat now, flex later.",
  "Your couch misses you. Don't go back.",
  "Legends don't skip leg day.",
];

export const getRandomFallback = (
  type: 'roast_success' | 'roast_fail' | 'tagline'
): string => {
  const options = 
    type === 'roast_success' ? FALLBACK_ROASTS.success :
    type === 'roast_fail' ? FALLBACK_ROASTS.fail :
    FALLBACK_TAGLINES;
  
  return options[Math.floor(Math.random() * options.length)];
};

// ---------- Export All ----------

export default {
  generateRoast,
  generateDailyTagline,
  generateWorkoutMotivation,
  generateWorkoutRecommendation,
  generateWorkoutSummary,
  getRandomFallback,
  FALLBACK_ROASTS,
  FALLBACK_TAGLINES,
};
