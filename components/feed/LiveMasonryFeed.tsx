
import React, { useState, useEffect } from 'react';
import { LiveSession, User } from '../../types';
import { Eye, Flame, Snowflake, Zap, ArrowRight } from 'lucide-react';

interface Props {
  sessions: LiveSession[];
  onSessionClick: (sessionId: string) => void;
  onGoMove?: () => void;
  onProfileClick?: (userId: string) => void;
  currentUser: User | null;
  onVote: (id: string, type: 'back' | 'callout') => void;
}

const LiveMasonryFeed: React.FC<Props> = ({ sessions, onSessionClick, onProfileClick, onVote, onGoMove }) => {
  const [liveReps, setLiveReps] = useState<Record<string, number>>({});

  useEffect(() => {
    const initial: Record<string, number> = {};
    sessions.forEach(s => {
        initial[s.id] = s.currentReps || 0;
    });
    setLiveReps(initial);

    const interval = setInterval(() => {
        setLiveReps(prev => {
            const next = { ...prev };
            sessions.forEach(s => {
                const target = s.totalReps || 50;
                const current = next[s.id] || 0;
                if (current < target && Math.random() > 0.4) {
                    next[s.id] = current + 1;
                }
            });
            return next;
        });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessions]);

  // Split into columns for grid layout
  const leftColumn = sessions.filter((_, i) => i % 2 === 0);
  const rightColumn = sessions.filter((_, i) => i % 2 !== 0);

  const renderCard = (session: LiveSession) => {
      const currentReps = liveReps[session.id] || session.currentReps || 0;
      
      return (
        <div 
            key={session.id}
            onClick={() => onSessionClick(session.id)}
            className="relative w-full aspect-[3/4] rounded-[24px] overflow-hidden mb-3 bg-black border border-white/10 shadow-lg group cursor-pointer"
        >
            {/* Background */}
            <div className="absolute inset-0">
                <img 
                    src={session.thumbnail || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`} 
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                    alt="thumbnail"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/10"></div>
            </div>

            {/* Top Left: Viewers */}
            <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md border border-white/10 px-2 py-1 rounded-full flex items-center gap-1 z-10">
                <Eye size={10} className="text-white" />
                <span className="text-[10px] font-bold text-white">{session.viewers}</span>
            </div>

            {/* Top Right: Voting Buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                <button 
                    onClick={(e) => { e.stopPropagation(); onVote(session.id, 'back'); }}
                    className="w-8 h-8 rounded-full bg-acid-green/90 backdrop-blur-md flex items-center justify-center shadow-lg active:scale-90 transition-transform border border-white/10"
                >
                    <Flame size={14} className="fill-black text-black" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onVote(session.id, 'callout'); }}
                    className="w-8 h-8 rounded-full bg-punch-blue/90 backdrop-blur-md flex items-center justify-center shadow-lg active:scale-90 transition-transform border border-white/10"
                >
                    <Snowflake size={14} className="fill-white text-white" />
                </button>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 w-full p-4 z-10">
                <div 
                    className="flex items-center gap-2 mb-1 group/profile" 
                    onClick={(e) => { e.stopPropagation(); onProfileClick && onProfileClick(session.user.id); }}
                >
                    <h3 className="font-black text-white text-sm tracking-tight leading-none group-hover/profile:underline decoration-acid-green decoration-2 underline-offset-2">
                        {session.user.name}
                    </h3>
                </div>
                
                <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wide mb-1">
                    {session.user.gym?.name || "GOLD'S GYM"}
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-[9px] font-mono text-white/60 uppercase truncate max-w-[60%]">
                        {session.workoutTitle.split(' ').slice(1).join(' ')}
                    </div>
                    <div className="text-[10px] font-black text-acid-green">
                        {currentReps}/{session.totalReps} REPS
                    </div>
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="px-2 mb-24">
        <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="font-black text-xl tracking-tighter text-gray-900 italic">Arena</h3>
            <div className="bg-red-50 px-2 py-1 rounded-full flex items-center gap-1.5 border border-red-100">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">15,328 Online</span>
            </div>
        </div>

        <div className="flex gap-3 items-start mb-8">
            <div className="flex-1 flex flex-col">
                {leftColumn.map(renderCard)}
            </div>
            {/* Stagger the right column by adding top padding */}
            <div className="flex-1 flex flex-col pt-12">
                {rightColumn.map(renderCard)}
            </div>
        </div>

        {/* END OF FEED BANNER */}
        <div className="w-full bg-black rounded-[32px] p-8 text-center shadow-2xl relative overflow-hidden group">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-acid-green/10 rounded-full blur-[50px] group-hover:bg-acid-green/20 transition-colors duration-500"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <Zap size={32} className="text-acid-green fill-acid-green mb-4 animate-bounce" />
                <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2 uppercase">You've watched it all</h3>
                <p className="text-gray-400 text-sm font-medium mb-6">Stop scrolling. Start sweating.</p>
                
                <button 
                    onClick={onGoMove}
                    className="w-full bg-acid-green text-black py-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,238,50,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    GO WORKOUT <ArrowRight size={18} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default LiveMasonryFeed;
