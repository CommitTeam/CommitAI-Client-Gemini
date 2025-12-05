
import React, { useState, useEffect } from 'react';
import { UserStats } from '../../types';
import { STORE_CATALOG } from '../../services/backend';

interface Props {
  userStats?: UserStats;
  equipped?: { skin: string; accessory?: string; effect?: string };
  variant?: 'fixed' | 'inline'; // fixed = floating bottom right, inline = standing still (e.g. profile)
  className?: string;
}

type Mood = 'idle' | 'excited' | 'cool' | 'sad';

const Mascot: React.FC<Props> = ({ userStats, equipped, variant = 'fixed', className = '' }) => {
  const [mood, setMood] = useState<Mood>('idle');
  const [speech, setSpeech] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  // Determine Visual Assets based on equipped items
  const skinItem = STORE_CATALOG.find(i => i.id === equipped?.skin);
  const skinGradient = skinItem?.visualAsset || 'from-acid-green to-yellow-400';
  
  const accItem = STORE_CATALOG.find(i => i.id === equipped?.accessory);
  const effectItem = STORE_CATALOG.find(i => i.id === equipped?.effect);

  // Determine Accessory Position
  const accPosition = accItem ? (
      accItem.id.includes('shoe') ? 'feet' :
      accItem.id.includes('hand') || accItem.id.includes('watch') || accItem.id.includes('glove') || accItem.id.includes('belt') ? 'hands' :
      'head'
  ) : null;

  // Listen for custom trigger events (Only for fixed variant usually)
  useEffect(() => {
    if (variant !== 'fixed') return;

    const handleTrigger = (e: CustomEvent) => {
      if (isDismissed) return;
      const { mood: newMood, message } = e.detail;
      setMood(newMood);
      setSpeech(message);
      setIsBouncing(true);

      // Reset bounce
      setTimeout(() => setIsBouncing(false), 500);

      // Reset to idle after delay
      setTimeout(() => {
        setMood('idle');
        setSpeech(null);
      }, 4000);
    };

    window.addEventListener('mascot-trigger' as any, handleTrigger as any);
    return () => window.removeEventListener('mascot-trigger' as any, handleTrigger as any);
  }, [isDismissed, variant]);

  const handleClick = () => {
      if(isDismissed && variant === 'fixed') return;
      setIsBouncing(true);
      setMood('excited');
      if (variant === 'fixed') setSpeech(getRandomMessage());
      setTimeout(() => setIsBouncing(false), 500);
      setTimeout(() => { setMood('idle'); setSpeech(null); }, 3000);
  };

  const getRandomMessage = () => {
      const msgs = ["Let's go!", "You got this!", "Beast mode!", "Don't stop!", "Looking swole!", "Hydrate!"];
      return msgs[Math.floor(Math.random() * msgs.length)];
  };

  if (isDismissed && variant === 'fixed') return null;

  // Base classes based on variant
  const containerClasses = variant === 'fixed' 
    ? `fixed bottom-28 right-6 z-[60] animate-float-slow`
    : `relative z-10`;

  return (
    <div 
      className={`${containerClasses} pointer-events-auto transition-transform duration-300 ${isBouncing ? '-translate-y-6 scale-110' : ''} ${className}`}
      onClick={handleClick}
    >
      {/* Speech Bubble */}
      {speech && variant === 'fixed' && (
        <div className="absolute bottom-full right-0 mb-4 whitespace-nowrap bg-white px-4 py-2 rounded-2xl rounded-tr-none shadow-xl text-xs font-black animate-in zoom-in slide-in-from-bottom-2 z-20 border-2 border-black">
          {speech}
        </div>
      )}

      {/* Effect Layer (Behind) */}
      {effectItem && (
          <div className="absolute inset-0 pointer-events-none z-[-1]">
              {effectItem.id === 'fx_fire' && <div className="absolute inset-0 bg-orange-500 blur-xl opacity-60 animate-pulse"></div>}
              {effectItem.id === 'fx_sparkle' && <div className="absolute -top-10 -right-10 text-4xl animate-bounce">✨</div>}
              {effectItem.id === 'fx_lightning' && <div className="absolute -top-10 left-1/2 text-4xl animate-pulse delay-75">⚡</div>}
          </div>
      )}

      {/* CHARACTER CONTAINER */}
      <div className={`relative w-24 h-32 flex flex-col items-center ${variant === 'inline' ? 'scale-90' : ''}`}>
         
         {/* LEFT HAND */}
         <div className={`absolute top-12 -left-4 w-7 h-7 rounded-full bg-gradient-to-br ${skinGradient} shadow-sm border border-black/10 animate-pulse z-20 flex items-center justify-center`}>
            {/* Hand Gear */}
            {accPosition === 'hands' && accItem && (
                <span className="text-xl transform scale-150">{accItem.icon}</span>
            )}
         </div>

         {/* RIGHT HAND */}
         <div className={`absolute top-12 -right-4 w-7 h-7 rounded-full bg-gradient-to-br ${skinGradient} shadow-sm border border-black/10 animate-pulse delay-100 z-20 flex items-center justify-center`}>
             {/* Hand Gear (Mirrored concept or just same icon) */}
             {accPosition === 'hands' && accItem && (
                <span className="text-xl transform scale-150">{accItem.icon}</span>
            )}
         </div>

         {/* BODY */}
         <div className={`
            w-20 h-20 rounded-[26px] bg-gradient-to-br ${skinGradient} shadow-[0_8px_32px_rgba(0,0,0,0.2)] 
            flex items-center justify-center relative overflow-hidden transition-all border-2 border-white/40 z-10
            ${mood === 'cool' ? 'skew-x-2' : ''}
         `}>
            
            {/* Shine */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

            {/* Face Container */}
            <div className="relative z-10 flex flex-col items-center gap-1 transition-all duration-300 mt-2">
                
                {/* Eyebrows */}
                <div className="flex gap-4 w-full justify-center mb-0.5">
                    <div className={`h-1 w-3 bg-black rounded-full transition-all ${mood === 'idle' || mood === 'cool' ? '-rotate-12 -translate-y-1' : ''}`}></div>
                    <div className={`h-1 w-3 bg-black rounded-full`}></div>
                </div>

                {/* Eyes */}
                <div className="flex gap-2">
                    <div className={`bg-black rounded-full transition-all duration-300 relative ${mood === 'excited' ? 'w-5 h-6' : 'w-4 h-5'} ${mood === 'cool' ? 'h-2 w-5 mt-1' : ''}`}>
                        {mood !== 'cool' && <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 right-1"></div>}
                    </div>
                    <div className={`bg-black rounded-full transition-all duration-300 relative ${mood === 'excited' ? 'w-5 h-6' : 'w-4 h-5'} ${mood === 'cool' ? 'h-2 w-5 mt-1' : ''}`}>
                         {mood !== 'cool' && <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 right-1"></div>}
                    </div>
                </div>

                {/* Mouth */}
                <div className={`
                    border-b-2 border-black/80 transition-all duration-300 rounded-full
                    ${mood === 'excited' ? 'w-4 h-3 rounded-b-xl bg-black/80 border-0' : 'w-4 h-2'}
                    ${mood === 'idle' || mood === 'cool' ? 'rotate-[-5deg] translate-x-1' : ''}
                `}></div>
            
                {/* HEAD GEAR (Default) */}
                {accPosition === 'head' && accItem && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
                        <span className="text-4xl filter drop-shadow-md transform -translate-y-1">{accItem.icon}</span>
                    </div>
                )}
            </div>
         </div>

         {/* LEGS & SHOES CONTAINER */}
         <div className="absolute top-[72px] flex gap-3 w-full justify-center z-0">
             
             {/* Left Leg + Shoe */}
             <div className={`flex flex-col items-center -rotate-6 transition-all ${isBouncing ? '-translate-y-2' : ''}`}>
                 <div className="w-1.5 h-4 bg-gray-900 rounded-full mb-[-4px]"></div>
                 {/* High Top Sneaker or Custom Shoe */}
                 <div className="w-8 h-6 bg-white rounded-lg border-2 border-gray-200 relative shadow-sm overflow-hidden flex items-center justify-center">
                    {accPosition === 'feet' && accItem ? (
                        <span className="text-lg z-10 relative bottom-1">{accItem.icon}</span>
                    ) : (
                        <>
                            <div className="absolute bottom-0 w-full h-2 bg-acid-green/80 border-t border-gray-100"></div>
                            <div className="absolute top-1.5 left-1 w-4 h-3 border-t-2 border-r-2 border-gray-300 rounded-tr-md opacity-50"></div>
                        </>
                    )}
                 </div>
             </div>

             {/* Right Leg + Shoe */}
             <div className={`flex flex-col items-center rotate-6 transition-all ${isBouncing ? '-translate-y-2' : ''}`}>
                 <div className="w-1.5 h-4 bg-gray-900 rounded-full mb-[-4px]"></div>
                 {/* High Top Sneaker or Custom Shoe */}
                 <div className="w-8 h-6 bg-white rounded-lg border-2 border-gray-200 relative shadow-sm overflow-hidden flex items-center justify-center">
                    {accPosition === 'feet' && accItem ? (
                        <span className="text-lg z-10 relative bottom-1">{accItem.icon}</span>
                    ) : (
                        <>
                            <div className="absolute bottom-0 w-full h-2 bg-punch-blue/80 border-t border-gray-100"></div>
                            <div className="absolute top-1.5 left-1 w-4 h-3 border-t-2 border-r-2 border-gray-300 rounded-tr-md opacity-50"></div>
                        </>
                    )}
                 </div>
             </div>

         </div>

         {/* Shadow Pulse on Ground */}
         <div className="absolute -bottom-2 w-16 h-3 bg-black/10 blur-md rounded-full animate-pulse"></div>

      </div>
    </div>
  );
};

export default Mascot;
