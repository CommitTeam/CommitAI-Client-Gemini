
import React, { useState, useEffect } from 'react';
import WorkoutChallenge from './components/WorkoutChallenge';
import BottomNav from './components/BottomNav';
import TrendingSection from './components/feed/TrendingSection';
import HeroBanner from './components/feed/HeroBanner';
import LiveMasonryFeed from './components/feed/LiveMasonryFeed';
import LiveFeedView from './components/feed/LiveFeedView';
import MoveMenu from './components/MoveMenu';
import ProfileView from './components/ProfileView';
import PublicProfileView from './components/PublicProfileView';
import CoinMenu from './components/CoinMenu';
import LeaderboardModal from './components/LeaderboardModal';
import LoginScreen from './components/onboarding/LoginScreen';
import AvatarSelection from './components/onboarding/AvatarSelection';
import OnboardingOverlay from './components/onboarding/OnboardingOverlay';
import NotificationToast from './components/ui/NotificationToast';
import Mascot from './components/ui/Mascot';
import WorkoutSummary from './components/WorkoutSummary';
import { User, LiveSession, Commitment, Gym, LeaderboardEntry } from './types';
import { Flame, Trophy, Zap } from 'lucide-react';
import { generateDailyTagline } from './services/geminiService';
import * as Backend from './services/backend';
import { requestNotificationPermission, sendNotification } from './services/notificationService';
import { useNetworkSimulation } from './hooks/useNetworkSimulation';

// ... (Constants kept same)
const LEVEL_MILESTONES = [{ level: 1, requirements: { 'Pushups': 0, 'Squats': 0, 'Jumping Jacks': 0, 'Steps': 0, 'Distance Walk': 0, 'Calories': 0 } }, { level: 2, requirements: { 'Pushups': 100, 'Squats': 100, 'Jumping Jacks': 200, 'Steps': 5000, 'Distance Walk': 5, 'Calories': 500 } }];
const NAMES = ['Mike', 'Viper', 'Nova', 'Titan', 'Jinx', 'Rogue', 'Axel', 'Echo', 'Blaze', 'Fury', 'Zen', 'Kilo', 'Jazz', 'Pixel', 'Ghost', 'Luna'];
const WORKOUT_TYPES = ['Pushups', 'Squats', 'Jumping Jacks', 'Steps', 'Distance Walk', 'Calories'];
const WORKOUT_TARGETS: any = { 'Pushups': ['50', '100'], 'Squats': ['50', '100'], 'Jumping Jacks': ['200'], 'Steps': ['5000'], 'Distance Walk': ['3km'], 'Calories': ['300'] };
const WORKOUT_TIMES = ['20 mins', '30 mins', '1 hour'];
const SCENIC_IMAGES = [
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', // Gym Crossfit
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', // Gym Lunge
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80', // Lifting
  'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80', // Home Pushups
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80', // Fitness
  'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&q=80', // Runner
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', // Trainer
  'https://images.unsplash.com/photo-1599552683573-9dc48255b7ef?w=800&q=80', // Man running
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80'  // Dumbbells
];

const generateMockSessions = (): LiveSession[] => {
    return NAMES.map((name, i) => {
        const exercises = ['Pushups', 'Squats', 'Burpees', 'Pullups', 'Lunges'];
        const exercise = exercises[i % exercises.length];
        const target = (Math.floor(Math.random() * 5) + 2) * 10; // 20, 30, 40, 50, 60
        
        return {
            id: `l_${i}`,
            user: { id: `u_mock_${i}`, name: name, gym: { id: 'g1', name: "Gold's Gym", isPartner: true, memberCount: 100 }, level: Math.floor(Math.random() * 10) + 1, avatar: '', coins: 500, coinHistory: [], stats: {} as any, lastActiveAt: Date.now(), inventory: [], equipped: { skin: 'skin_default' } },
            workoutTitle: `${target} ${exercise}`,
            viewers: Math.floor(Math.random() * 2000),
            hypeScore: 500,
            thumbnail: SCENIC_IMAGES[i % SCENIC_IMAGES.length],
            currentReps: Math.floor(Math.random() * (target * 0.8)),
            totalReps: target
        };
    });
};
const MOCK_LIVE_SESSIONS = generateMockSessions();

const App: React.FC = () => {
  const [appState, setAppState] = useState<'login' | 'avatar' | 'app'>('login');
  const [showTour, setShowTour] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'move' | 'profile' | 'live-session'>('home');
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [activeWorkoutConfig, setActiveWorkoutConfig] = useState<{title: string, description: string} | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number>(0);
  const [viewingLiveFeedId, setViewingLiveFeedId] = useState<string | null>(null);
  const [showCoinMenu, setShowCoinMenu] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAllBets, setShowAllBets] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [workoutSummary, setWorkoutSummary] = useState<{success: boolean, reps: number, pointsEarned: number, workoutTitle: string} | null>(null);

  useNetworkSimulation(currentUser);

  // SCROLL TO TOP ON VIEW CHANGE
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  useEffect(() => {
      const loadData = async () => {
          if (currentUser) {
              const feed = await Backend.getFeed(currentUser.id);
              setCommitments(feed);
              const leaderboard = await Backend.getLeaderboard('top_humans', currentUser.id) as LeaderboardEntry[];
              setCurrentUserRank(leaderboard.find(e => e.user.id === currentUser.id)?.rank || 0);
          }
      };
      loadData();
      const interval = setInterval(loadData, 5000); 
      return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => { if (currentUser) requestNotificationPermission(); }, [currentUser]);

  const handleLogin = async (username: string) => {
    const user = await Backend.loginUser(username);
    setCurrentUser(user);
    // Directly go to app if avatar exists, else go to avatar selection
    if (user.avatar) { 
        setAppState('app'); 
    } else { 
        setAppState('avatar'); 
    }
  };

  const handleAvatarSelect = async (avatarUrl: string) => { 
      if (currentUser) { 
          const u = await Backend.updateUserAvatar(currentUser.id, avatarUrl); 
          if (u) { 
              setCurrentUser(u); 
              setAppState('app'); 
              setShowTour(true); 
          } 
      } 
  };
  
  const handleUserUpdate = (updatedUser: User) => {
      setCurrentUser(updatedUser);
  };

  const handleLogout = () => { setCurrentUser(null); setAppState('login'); setCurrentView('home'); };
  const handleDeleteAccount = async () => { if (currentUser) { await Backend.deleteUser(currentUser.id); handleLogout(); } };
  
  const handleVote = async (id: string, type: 'back' | 'callout') => { 
      if (currentUser) { 
          const r = await Backend.placeVote(currentUser.id, id, type); 
          
          if (r.success) {
            // Success Notification
            if (type === 'callout') {
                 // Voted NO
                 sendNotification("Vote Placed", "50 COINS IN. You think they've cooled off! Let's see!", 'vote');
            } else {
                 // Voted YO
                 sendNotification("Vote Placed", "50 COINS IN. You think they are on Fire! Let’s see!", 'vote');
            }

            if (r.updatedUser) { 
                setCurrentUser(r.updatedUser); 
                // Only refresh commitments if this was a commitment vote (not simulated live vote)
                if (!id.startsWith('l_')) {
                    setCommitments(await Backend.getFeed(currentUser.id)); 
                }
            } 
          } else {
            // Failure Notification (e.g. Duplicate)
            sendNotification("Vote Status", r.message, 'vote');
          }
      } 
  };
  
  const handleGoLive = async (config: { type: string; target: string; duration: string }) => {
      if (!currentUser) return;
      setShowMoveModal(false);
      if (['Steps', 'Distance Walk', 'Calories'].includes(config.type)) {
          await Backend.createCommitment(currentUser, `${config.target} ${config.type}`, Date.now());
          setCommitments(await Backend.getFeed(currentUser.id));
          setCurrentView('home');
      } else {
          setActiveWorkoutConfig({ title: `${config.target} ${config.type}`, description: '' });
          setCurrentView('live-session');
      }
  };

  const handleCommit = async (config: { type: string; target: string; duration: string }) => {
      if (!currentUser) return;
      await Backend.createCommitment(currentUser, `${config.target} ${config.type}`, Date.now());
      setCommitments(await Backend.getFeed(currentUser.id));
      setShowMoveModal(false);
  };

  const handleStartCommitment = (c: Commitment) => {
      setActiveWorkoutConfig({ title: c.workoutTitle, description: '' });
      setCurrentView('live-session');
  };

  const handleWorkoutComplete = (result?: { success: boolean; reps: number }) => {
      setCurrentView('home');
      if (result && currentUser) {
          const points = result.success ? 200 : 0;
          setWorkoutSummary({
              success: result.success,
              reps: result.reps,
              pointsEarned: points,
              workoutTitle: activeWorkoutConfig?.title || 'Workout'
          });

          if (result.success) {
              const updatedUser = { ...currentUser, coins: currentUser.coins + points };
              // Simple update locally, ideally call backend
              setCurrentUser(updatedUser);
          }
      }
  };

  const nextLevelConfig = currentUser ? LEVEL_MILESTONES[0] : null;

  if (appState === 'login') return <LoginScreen onLogin={handleLogin} />;
  if (appState === 'avatar' && currentUser) return <AvatarSelection username={currentUser.name} onSelect={handleAvatarSelect} />;
  if (!currentUser) return null;

  return (
    <div className="min-h-screen pb-24 bg-[#f2f2f7] relative flex flex-col font-sans">
      <NotificationToast />
      {showTour && <OnboardingOverlay onComplete={() => setShowTour(false)} />}
      
      {/* MASCOT OVERLAY - PERSISTENT (Hidden in Profile View because it's inline there) */}
      {currentView !== 'profile' && (
        <Mascot userStats={currentUser.stats} equipped={currentUser.equipped} />
      )}

      {/* Floating Header Pills - Replaces duplicate logic */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-2 bg-transparent pointer-events-none flex justify-between items-start">
          {/* Rank Pill - Dark/Glass Style */}
          <button 
            onClick={() => setShowLeaderboard(true)} 
            className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white shadow-lg hover:bg-black/80 transition-transform active:scale-95"
          >
              <span className="text-xl font-bold italic">#{currentUserRank || '-'}</span>
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">RANK</span>
          </button>
          
          {/* Points Pill - Light/Glass Style */}
          <button 
            onClick={() => setShowCoinMenu(true)} 
            className="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-white/50 text-black px-3 py-1.5 rounded-full shadow-lg hover:scale-105 transition-transform active:scale-95"
          >
              <span className="font-bold text-sm">{currentUser.coins}</span>
              <Zap size={14} className="fill-black text-black" />
          </button>
      </div>

      <main className="w-full max-w-md mx-auto px-4 flex-1">
        {currentView === 'home' && (
            <>
                <HeroBanner 
                    currentUser={currentUser} 
                    onGoLive={handleGoLive} 
                    onCommit={handleCommit} 
                    onOpenMove={() => setShowMoveModal(true)}
                    onViewProfile={(id) => setViewingProfileId(id)}
                    onVote={handleVote} 
                />
                <TrendingSection 
                    commitments={commitments} 
                    currentUser={currentUser}
                    onVote={handleVote} 
                    onViewMore={() => setShowAllBets(!showAllBets)} 
                    isExpanded={showAllBets} 
                    onProfileClick={(id) => setViewingProfileId(id)}
                    onGoLive={handleStartCommitment}
                />
                {!showAllBets && (
                  <LiveMasonryFeed 
                    sessions={MOCK_LIVE_SESSIONS} 
                    onSessionClick={(id) => setViewingLiveFeedId(id)} 
                    onGoMove={() => setShowMoveModal(true)} 
                    onProfileClick={(id) => setViewingProfileId(id)} 
                    currentUser={currentUser}
                    onVote={handleVote}
                  />
                )}
            </>
        )}
        {currentView === 'profile' && (
            <ProfileView 
                user={currentUser} 
                onGenerateTagline={() => {}} 
                nextLevelRequirements={nextLevelConfig?.requirements} 
                onLogout={handleLogout} 
                onDeleteAccount={handleDeleteAccount}
                onUpdateUser={handleUserUpdate}
            />
        )}
        {currentView === 'live-session' && <WorkoutChallenge challenge={{ id: 'temp', user: currentUser, workout: { id: 'w1', title: activeWorkoutConfig?.title || 'Workout', description: '', duration: '', intensity: 'High' }, status: 'pending', bets: [], timestamp: Date.now() }} initialMode="live" onComplete={handleWorkoutComplete} />}
      </main>

      {showMoveModal && <MoveMenu userLevel={currentUser.level} userName={currentUser.name} onClose={() => setShowMoveModal(false)} onGoLive={handleGoLive} onCommit={handleCommit} />}
      
      {workoutSummary && (
          <WorkoutSummary 
            results={workoutSummary} 
            user={currentUser} 
            onClose={() => setWorkoutSummary(null)} 
          />
      )}

      {viewingLiveFeedId && <LiveFeedView sessions={MOCK_LIVE_SESSIONS} initialSessionId={viewingLiveFeedId} onClose={() => setViewingLiveFeedId(null)} onProfileClick={(id) => setViewingProfileId(id)} currentUser={currentUser} />}
      {viewingProfileId && <PublicProfileView userId={viewingProfileId} onClose={() => setViewingProfileId(null)} />}
      {showCoinMenu && <CoinMenu user={currentUser} onClose={() => setShowCoinMenu(false)} />}
      {showLeaderboard && <LeaderboardModal currentUser={currentUser} onClose={() => setShowLeaderboard(false)} onProfileClick={(id) => setViewingProfileId(id)} />}

      <BottomNav currentView={currentView === 'live-session' ? 'move' : currentView} onNavigate={(v) => { if(v === 'move') setShowMoveModal(true); else { setCurrentView(v); setShowAllBets(false); } }} />
    </div>
  );
};

export default App;
