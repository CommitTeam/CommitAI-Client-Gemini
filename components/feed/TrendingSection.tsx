
import React from 'react';
import { Commitment, User } from '../../types';
import CommitmentCard from './CommitmentCard';
import { ArrowRight, ArrowLeft, Flame } from 'lucide-react';

interface Props {
  commitments: Commitment[];
  currentUser: User | null;
  onVote: (id: string, type: 'back' | 'callout') => void;
  onViewMore: () => void;
  isExpanded: boolean;
  onProfileClick?: (userId: string) => void;
  onGoLive?: (commitment: Commitment) => void;
}

const TrendingSection: React.FC<Props> = ({ commitments, currentUser, onVote, onViewMore, isExpanded, onProfileClick, onGoLive }) => {
  return (
    <div className={`mb-8 transition-all duration-300 ${isExpanded ? 'min-h-[80vh]' : ''}`}>
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
            <h3 className="font-black text-xl tracking-tighter text-gray-900 italic">TRENDING</h3>
            <div className="bg-orange-100 p-1 rounded-full">
                <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={16} />
            </div>
        </div>
        <button 
            onClick={onViewMore}
            className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors flex items-center gap-1"
        >
            {isExpanded ? (
                <>
                    <ArrowLeft size={14} /> Back
                </>
            ) : (
                <>
                    View All <ArrowRight size={14} />
                </>
            )}
        </button>
      </div>
      
      {isExpanded ? (
          /* EXPANDED GRID VIEW */
          <div className="grid grid-cols-1 gap-4 px-2 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
             {commitments.length === 0 ? (
                <div className="w-full h-32 border-2 border-gray-300 border-dashed rounded-3xl flex items-center justify-center bg-gray-50">
                    <span className="font-mono text-xs text-gray-400 font-bold uppercase">No Active Sparks</span>
                </div>
             ) : (
                 commitments.map(commitment => (
                     <div key={commitment.id} className="w-full">
                         <CommitmentCard 
                             commitment={commitment}
                             currentUser={currentUser}
                             onVote={onVote} 
                             onProfileClick={onProfileClick}
                             onGoLive={onGoLive}
                         />
                     </div>
                 ))
             )}
          </div>
      ) : (
          /* HORIZONTAL SCROLL CAROUSEL (Default) */
          <div className="flex gap-4 overflow-x-auto pb-6 px-4 -mx-4 no-scrollbar snap-x">
            {commitments.length === 0 ? (
            <div className="w-full h-40 border-2 border-gray-300 border-dashed rounded-3xl flex items-center justify-center bg-gray-50 shrink-0 mx-4">
                <span className="font-mono text-xs text-gray-400 font-bold uppercase">No Active Sparks</span>
            </div>
            ) : (
                commitments.map(commitment => (
                <div key={commitment.id} className="snap-center shrink-0 w-[85vw] sm:w-80">
                    <CommitmentCard 
                        commitment={commitment}
                        currentUser={currentUser}
                        onVote={onVote} 
                        onProfileClick={onProfileClick}
                        onGoLive={onGoLive}
                    />
                </div>
                ))
            )}
          </div>
      )}
    </div>
  );
};

export default TrendingSection;
