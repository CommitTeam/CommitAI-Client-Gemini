
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { Zap, ArrowRight, Flame, Trophy, Bot, ChevronLeft, ChevronRight, Activity, Crown } from 'lucide-react';

interface Props {
  currentUser: User | null;
  onGoLive: (config: any) => void;
  onCommit: (config: any) => void;
  onOpenMove: () => void;
  onViewProfile: (userId: string) => void;
  onVote?: (id: string, type: 'back' | 'callout') => void;
}

interface Slide {
  id: string;
  type: 'ai_greeting' | 'recommendation' | 'leaderboard';
  title: string;
  subtitle: string;
  badge: { text: string; icon: React.ReactNode; color: string };
  image: string;
  cta: string;
  action: () => void;
}

const HeroBanner: React.FC<Props> = ({ currentUser, onGoLive, onCommit, onOpenMove, onViewProfile }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const touchStartX = useRef(0);

  // Generate Intelligent Slides based on User State
  useEffect(() => {
    if (!currentUser) return;

    const generatedSlides: Slide[] = [];

    // --- SLIDE 1: PERSONALIZED AI PROMPTER ---
    let greetingTitle = "Welcome Rookie 💥";
    let greetingSubtitle = "Time to make your first move!";
    const lastActiveDiff = Date.now() - currentUser.lastActiveAt;
    const isInactive = lastActiveDiff > 3 * 24 * 60 * 60 * 1000; // 3 days

    if (currentUser.stats.totalWorkouts === 0) {
        greetingTitle = `Welcome ${currentUser.name} 💥`;
        greetingSubtitle = "Time to make your first move!";
    } else if (isInactive) {
        greetingTitle = "Hey you! 👋";
        greetingSubtitle = "We missed your sweat. Let's get back on track.";
    } else if (currentUser.stats.currentStreak > 2) {
        greetingTitle = "You're on a streak! 🔥";
        greetingSubtitle = "Keep the fire alive! Don't break the chain now.";
    } else {
        // Random fallback for regular users
        const quotes = [
            { t: "You're on 🔥", s: "Right now, you're unstoppable." },
            { t: "Every loss is a warm-up", s: "Let's go again. Prove them wrong." }
        ];
        const q = quotes[Math.floor(Math.random() * quotes.length)];
        greetingTitle = q.t;
        greetingSubtitle = q.s;
    }

    generatedSlides.push({
        id: 'ai_prompter',
        type: 'ai_greeting',
        title: greetingTitle,
        subtitle: greetingSubtitle,
        badge: { text: 'DAILY BOOST', icon: <Bot size={12} />, color: 'bg-black text-acid-green' },
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', // Gym atmosphere
        cta: 'CHECK IN',
        action: () => onOpenMove()
    });

    // --- SLIDE 2: WORKOUT RECOMMENDATION ENGINE ---
    // Progression: Jumping Jacks -> Squats -> Pushups -> Distance Walk
    const progression = ['Jumping Jacks', 'Squats', 'Pushups', 'Distance Walk'];
    let nextWorkout = 'Jumping Jacks';
    
    // Simple logic: find the last non-zero stat and pick the next one
    for (let i = 0; i < progression.length; i++) {
        const type = progression[i];
        if ((currentUser.stats.workoutBreakdown[type] || 0) > 10) {
            // If they have done this, suggest the next one, or harder version of same
            if (i < progression.length - 1) {
                nextWorkout = progression[i+1];
            } else {
                nextWorkout = 'Burpees'; // Boss level
            }
        }
    }
    
    generatedSlides.push({
        id: 'recommendation',
        type: 'recommendation',
        title: `Up Next: ${nextWorkout}`,
        subtitle: "Missed yesterday? Here's your bounce-back workout.",
        badge: { text: 'NEXT LEVEL', icon: <Activity size={12} />, color: 'bg-blue-600 text-white' },
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80', // Intense workout
        cta: 'TRY THIS NOW',
        action: () => onOpenMove()
    });

    // --- SLIDE 3: TOP PERFORMER HIGHLIGHT ---
    // Mocking "MightyMike" as requested since we don't have global leaderboard state here easily
    // We use a mock ID 'u_viper' to ensure it opens a profile if clicked
    generatedSlides.push({
        id: 'leaderboard_top',
        type: 'leaderboard',
        title: "@MightyMike is DOMINATING",
        subtitle: "9 wins in a row! Can you beat the king?",
        badge: { text: 'LEADERBOARD BEAST', icon: <Crown size={12} />, color: 'bg-yellow-500 text-black' },
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80', // Winner vibe
        cta: 'WATCH LIVE',
        action: () => onViewProfile('u_viper') 
    });

    setSlides(generatedSlides);
  }, [currentUser]);

  // Auto Scroll - 3 Seconds
  useEffect(() => {
    if (isPaused || slides.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setActiveIndex((prev) => (prev + 1) % slides.length);
      else setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
    // Resume auto-scroll after interaction
    setTimeout(() => setIsPaused(false), 5000);
  };

  const handleManualNav = (direction: 'left' | 'right') => {
      setIsPaused(true);
      if (direction === 'right') setActiveIndex((prev) => (prev + 1) % slides.length);
      else setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
      setTimeout(() => setIsPaused(false), 5000);
  };

  if (slides.length === 0) return null;

  return (
    <div className="relative w-screen -ml-4 h-[480px] mb-8 z-0 bg-[#f2f2f7]">
       <div 
         className="w-full h-full relative"
         onTouchStart={handleTouchStart}
         onTouchEnd={handleTouchEnd}
         onMouseEnter={() => setIsPaused(true)}
         onMouseLeave={() => setIsPaused(false)}
       >
          {slides.map((card, index) => (
            <div 
                key={card.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img 
                        src={card.image} 
                        alt={card.title} 
                        className="w-full h-full object-cover" 
                    />
                    
                    {/* Dark Glass Overlay for Readability */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

                    {/* Top Gradient */}
                    <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/60 to-transparent"></div>

                    {/* Bottom Gradient */}
                    <div className="absolute bottom-0 left-0 w-full h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                    
                    {/* Bottom Edge Fade */}
                    <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#f2f2f7] to-transparent"></div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 pb-12 z-20">
                     {/* Badge / Label */}
                     <div className="mb-3 animate-in slide-in-from-bottom-2 duration-500">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${card.badge.color}`}>
                            {card.badge.icon}
                            {card.badge.text}
                        </div>
                     </div>
                    
                    {/* Title */}
                    <h2 className="text-4xl font-black text-white leading-[0.95] tracking-tighter mb-3 drop-shadow-xl animate-in slide-in-from-bottom-2 duration-500 delay-100 max-w-[90%]">
                        {card.title}
                    </h2>

                    {/* Subtitle */}
                    <p className="text-sm font-medium text-gray-200 line-clamp-2 max-w-[85%] mb-8 leading-relaxed drop-shadow-md animate-in slide-in-from-bottom-2 duration-500 delay-200">
                        {card.subtitle}
                    </p>
                    
                    {/* CTA */}
                    <div className="animate-in slide-in-from-bottom-2 duration-500 delay-300">
                        <button 
                            onClick={card.action}
                            className="bg-white text-black pl-6 pr-5 py-3.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-transform active:scale-95 flex items-center gap-2 shadow-xl shadow-black/20"
                        >
                            {card.cta} <ArrowRight size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
          ))}
       </div>

       {/* Swipe Intuition Indicators (Chevrons) */}
       <button 
         onClick={() => handleManualNav('left')}
         className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 text-white/50 hover:text-white transition-colors animate-pulse"
       >
          <ChevronLeft size={32} />
       </button>
       <button 
         onClick={() => handleManualNav('right')}
         className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 text-white/50 hover:text-white transition-colors animate-pulse"
       >
          <ChevronRight size={32} />
       </button>

       {/* Pagination Dots */}
       <div className="absolute bottom-24 right-6 z-30 flex flex-col gap-1.5 pointer-events-none">
          {slides.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 rounded-full transition-all duration-500 backdrop-blur-sm shadow-sm ${i === activeIndex ? 'h-5 bg-acid-green' : 'h-1.5 bg-white/30'}`}
              ></div>
          ))}
       </div>
    </div>
  );
};

export default HeroBanner;
