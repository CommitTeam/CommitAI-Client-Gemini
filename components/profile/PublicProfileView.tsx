
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { X, MapPin, BadgeCheck, Trophy, TrendingUp, TrendingDown, Shield, AlertTriangle, Zap, Activity, Flame } from 'lucide-react';
import * as Backend from '../services/backend';

interface Props {
  userId: string;
  onClose: () => void;
}

const PublicProfileView: React.FC<Props> = ({ userId, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
        const fetchedUser = await Backend.getUser(userId);
        if (fetchedUser) {
            setUser(fetchedUser);
        }
        setLoading(false);
    };
    loadUser();
  }, [userId]);

  if (loading) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="glass-panel px-6 py-3 rounded-full bg-white/80 shadow-glow">
                <span className="font-semibold text-sm text-gray-600 animate-pulse">Syncing Profile...</span>
            </div>
        </div>
      );
  }

  if (!user) return null;

  // Mock Credibility Stats
  const completionRate = 85; 
  const totalWatts = user.coins; 
  const winRate = 62; 

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
       
       <div className="w-full max-w-md bg-[#f2f2f7]/90 backdrop-blur-2xl h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl rounded-[40px] overflow-hidden relative border border-white/40">
            
            {/* Header Background */}
            <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-gray-200/50 to-transparent opacity-50 pointer-events-none"></div>
            
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 bg-white/50 hover:bg-white text-black p-2 rounded-full backdrop-blur-md transition-all z-20 shadow-sm"
            >
                <X size={20} />
            </button>

            {/* Profile Header */}
            <div className="relative pt-12 pb-6 px-6 flex flex-col items-center z-10">
                 {/* Avatar */}
                 <div className="w-28 h-28 rounded-full p-1.5 bg-white shadow-xl mb-4 relative">
                    <img 
                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                        alt={user.name} 
                        className="w-full h-full rounded-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                        LVL {user.level}
                    </div>
                 </div>

                 {/* Name & Gym */}
                 <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-1 text-center">
                    {user.name}
                 </h2>
                 
                 {user.gym && (
                    <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-full border border-white/40 shadow-sm mb-6">
                        <MapPin size={12} className="text-gray-500" />
                        <span className="text-xs font-semibold text-gray-600 truncate max-w-[150px]">{user.gym.name}</span>
                        {user.gym.isPartner && <BadgeCheck size={12} className="text-blue-500" />}
                    </div>
                 )}

                 {/* Action Buttons */}
                 <div className="flex gap-3 w-full max-w-xs">
                    <button className="flex-1 bg-black text-white py-3 rounded-full font-semibold text-sm shadow-lg hover:scale-[1.02] transition-transform active:scale-95">
                        Follow
                    </button>
                    <button className="flex-1 bg-white text-black py-3 rounded-full font-semibold text-sm shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors active:scale-95">
                        Challenge
                    </button>
                 </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6">
                
                {/* Reputation Stats */}
                <div className="glass-panel bg-white/60 p-1 rounded-[32px] grid grid-cols-3 gap-1 shadow-sm">
                    <div className="text-center p-4 rounded-[28px] bg-white shadow-sm">
                        <div className="text-xs font-semibold text-gray-400 mb-1">Completion</div>
                        <div className="text-xl font-bold text-gray-900">{completionRate}%</div>
                    </div>
                    <div className="text-center p-4">
                        <div className="text-xs font-semibold text-gray-500 mb-1">Streak</div>
                        <div className="text-xl font-bold text-gray-900 flex items-center justify-center gap-1">
                            {user.stats.currentStreak} <Flame size={14} className="text-orange-500 fill-orange-500" />
                        </div>
                    </div>
                    <div className="text-center p-4">
                        <div className="text-xs font-semibold text-gray-500 mb-1">Points</div>
                        <div className="text-xl font-bold text-gray-900">{(totalWatts / 1000).toFixed(1)}k</div>
                    </div>
                </div>

                {/* Score / Win Rate */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">Performance</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50/80 p-5 rounded-[24px] border border-green-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10"><TrendingUp size={40} className="text-green-600" /></div>
                            <div className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wide">Win Rate</div>
                            <div className="text-3xl font-bold text-green-700">{winRate}%</div>
                        </div>
                        <div className="bg-red-50/80 p-5 rounded-[24px] border border-red-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10"><TrendingDown size={40} className="text-red-600" /></div>
                            <div className="text-xs font-semibold text-red-600 mb-1 uppercase tracking-wide">Loss Rate</div>
                            <div className="text-3xl font-bold text-red-700">{100 - winRate}%</div>
                        </div>
                    </div>
                </div>

                {/* Badges */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">Badges</h3>
                    <div className="flex flex-wrap gap-2">
                        {user.stats.badges.length > 0 ? user.stats.badges.map(badge => (
                            <div key={badge} className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white/50 flex items-center gap-2">
                                <Trophy size={14} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-gray-800">{badge}</span>
                            </div>
                        )) : (
                            <div className="text-xs text-gray-400 px-2">No badges earned yet.</div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">Recent Activity</h3>
                    <div className="bg-white/50 rounded-[32px] p-2 space-y-1">
                        {[1, 2, 3].map((i) => (
                             <div key={i} className="flex items-center justify-between p-3 hover:bg-white transition-colors rounded-2xl group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 1 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                                        {i === 1 ? <AlertTriangle size={18} /> : <Activity size={18} />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{i === 1 ? "Failed Pushups" : "Completed 5k Run"}</div>
                                        <div className="text-[10px] text-gray-500 font-medium">2 days ago</div>
                                    </div>
                                </div>
                                <div className={`text-xs font-bold px-3 py-1 rounded-full ${i === 1 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    {i === 1 ? '-50' : '+120'}
                                </div>
                             </div>
                        ))}
                    </div>
                </div>

            </div>
       </div>
    </div>
  );
};

export default PublicProfileView;
