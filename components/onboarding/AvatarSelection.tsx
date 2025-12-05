import React, { useState } from 'react';
import BrutalistButton from '../ui/BrutalistButton';

interface Props {
  username: string;
  onSelect: (avatarUrl: string) => void;
}

const AVATAR_SEEDS = ['Bubbles', 'Cookie', 'Sunny', 'Sparkle', 'Jelly', 'Noodle', 'Giggles', 'Waffles', 'Peanut', 'Bean', 'Pops', 'Doodle'];

const AvatarSelection: React.FC<Props> = ({ username, onSelect }) => {
  const [selectedSeed, setSelectedSeed] = useState<string>(AVATAR_SEEDS[0]);
  const getUrl = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc&mouth=smile,twinkle,tongue&eyes=happy,hearts,wink,surprised&eyebrows=default,raisedExcited,upDown&accessoriesProbability=0`;

  return (
    <div className="min-h-screen bg-[#f2f2f7] flex flex-col items-center py-12 px-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Pick an Avatar</h2>
        <p className="text-gray-500 text-sm">How the world (and AI) sees you.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-sm w-full mb-10">
        {AVATAR_SEEDS.map((seed) => (
          <button
            key={seed}
            onClick={() => setSelectedSeed(seed)}
            className={`
              aspect-square rounded-full relative overflow-hidden transition-all duration-300
              ${selectedSeed === seed 
                ? 'scale-110 shadow-glow ring-4 ring-acid-green z-10' 
                : 'bg-white opacity-70 hover:opacity-100 hover:scale-105 shadow-sm'
              }
            `}
          >
            <img src={getUrl(seed)} alt={seed} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div className="glass-panel w-full max-w-sm p-5 rounded-[32px] flex items-center gap-4 bg-white/70">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 shadow-inner">
            <img src={getUrl(selectedSeed)} alt="Selected" className="w-full h-full object-cover" />
        </div>
        <div className="text-left flex-1">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ready to go</div>
            <div className="text-xl font-bold text-gray-900">{username}</div>
        </div>
        <BrutalistButton 
            label="LET'S GO" 
            className="px-6"
            onClick={() => onSelect(getUrl(selectedSeed))}
        />
      </div>
    </div>
  );
};

export default AvatarSelection;