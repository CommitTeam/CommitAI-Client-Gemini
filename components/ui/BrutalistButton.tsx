
import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  label?: string;
  children?: React.ReactNode;
}

const BrutalistButton: React.FC<Props> = ({ variant = 'primary', label, children, className = '', ...props }) => {
  // Base styles: Rounded full, soft glass effect, no borders
  const baseStyles = "relative overflow-hidden px-6 py-3 min-h-[48px] font-semibold text-sm uppercase tracking-wide touch-manipulation rounded-full jelly-button group transition-all";
  
  // Variants
  const variants = {
    primary: "bg-acid-green text-black shadow-[0_4px_12px_rgba(255,238,50,0.4)]",
    secondary: "bg-white text-black shadow-soft border border-white/50",
    danger: "bg-vote-red text-white shadow-[0_4px_12px_rgba(185,28,28,0.3)]",
    ghost: "bg-transparent text-gray-600 hover:bg-black/5"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {/* Liquid Fluid Layer */}
      {variant !== 'ghost' && (
        <div className="liquid-fluid absolute inset-0 w-full h-full bg-inherit opacity-30 pointer-events-none mix-blend-overlay"></div>
      )}
      
      {/* Glass Glare */}
      {variant !== 'ghost' && <div className="liquid-glare"></div>}
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {label || children}
      </span>
    </button>
  );
};

export default BrutalistButton;
