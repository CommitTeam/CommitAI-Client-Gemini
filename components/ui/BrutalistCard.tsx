
import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  color?: 'white' | 'yellow' | 'blue' | 'black';
  title?: string;
}

const BrutalistCard: React.FC<Props> = ({ children, className = '', color = 'white', title }) => {
  // Mapping 'colors' to background tints compatible with glassmorphism
  const colors = {
    white: 'bg-white/70',
    yellow: 'bg-acid-green/80',
    blue: 'bg-punch-blue/80 text-white',
    black: 'bg-black/80 text-white'
  };

  return (
    <div className={`glass-panel p-6 rounded-[32px] relative overflow-hidden ${colors[color]} ${className}`}>
      
      {/* Subtle Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
      
      {title && (
        <div className="border-b border-black/5 pb-3 mb-4 relative z-10">
          <h3 className="text-lg font-bold tracking-tight opacity-90">{title}</h3>
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BrutalistCard;
