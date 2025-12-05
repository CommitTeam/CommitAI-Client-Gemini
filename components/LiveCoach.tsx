
import React from 'react';
import { useLiveCoach } from '../hooks/useLiveCoach';
import BrutalistCard from './ui/BrutalistCard';
import { Mic, MicOff, Radio } from 'lucide-react';

const LiveCoach: React.FC = () => {
  const { isConnected, isTalking, connect, disconnect, error } = useLiveCoach();

  return (
    <BrutalistCard color="blue" className="mb-8" title="Live Heckler">
      <div className="flex flex-col items-center gap-6">
        <div className={`relative rounded-full border-4 border-white w-24 h-24 flex items-center justify-center transition-all ${isTalking ? 'scale-110 shadow-[0_0_30px_rgba(255,255,255,0.8)]' : ''}`}>
           {isConnected ? <Radio className="w-10 h-10 animate-pulse" /> : <MicOff className="w-10 h-10 opacity-50" />}
        </div>
        
        <div className="text-center">
            <h4 className="font-bold text-lg mb-2">TALK TO THE COACH</h4>
            <p className="text-sm opacity-80 max-w-xs mx-auto">
                Start a live session. The AI will roast your excuses in real-time.
                Ensure your volume is up.
            </p>
            {error && <p className="text-red-300 font-bold mt-2 bg-black px-2 rounded-md">{error}</p>}
        </div>

        <button
          onClick={isConnected ? disconnect : connect}
          className={`
            w-full py-4 font-bold uppercase tracking-widest text-lg transition-transform active:translate-y-1 rounded-xl
            ${isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-acid-green text-black hover:bg-lime-300'}
          `}
        >
          {isConnected ? 'END SESSION' : 'START LIVE ROAST'}
        </button>
      </div>
    </BrutalistCard>
  );
};

export default LiveCoach;
