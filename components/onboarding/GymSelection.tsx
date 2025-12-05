
import React, { useState, useEffect } from 'react';
import BrutalistButton from '../ui/BrutalistButton';
import { Gym } from '../../types';
import { Search, Dumbbell, BadgeCheck, Home, X } from 'lucide-react';
import * as Backend from '../../services/backend';

interface Props {
  onSelect: (gym: Gym) => void;
  onClose?: () => void;
}

const GymSelection: React.FC<Props> = ({ onSelect, onClose }) => {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

  useEffect(() => {
    const loadGyms = async () => {
        const data = await Backend.getGyms();
        setGyms(data);
        setLoading(false);
    };
    loadGyms();
  }, []);

  const filteredGyms = gyms.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || (g.location && g.location.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="fixed inset-0 z-[100] bg-[#f2f2f7] flex flex-col pt-safe pb-safe animate-in slide-in-from-bottom-full duration-300">
       
       <div className="px-4 pt-6 pb-2 flex justify-between items-start">
           <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Workout Base</h2>
              <p className="text-gray-500 text-sm">Connect with your local community.</p>
           </div>
           {onClose && (
               <button onClick={onClose} className="bg-gray-200 p-2 rounded-full text-gray-600 hover:bg-gray-300 transition-colors">
                   <X size={20} />
               </button>
           )}
       </div>

       <div className="relative mb-4 mx-4 mt-4">
          <Search className="absolute top-3.5 left-4 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search gym or city..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-transparent p-3 pl-12 text-base font-medium placeholder:text-gray-400 focus:outline-none focus:bg-white focus:shadow-md rounded-2xl transition-all"
          />
       </div>

       <div className="flex-1 overflow-y-auto space-y-3 pb-28 px-4">
          {loading ? (
             <div className="text-center text-gray-400 mt-10 text-sm">Locating communities...</div>
          ) : (
             filteredGyms.map(gym => (
                 <div 
                    key={gym.id}
                    onClick={() => setSelectedGym(gym)}
                    className={`
                        p-4 flex items-center gap-4 cursor-pointer transition-all rounded-3xl
                        ${selectedGym?.id === gym.id 
                            ? 'bg-white shadow-glow ring-2 ring-acid-green transform scale-[1.02]' 
                            : 'bg-white/60 hover:bg-white shadow-soft'
                        }
                    `}
                 >
                    <div className={`
                        w-12 h-12 flex items-center justify-center rounded-2xl
                        ${gym.id === 'gym_home' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-700'}
                    `}>
                        {gym.id === 'gym_home' ? <Home size={22} /> : <Dumbbell size={22} />}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-gray-900 text-sm">{gym.name}</h4>
                            {gym.isPartner && <BadgeCheck size={16} className="text-blue-500" />}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                            {gym.location || 'Remote Base'} • {gym.memberCount} Users
                        </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedGym?.id === gym.id ? 'border-acid-green bg-acid-green' : 'border-gray-300'}`}>
                        {selectedGym?.id === gym.id && <div className="w-2 h-2 bg-black rounded-full"></div>}
                    </div>
                 </div>
             ))
          )}
       </div>

       <div className="absolute bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-200 p-4 pb-8 z-10 rounded-t-[32px]">
            <BrutalistButton 
                label={selectedGym ? "Confirm Base" : "Select a Gym"} 
                disabled={!selectedGym}
                onClick={() => selectedGym && onSelect(selectedGym)}
                className="w-full shadow-lg"
            />
            {!selectedGym && (
                <button 
                    onClick={() => onSelect(gyms.find(g => g.id === 'gym_home')!)} 
                    className="w-full text-center mt-4 text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                    Skip / I train at home
                </button>
            )}
       </div>
    </div>
  );
};

export default GymSelection;
