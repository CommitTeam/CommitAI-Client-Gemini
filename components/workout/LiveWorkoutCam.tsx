
import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Play, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import BrutalistButton from './ui/BrutalistButton';
import { analyzeSquat, analyzePushup, analyzeJumpingJack, ExerciseState } from '../utils/poseLogic';

interface Props {
  exerciseType: string;
  target: string;
  duration: string; // e.g. "2 min", "30 secs"
  onClose: () => void;
  onComplete: (result: { reps: number; success: boolean }) => void;
}

declare global {
  interface Window {
    Pose: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    POSE_CONNECTIONS: any;
  }
}

const LiveWorkoutCam: React.FC<Props> = ({ exerciseType, target, duration, onClose, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [workoutStatus, setWorkoutStatus] = useState<'setup' | 'countdown' | 'active' | 'finished'>('setup');
  const [countDown, setCountDown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [exerciseState, setExerciseState] = useState<ExerciseState>({ stage: null, reps: 0, lastFeedback: "Get Ready" });
  
  const targetReps = parseInt(target) || 0;
  const targetSeconds = duration.includes('min') ? parseInt(duration) * 60 : parseInt(duration);

  // Initialize Camera & Pose
  useEffect(() => {
    let camera: any = null;
    let pose: any = null;

    const onResults = (results: any) => {
      if (!canvasRef.current || !videoRef.current) return;
      
      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, width, height);
      
      // Draw Video
      canvasCtx.drawImage(results.image, 0, 0, width, height);

      // Draw Skeleton
      if (results.poseLandmarks) {
        if (window.drawConnectors && window.POSE_CONNECTIONS) {
            window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
        }
        if (window.drawLandmarks) {
            window.drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
        }

        // Analyze Reps only if Active
        if (workoutStatus === 'active') {
            const type = exerciseType.toLowerCase();
            let newState = { ...exerciseState };
            
            if (type.includes('squat')) {
                newState = analyzeSquat(results.poseLandmarks, exerciseState);
            } else if (type.includes('pushup')) {
                newState = analyzePushup(results.poseLandmarks, exerciseState);
            } else if (type.includes('jack')) {
                newState = analyzeJumpingJack(results.poseLandmarks, exerciseState);
            }

            if (newState.reps !== exerciseState.reps) {
                setExerciseState(newState);
            }
        }
      }
      canvasCtx.restore();
    };

    const init = async () => {
      if (window.Pose) {
        pose = new window.Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        pose.onResults(onResults);

        if (videoRef.current && window.Camera) {
          camera = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current) await pose.send({ image: videoRef.current });
            },
            width: 640,
            height: 480
          });
          try {
              await camera.start();
              setPermissionGranted(true);
          } catch (e) {
              console.error("Camera denied", e);
          }
        }
      }
    };

    if (workoutStatus !== 'finished') {
        init();
    }

    return () => {
      if (camera) camera.stop();
      if (pose) pose.close();
    };
  }, [workoutStatus, exerciseType]); // Re-init on status change not ideal, but ensures state capture. Better to use refs for state inside callback. 
  // Optimization: The onResults closure captures initial state. For rep counting to persist, we need refs for state.
  
  // Ref-based state for the loop
  const stateRef = useRef<ExerciseState>({ stage: null, reps: 0, lastFeedback: "" });
  
  useEffect(() => {
      stateRef.current = exerciseState;
  }, [exerciseState]);

  // Handle Workout Timer
  useEffect(() => {
    let timer: any;
    if (workoutStatus === 'countdown') {
        timer = setInterval(() => {
            setCountDown(prev => {
                if (prev === 1) {
                    setWorkoutStatus('active');
                    setTimeLeft(targetSeconds);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    } else if (workoutStatus === 'active') {
        timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setWorkoutStatus('finished');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(timer);
  }, [workoutStatus, targetSeconds]);

  // Finish early if target met
  useEffect(() => {
      if (workoutStatus === 'active' && targetReps > 0 && exerciseState.reps >= targetReps) {
          setWorkoutStatus('finished');
      }
  }, [exerciseState.reps, workoutStatus, targetReps]);


  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Video / Canvas Layer */}
      <div className="relative flex-1 bg-gray-900 flex items-center justify-center overflow-hidden">
         <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-0" playsInline />
         <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" width={640} height={480} />
         
         {/* Overlays based on Status */}
         
         {/* SETUP */}
         {!permissionGranted && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center z-50">
                 <Camera size={48} className="text-white mb-4 animate-bounce" />
                 <h2 className="text-white text-2xl font-bold mb-2">Camera Access Needed</h2>
                 <p className="text-gray-400 mb-6">We use your camera to count reps. Your video is processed locally and never sent to a server.</p>
                 <span className="text-sm text-yellow-400">Please allow camera access when prompted.</span>
             </div>
         )}

         {/* COUNTDOWN */}
         {workoutStatus === 'countdown' && (
             <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
                 <div className="text-[120px] font-black text-acid-green animate-ping">{countDown}</div>
             </div>
         )}

         {/* ACTIVE OVERLAY */}
         {workoutStatus === 'active' && (
             <>
                {/* HUD Top */}
                <div className="absolute top-safe left-0 right-0 p-4 flex justify-between items-start z-20">
                    <div className="glass-panel bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                        <span className="text-[10px] text-gray-300 uppercase tracking-widest block">Reps</span>
                        <span className="text-4xl font-black text-acid-green leading-none">{exerciseState.reps}</span>
                        {targetReps > 0 && <span className="text-xs text-gray-400">/ {targetReps}</span>}
                    </div>
                    
                    <div className="glass-panel bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                        <span className="text-[10px] text-gray-300 uppercase tracking-widest block">Time</span>
                        <span className={`text-2xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>
                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                {/* HUD Bottom - Feedback */}
                <div className="absolute bottom-safe left-0 right-0 p-6 z-20 flex justify-center">
                    <div className="glass-panel bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-3 rounded-full">
                        <span className="text-white font-bold text-lg animate-pulse">{exerciseState.lastFeedback || "Keep moving!"}</span>
                    </div>
                </div>
             </>
         )}

         {/* FINISHED OVERLAY */}
         {workoutStatus === 'finished' && (
             <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                 <div className="mb-6 bg-acid-green p-6 rounded-full shadow-glow">
                    {exerciseState.reps >= targetReps ? <CheckCircle size={64} className="text-black" /> : <AlertTriangle size={64} className="text-black" />}
                 </div>
                 
                 <h2 className="text-4xl font-black text-white mb-2 italic">
                    {exerciseState.reps >= targetReps ? "CRUSHED IT!" : "FINISHED"}
                 </h2>
                 <p className="text-gray-400 mb-8 text-center max-w-xs">
                    {exerciseState.reps >= targetReps 
                        ? `You completed ${exerciseState.reps} reps. Beast mode activated.` 
                        : `You did ${exerciseState.reps} reps. Good effort, but you can do better.`}
                 </p>

                 <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                     <div className="bg-white/10 p-4 rounded-2xl text-center">
                         <span className="block text-xs text-gray-500 uppercase">Reps</span>
                         <span className="text-2xl font-bold text-white">{exerciseState.reps}</span>
                     </div>
                     <div className="bg-white/10 p-4 rounded-2xl text-center">
                         <span className="block text-xs text-gray-500 uppercase">Time</span>
                         <span className="text-2xl font-bold text-white">{Math.floor((targetSeconds - timeLeft) / 60)}:{(targetSeconds - timeLeft) % 60}</span>
                     </div>
                 </div>

                 <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
                     <BrutalistButton 
                        label="Save & Continue" 
                        onClick={() => onComplete({ reps: exerciseState.reps, success: exerciseState.reps >= targetReps })} 
                        className="w-full"
                     />
                     <button onClick={onClose} className="text-white/60 text-sm font-semibold hover:text-white py-2">
                        Discard
                     </button>
                 </div>
             </div>
         )}
      </div>

      {/* SETUP UI */}
      {workoutStatus === 'setup' && permissionGranted && (
          <div className="absolute bottom-safe left-0 right-0 p-6 z-50 bg-gradient-to-t from-black via-black/80 to-transparent pt-20">
              <h3 className="text-white text-2xl font-bold mb-2">Live {exerciseType}</h3>
              <p className="text-gray-300 text-sm mb-6">
                  1. Place phone on floor or table.<br/>
                  2. Ensure your whole body is visible.<br/>
                  3. Wait for the countdown.
              </p>
              <BrutalistButton 
                label="START NOW" 
                onClick={() => setWorkoutStatus('countdown')}
                className="w-full shadow-glow"
              >
                  <Play size={20} className="fill-black" />
              </BrutalistButton>
              <button onClick={onClose} className="w-full text-center text-white/50 text-sm font-bold mt-4 py-2">CANCEL</button>
          </div>
      )}
    </div>
  );
};

export default LiveWorkoutCam;
