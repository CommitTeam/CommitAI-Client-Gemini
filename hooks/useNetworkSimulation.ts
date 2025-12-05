
import { useEffect } from 'react';
import { sendNotification } from '../services/notificationService';
import { User } from '../types';

const NAMES = ['Rex', 'Viper', 'Luna', 'Ghost', 'Blaze', 'Pixel', 'Jazz', 'Kilo'];
const WORKOUTS = ['5k Run', '100 Pushups', '300 Squats', 'Murph Challenge', '50 Pullups'];

export const useNetworkSimulation = (currentUser: User | null) => {
  useEffect(() => {
    if (!currentUser) return;

    // Simulation 1: Friend Commits (Social) - Random interval 20-60s
    const commitInterval = setInterval(() => {
        if (Math.random() > 0.7) {
            const friend = NAMES[Math.floor(Math.random() * NAMES.length)];
            const workout = WORKOUTS[Math.floor(Math.random() * WORKOUTS.length)];
            
            sendNotification(
                "New Commitment Detected",
                `${friend} just committed to ${workout}. Vote now!`,
                "social"
            );
        }
    }, 45000);

    // Simulation 2: Vote on User (Vote) - Random interval 30-90s
    const voteInterval = setInterval(() => {
        if (Math.random() > 0.6) {
            const friend = NAMES[Math.floor(Math.random() * NAMES.length)];
            const type = Math.random() > 0.3 ? "Vote Up" : "Vote Down";
            
            sendNotification(
                "Incoming Vote",
                `${friend} placed a ${type} on your active challenge.`,
                "vote"
            );
        }
    }, 60000);

    return () => {
        clearInterval(commitInterval);
        clearInterval(voteInterval);
    };
  }, [currentUser]);
};
