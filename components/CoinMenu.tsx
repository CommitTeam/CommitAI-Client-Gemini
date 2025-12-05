
import React from 'react';
import { User, Commitment } from '../types';
import { X, Zap, Trophy, History, Brain, Sparkles, Flame, Snowflake } from 'lucide-react';
import BrutalistButton from './ui/BrutalistButton';

interface Props {
  user: User;
  onClose: () => void;
}

const CoinMenu: React.FC<Props> = ({ user, onClose }) => {
  const history = user.coinHistory || [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative glass-panel w-full max-w-md max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-5 overflow-hidden z-10 rounded-[40px] bg-white/90">
        
        <div className="p-6 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Points</h2>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{user.name}</div>
            </div>
            <button onClick={onClose} className="bg-gray-100 p-2 hover:bg-gray-200 transition-colors rounded-full text-gray-600">
                <X size={20} />
            </button>
        </div>

        {/* Balance Display */}
        <div className="px-6 mb-6">
            <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 p-8 rounded-[32px] text-center shadow-lg shadow-yellow-500/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-[10px] font-bold text-yellow-900 uppercase tracking-widest mb-1 block">Current Points</span>
                <div className="flex items-center justify-center gap-2 text-white drop-shadow-sm">
                    <span className="text-5xl font-bold tracking-tight">{user.coins.toLocaleString()}</span>
                    <Zap size={32} className="fill-white" />
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
            
            {/* AI Advisor */}
            <div className="bg-white/50 border border-white/50 p-4 rounded-[24px]">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="bg-black text-white p-1.5 rounded-full"><Brain size={12} /></div>
                    <h3 className="font-bold text-xs uppercase text-gray-900">Forecast</h3>
                 </div>
                 <p className="text-xs text-gray-600 mb-4 leading-relaxed font-medium">
                    "Points instability detected. Projections indicate a surge if you place a vote now."
                 </p>
                 <button className="w-full bg-gray-900 text-white text-xs font-bold uppercase py-2.5 hover:bg-black flex items-center justify-center gap-2 rounded-xl">
                    <Sparkles size={12} className="text-acid-green" /> Run Simulation
                 </button>
            </div>

            {/* Earn Section */}
            <div>
                <h3 className="font-bold text-xs uppercase text-gray-400 mb-3 ml-1">Earn Points</h3>
                <div className="grid grid-cols-2 gap-3">
                     <div className="p-4 bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col gap-2 cursor-pointer hover:scale-[1.02] transition-transform">
                        <div className="bg-orange-100 text-orange-600 p-2 w-fit rounded-xl"><Zap size={18} /></div>
                        <div>
                            <div className="font-bold text-sm text-gray-900">Go Live</div>
                            <div className="text-[10px] font-semibold text-orange-500">+100 PTS</div>
                        </div>
                     </div>
                     <div className="p-4 bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col gap-2 cursor-pointer hover:scale-[1.02] transition-transform">
                        <div className="bg-orange-100 text-orange-600 p-2 w-fit rounded-xl"><Trophy size={18} /></div>
                        <div>
                            <div className="font-bold text-sm text-gray-900">Vote Win</div>
                            <div className="text-[10px] font-semibold text-orange-500">+60 PTS</div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Log */}
            <div>
                <h3 className="font-bold text-xs uppercase text-gray-400 mb-3 ml-1">History</h3>
                <div className="space-y-3">
                    {history.slice().reverse().map(tx => (
                        <div key={tx.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div className="flex gap-3 items-center">
                                <div className={`p-2 rounded-xl ${tx.amount > 0 ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                                    {tx.amount > 0 ? <Flame size={14} /> : <Snowflake size={14} />}
                                </div>
                                <div>
                                    <div className="font-bold text-xs text-gray-900">{tx.type.replace('_', ' ')}</div>
                                    <div className="text-[10px] text-gray-400">{tx.description}</div>
                                </div>
                            </div>
                            <div className={`font-bold text-xs ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

        <div className="p-6 bg-white/50 border-t border-white/50">
             <BrutalistButton 
                label="Get More Points" 
                variant="primary" 
                className="w-full shadow-lg shadow-acid-green/30"
                onClick={() => alert("Coming soon")}
             />
        </div>

      </div>
    </div>
  );
};

export default CoinMenu;
