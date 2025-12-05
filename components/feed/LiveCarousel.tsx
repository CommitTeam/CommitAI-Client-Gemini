
import React from 'react';
import { LiveSession } from '../../types';
import { Eye, Flame } from 'lucide-react';

interface Props {
  sessions: LiveSession[];
  onSessionClick: (sessionId: string) => void;
}

// Custom Skull Icon for consistency with CommitmentCard
const SkullIcon: React.FC<{size?: number, className?: string}> = ({ size = 24, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C7.03 2 3 6.03 3 11C3 13.56 4.07 15.87 5.8 17.49L6 21.5C6 21.78 6.22 22 6.5 22H17.5C17.78 22 18 21.78 18 21.5L18.2 17.49C19.93 15.87 21 13.56 21 11C21 6.03 16.97 2 12 2ZM8 12.5C9.1 12.5 10 11.6 10 10.5C10 9.4 9.1 8.5 8 8.5C6.9 8.5 6 9.4 6 10.5C6 11.6 6.9 12.5 8 12.5ZM16 12.5C17.1 12.5 18 11.6 18 10.5C18 9.4 17.1 8.5 16 8.5C14.9 8.5 14 9.4 14 10.5C14 11.6 14.9 12.5 16 12.5ZM12 16C12.83 16 13.5 16.67 13.5 17.5V20H10.5V17.5C10.5 16.67 11.17 16 12 16Z" />
  </svg>
);

const LiveCarousel: React.FC<Props> = ({ sessions, onSessionClick }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-2 px-1">
        <h3 className="font-black text-xl tracking-tighter text-black">LIVE NOW <span className="text-red-600 animate-pulse">●</span></h3>
        <span className="text-xs font-bold underline text-black">View All</span>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 px-1 no-scrollbar snap-x">
        {sessions.map(session => (
          <div 
            key={session.id} 
            onClick={() => onSessionClick(session.id)}
            className="snap-center shrink-0 w-40 aspect-[9/16] relative bg-black border-4 border-black shadow-brutal overflow-hidden group cursor-pointer rounded-2xl"
          >
            {/* Background Image / Placeholder */}
            <div className="absolute inset-0 bg-gray-800">
               {session.thumbnail?.endsWith('.mp4') ? (
                  <video 
                    src={session.thumbnail} 
                    muted 
                    loop 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                  />
               ) : (
                  <img 
                    src={session.thumbnail || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`} 
                    alt={session.user.name} 
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" 
                  />
               )}
               {/* Overlay Gradient */}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
            </div>

            {/* VOTING BUTTONS - Right Edge - No Borders */}
            <div className="absolute right-1 bottom-16 z-20 flex flex-col gap-2">
                 {/* FIRE (Upvote) */}
                 <button 
                    onClick={(e) => { e.stopPropagation(); console.log('Voted Fire on', session.id); }}
                    className="w-8 h-8 rounded-full bg-acid-green flex items-center justify-center shadow-[0_0_10px_rgba(255,238,50,0.6)] active:scale-90 transition-transform"
                    title="Fire"
                 >
                    <Flame size={16} className="fill-black text-black" />
                 </button>
                 
                 {/* DED (Downvote) */}
                 <button 
                    onClick={(e) => { e.stopPropagation(); console.log('Voted DED on', session.id); }}
                    className="w-8 h-8 rounded-full bg-hot-pink flex items-center justify-center shadow-[0_0_10px_rgba(255,0,255,0.6)] active:scale-90 transition-transform"
                    title="DED"
                 >
                    <SkullIcon size={16} className="text-white" />
                 </button>
            </div>

            {/* Live Badge */}
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1 py-0.5 border border-black animate-pulse z-10 rounded-lg">
              LIVE
            </div>

            {/* Content */}
            <div className="absolute bottom-2 left-2 right-2 text-white z-10 pointer-events-none">
               <div className="flex items-center gap-1 mb-1">
                  <div className="w-4 h-4 rounded-full border border-white bg-gray-500 overflow-hidden">
                     <img src={session.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`} alt="avatar" />
                  </div>
                  <span className="text-xs font-bold truncate">{session.user.name}</span>
               </div>
               <p className="text-[10px] leading-tight font-mono opacity-80 truncate">{session.workoutTitle}</p>
               
               {/* Stats */}
               <div className="flex justify-between mt-2">
                 <div className="flex items-center gap-0.5 text-[10px] text-acid-green">
                    <Flame className="w-3 h-3 fill-acid-green" />
                    <span className="font-bold">{session.hypeScore}</span>
                 </div>
                 <div className="flex items-center gap-0.5 text-[10px]">
                    <Eye className="w-3 h-3" />
                    <span>{session.viewers}</span>
                 </div>
               </div>
            </div>
          </div>
        ))}
        
        {/* Add Friend Placeholder */}
        <div className="snap-center shrink-0 w-40 aspect-[9/16] bg-off-white border-4 border-black border-dashed flex flex-col items-center justify-center p-4 text-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer hover:bg-white rounded-2xl">
            <span className="text-2xl mb-2">➕</span>
            <span className="font-bold text-xs uppercase text-black">Invite Crew</span>
        </div>
      </div>
    </div>
  );
};

export default LiveCarousel;
