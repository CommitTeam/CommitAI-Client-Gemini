
import React, { useState, useEffect } from 'react';
import { User, LeaderboardEntry, GymLeaderboardEntry } from '../types';
import { X, Trophy, Crown, Flame, MapPin, Share2, Eye, Zap, ArrowRight, Instagram, Facebook } from 'lucide-react';
import { getLeaderboard } from '../services/backend';
import Mascot from './ui/Mascot';
import BrutalistButton from './ui/BrutalistButton';

interface Props {
  currentUser: User;
  onClose: () => void;
  onProfileClick?: (userId: string) => void;
}

const LeaderboardModal: React.FC<Props> = ({ currentUser, onClose, onProfileClick }) => {
  const [activeTab, setActiveTab] = useState<'top_humans' | 'friends' | 'workouts_done' | 'top_gyms'>('top_humans');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [gymEntries, setGymEntries] = useState<GymLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showShareRank, setShowShareRank] = useState(false);
  const [expandedGymId, setExpandedGymId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        const data = await getLeaderboard(activeTab, currentUser.id);
        if (activeTab === 'top_gyms') {
            setGymEntries(data as GymLeaderboardEntry[]);
        } else {
            setEntries(data as LeaderboardEntry[]);
        }
        setLoading(false);
    };
    fetchData();
  }, [activeTab, currentUser.id]);

  const getUserRankEntry = () => entries.find(e => e.user.id === currentUser.id);
  const userRankEntry = getUserRankEntry();

  const renderRankBadge = (rank: number) => {
      if (rank === 1) return <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.6)] flex items-center justify-center text-yellow-900 font-black text-sm animate-pulse">1</div>;
      if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.4)] flex items-center justify-center text-gray-800 font-black text-sm">2</div>;
      if (rank === 3) return <div className="w-8 h-8 rounded-full bg-orange-300 border-2 border-orange-200 shadow-[0_0_10px_rgba(253,186,116,0.4)] flex items-center justify-center text-orange-900 font-black text-sm">3</div>;
      return <div className="w-8 text-center font-bold text-gray-400 text-sm">#{rank}</div>;
  };

  const handleRowClick = (entry: LeaderboardEntry) => {
      if (entry.user.id === currentUser.id) {
          setShowShareRank(true);
      } else {
          setSelectedUser(entry.user);
      }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Main Card */}
      <div className="relative w-full h-[92vh] sm:h-[85vh] sm:max-w-md bg-[#f2f2f7] sm:rounded-[40px] rounded-t-[40px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl p-6 pb-2 z-10 sticky top-0 border-b border-gray-200/50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-gray-900 italic tracking-tighter uppercase">Leaderboard</h2>
                <button onClick={onClose} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {[
                    { id: 'top_humans', label: 'Top Humans' },
                    { id: 'friends', label: 'Friends' },
                    { id: 'workouts_done', label: 'Workouts Done' },
                    { id: 'top_gyms', label: 'Top Gyms' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all
                            ${activeTab === tab.id 
                                ? 'bg-black text-white shadow-lg' 
                                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-32 pt-2">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    <span className="text-xs font-bold uppercase tracking-widest">Loading Ranks...</span>
                </div>
            ) : activeTab === 'top_gyms' ? (
                /* GYM BATTLES LIST */
                <div className="space-y-3">
                    {gymEntries.map((entry) => (
                        <div 
                            key={entry.gym.id}
                            onClick={() => setExpandedGymId(expandedGymId === entry.gym.id ? null : entry.gym.id)}
                            className={`bg-white rounded-[24px] p-4 border-2 transition-all cursor-pointer ${expandedGymId === entry.gym.id ? 'border-acid-green shadow-lg' : 'border-transparent shadow-sm hover:shadow-md'}`}
                        >
                            <div className="flex items-center gap-4">
                                {renderRankBadge(entry.rank)}
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shadow-inner">
                                    {entry.rank === 1 ? '🏰' : '🏟️'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{entry.gym.name}</h3>
                                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                        <MapPin size={10} /> {entry.gym.location || 'Global'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-gray-900">{entry.totalScore.toLocaleString()}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase">Total Pts</div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedGymId === entry.gym.id && (
                                <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex -space-x-2">
                                            {[1,2,3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                                            ))}
                                            <div className="w-8 h-8 rounded-full bg-black text-white text-[10px] flex items-center justify-center border-2 border-white font-bold">
                                                +{entry.gym.memberCount}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-acid-green uppercase">MVP of the Week</div>
                                            <div className="font-bold text-sm">{entry.mvpUser?.name || 'Ghost'}</div>
                                        </div>
                                    </div>
                                    <button className="w-full bg-black text-white py-3 rounded-xl font-bold text-xs uppercase hover:scale-[1.02] transition-transform">
                                        Represent This Gym
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                /* USER LIST */
                <div className="space-y-2">
                    {entries.map((entry) => (
                        <div 
                            key={entry.user.id}
                            onClick={() => handleRowClick(entry)}
                            className={`
                                relative group flex items-center gap-3 p-3 rounded-[20px] transition-all cursor-pointer border border-transparent
                                ${entry.rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-200 shadow-md' : 
                                  entry.rank === 2 ? 'bg-gradient-to-r from-gray-50 to-white border-gray-200 shadow-sm' :
                                  entry.rank === 3 ? 'bg-gradient-to-r from-orange-50 to-white border-orange-200 shadow-sm' : 
                                  'bg-white hover:bg-gray-50 shadow-sm'
                                }
                                ${entry.user.id === currentUser.id ? 'ring-2 ring-black' : ''}
                            `}
                        >
                            {renderRankBadge(entry.rank)}
                            
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                                    <img src={entry.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.user.name}`} alt={entry.user.name} className="w-full h-full object-cover" />
                                </div>
                                {entry.isLive && (
                                    <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white animate-pulse">
                                        LIVE
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-gray-900 truncate">{entry.user.name}</span>
                                    {entry.user.id === currentUser.id && <span className="text-[10px] bg-gray-200 px-1 rounded text-gray-600 font-bold">YOU</span>}
                                </div>
                                <div className="text-xs text-gray-500 font-medium truncate flex items-center gap-1">
                                    {activeTab === 'workouts_done' 
                                        ? `${entry.user.stats.totalWorkouts} Workouts` 
                                        : (entry.recentHighlight || entry.user.gym?.name || "Rookie")}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-black text-gray-900 text-sm">
                                    {activeTab === 'workouts_done' ? entry.user.stats.totalWorkouts : entry.score.toLocaleString()}
                                </div>
                                <div className="flex items-center justify-end gap-0.5 text-[10px] font-bold text-gray-400 uppercase">
                                    {activeTab === 'workouts_done' ? 'Done' : <><Zap size={10} className="fill-acid-green text-acid-green" /> Pts</>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* --- USER ACTION SHEET --- */}
        {selectedUser && (
            <div className="absolute inset-0 z-50 flex items-end pointer-events-none">
                <div 
                    className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
                    onClick={() => setSelectedUser(null)}
                ></div>
                <div className="bg-white w-full rounded-t-[40px] p-8 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-full duration-300 pointer-events-auto relative">
                    {/* Handle */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full"></div>
                    
                    <div className="flex items-center gap-6 mb-8">
                        {/* Mascot Display */}
                        <div className="scale-75 origin-left">
                            <Mascot variant="inline" equipped={selectedUser.equipped} userStats={selectedUser.stats} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900">{selectedUser.name}</h2>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Lvl {selectedUser.level}</span>
                                {selectedUser.gym && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">{selectedUser.gym.name}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Current Streak</div>
                            <div className="text-2xl font-black text-gray-900 flex items-center gap-1">
                                {selectedUser.stats.currentStreak} <Flame className="text-orange-500 fill-orange-500" size={18} />
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Win Rate</div>
                            <div className="text-2xl font-black text-gray-900">
                                64%
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <button className="flex-1 bg-white border-2 border-gray-100 text-gray-900 py-3 rounded-2xl font-bold text-xs uppercase hover:bg-gray-50 transition-colors">
                                Flex Emoji 💪
                            </button>
                            <button 
                                onClick={() => { if(onProfileClick) { onProfileClick(selectedUser.id); setSelectedUser(null); onClose(); } }}
                                className="flex-1 bg-white border-2 border-gray-100 text-gray-900 py-3 rounded-2xl font-bold text-xs uppercase hover:bg-gray-50 transition-colors"
                            >
                                View Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- FLEX SHARE CARD --- */}
        {showShareRank && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
                <div className="relative w-full max-w-sm bg-[#1c1c1e] rounded-[40px] overflow-hidden shadow-2xl p-8 text-center border border-white/10">
                    <button onClick={() => setShowShareRank(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={24} /></button>
                    
                    <div className="absolute inset-0 bg-gradient-to-b from-acid-green/10 via-transparent to-transparent pointer-events-none"></div>

                    <h3 className="text-acid-green font-black italic text-3xl mb-1 uppercase tracking-tighter">I'm Ranked #{userRankEntry?.rank}</h3>
                    <p className="text-gray-400 text-sm font-bold mb-8">Catch me if you can!</p>

                    <div className="relative mx-auto w-32 h-32 mb-6">
                        <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                        <img 
                            src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} 
                            alt="avatar" 
                            className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-xl"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black w-10 h-10 flex items-center justify-center rounded-full font-black border-4 border-[#1c1c1e] text-lg">
                            {userRankEntry?.rank}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                            <div className="text-white font-black text-xl">{currentUser.coins.toLocaleString()}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Points</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                            <div className="text-white font-black text-xl">{currentUser.stats.currentStreak}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Streak</div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                             <Instagram size={24} />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-black border border-white/20 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                             <span className="font-bold text-xs"><span className="text-cyan-400">Tik</span>Tok</span>
                        </button>
                        <button className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                             <Facebook size={24} />
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default LeaderboardModal;
