
export const calculateAngle = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): number => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
};

// State Machine for Rep Counting
export interface ExerciseState {
  stage: 'UP' | 'DOWN' | null;
  reps: number;
  lastFeedback: string;
}

export const analyzeSquat = (landmarks: any[], state: ExerciseState): ExerciseState => {
  // 23: left_hip, 25: left_knee, 27: left_ankle
  const hip = landmarks[23];
  const knee = landmarks[25];
  const ankle = landmarks[27];

  if (!hip || !knee || !ankle) return state;

  const angle = calculateAngle(hip, knee, ankle);
  let newState = { ...state };

  if (angle > 160) {
    newState.stage = 'UP';
  }
  if (angle < 90 && state.stage === 'UP') {
    newState.stage = 'DOWN';
    newState.reps += 1;
    newState.lastFeedback = "Good Squat!";
  }

  // Basic Form Check
  if (angle < 70) newState.lastFeedback = "Too deep!";
  
  return newState;
};

export const analyzePushup = (landmarks: any[], state: ExerciseState): ExerciseState => {
  // 11: left_shoulder, 13: left_elbow, 15: left_wrist
  const shoulder = landmarks[11];
  const elbow = landmarks[13];
  const wrist = landmarks[15];

  if (!shoulder || !elbow || !wrist) return state;

  const angle = calculateAngle(shoulder, elbow, wrist);
  let newState = { ...state };

  if (angle > 160) {
    newState.stage = 'UP';
  }
  if (angle < 90 && state.stage === 'UP') {
    newState.stage = 'DOWN';
    newState.reps += 1;
    newState.lastFeedback = "Strong Push!";
  }

  return newState;
};

export const analyzeJumpingJack = (landmarks: any[], state: ExerciseState): ExerciseState => {
  // 11: left_shoulder, 12: right_shoulder, 23: left_hip, 24: right_hip
  // 15: left_wrist, 16: right_wrist, 27: left_ankle, 28: right_ankle
  const l_wrist = landmarks[15];
  const r_wrist = landmarks[16];
  const l_hip = landmarks[23];
  const r_hip = landmarks[24];
  const l_ankle = landmarks[27];
  const r_ankle = landmarks[28];

  if (!l_wrist || !r_wrist || !l_hip || !r_hip || !l_ankle || !r_ankle) return state;

  let newState = { ...state };

  // Calculate feet distance
  const feetDist = Math.abs(l_ankle.x - r_ankle.x);
  
  // Hands above head condition (approximately)
  const handsUp = l_wrist.y < l_hip.y - 0.3 && r_wrist.y < r_hip.y - 0.3; // Wrist significantly above hip/shoulder
  const handsDown = l_wrist.y > l_hip.y && r_wrist.y > r_hip.y;

  if (handsDown && feetDist < 0.15) {
      newState.stage = 'DOWN';
  }
  
  if (handsUp && feetDist > 0.25 && state.stage === 'DOWN') {
      newState.stage = 'UP';
      newState.reps += 1;
      newState.lastFeedback = "Jack!";
  }

  return newState;
};
