import { create } from 'zustand';
import { UserProfile, HabitLog, ChallengeProgress } from '../types/user.types';
import { isMockMode, db } from '../services/firebase/config';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

interface UserState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  habits: Record<string, HabitLog>; // date -> log
  challengeProgress: Record<string, ChallengeProgress>; // challengeId -> progress
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => Promise<void>;
  
  // Data actions
  logHabit: (date: string, habits: Omit<HabitLog, 'carbonSaved' | 'loggedAt'>) => Promise<void>;
  enrollInChallenge: (challengeId: string, durationDays: number, points: number) => Promise<void>;
  updateChallengeProgress: (challengeId: string, daysCompleted: number, isCompleted?: boolean) => Promise<void>;
  updateProfileSettings: (settings: Partial<UserProfile['settings']>) => Promise<void>;
  updateProfileInfo: (info: { displayName: string; institution: string | null; location: { city: string; country: string } }) => Promise<void>;
  acceptPrivacyConsent: () => Promise<void>;
}

// Default initial state
export const defaultMockUser: UserProfile = {
  uid: 'mock-user-123',
  email: 'eco.commuter@example.com',
  displayName: 'Aarav Sharma',
  photoURL: null,
  location: { city: 'Mumbai', country: 'India' },
  institution: 'IIT Bombay',
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
  settings: {
    theme: 'dark',
    unit: 'metric',
    notifications: true,
    emailReports: true
  },
  sustainability: {
    totalPoints: 450,
    level: 3,
    streak: 5,
    lastHabitLog: null
  },
  privacyConsent: {
    accepted: false,
    acceptedAt: '',
    version: '1.0'
  }
};

export const defaultMockChallenges: Record<string, ChallengeProgress> = {
  'ch-transit': {
    challengeId: 'ch-transit',
    status: 'active',
    startedAt: new Date().toISOString(),
    completedAt: null,
    daysCompleted: 2,
    pointsEarned: 0
  },
  'ch-veg': {
    challengeId: 'ch-veg',
    status: 'completed',
    startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    daysCompleted: 7,
    pointsEarned: 150
  }
};

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  habits: {},
  challengeProgress: {},

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  initialize: async () => {
    set({ loading: true });
    
    if (isMockMode) {
      // Mock Mode Initialization
      try {
        const isInitialized = localStorage.getItem('eq_initialized') === 'true';
        
        if (!isInitialized) {
          // First-time visit auto-login setup
          localStorage.setItem('eq_initialized', 'true');
          
          const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const initialUser = {
            ...defaultMockUser,
            sustainability: {
              ...defaultMockUser.sustainability,
              lastHabitLog: yesterdayStr
            }
          };
          localStorage.setItem('eq_user', JSON.stringify(initialUser));
          localStorage.setItem('eq_challenges', JSON.stringify(defaultMockChallenges));
          
          const initialHabits = {
            [yesterdayStr]: {
              bikeKm: 5,
              publicTransportTrips: 2,
              vegetarianMeals: 2,
              plasticFreeDays: 1,
              carbonSaved: 4.8,
              loggedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
          };
          localStorage.setItem('eq_habits', JSON.stringify(initialHabits));
        }
        
        const storedUser = localStorage.getItem('eq_user');
        const storedHabits = localStorage.getItem('eq_habits');
        const storedChallenges = localStorage.getItem('eq_challenges');
        
        const loadedUser = storedUser ? JSON.parse(storedUser) : null;
        const loadedHabits = storedHabits ? JSON.parse(storedHabits) : {};
        const loadedChallenges = storedChallenges ? JSON.parse(storedChallenges) : {};
        
        set({
          user: loadedUser,
          habits: loadedHabits,
          challengeProgress: loadedChallenges,
          loading: false
        });
      } catch (err) {
        console.error('Failed to initialize Mock User storage:', err);
        set({ error: 'Failed to initialize Mock User storage', loading: false });
      }
    } else {
      // Firebase Mode Initialization will be handled via Auth State changes in hook
      set({ loading: false });
    }
  },

  logHabit: async (date, habitInput) => {
    const { user, habits } = get();
    if (!user) {return;}

    // Calculate carbon saved
    // factors: public transport = 0.5kg per trip, bike = 0.192kg per km, vegetarian meal = 0.65kg, plastic free = 0.2kg
    const carbonSaved = 
      habitInput.bikeKm * 0.192 +
      habitInput.publicTransportTrips * 1.2 + 
      habitInput.vegetarianMeals * 0.65 +
      habitInput.plasticFreeDays * 0.2;

    const newLog: HabitLog = {
      ...habitInput,
      carbonSaved: parseFloat(carbonSaved.toFixed(2)),
      loggedAt: new Date().toISOString()
    };

    const updatedHabits = {
      ...habits,
      [date]: newLog
    };

    // Calculate points and streak
    let pointsEarned = Math.round(carbonSaved * 10);
    if (pointsEarned < 5) {pointsEarned = 5;} // minimum points for tracking

    let newStreak = user.sustainability.streak;
    const lastLogDate = user.sustainability.lastHabitLog;
    
    if (lastLogDate) {
      const lastDate = new Date(lastLogDate);
      const currentDate = new Date(date);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1; // reset streak
      }
    } else {
      newStreak = 1; // first log
    }

    const totalPoints = user.sustainability.totalPoints + pointsEarned;
    const newLevel = Math.floor(totalPoints / 200) + 1; // 200 points per level

    const updatedUser: UserProfile = {
      ...user,
      sustainability: {
        totalPoints,
        level: newLevel,
        streak: newStreak,
        lastHabitLog: date
      }
    };

    if (isMockMode) {
      localStorage.setItem('eq_user', JSON.stringify(updatedUser));
      localStorage.setItem('eq_habits', JSON.stringify(updatedHabits));
      set({ user: updatedUser, habits: updatedHabits });
    } else {
      try {
        const userDocRef = doc(db!, 'users', user.uid);
        const habitDocRef = doc(db!, 'users', user.uid, 'habits', date);
        
        await setDoc(habitDocRef, {
          ...newLog,
          loggedAt: new Date()
        });
        
        await updateDoc(userDocRef, {
          'sustainability.totalPoints': totalPoints,
          'sustainability.level': newLevel,
          'sustainability.streak': newStreak,
          'sustainability.lastHabitLog': date
        });
        
        set({ user: updatedUser, habits: updatedHabits });
      } catch (err) {
        console.error('Error syncing habit to Firestore:', err);
        throw err;
      }
    }
  },

  enrollInChallenge: async (challengeId, _durationDays, _points) => {
    const { user, challengeProgress } = get();
    if (!user) {return;}
    void _durationDays;
    void _points;

    const newProgress: ChallengeProgress = {
      challengeId,
      status: 'active',
      startedAt: new Date().toISOString(),
      completedAt: null,
      daysCompleted: 0,
      pointsEarned: 0
    };

    const updatedProgress = {
      ...challengeProgress,
      [challengeId]: newProgress
    };

    if (isMockMode) {
      localStorage.setItem('eq_challenges', JSON.stringify(updatedProgress));
      set({ challengeProgress: updatedProgress });
    } else {
      try {
        const docRef = doc(db!, 'users', user.uid, 'challengeProgress', challengeId);
        await setDoc(docRef, {
          ...newProgress,
          startedAt: new Date()
        });
        set({ challengeProgress: updatedProgress });
      } catch (err) {
        console.error('Error enrolling in challenge in Firestore:', err);
        throw err;
      }
    }
  },

  updateChallengeProgress: async (challengeId, daysCompleted, isCompleted = false) => {
    const { user, challengeProgress } = get();
    if (!user) {return;}

    const current = challengeProgress[challengeId];
    if (!current) {return;}

    const pointsToEarn = isCompleted ? 150 : 0; // Hardcoded default award for completion, can be dynamic
    
    const updated: ChallengeProgress = {
      ...current,
      daysCompleted,
      status: isCompleted ? 'completed' : 'active',
      completedAt: isCompleted ? new Date().toISOString() : null,
      pointsEarned: current.pointsEarned + pointsToEarn
    };

    const updatedProgress = {
      ...challengeProgress,
      [challengeId]: updated
    };

    // Update user points if completed
    let updatedUser = user;
    if (isCompleted && pointsToEarn > 0) {
      const totalPoints = user.sustainability.totalPoints + pointsToEarn;
      const newLevel = Math.floor(totalPoints / 200) + 1;
      
      updatedUser = {
        ...user,
        sustainability: {
          ...user.sustainability,
          totalPoints,
          level: newLevel
        }
      };
    }

    if (isMockMode) {
      localStorage.setItem('eq_challenges', JSON.stringify(updatedProgress));
      if (isCompleted) {
        localStorage.setItem('eq_user', JSON.stringify(updatedUser));
      }
      set({ challengeProgress: updatedProgress, user: updatedUser });
    } else {
      try {
        const progressRef = doc(db!, 'users', user.uid, 'challengeProgress', challengeId);
        await updateDoc(progressRef, {
          daysCompleted,
          status: updated.status,
          completedAt: updated.completedAt ? new Date() : null,
          pointsEarned: updated.pointsEarned
        });
        
        if (isCompleted && pointsToEarn > 0) {
          const userRef = doc(db!, 'users', user.uid);
          await updateDoc(userRef, {
            'sustainability.totalPoints': updatedUser.sustainability.totalPoints,
            'sustainability.level': updatedUser.sustainability.level
          });
        }
        
        set({ challengeProgress: updatedProgress, user: updatedUser });
      } catch (err) {
        console.error('Error updating challenge progress:', err);
        throw err;
      }
    }
  },

  updateProfileSettings: async (settings) => {
    const { user } = get();
    if (!user) {return;}

    const updatedUser = {
      ...user,
      settings: {
        ...user.settings,
        ...settings
      }
    };

    if (isMockMode) {
      localStorage.setItem('eq_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } else {
      try {
        const userRef = doc(db!, 'users', user.uid);
        await updateDoc(userRef, {
          'settings.theme': updatedUser.settings.theme,
          'settings.unit': updatedUser.settings.unit,
          'settings.notifications': updatedUser.settings.notifications,
          'settings.emailReports': updatedUser.settings.emailReports
        });
        set({ user: updatedUser });
      } catch (err) {
        console.error('Error updating settings in Firestore:', err);
        throw err;
      }
    }
  },

  updateProfileInfo: async (info) => {
    const { user } = get();
    if (!user) {return;}

    const updatedUser = {
      ...user,
      displayName: info.displayName,
      institution: info.institution,
      location: info.location
    };

    if (isMockMode) {
      localStorage.setItem('eq_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } else {
      try {
        const userRef = doc(db!, 'users', user.uid);
        await updateDoc(userRef, {
          displayName: info.displayName,
          institution: info.institution,
          location: info.location
        });
        set({ user: updatedUser });
      } catch (err) {
        console.error('Error updating user info in Firestore:', err);
        throw err;
      }
    }
  },

  acceptPrivacyConsent: async () => {
    const { user } = get();
    if (!user) {return;}

    const updatedUser = {
      ...user,
      privacyConsent: {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        version: '1.0'
      }
    };

    if (isMockMode) {
      localStorage.setItem('eq_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } else {
      try {
        const userRef = doc(db!, 'users', user.uid);
        await updateDoc(userRef, {
          'privacyConsent.accepted': true,
          'privacyConsent.acceptedAt': new Date(),
          'privacyConsent.version': '1.0'
        });
        set({ user: updatedUser });
      } catch (err) {
        console.error('Error updating consent in Firestore:', err);
        throw err;
      }
    }
  }
}));
