
import React, { useEffect, useState, useRef } from 'react';
import { User, Gym } from '../types';
import { 
  TrendingUp, Flame, Dumbbell, Target, Mail, 
  MessageSquare, Send, X, Share2, Instagram, Facebook, 
  Smartphone, Activity, Footprints, ChevronRight, Check, Zap,
  Camera, MapPin, BadgeCheck, Settings, ShoppingBag, Wallet
} from 'lucide-react';
import { sendFeedback, updateUserAvatar, updateUserGym } from '../services/backend';
import GymSelection from './onboarding/GymSelection';
import MarketplaceModal from './MarketplaceModal';
import Mascot from './ui/Mascot';

interface Props {
  user: User;
  onGenerateTagline: () => void;
  nextLevelRequirements?: Record<string, number>;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onUpdateUser: (user: User) => void;
}

// --- LEVEL LOGIC HELPER ---
const calculateLevelProgress = (user: User) => {
  const workouts = user.stats.totalWorkouts;
  const betWins = user.coinHistory.filter(t => t.type === 'BET_WON').length;

  // Level Logic:
  // 1-10: 5 workouts + 5 bets per level
  // 11-50: 10 workouts + 10 bets per level
  
  let currentLevel = user.level;
  let wReq = 5;
  let bReq = 5;
  
  // Requirements for CURRENT level up to NEXT level
  if (currentLevel >= 11) {
      wReq = 10;
      bReq = 10;
  }

  // Calculate raw progress within the current level cycle
  const wCurrent = workouts % wReq;
  const bCurrent = betWins % bReq;
  
  // Percentage for the ring (averaged)
  const wPct = wCurrent / wReq;
  const bPct = bCurrent / bReq;
  const totalProgress = ((wPct + bPct) / 2) * 100;

  return { 
    level: currentLevel, 
    progress: totalProgress, 
    workouts, 
    betWins,
    wCurrent,
    wReq,
    bCurrent,
    bReq
  };
};

// --- COUNT UP COMPONENT ---
const CountUp = ({ end, duration = 1000, suffix = '' }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const ProfileView: React.FC<Props> = ({ user, onGenerateTagline, onLogout, onDeleteAccount, onUpdateUser }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showGymModal, setShowGymModal] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { level, progress, workouts, betWins, wCurrent, wReq, bCurrent, bReq } = calculateLevelProgress(user);
  
  // Animation state for ring
  const [ringProgress, setRingProgress] = useState(0);
  useEffect(() => {
      setTimeout(() => setRingProgress(progress), 300);
  }, [progress]);

  useEffect(() => {
    if (!user.dailyTagline) onGenerateTagline();
  }, [user.dailyTagline, onGenerateTagline]);

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    setIsSendingFeedback(true);
    await sendFeedback(user.id, feedbackText);
    setIsSendingFeedback(false);
    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => {
        setFeedbackSent(false);
        setShowFeedbackModal(false);
    }, 2000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        // Optimistic UI update could happen here, but we wait for backend
        const updatedUser = await updateUserAvatar(user.id, base64);
        if (updatedUser) {
            onUpdateUser(updatedUser);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGymSelect = async (gym: Gym) => {
      const updatedUser = await updateUserGym(user.id, gym);
      if (updatedUser) {
          onUpdateUser(updatedUser);
          setShowGymModal(false);
      }
  };

  const circumference = 2 * Math.PI * 60; // r=60
  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  return (
    <div className="space-y-8 pb-32 pt-4">
      
      {/* --- SECTION 1: LEVEL PROGRESSION ZONE --- */}
      <div className="relative flex flex-col items-center">
          
          {/* Header Composition: Avatar + Mascot */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-acid-green/20 rounded-full blur-[60px] animate-pulse"></div>
                
                <svg className="transform -rotate-90 w-full h-full drop-shadow-xl absolute top-0 left-0">
                    {/* Track */}
                    <circle cx="96" cy="96" r="60" stroke="#f2f2f7" strokeWidth="8" fill="transparent" />
                    {/* Progress */}
                    <circle 
                        cx="96" cy="96" r="60" 
                        stroke="#000000" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-[1500ms] ease-out"
                    />
                </svg>
                
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <div 
                        onClick={handleAvatarClick}
                        className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md mb-2 relative z-10 group cursor-pointer"
                    >
                        <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" className="w-full h-full object-cover" />
                        
                        {/* Edit Overlay */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera size={20} className="text-white" />
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />

                    <div className="absolute top-0 right-10 z-20">
                        {user.stats.currentStreak >= 3 && (
                            <div className="bg-orange-500 text-white rounded-full p-1.5 shadow-lg animate-bounce border-2 border-white">
                                <Flame size={12} fill="currentColor" />
                            </div>
                        )}
                    </div>
                    <span className="text-3xl font-black tracking-tighter text-gray-900 leading-none mt-2">
                        {level}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Level</span>
                </div>

                {/* Inline Mascot - Integrated Bottom Right */}
                <div className="absolute bottom-0 -right-4 z-20">
                    <Mascot 
                        userStats={user.stats} 
                        equipped={user.equipped} 
                        variant="inline" 
                        className="transform scale-90"
                    />
                </div>
          </div>

          <div className="text-center space-y-1 mb-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{user.name}</h1>
              
              {/* Gym Badge (Top Location) */}
              <button 
                  onClick={() => setShowGymModal(true)}
                  className="flex items-center gap-1.5 mt-2 mb-2 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all mx-auto"
              >
                  <MapPin size={12} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide truncate max-w-[200px]">
                      {user.gym ? user.gym.name : 'Set Workout Base'}
                  </span>
              </button>

              <p className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-600 border border-gray-200">{workouts} wins</span>
                  <span className="text-gray-300">•</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-600 border border-gray-200">{betWins} bets won</span>
              </p>
          </div>

          {/* Level Progress Tracker Card */}
          <div className="w-full max-w-xs mx-auto mt-4 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 animate-in slide-in-from-bottom-2 duration-500">
              <div className="text-center mb-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Level Progress</h3>
                  <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 text-xs font-bold text-gray-800 shadow-sm border border-white">
                    Level {level}
                  </div>
              </div>

              <div className="space-y-4">
                  {/* Workout Wins */}
                  <div>
                      <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                          <span>Workouts Won</span>
                          <span>{wCurrent} / {wReq}</span>
                      </div>
                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                          <div 
                              className="h-full bg-gradient-to-r from-emerald-300 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                              style={{ width: `${(wCurrent / wReq) * 100}%` }}
                          ></div>
                      </div>
                  </div>

                  {/* Bets Won */}
                  <div>
                      <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                          <span>Bets Won</span>
                          <span>{bCurrent} / {bReq}</span>
                      </div>
                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                          <div 
                              className="h-full bg-gradient-to-r from-purple-300 to-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                              style={{ width: `${(bCurrent / bReq) * 100}%` }}
                          ></div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* --- SECTION 3: WALLET ZONE (SPLURGE) --- */}
      <div className="px-2">
          <div className="bg-black rounded-[32px] p-6 shadow-xl relative overflow-hidden flex items-center justify-between">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black z-0"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-acid-green/10 rounded-full blur-[40px] animate-pulse"></div>
              
              <div className="relative z-10 text-white">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Balance</div>
                  <div className="flex items-center gap-2">
                      <Zap size={24} className="fill-acid-green text-acid-green" />
                      <span className="text-3xl font-black tracking-tight">{user.coins.toLocaleString()}</span>
                  </div>
              </div>

              <button 
                onClick={() => setShowMarketplace(true)}
                className="relative z-10 bg-acid-green text-black px-6 py-3 rounded-full font-black uppercase tracking-wide text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,238,50,0.3)] flex items-center gap-2"
              >
                  <ShoppingBag size={14} /> SPLURGE
              </button>
          </div>
      </div>

      {/* --- SECTION 4: PERFORMANCE SCORECARD --- */}
      <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Performance</h3>
          </div>
          
          {/* Horizontal Scroll Slider */}
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x no-scrollbar">
              
              {/* Pushups */}
              <div className="snap-center shrink-0 w-40 bg-white p-5 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between h-36">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-900">
                      <Dumbbell size={16} />
                  </div>
                  <div>
                      <div className="text-2xl font-black text-gray-900 tracking-tight">
                          <CountUp end={user.stats.workoutBreakdown['Pushups'] || 0} />
                      </div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Pushups</div>
                  </div>
              </div>

              {/* Squats */}
              <div className="snap-center shrink-0 w-40 bg-white p-5 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between h-36">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-900">
                      <Activity size={16} />
                  </div>
                  <div>
                      <div className="text-2xl font-black text-gray-900 tracking-tight">
                          <CountUp end={user.stats.workoutBreakdown['Squats'] || 0} />
                      </div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Squats</div>
                  </div>
              </div>

              {/* Steps */}
              <div className="snap-center shrink-0 w-40 bg-white p-5 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between h-36">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-900">
                      <Footprints size={16} />
                  </div>
                  <div>
                      <div className="text-2xl font-black text-gray-900 tracking-tight">
                          <CountUp end={user.stats.workoutBreakdown['Steps'] || 0} suffix="k" />
                      </div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Steps</div>
                  </div>
              </div>

              {/* Calories */}
              <div className="snap-center shrink-0 w-40 bg-white p-5 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between h-36">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-900">
                      <Flame size={16} />
                  </div>
                  <div>
                      <div className="text-2xl font-black text-gray-900 tracking-tight">
                          <CountUp end={user.stats.workoutBreakdown['Calories'] || 0} />
                      </div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Burned</div>
                  </div>
              </div>

          </div>

          {/* Share Button */}
          <button 
            onClick={() => setShowShareModal(true)}
            className="w-full bg-white border-2 border-black text-black py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
          >
              Share My Scorecard <Share2 size={16} />
          </button>
      </div>

      {/* --- SECTION 5: ACTIONS & SUPPORT --- */}
      <div className="pt-8 border-t border-gray-200/50 space-y-4">
          
          <div className="flex gap-3">
            <button 
                onClick={() => window.open('https://www.icommit.ai', '_blank')}
                className="flex-1 bg-white border border-gray-200 py-3 rounded-2xl text-xs font-bold uppercase tracking-wide text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
                <Mail size={14} /> Contact
            </button>
            <button 
                onClick={() => setShowFeedbackModal(true)}
                className="flex-1 bg-white border border-gray-200 py-3 rounded-2xl text-xs font-bold uppercase tracking-wide text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
                <MessageSquare size={14} /> Feedback
            </button>
          </div>
          
          <button onClick={onLogout} className="w-full py-3 text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors">
              Log Out
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="w-full py-2 text-xs font-semibold text-red-300 hover:text-red-500 transition-colors">
              Delete Account
          </button>
      </div>


      {/* --- MODALS --- */}

      {/* MARKETPLACE MODAL */}
      {showMarketplace && (
          <MarketplaceModal
            user={user}
            onClose={() => setShowMarketplace(false)}
            onUpdateUser={onUpdateUser}
          />
      )}

      {/* GYM SELECTION MODAL */}
      {showGymModal && (
          <GymSelection 
            onSelect={handleGymSelect} 
            onClose={() => setShowGymModal(false)}
          />
      )}

      {/* SHARE PREVIEW MODAL */}
      {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="relative w-full max-w-sm flex flex-col items-center">
                  <button onClick={() => setShowShareModal(false)} className="absolute -top-12 right-0 bg-white/20 p-2 rounded-full text-white hover:bg-white/40 backdrop-blur-md">
                      <X size={20} />
                  </button>

                  {/* Story Card Preview */}
                  <div className="bg-[#1c1c1e] w-full aspect-[9/16] rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col p-8 items-center text-center animate-in slide-in-from-bottom-10 border border-white/10">
                      {/* Background Effects */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-acid-green/20 blur-[100px] rounded-full opacity-60"></div>
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-punch-blue/20 blur-[100px] rounded-full opacity-60"></div>
                      
                      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
                          <h3 className="text-acid-green font-black italic text-4xl tracking-tighter mb-8 uppercase">Commit<span className="text-white">AI</span></h3>
                          
                          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-acid-green to-blue-500 mb-6">
                             <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" className="w-full h-full rounded-full object-cover border-4 border-black" />
                          </div>

                          <h2 className="text-white text-3xl font-bold mb-1">{user.name}</h2>
                          <div className="inline-block bg-white/10 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold text-gray-300 mb-8 uppercase tracking-widest border border-white/10">
                              Level {level} • Built Different
                          </div>

                          <div className="grid grid-cols-2 gap-4 w-full">
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                  <div className="text-2xl font-bold text-white">{workouts}</div>
                                  <div className="text-[10px] text-gray-400 uppercase">Wins</div>
                              </div>
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                  <div className="text-2xl font-bold text-white">{betWins}</div>
                                  <div className="text-[10px] text-gray-400 uppercase">Bets Won</div>
                              </div>
                          </div>
                      </div>

                      <div className="relative z-10 mt-auto w-full pt-8">
                          <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-4">Share to</p>
                          <div className="flex justify-center gap-4">
                              <button className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                                  <Instagram size={24} />
                              </button>
                              <button className="w-12 h-12 rounded-full bg-black border border-white/20 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                                  <div className="font-bold text-xs"><span className="text-cyan-400">Tik</span>Tok</div>
                              </button>
                              <button className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                                  <Facebook size={24} />
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* FEEDBACK MODAL (Reused with minimal tweaks) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative animate-in zoom-in-95">
                <button onClick={() => setShowFeedbackModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                    <X size={20} />
                </button>
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Feedback</h3>
                    <p className="text-sm text-gray-500">Help us improve.</p>
                </div>
                {feedbackSent ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center justify-center gap-2 mb-4">
                        <Check size={16} /> <span className="font-bold text-sm">Sent!</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Your thoughts..."
                            className="w-full bg-gray-50 border-0 p-4 rounded-2xl text-sm min-h-[120px] focus:ring-2 focus:ring-black/10 resize-none"
                            maxLength={500}
                        />
                        <button 
                            onClick={handleSendFeedback}
                            disabled={!feedbackText.trim() || isSendingFeedback}
                            className="w-full py-3.5 rounded-full bg-black text-white font-bold text-sm uppercase flex items-center justify-center gap-2 hover:bg-gray-900 disabled:opacity-50"
                        >
                            {isSendingFeedback ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-6 w-full max-w-sm rounded-[32px] shadow-2xl text-center">
                <h3 className="text-xl font-bold mb-2">Delete Account?</h3>
                <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={onDeleteAccount} className="bg-red-500 text-white py-3 rounded-full font-bold text-sm">Confirm Delete</button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="text-sm font-semibold text-gray-500 py-2">Cancel</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ProfileView;
