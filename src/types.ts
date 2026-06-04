/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OnboardingData {
  gender: 'Male' | 'Female' | '';
  age: number | '';
  height: number | ''; // in cm
  weight: number | ''; // in kg
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: string;
  limitations: string;
  equipment: string[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  description: string;
  image?: string;
}

export interface DailyWorkout {
  day: string; // e.g., 'Monday'
  dayNum: number; // 1-7
  name: string; // e.g., 'Upper Body Push'
  focus: string; // e.g., 'Chest, Shoulders, Triceps'
  description: string;
  exercises: Exercise[];
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  type: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  tags: string[];
  image?: string;
}

export interface FitnessPlan {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  dietPreference: 'vegetarian' | 'mixed';
  meals: Meal[];
  workoutPlan: DailyWorkout[];
  coachNote: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  steps: number;
  waterIntake: number; // in Liters
  loggedMeals: Array<{ mealId: string; loggedAt: string }>;
  customMeals: Array<{ name: string; calories: number; protein: number; carbs: number; fats: number; loggedAt: string }>;
  completedWorkout: boolean;
  feeling: 'Full' | 'Neutral' | 'Hungry';
  craving: string;
  feedbackSubmitted: boolean;
  coachFeedback?: string;
  weightAtTime?: number; // to track weight changes over time
}

export interface FitnessState {
  currentStep: number;
  onboarding: OnboardingData;
  isOnboarded: boolean;
  plan: FitnessPlan | null;
  dailyLogs: { [date: string]: DailyLog };
  selectedTab: 'dashboard' | 'my-plan' | 'progress' | 'profile';
  selectedPlanType: 'workout' | 'nutrition';
  selectedWorkoutDay: number; // 1 to 7
  streak: number;
  lastPlannedDate: string; // Keep track of when plan was derived
}
