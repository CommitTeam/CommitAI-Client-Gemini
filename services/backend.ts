
// ... (imports remain)
import { User, Commitment, CoinTransaction, ActivityLog, Vote, LeaderboardEntry, Gym, StoreItem, GymLeaderboardEntry } from '../types';
import { sendNotification } from './notificationService';

const DB_KEYS = {
    USERS: 'db_users',
    COMMITMENTS: 'db_commitments',
    VOTES: 'db_votes', // Used for global vote tracking (including live)
    TRANSACTIONS: 'db_transactions',
    LOGS: 'db_activity_logs'
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_GYMS: Gym[] = [
    { id: 'gym_home', name: 'Home Gym / Garage', isPartner: false, memberCount: 1205 },
    { id: 'gym_golds', name: 'Gold\'s Gym', location: 'Venice Beach, CA', isPartner: true, memberCount: 842 },
    { id: 'gym_pf', name: 'Planet Fitness', location: 'Global', isPartner: false, memberCount: 3200 },
    { id: 'gym_crossfit', name: 'CrossFit Central', location: 'Austin, TX', isPartner: true, memberCount: 156 },
    { id: 'gym_equinox', name: 'Equinox', location: 'New York, NY', isPartner: false, memberCount: 430 },
    { id: 'gym_la', name: 'LA Fitness', location: 'Los Angeles, CA', isPartner: false, memberCount: 950 },
    { id: 'gym_anytime', name: 'Anytime Fitness', location: 'Chicago, IL', isPartner: false, memberCount: 620 },
    { id: 'gym_metro', name: 'Metroflex', location: 'Arlington, TX', isPartner: true, memberCount: 210 },
];

// --- MARKETPLACE CATALOG ---
export const STORE_CATALOG: StoreItem[] = [
    // SKINS
    { id: 'skin_default', type: 'skin', name: 'Original Blob', description: 'The classic look.', price: 0, rarity: 'common', icon: '🟡', visualAsset: 'from-acid-green to-yellow-400' },
    { id: 'skin_fire', type: 'skin', name: 'Inferno', description: 'Hot to the touch.', price: 500, rarity: 'rare', icon: '🔥', visualAsset: 'from-orange-500 to-red-600' },
    { id: 'skin_ice', type: 'skin', name: 'Zero Kelvin', description: 'Stay frosty.', price: 500, rarity: 'rare', icon: '❄️', visualAsset: 'from-cyan-300 to-blue-500' },
    { id: 'skin_cyber', type: 'skin', name: 'Cyberpunk', description: 'Neon lights included.', price: 1200, rarity: 'epic', icon: '🤖', visualAsset: 'from-purple-500 to-pink-500' },
    { id: 'skin_shadow', type: 'skin', name: 'Shadow Ops', description: 'Stealth mode.', price: 2000, rarity: 'legendary', icon: '🥷', visualAsset: 'from-gray-800 to-black' },
    { id: 'skin_gold', type: 'skin', name: 'Golden God', description: 'Pure luxury.', price: 5000, rarity: 'legendary', icon: '🏆', visualAsset: 'from-yellow-200 via-yellow-400 to-yellow-600' },
    { id: 'skin_mecha', type: 'skin', name: 'Mecha-01', description: 'Robot uprising.', price: 1500, rarity: 'epic', icon: '🦾', visualAsset: 'from-gray-300 via-gray-100 to-gray-300' },
    { id: 'skin_zombie', type: 'skin', name: 'Undead', description: 'Cardio is survival.', price: 800, rarity: 'rare', icon: '🧟', visualAsset: 'from-green-700 to-green-900' },
    { id: 'skin_nebula', type: 'skin', name: 'Nebula', description: 'Out of this world.', price: 1800, rarity: 'epic', icon: '🌌', visualAsset: 'from-indigo-500 via-purple-500 to-pink-500' },

    // GEAR / ACCESSORIES (Head, Hands, Feet)
    { id: 'acc_shades', type: 'accessory', name: 'Cool Shades', description: 'Block out the haters.', price: 250, rarity: 'common', icon: '🕶️', visualAsset: 'sunglasses' },
    { id: 'acc_cap', type: 'accessory', name: 'Gym Cap', description: 'Bad hair day saver.', price: 300, rarity: 'common', icon: '🧢', visualAsset: 'cap' },
    { id: 'acc_headband', type: 'accessory', name: 'Sweat Band', description: 'Retro vibes.', price: 150, rarity: 'common', icon: '🤕', visualAsset: 'headband' },
    { id: 'acc_crown', type: 'accessory', name: 'King\'s Crown', description: 'For the royalty.', price: 5000, rarity: 'legendary', icon: '👑', visualAsset: 'crown' },
    
    // Shoes (Prefix acc_shoe_)
    { id: 'acc_shoe_airj', type: 'accessory', name: 'Air J\'s', description: 'Fly higher.', price: 1200, rarity: 'epic', icon: '👟', visualAsset: 'shoe_airj' },
    { id: 'acc_shoe_neon', type: 'accessory', name: 'Neon Runners', description: 'Night run ready.', price: 800, rarity: 'rare', icon: '👟', visualAsset: 'shoe_neon' },
    { id: 'acc_shoe_gold', type: 'accessory', name: 'Golden Kicks', description: 'Too expensive to run in.', price: 3000, rarity: 'legendary', icon: '👞', visualAsset: 'shoe_gold' },

    // Hands/Wrists (Prefix acc_hand_)
    { id: 'acc_hand_glove', type: 'accessory', name: 'Power Glove', description: 'It\'s so bad.', price: 1500, rarity: 'epic', icon: '🥊', visualAsset: 'hand_glove' },
    { id: 'acc_hand_watch', type: 'accessory', name: 'Smart Watch', description: 'Track your tracks.', price: 600, rarity: 'rare', icon: '⌚', visualAsset: 'hand_watch' },
    { id: 'acc_hand_belt', type: 'accessory', name: 'Champ Belt', description: 'Heavyweight.', price: 2500, rarity: 'legendary', icon: '🎗️', visualAsset: 'hand_belt' },

    // EFFECTS
    { id: 'fx_sparkle', type: 'effect', name: 'Sparkles', description: 'Shine bright.', price: 800, rarity: 'epic', icon: '✨', visualAsset: 'sparkle' },
    { id: 'fx_fire', type: 'effect', name: 'Flame Trail', description: 'Leave them in the dust.', price: 1500, rarity: 'legendary', icon: '☄️', visualAsset: 'fire_trail' },
    { id: 'fx_matrix', type: 'effect', name: 'Matrix Code', description: 'There is no spoon.', price: 1200, rarity: 'epic', icon: '💻', visualAsset: 'matrix' },
    { id: 'fx_lightning', type: 'effect', name: 'Storm', description: 'Electric energy.', price: 1000, rarity: 'rare', icon: '⚡', visualAsset: 'lightning' },
    { id: 'fx_confetti', type: 'effect', name: 'Party Time', description: 'Celebrate every step.', price: 500, rarity: 'common', icon: '🎉', visualAsset: 'confetti' },

    // REWARDS (Gift Cards)
    { id: 'card_starbucks_50', type: 'gift_card', name: '$50 Starbucks', description: 'Fuel your caffeine addiction.', price: 10000, rarity: 'epic', icon: '☕', visualAsset: 'card_starbucks' },
    { id: 'card_amazon_50', type: 'gift_card', name: '$50 Amazon', description: 'Buy whatever you want.', price: 12000, rarity: 'epic', icon: '📦', visualAsset: 'card_amazon' },
    { id: 'card_nike_100', type: 'gift_card', name: '$100 Nike', description: 'Just Do It.', price: 25000, rarity: 'legendary', icon: '✔️', visualAsset: 'card_nike' },
    { id: 'card_apple_50', type: 'gift_card', name: '$50 Apple', description: 'Apps, Music, TV.', price: 12000, rarity: 'epic', icon: '🍎', visualAsset: 'card_apple' },
    { id: 'card_target_50', type: 'gift_card', name: '$50 Target', description: 'Expect More. Pay Less.', price: 10000, rarity: 'epic', icon: '🎯', visualAsset: 'card_target' },
];

const MOVE_MENU_OPTIONS = {
    TYPES: ['Pushups', 'Squats', 'Jumping Jacks', 'Steps', 'Distance Walk', 'Calories'],
    TARGETS: {
        'Pushups': ['10', '20', '30', '50', '100', '200'],
        'Squats': ['15', '30', '50', '100', '300'],
        'Jumping Jacks': ['50', '100', '200', '500'],
        'Steps': ['1000', '3000', '5000', '10000'],
        'Distance Walk': ['1km', '3km', '5km', '10km'],
        'Calories': ['100', '300', '500', '1000']
    },
    TIMES: ['10 mins', '20 mins', '30 mins', '1 hour', '2 hours']
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateStandardWorkout = () => {
    const type = getRandomItem(MOVE_MENU_OPTIONS.TYPES);
    // @ts-ignore
    const target = getRandomItem(MOVE_MENU_OPTIONS.TARGETS[type]);
    const time = getRandomItem(MOVE_MENU_OPTIONS.TIMES);
    return `${target} ${type} in ${time}`;
};

const seedDatabase = () => {
    console.log("Seeding Database...");
    const names = ['Rex', 'Viper', 'Tank', 'Luna', 'Ghost', 'Blaze', 'Pixel', 'Jazz', 'Kilo', 'Neo', 'Fury', 'Zen', 'Rogue', 'Echo', 'Titan', 'Jinx', 'Axel', 'Nova', 'Cypher', 'Orbit'];
    const mockUsers: User[] = names.map((name, i) => {
        const coinHistory: CoinTransaction[] = [];
        const wins = Math.floor(Math.random() * 50);
        for (let j = 0; j < wins; j++) {
            coinHistory.push({
                id: `tx_seed_${i}_${j}`,
                type: 'BET_WON',
                amount: 60,
                description: 'Points Surge (Win)',
                timestamp: Date.now() - Math.floor(Math.random() * 1000000000)
            });
        }
        const gym = Math.random() > 0.2 ? getRandomItem(MOCK_GYMS) : undefined;
        return {
            id: `u_${name.toLowerCase()}`,
            name: name,
            avatar: '',
            gym: gym,
            level: Math.floor(Math.random() * 10) + 1,
            coins: Math.floor(Math.random() * 5000) + 500,
            coinHistory: coinHistory, 
            stats: { 
                currentStreak: Math.floor(Math.random() * 20), 
                bestStreak: Math.floor(Math.random() * 50), 
                totalWorkouts: Math.floor(Math.random() * 200), 
                badges: Math.random() > 0.5 ? ['7-day'] : [], 
                workoutBreakdown: {} 
            },
            inventory: ['skin_default'],
            equipped: { skin: 'skin_default' },
            lastActiveAt: Date.now()
        };
    });

    const mockCommitments: Commitment[] = [];
    for (let i = 0; i < 25; i++) {
        const user = mockUsers[i % mockUsers.length];
        const title = generateStandardWorkout();
        const backVotes = Math.floor(Math.random() * 50);
        const calloutVotes = Math.floor(Math.random() * 20);
        mockCommitments.push({
            id: `c_${i}`,
            user: user,
            workoutTitle: title,
            deadline: Date.now() + (Math.random() * 86400000), 
            votes: generateVotes(backVotes, calloutVotes)
        });
    }

    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(mockUsers));
    localStorage.setItem(DB_KEYS.COMMITMENTS, JSON.stringify(mockCommitments));
    localStorage.setItem(DB_KEYS.VOTES, JSON.stringify([]));
    localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify([]));
};

const generateVotes = (back: number, callout: number): Vote[] => {
    const votes: Vote[] = [];
    for (let i = 0; i < back; i++) votes.push({ userId: `mock_${i}`, type: 'back' });
    for (let i = 0; i < callout; i++) votes.push({ userId: `mock_hater_${i}`, type: 'callout' });
    return votes;
};

const initializeDB = () => {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
        seedDatabase();
    }
};

export const getGyms = async (): Promise<Gym[]> => {
    await delay(300);
    return MOCK_GYMS;
};

export const loginUser = async (username: string): Promise<User> => {
    initializeDB();
    await delay(300);
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    let user = users.find((u: User) => u.name.toLowerCase() === username.toLowerCase());
    if (!user) {
        const newUser: User = {
            id: `u_${Date.now()}`,
            name: username,
            avatar: '',
            level: 1,
            coins: 1250,
            coinHistory: [],
            stats: { currentStreak: 0, bestStreak: 0, totalWorkouts: 0, badges: [], workoutBreakdown: {} },
            inventory: ['skin_default'],
            equipped: { skin: 'skin_default' },
            nextMission: "First Workout",
            lastActiveAt: Date.now()
        };
        const bonusTx: CoinTransaction = { id: `tx_${Date.now()}`, type: 'SIGNUP_BONUS', amount: 1250, description: 'SIGNUP POINTS', timestamp: Date.now() };
        newUser.coinHistory.push(bonusTx);
        users.push(newUser);
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        logActivity(newUser.id, 'LOGIN', { isNewUser: true });
        sendNotification('Welcome!', 'Time to earn some points.', 'streak');
        return newUser;
    } else {
        user.lastActiveAt = Date.now();
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        logActivity(user.id, 'LOGIN', { isNewUser: false });
        if (user.stats.currentStreak > 0 && user.stats.currentStreak % 5 === 0) {
             sendNotification('Streak Alive!', `${user.stats.currentStreak} Day Streak! Keep it up.`, 'streak');
        }
        return user;
    }
};

export const updateUserAvatar = async (userId: string, avatarUrl: string): Promise<User | null> => {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const index = users.findIndex((u: User) => u.id === userId);
    if (index !== -1) {
        users[index].avatar = avatarUrl;
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        return users[index];
    }
    return null;
};

export const updateUserGym = async (userId: string, gym: Gym): Promise<User | null> => {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const index = users.findIndex((u: User) => u.id === userId);
    if (index !== -1) {
        users[index].gym = gym;
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        return users[index];
    }
    return null;
};

// --- STORE FUNCTIONS ---

export const purchaseItem = async (userId: string, itemId: string): Promise<{ success: boolean; message: string; user?: User }> => {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const index = users.findIndex((u: User) => u.id === userId);
    if (index === -1) return { success: false, message: "User not found" };
    
    const user = users[index];
    const item = STORE_CATALOG.find(i => i.id === itemId);
    
    if (!item) return { success: false, message: "Item not found" };
    
    // Allow re-purchase of gift cards
    if (item.type !== 'gift_card' && user.inventory.includes(itemId)) return { success: false, message: "Item already owned" };
    
    if (user.coins < item.price) return { success: false, message: "Insufficient coins" };

    // Deduct
    user.coins -= item.price;
    if (item.type !== 'gift_card') {
        user.inventory.push(itemId);
    }
    
    // Add Transaction
    user.coinHistory.push({
        id: `tx_${Date.now()}`,
        type: 'STORE_PURCHASE',
        amount: -item.price,
        description: `Bought ${item.name}`,
        timestamp: Date.now()
    });

    users[index] = user;
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    logActivity(userId, 'PURCHASE_ITEM', { itemId });
    return { success: true, message: `Purchased ${item.name}!`, user };
};

export const equipItem = async (userId: string, itemId: string): Promise<{ success: boolean; user?: User }> => {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const index = users.findIndex((u: User) => u.id === userId);
    if (index === -1) return { success: false };

    const user = users[index];
    const item = STORE_CATALOG.find(i => i.id === itemId);
    
    if (!item || !user.inventory.includes(itemId)) return { success: false };
    if (item.type === 'gift_card') return { success: false }; // Cannot equip

    // Equip based on type
    if (item.type === 'skin') user.equipped.skin = itemId;
    if (item.type === 'accessory') user.equipped.accessory = itemId;
    if (item.type === 'effect') user.equipped.effect = itemId;

    users[index] = user;
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return { success: true, user };
};

export const unequipItem = async (userId: string, type: 'accessory' | 'effect'): Promise<{ success: boolean; user?: User }> => {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const index = users.findIndex((u: User) => u.id === userId);
    if (index === -1) return { success: false };
    
    const user = users[index];
    if (type === 'accessory') delete user.equipped.accessory;
    if (type === 'effect') delete user.equipped.effect;

    users[index] = user;
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return { success: true, user };
};

export const getUser = async (userId: string): Promise<User | null> => {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    return users.find((u: User) => u.id === userId) || null;
};

export const deleteUser = async (userId: string): Promise<void> => {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const filteredUsers = users.filter((u: User) => u.id !== userId);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(filteredUsers));
};

export const createCommitment = async (user: User, title: string, deadline: number): Promise<Commitment> => {
    const commitments = JSON.parse(localStorage.getItem(DB_KEYS.COMMITMENTS) || '[]');
    const newCommitment: Commitment = { id: `c_${Date.now()}`, user: user, workoutTitle: title, deadline: deadline, votes: [] };
    commitments.unshift(newCommitment);
    localStorage.setItem(DB_KEYS.COMMITMENTS, JSON.stringify(commitments));
    logActivity(user.id, 'COMMIT_WORKOUT', { title });
    return newCommitment;
};

export const getFeed = async (currentUserId: string): Promise<Commitment[]> => {
    await delay(200);
    initializeDB();
    const commitments = JSON.parse(localStorage.getItem(DB_KEYS.COMMITMENTS) || '[]');
    return commitments.map((c: Commitment) => ({
        ...c,
        currentUserVote: c.votes.find((v: Vote) => v.userId === currentUserId)?.type
    }));
};

export const placeVote = async (userId: string, commitmentId: string, type: 'back' | 'callout'): Promise<{ success: boolean; message: string; updatedUser?: User }> => {
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const userIndex = users.findIndex((u: User) => u.id === userId);
    if (userIndex === -1) return { success: false, message: "User not found" };
    const user = users[userIndex];
    
    // Check Global Votes for duplicates (handles both Commitments and Live Sessions)
    const globalVotes = JSON.parse(localStorage.getItem(DB_KEYS.VOTES) || '[]');
    const existingVote = globalVotes.find((v: any) => v.userId === userId && v.targetId === commitmentId);
    
    if (existingVote) {
        return { success: false, message: "You already voted! Move on. Boost someone else’s ego!" };
    }
    
    // Points Check
    if (user.coins < 50) {
        return { success: false, message: "Low Points. Recharge required." };
    }

    // Is this a Live Session? (Mock Logic: IDs start with 'l_')
    const isLive = commitmentId.startsWith('l_');
    let commitment = null;
    let commitments = [];
    let commIndex = -1;

    if (!isLive) {
        commitments = JSON.parse(localStorage.getItem(DB_KEYS.COMMITMENTS) || '[]');
        commIndex = commitments.findIndex((c: Commitment) => c.id === commitmentId);
        if (commIndex === -1) return { success: false, message: "Commitment not found" };
        commitment = commitments[commIndex];
        
        // Add vote to commitment object (for UI state consistency if reloaded)
        commitment.votes.push({ userId, type });
        commitments[commIndex] = commitment;
        localStorage.setItem(DB_KEYS.COMMITMENTS, JSON.stringify(commitments));
    }

    // Deduct Coins
    user.coins -= 50;
    const tx: CoinTransaction = { 
        id: `tx_${Date.now()}`, 
        type: 'BET_PLACED', 
        amount: -50, 
        description: `Vote (${type.toUpperCase()}) on ${isLive ? 'Live Session' : commitment?.user.name || 'User'}`, 
        timestamp: Date.now() 
    };
    user.coinHistory.push(tx);
    users[userIndex] = user;
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));

    // Record Global Vote
    globalVotes.push({ userId, targetId: commitmentId, type, timestamp: Date.now() });
    localStorage.setItem(DB_KEYS.VOTES, JSON.stringify(globalVotes));

    logActivity(userId, 'PLACE_BET', { commitmentId, type, isLive });
    
    return { success: true, message: "Vote Placed!", updatedUser: user };
};

export const logActivity = (userId: string, actionType: string, metadata: any = {}) => {
    const logs = JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]');
    const newLog: ActivityLog = { id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, userId, actionType, metadata, timestamp: Date.now() };
    logs.push(newLog);
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs));
};

export const getTimeSpent = (userId: string): number => {
    const logs = JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]');
    const userLogs = logs.filter((l: ActivityLog) => l.userId === userId);
    return userLogs.length * 5; 
};

export const getLeaderboard = async (type: 'top_humans' | 'friends' | 'workouts_done' | 'top_gyms', currentUserId: string): Promise<LeaderboardEntry[] | GymLeaderboardEntry[]> => {
    await delay(200);
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    let sortedUsers: User[] = [...users];

    // Mock live status and streak for UI
    const enhanceUser = (user: User, index: number): LeaderboardEntry => {
        return {
            rank: index + 1,
            user,
            score: user.coins,
            trend: Math.random() > 0.5 ? 'up' : 'down',
            isLive: Math.random() > 0.8, // 20% chance to be live
            streak: user.stats.currentStreak || Math.floor(Math.random() * 10),
            recentHighlight: Math.random() > 0.5 ? `${Math.floor(Math.random() * 5) + 2} day streak` : `Won ${Math.floor(Math.random() * 100) + 50} bets`
        };
    };

    if (type === 'top_gyms') {
        // Aggregate Gym Scores
        const gymMap = new Map<string, GymLeaderboardEntry>();
        MOCK_GYMS.forEach(gym => {
            gymMap.set(gym.id, { rank: 0, gym, totalScore: 0 });
        });
        
        // Add random scores to mock realistic gym battles
        users.forEach((u: User) => {
            if (u.gym) {
                const entry = gymMap.get(u.gym.id);
                if (entry) {
                    entry.totalScore += u.coins;
                    // Mock MVP logic
                    if (!entry.mvpUser || u.coins > entry.mvpUser.coins) {
                        entry.mvpUser = u;
                    }
                }
            }
        });

        const sortedGyms = Array.from(gymMap.values())
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
            
        return sortedGyms;
    }

    if (type === 'friends') {
        // Mock friends list (random 5 users)
        sortedUsers = sortedUsers.filter((u, i) => i % 3 === 0).sort((a, b) => b.coins - a.coins);
    } else if (type === 'workouts_done') {
        // Sort by total Workouts
        sortedUsers.sort((a, b) => b.stats.totalWorkouts - a.stats.totalWorkouts);
    } else {
        // Top Humans (Global - by Coins)
        sortedUsers.sort((a, b) => b.coins - a.coins);
    }

    return sortedUsers.map(enhanceUser);
};

export const sendFeedback = async (userId: string, message: string): Promise<boolean> => {
    await delay(500); // Simulate network
    // In a real app, this would POST to an API or email service
    console.log(`[FEEDBACK] User ${userId}: ${message}`);
    logActivity(userId, 'SEND_FEEDBACK', { messageLength: message.length });
    return true;
};
