
import React from 'react';
import { Home, User, Flame } from 'lucide-react';

interface Props {
  currentView: 'home' | 'move' | 'profile' | 'live-session';
  onNavigate: (view: 'home' | 'move' | 'profile') => void;
}

const BottomNav: React.FC<Props> = ({ currentView, onNavigate }) => {
  return (
    <nav className="fixed bottom-6 left-0 w-full px-4 z-50 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="glass-panel bg-white/80 backdrop-blur-xl border border-white/40 h-16 rounded-[32px] shadow-glass flex items-center justify-between px-8 relative">
            
            <button 
                onClick={() => onNavigate('home')}
                className={`transition-colors ${currentView === 'home' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <Home size={24} strokeWidth={currentView === 'home' ? 3 : 2} />
            </button>

            <button 
                onClick={() => onNavigate('move')}
                className="absolute left-1/2 -top-6 -translate-x-1/2 bg-black text-acid-green w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-black/30 hover:scale-105 active:scale-95 transition-all"
            >
                <Flame size={28} className="fill-acid-green" />
            </button>

            <button 
                onClick={() => onNavigate('profile')}
                className={`transition-colors ${currentView === 'profile' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <User size={24} strokeWidth={currentView === 'profile' ? 3 : 2} />
            </button>

        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
