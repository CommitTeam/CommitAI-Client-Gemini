// ============================================
// CommitAI Mobile - Pose Logic Utilities
// Exercise analysis and rep counting
// ============================================

import { ExerciseState } from '@/types';

// ---------- Angle Calculation ----------

interface Point {
  x: number;
  y: number;
}

/**
 * Calculates the angle between three points (in degrees)
 * Used to detect joint angles for exercise tracking
 */
export const calculateAngle = (a: Point, b: Point, c: Point): number => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
};

// ---------- Landmark Indices (MediaPipe Pose) ----------
// Reference: https://google.github.io/mediapipe/solutions/pose.html

export const POSE_LANDMARKS = {
  // Face
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  
  // Upper Body
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  
  // Lower Body
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

// ---------- Exercise Analysis Functions ----------

/**
 * Analyzes squat form and counts reps
 * Detects the knee angle transition from standing to squatting
 */
export const analyzeSquat = (
  landmarks: Point[],
  state: ExerciseState
): ExerciseState => {
  const hip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const knee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
  const ankle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];

  if (!hip || !knee || !ankle) return state;

  const angle = calculateAngle(hip, knee, ankle);
  const newState = { ...state };

  // Standing position (legs relatively straight)
  if (angle > 160) {
    newState.stage = 'UP';
  }
  
  // Squatting position (knee bent significantly)
  if (angle < 90 && state.stage === 'UP') {
    newState.stage = 'DOWN';
    newState.reps += 1;
    newState.lastFeedback = 'Good Squat!';
  }

  // Form feedback
  if (angle < 70) {
    newState.lastFeedback = 'Too deep!';
  }

  return newState;
};

/**
 * Analyzes pushup form and counts reps
 * Detects elbow angle transition from up to down position
 */
export const analyzePushup = (
  landmarks: Point[],
  state: ExerciseState
): ExerciseState => {
  const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const elbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
  const wrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];

  if (!shoulder || !elbow || !wrist) return state;

  const angle = calculateAngle(shoulder, elbow, wrist);
  const newState = { ...state };

  // Arms extended (up position)
  if (angle > 160) {
    newState.stage = 'UP';
  }
  
  // Arms bent (down position)
  if (angle < 90 && state.stage === 'UP') {
    newState.stage = 'DOWN';
    newState.reps += 1;
    newState.lastFeedback = 'Strong Push!';
  }

  return newState;
};

/**
 * Analyzes jumping jack form and counts reps
 * Detects hand position relative to body and feet spread
 */
export const analyzeJumpingJack = (
  landmarks: Point[],
  state: ExerciseState
): ExerciseState => {
  const l_wrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
  const r_wrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
  const l_hip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const r_hip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  const l_ankle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  const r_ankle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

  if (!l_wrist || !r_wrist || !l_hip || !r_hip || !l_ankle || !r_ankle) {
    return state;
  }

  const newState = { ...state };

  // Calculate feet distance (spread)
  const feetDist = Math.abs(l_ankle.x - r_ankle.x);

  // Hands above head condition
  const handsUp = l_wrist.y < l_hip.y - 0.3 && r_wrist.y < r_hip.y - 0.3;
  const handsDown = l_wrist.y > l_hip.y && r_wrist.y > r_hip.y;

  // Starting position (hands down, feet together)
  if (handsDown && feetDist < 0.15) {
    newState.stage = 'DOWN';
  }

  // Jump position (hands up, feet spread)
  if (handsUp && feetDist > 0.25 && state.stage === 'DOWN') {
    newState.stage = 'UP';
    newState.reps += 1;
    newState.lastFeedback = 'Jack!';
  }

  return newState;
};

// ---------- Generic Exercise Analyzer ----------

export type ExerciseType = 'squat' | 'pushup' | 'jumping_jack';

/**
 * Unified exercise analyzer that routes to specific functions
 */
export const analyzeExercise = (
  type: ExerciseType,
  landmarks: Point[],
  state: ExerciseState
): ExerciseState => {
  switch (type) {
    case 'squat':
      return analyzeSquat(landmarks, state);
    case 'pushup':
      return analyzePushup(landmarks, state);
    case 'jumping_jack':
      return analyzeJumpingJack(landmarks, state);
    default:
      return state;
  }
};

/**
 * Maps workout title to exercise type
 */
export const getExerciseType = (workoutTitle: string): ExerciseType | null => {
  const title = workoutTitle.toLowerCase();
  
  if (title.includes('squat')) return 'squat';
  if (title.includes('pushup') || title.includes('push-up') || title.includes('push up')) return 'pushup';
  if (title.includes('jack') || title.includes('jumping')) return 'jumping_jack';
  
  return null;
};

// ---------- Initial State ----------

export const createInitialExerciseState = (): ExerciseState => ({
  stage: null,
  reps: 0,
  lastFeedback: 'Get Ready',
});

// ---------- Export All ----------

export default {
  calculateAngle,
  POSE_LANDMARKS,
  analyzeSquat,
  analyzePushup,
  analyzeJumpingJack,
  analyzeExercise,
  getExerciseType,
  createInitialExerciseState,
};
