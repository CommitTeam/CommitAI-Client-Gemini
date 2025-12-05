
import React, { useEffect, useState } from 'react';
import { AppNotification } from '../../types';
import { subscribeToNotifications } from '../../services/notificationService';
import { Bell, Flame, Zap, Trophy, X } from 'lucide-react';

const NotificationToast: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      
      // Auto dismiss
      // Votes are quicker to dismiss (3s) to not block view too long
      const timeout = newNotification.type === 'vote' ? 3000 : 5000;
      setTimeout(() => {
        setNotifications((prev) => prev.filter(n => n.id !== newNotification.id));
      }, timeout);
    });

    return unsubscribe;
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  const voteNotifications = notifications.filter(n => n.type === 'vote');
  const topNotifications = notifications.filter(n => n.type !== 'vote');

  if (notifications.length === 0) return null;

  return (
    <>
      {/* STANDARD TOASTS (TOP) - Social, Streak, etc. */}
      <div className="fixed top-safe left-0 w-full z-[150] pointer-events-none flex flex-col items-center gap-2 pt-2 px-4">
        {topNotifications.map((notification) => (
          <div 
            key={notification.id}
            className="pointer-events-auto w-full max-w-sm glass-panel bg-white/90 p-4 rounded-3xl shadow-glass flex items-start gap-3 animate-in slide-in-from-top-2 fade-in duration-300 relative overflow-hidden"
          >
            {/* Liquid Glare */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent opacity-50 pointer-events-none"></div>

            {/* Icon based on type */}
            <div className={`
              p-2 rounded-full border border-white/20 shadow-sm shrink-0 relative z-10
              ${notification.type === 'streak' ? 'bg-acid-green text-black' : ''}
              ${notification.type === 'social' ? 'bg-punch-blue text-white' : ''}
              ${!['streak', 'social'].includes(notification.type) ? 'bg-gray-100 text-gray-600' : ''}
            `}>
              {notification.type === 'streak' && <Trophy size={18} />}
              {notification.type === 'social' && <Zap size={18} />}
              {!['streak', 'social'].includes(notification.type) && <Bell size={18} />}
            </div>

            <div className="flex-1 min-w-0 relative z-10">
              <h4 className="font-bold text-sm text-black leading-tight">{notification.title}</h4>
              <p className="text-xs font-mono text-gray-600 mt-1 leading-snug">{notification.message}</p>
            </div>

            <button 
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-black transition-colors relative z-10 p-1"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* VOTE/BET POPUPS (CENTER SCREEN) */}
      {voteNotifications.length > 0 && (
        <div className="fixed inset-0 z-[160] pointer-events-none flex items-center justify-center p-6">
            <div className="w-full max-w-xs flex flex-col gap-4">
                {voteNotifications.map((notification) => (
                    <div 
                        key={notification.id}
                        className="pointer-events-auto bg-black/95 backdrop-blur-2xl border border-white/10 p-8 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col items-center text-center gap-4 animate-in zoom-in-50 fade-in slide-in-from-bottom-8 duration-300 relative overflow-hidden"
                    >
                         {/* Dynamic Background */}
                         <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
                         <div className="absolute -top-10 -right-10 w-32 h-32 bg-acid-green/20 blur-[50px] rounded-full animate-pulse"></div>
                         
                         {/* Icon */}
                         <div className="bg-gradient-to-br from-vote-orange to-red-600 p-5 rounded-full shadow-[0_0_30px_rgba(255,107,0,0.5)] animate-bounce relative z-10 ring-4 ring-black">
                            <Flame size={32} className="fill-white text-white" />
                         </div>

                         {/* Text */}
                         <div className="relative z-10">
                            <h4 className="font-black text-2xl text-white uppercase italic tracking-tighter leading-none mb-2">{notification.title}</h4>
                            <p className="text-sm font-bold text-gray-400 leading-snug px-2">{notification.message}</p>
                         </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </>
  );
};

export default NotificationToast;
