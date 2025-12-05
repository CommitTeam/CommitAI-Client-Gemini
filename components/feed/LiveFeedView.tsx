
import React, { useEffect, useRef, useState } from 'react';
import { LiveSession, User } from '../../types';
import { X, Share2, Eye, MoreVertical, Clock, MessageSquare, Flame, Snowflake } from 'lucide-react';
import * as Backend from '../../services/backend';

interface Props {
  sessions: LiveSession[];
  initialSessionId: string | null;
  onClose: () => void;
  onProfileClick?: (userId: string) => void;
  currentUser: User | null;
}

const AI_SHOUTOUTS = [
  "KEEP PUSHING! 🚀",
  "LIGHT WEIGHT BABY! 💪",
  "DONT YOU DARE QUIT 😤",
  "FORM CHECK: PERFECT ✨",
  "ALMOST THERE! 🏁",
  "BEAST MODE: ON 🦍"
];

const LiveFeedView: React.FC<Props> = ({ sessions, initialSessionId, onClose, onProfileClick, currentUser }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reps, setReps] = useState<Record<string, number>>({});
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [shoutoutMenuOpen, setShoutoutMenuOpen] = useState<string | null>(null);
  const [voteToast, setVoteToast] = useState<string | null>(null);

  useEffect(() => {
    if (initialSessionId && containerRef.current) {
      const index = sessions.findIndex(s => s.id === initialSessionId);
      if (index !== -1) {
        const element = containerRef.current.children[index] as HTMLElement;
        if (element) {
          element.scrollIntoView({ behavior: 'auto' });
        }
      }
    }
  }, [initialSessionId, sessions]);

  // Simulation Logic (same as before)
  useEffect(() => {
    const initialReps: Record<string, number> = {};
    const initialTimers: Record<string, number> = {};
    sessions.forEach(s => {
        initialReps[s.id] = Math.floor(Math.random() * 15);
        initialTimers[s.id] = 120;
    });
    setReps(initialReps);
    setTimers(initialTimers);
    const interval = setInterval(() => {
        setReps(prev => {
            const next = { ...prev };
            sessions.forEach(s => { if (Math.random() > 0.6) next[s.id] = (next[s.id] || 0) + 1; });
            return next;
        });
        setTimers(prev => {
            const next = { ...prev };
            sessions.forEach(s => { if ((next[s.id] || 0) > 0) next[s.id] = (next[s.id] || 0) - 1; });
            return next;
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessions]);

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  const toggleShoutoutMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShoutoutMenuOpen(prev => prev === id ? null : id);
  };

  const sendShoutout = (text: string) => {
    console.log(`Sent shoutout: ${text}`);
    setShoutoutMenuOpen(null);
  };

  const handleVote = async (sessionId: string, type: 'back' | 'callout', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    if (currentUser.coins >= 50) {
        await Backend.placeVote(currentUser.id, sessionId, type);
        setVoteToast("-50 POINTS DEDUCTED");
        setTimeout(() => setVoteToast(null), 2000);
    } else {
        setVoteToast("❌ INSUFFICIENT POINTS");
        setTimeout(() => setVoteToast(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {voteToast && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[110] bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-4">
              <span className="font-semibold text-xs text-white">{voteToast}</span>
          </div>
      )}

      <button 
        onClick={onClose}
        className="absolute top-[calc(1.5rem+env(safe-area-inset-top))] left-4 z-30 w-10 h-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition-colors"
      >
        <X size={20} />
      </button>

      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
        onClick={() => setShoutoutMenuOpen(null)}
      >
        {sessions.map((session) => {
          const currentReps = reps[session.id] || 0;
          const timeLeft = timers[session.id] || 0;
          const targetReps = 50; 
          const progress = Math.min(100, (currentReps / targetReps) * 100);
          const isMenuOpen = shoutoutMenuOpen === session.id;

          return (
            <div key={session.id} className="w-full h-full snap-center relative bg-gray-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                    <img 
                        src={session.thumbnail || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`} 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80"></div>
                </div>

                {/* Top Info */}
                <div className="absolute top-[calc(5rem+env(safe-area-inset-top))] left-4 flex items-center gap-2 z-10">
                    <div className="bg-red-500/90 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full animate-pulse shadow-glow">
                        LIVE
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-white/10 text-white">
                        <Eye size={12} />
                        {session.viewers}
                    </div>
                </div>

                {/* Timer & Reps */}
                <div className="absolute top-[calc(1.5rem+env(safe-area-inset-top))] right-4 flex flex-col items-end z-20 gap-2">
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                        <Clock size={14} className="text-white/80" />
                        <span className="font-mono font-bold text-lg text-white leading-none">{formatTime(timeLeft)}</span>
                    </div>
                    <div className="text-5xl font-bold text-white drop-shadow-md">{currentReps}</div>
                </div>

                {/* Interaction Buttons - Glass Circles */}
                <div className="absolute right-4 bottom-32 flex flex-col gap-4 items-center z-20 pb-safe">
                    <button 
                        onClick={(e) => handleVote(session.id, 'back', e)}
                        className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-orange-500/80 transition-all active:scale-95 shadow-lg group"
                    >
                        <Flame size={20} className="text-white group-hover:fill-white" />
                    </button>
                    
                    <button 
                        onClick={(e) => handleVote(session.id, 'callout', e)}
                        className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-blue-500/80 transition-all active:scale-95 shadow-lg group"
                    >
                        <Snowflake size={20} className="text-white group-hover:fill-white" />
                    </button>

                    <div className="relative">
                        {isMenuOpen && (
                            <div className="absolute right-14 bottom-0 glass-panel bg-white/90 p-2 w-48 rounded-2xl flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-right-5">
                                {AI_SHOUTOUTS.map(s => (
                                    <button key={s} onClick={(e) => { e.stopPropagation(); sendShoutout(s); }} className="text-left text-xs font-semibold text-gray-800 hover:bg-gray-100 p-2 rounded-xl transition-all">{s}</button>
                                ))}
                            </div>
                        )}
                        <button 
                            onClick={(e) => toggleShoutoutMenu(session.id, e)}
                            className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all active:scale-95 shadow-lg"
                        >
                            <MessageSquare size={20} className="text-white" />
                        </button>
                    </div>

                    <button className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all active:scale-95 shadow-lg">
                        <Share2 size={20} className="text-white" />
                    </button>
                </div>

                {/* Footer Info */}
                <div className="absolute bottom-0 left-0 w-full pt-20 pb-safe px-4 z-10">
                    <div className="pb-8">
                        <div className="w-full h-1 bg-white/20 mb-4 rounded-full overflow-hidden backdrop-blur-sm">
                             <div className="h-full bg-acid-green transition-all duration-1000 shadow-[0_0_10px_#FFEE32]" style={{ width: `${progress}%` }}></div>
                        </div>

                        <div 
                          className="flex items-center gap-3 mb-2 pointer-events-auto cursor-pointer"
                          onClick={() => onProfileClick && onProfileClick(session.user.id)}
                        >
                            <div className="w-10 h-10 rounded-full border border-white/50 p-0.5">
                                <img src={session.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`} alt={session.user.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-white leading-none">{session.user.name}</h3>
                                <span className="text-xs text-white/70">LVL {session.user.level}</span>
                            </div>
                            <button className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-white hover:text-black transition-colors">
                                Follow
                            </button>
                        </div>
                        <p className="text-white/90 text-sm font-medium ml-13">{session.workoutTitle}</p>
                    </div>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveFeedView;
