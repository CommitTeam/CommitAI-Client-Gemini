
import React, { useState, useEffect } from 'react';
import BrutalistButton from './ui/BrutalistButton';
import BrutalistCard from './ui/BrutalistCard';
import { useLiveCoach } from '../hooks/useLiveCoach';
import { Challenge } from '../types';
import LiveWorkoutCam from './LiveWorkoutCam';
import { KettlebellIcon } from './feed/CommitmentCard'; // Reusing the icon
import { Flame, Snowflake, Timer, Radio } from 'lucide-react';

interface Props {
  challenge: Challenge;
  initialMode?: 'view' | 'live';
  onComplete?: (result?: { success: boolean; reps: number }) => void;
}

const WorkoutChallenge: React.FC<Props> = ({ challenge, initialMode = 'view', onComplete }) => {
  const [isLive, setIsLive] = useState(initialMode === 'live');
  const [showCam, setShowCam] = useState(false);
  const { isConnected, isTalking, connect, disconnect } = useLiveCoach();

  // Determine if this workout supports AI counting
  const workoutType = challenge.workout.title.split(' ')[1] || challenge.workout.title; // simplistic parsing
  const isSupported = ['Pushups', 'Squats', 'Jumping'].some(type => challenge.workout.title.includes(type));
  const targetReps = challenge.workout.title.match(/\d+/)?.[0] || "0";
  // Extract duration if present in title "50 Pushups in 2 mins"
  const durationMatch = challenge.workout.title.match(/in\s(.+)/);
  const duration = durationMatch ? durationMatch[1] : "2 mins";

  const handleStartLive = () => {
      if (isSupported) {
          setShowCam(true);
      } else {
          setIsLive(true);
          if (!isConnected) connect();
      }
  };

  if (showCam) {
      return (
          <LiveWorkoutCam 
            exerciseType={workoutType}
            target={targetReps}
            duration={duration}
            onClose={() => setShowCam(false)}
            onComplete={(result) => {
                setShowCam(false);
                if (onComplete) onComplete(result);
            }}
          />
      );
  }

  if (isLive) {
      // Fallback for unsupported workouts (Standard Live Session / Manual)
      return (
        <div className="relative w-full h-[80vh] rounded-[32px] overflow-hidden shadow-glass bg-black flex flex-col items-center justify-center p-6 text-center">
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-acid-green/10 rounded-full blur-[100px] animate-pulse"></div>

            <div className="relative z-10 flex flex-col items-center gap-8">
                <div className={`w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center transition-all duration-500 ${isTalking ? 'scale-110 shadow-glow border-acid-green' : ''}`}>
                    <Radio size={48} className={isTalking ? 'text-acid-green' : 'text-white/50'} />
                </div>

                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{challenge.workout.title}</h2>
                    <p className="text-gray-400 font-mono">Live Audio Coaching Active</p>
                </div>

                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                    <Timer className="text-acid-green" size={18} />
                    <span className="text-white font-mono text-xl">Session Active</span>
                </div>

                <button 
                    onClick={() => { 
                        setIsLive(false); 
                        disconnect(); 
                        if(onComplete) onComplete({ success: true, reps: parseInt(targetReps) }); // Assume success for manual flow
                    }} 
                    className="bg-red-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-red-600 transition-all active:scale-95"
                >
                    End Session
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="glass-panel bg-white/80 p-8 rounded-[32px] shadow-glow text-center mt-10 relative overflow-hidden">
        {/* Friend Voting Section */}
        <div className="mb-6 bg-white/50 p-4 rounded-3xl border border-white/50">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Friend Votes</span>
                <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full">LIVE ODDS</span>
            </div>
            <div className="flex gap-2">
                {/* Vote Up - Dark Green */}
                <div className="flex-1 bg-[#15803d] p-3 rounded-2xl flex items-center justify-center gap-2 relative overflow-hidden shadow-inner">
                    <div className="liquid-fluid bg-inherit opacity-20"></div>
                    <Flame size={20} className="text-white fill-white" />
                    <span className="font-bold text-white">82%</span>
                </div>
                {/* Vote Down - Dark Red */}
                <div className="flex-1 bg-[#b91c1c] p-3 rounded-2xl flex items-center justify-center gap-2 relative overflow-hidden shadow-inner">
                    <div className="liquid-fluid bg-inherit opacity-20"></div>
                    <Snowflake size={20} className="text-white fill-white" />
                    <span className="font-bold text-white">18%</span>
                </div>
            </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">{challenge.workout.title}</h2>
        <p className="text-gray-500 mb-8 font-medium">Ready to prove yourself?</p>
        
        <BrutalistButton 
            label={isSupported ? "GO LIVE (AI TRACKING)" : "START LIVE SESSION"} 
            onClick={handleStartLive} 
            className="w-full shadow-lg shadow-black/20" 
        />
        
        {isSupported && (
            <p className="text-[10px] text-gray-400 mt-3 font-semibold uppercase tracking-wide">
                * Camera Required for Rep Counting
            </p>
        )}
    </div>
  );
};

export default WorkoutChallenge;
