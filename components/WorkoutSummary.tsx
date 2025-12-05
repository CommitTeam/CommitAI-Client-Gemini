
import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { Share2, RefreshCw, X, Zap, Trophy } from 'lucide-react';
import BrutalistButton from './ui/BrutalistButton';
import Mascot from './ui/Mascot';

interface Props {
  results: {
    success: boolean;
    reps: number;
    pointsEarned: number;
    workoutTitle: string;
  };
  user: User;
  onClose: () => void;
}

const WorkoutSummary: React.FC<Props> = ({ results, user, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { success, reps, pointsEarned, workoutTitle } = results;

  const winMessages = [
      "Wow, you crushed it!",
      "Victory unlocked. Ego boosted!",
      "Built different. Literally.",
      "Light weight baby!"
  ];

  const lossMessages = [
      "Awh snap! You were close.",
      "That’s a loss... but legends rise.",
      "Better luck next round.",
      "Oof. We'll pretend that didn't happen."
  ];

  const message = success 
    ? winMessages[Math.floor(Math.random() * winMessages.length)] 
    : lossMessages[Math.floor(Math.random() * lossMessages.length)];

  // Trigger mascot mood based on result
  useEffect(() => {
      const mood = success ? 'excited' : 'sad';
      const event = new CustomEvent('mascot-trigger', { detail: { mood, message: success ? "YOOO!" : "Next time..." } });
      window.dispatchEvent(event);
  }, [success]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      
      <div className={`relative w-full max-w-sm bg-[#f2f2f7] rounded-[40px] overflow-hidden shadow-2xl transition-all duration-500 transform ${mounted ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-10 opacity-0'}`}>
        
        {/* Dynamic Background Header */}
        <div className={`h-40 w-full relative flex items-center justify-center overflow-hidden ${success ? 'bg-acid-green' : 'bg-gray-800'}`}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f2f2f7]/20"></div>
            {/* Confetti or Rain Effect could go here */}
            {success && <div className="absolute inset-0 animate-pulse bg-white/20"></div>}
            
            <div className="z-10 transform translate-y-4 scale-125">
                <Mascot 
                    variant="inline" 
                    userStats={user.stats} 
                    equipped={user.equipped}
                />
            </div>
        </div>

        <div className="p-8 pt-12 text-center relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                <X size={20} />
            </button>

            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2 leading-none">
                {success ? "SESSION COMPLETE" : "SESSION ENDED"}
            </h2>
            
            <p className="text-sm font-medium text-gray-500 mb-6 px-4">
                {message}
            </p>

            {/* Stats Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 grid grid-cols-2 gap-4">
                <div className="text-center">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Result</div>
                    <div className={`text-xl font-black uppercase ${success ? 'text-green-600' : 'text-red-500'}`}>
                        {success ? 'WIN' : 'MISS'}
                    </div>
                </div>
                <div className="text-center border-l border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reps</div>
                    <div className="text-xl font-black text-gray-900">
                        {reps}
                    </div>
                </div>
            </div>

            {/* Rewards */}
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className={`px-4 py-2 rounded-full border-2 font-bold flex items-center gap-2 ${success ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    <Zap size={16} className={success ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'} />
                    {success ? `+${pointsEarned}` : '+0'} Coins
                </div>
                {success && (
                    <div className="px-4 py-2 rounded-full border-2 border-blue-100 bg-blue-50 text-blue-600 font-bold flex items-center gap-2">
                        <Trophy size={16} /> XP Up
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <BrutalistButton 
                    label="Share Victory" 
                    variant="primary" 
                    className="w-full shadow-lg"
                    onClick={() => alert("Sharing...")} // Placeholder
                >
                    <Share2 size={18} /> Share Result
                </BrutalistButton>
                
                <button 
                    onClick={onClose}
                    className="w-full py-3 font-bold text-xs uppercase text-gray-400 hover:text-black transition-colors"
                >
                    Close
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default WorkoutSummary;
