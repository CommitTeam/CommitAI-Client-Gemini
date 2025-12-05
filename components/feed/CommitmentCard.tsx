
import React from 'react';
import { Commitment, User } from '../../types';
import { Zap, Flame, Snowflake } from 'lucide-react';

interface Props {
  commitment: Commitment;
  currentUser: User | null;
  onVote: (id: string, type: 'back' | 'callout') => void;
  onProfileClick?: (userId: string) => void;
  onGoLive?: (commitment: Commitment) => void;
}

// Custom Kettlebell Icon (Cuter, Rounded) - Exported for use in WorkoutChallenge
export const KettlebellIcon: React.FC<{size?: number, className?: string}> = ({ size = 24, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C7.5 2 4.5 5.5 4.5 9.5C4.5 11.5 5.5 13.5 7 14.5L7.5 18C7.5 20.2 9.3 22 11.5 22H12.5C14.7 22 16.5 20.2 16.5 18L17 14.5C18.5 13.5 19.5 11.5 19.5 9.5C19.5 5.5 16.5 2 12 2ZM9 10C9.6 10 10 9.6 10 9C10 8.4 9.6 8 9 8C8.4 8 8 8.4 8 9C8 9.6 8.4 10 9 10ZM15 10C15.6 10 16 9.6 16 9C16 8.4 15.6 8 15 8C14.4 8 14 8.4 14 9C14 9.6 14.4 10 15 10ZM12 14.5C12.8 14.5 13.5 15.2 13.5 16V18.5H10.5V16C10.5 15.2 11.2 14.5 12 14.5Z" />
  </svg>
);

const CommitmentCard: React.FC<Props> = ({ commitment, currentUser, onVote, onProfileClick, onGoLive }) => {
  const isOwn = currentUser && currentUser.id === commitment.user.id;
  
  return (
    <div className="glass-panel bg-white p-5 rounded-[32px] relative overflow-hidden flex flex-col h-full min-h-[160px] shadow-sm hover:shadow-md transition-all border border-white/60">
       
       {/* User Header */}
       <div className="flex justify-between items-start mb-3">
           <div 
             className="flex items-center gap-2 cursor-pointer group"
             onClick={() => onProfileClick && onProfileClick(commitment.user.id)}
           >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-white shrink-0">
                    <img 
                        src={commitment.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${commitment.user.name}`} 
                        alt="avatar" 
                        className="w-full h-full object-cover" 
                    />
                </div>
                <div>
                    <h4 className="font-bold text-xs text-gray-900 leading-none">{commitment.user.name}</h4>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">LVL {commitment.user.level}</span>
                </div>
           </div>
           
           <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <Zap size={10} className="fill-orange-400 text-orange-400" />
                <span className="font-bold text-[10px] text-gray-600">{commitment.user.stats.currentStreak}</span>
           </div>
       </div>

       {/* Title */}
       <div className="mb-6 flex-1">
            <h3 className="text-lg font-black text-gray-900 leading-tight tracking-tight line-clamp-2">
                {commitment.workoutTitle}
            </h3>
       </div>

       {/* Actions */}
       {isOwn ? (
         <div className="mt-auto">
             <button 
                 onClick={() => onGoLive && onGoLive(commitment)}
                 className="w-full bg-black text-white py-3 rounded-xl font-black uppercase tracking-wide shadow-lg shadow-black/20 hover:bg-gray-900 active:scale-95 transition-all flex items-center justify-center gap-2"
             >
                 <Zap size={16} className="text-acid-green fill-acid-green" />
                 GO LIVE NOW
             </button>
         </div>
       ) : (
         /* Voting Actions - UPDATED: Snow (No) Left, Fire (Yo) Right */
         <div className="flex gap-2 mt-auto">
              {/* CALLOUT / NO (Snowflake) - Left */}
              <button 
                  onClick={() => onVote(commitment.id, 'callout')}
                  className={`
                      flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all active:scale-95
                      ${commitment.currentUserVote === 'callout' 
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }
                      ${commitment.currentUserVote && commitment.currentUserVote !== 'callout' ? 'opacity-30' : ''}
                  `}
              >
                  <Snowflake size={16} className={commitment.currentUserVote === 'callout' ? 'fill-white' : 'fill-gray-400'} />
                  <span className="text-xs font-black uppercase tracking-wide">NO</span>
              </button>

              {/* BACK / YO (Fire) - Right */}
              <button 
                  onClick={() => onVote(commitment.id, 'back')}
                  className={`
                      flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all active:scale-95
                      ${commitment.currentUserVote === 'back' 
                          ? 'bg-acid-green text-black shadow-lg shadow-acid-green/20' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }
                      ${commitment.currentUserVote && commitment.currentUserVote !== 'back' ? 'opacity-30' : ''}
                  `}
              >
                  <Flame size={16} className={commitment.currentUserVote === 'back' ? 'fill-black' : 'fill-gray-400'} />
                  <span className="text-xs font-black uppercase tracking-wide">YO</span>
              </button>
         </div>
       )}
    </div>
  );
};

export default CommitmentCard;
