export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  location: {
    city: string;
    country: string;
  };
  institution: string | null;
  createdAt: string;
  lastActiveAt: string;
  settings: {
    theme: 'light' | 'dark' | 'system';
    unit: 'metric' | 'imperial';
    notifications: boolean;
    emailReports: boolean;
  };
  sustainability: {
    totalPoints: number;
    level: number;
    streak: number;
    lastHabitLog: string | null;
  };
  privacyConsent: {
    accepted: boolean;
    acceptedAt: string;
    version: string;
  };
}

export interface HabitLog {
  bikeKm: number;
  publicTransportTrips: number;
  vegetarianMeals: number;
  plasticFreeDays: number;
  carbonSaved: number; // in kg CO2e
  loggedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'food' | 'shopping';
  difficulty: 'easy' | 'medium' | 'hard';
  durationDays: number;
  co2SavedEstimate: number; // kg CO2e
  points: number;
  badgeId: string;
  isActive: boolean;
}

export interface ChallengeProgress {
  challengeId: string;
  status: 'active' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  daysCompleted: number;
  pointsEarned: number;
}
