/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OnboardingData, FitnessPlan, DailyLog, FitnessState } from './types';
import AssessmentForm from './components/AssessmentForm';
import Dashboard from './components/Dashboard';
import MyPlan from './components/MyPlan';
import Progress from './components/Progress';
import Profile from './components/Profile';
import AuthScreen from './components/AuthScreen';
import { Sparkles, Trophy, Dumbbell, ShieldAlert, BookOpen, User, LineChart, Flame, LogOut } from 'lucide-react';
import { 
  auth, 
  db, 
  isFirebaseConfigured, 
  handleFirestoreError, 
  OperationType 
} from './lib/firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'elite_fitness_data_v2';

const initialOnboarding: OnboardingData = {
  gender: '',
  age: '',
  height: '',
  weight: '',
  experience: 'Intermediate',
  goal: 'Build Muscle & Strength',
  limitations: '',
  equipment: ['Gym', 'Dumbbells'],
};

export default function App() {
  // Master app state
  const [currentStep, setCurrentStep] = React.useState(1);
  const [onboarding, setOnboarding] = React.useState<OnboardingData>(initialOnboarding);
  const [isOnboarded, setIsOnboarded] = React.useState(false);
  const [plan, setPlan] = React.useState<FitnessPlan | null>(null);
  const [dailyLogs, setDailyLogs] = React.useState<{ [date: string]: DailyLog }>({});
  const [selectedTab, setSelectedTab] = React.useState<'dashboard' | 'my-plan' | 'progress' | 'profile'>('dashboard');
  const [selectedPlanType, setSelectedPlanType] = React.useState<'workout' | 'nutrition'>('workout');
  const [selectedWorkoutDay, setSelectedWorkoutDay] = React.useState<number>(1);
  const [streak, setStreak] = React.useState<number>(4); // default fun streak
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = React.useState(false);
  const [apiSource, setApiSource] = React.useState<string>('');

  // Adaptive Coach Engine Settings
  const [selectedHurdle, setSelectedHurdle] = React.useState<string>('no-hurdle');
  const [cyclePhase, setCyclePhase] = React.useState<string>('none');
  const [pcosAwareness, setPcosAwareness] = React.useState<boolean>(false);
  const [postpartumMode, setPostpartumMode] = React.useState<boolean>(false);
  const [beginnerMilestones, setBeginnerMilestones] = React.useState<boolean>(false);

  // Authentication and Cloud Sync states
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const isFetchingRef = React.useRef(false);

  // Get current date string (YYYY-MM-DD)
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayStr();

  // 1. Initial Load: Listen for Firebase auth changes OR load Guest local storage
  React.useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          isFetchingRef.current = true;
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.onboarding) setOnboarding(data.onboarding);
              if (data.isOnboarded !== undefined) setIsOnboarded(data.isOnboarded);
              if (data.plan) setPlan(data.plan);
              if (data.apiSource) setApiSource(data.apiSource);
              if (data.dailyLogs) setDailyLogs(data.dailyLogs);
              if (data.streak !== undefined) setStreak(data.streak);
              if (data.selectedTab) setSelectedTab(data.selectedTab);
              if (data.selectedPlanType) setSelectedPlanType(data.selectedPlanType);
              if (data.selectedHurdle) setSelectedHurdle(data.selectedHurdle);
              if (data.cyclePhase) setCyclePhase(data.cyclePhase);
              if (data.pcosAwareness !== undefined) setPcosAwareness(data.pcosAwareness);
              if (data.postpartumMode !== undefined) setPostpartumMode(data.postpartumMode);
              if (data.beginnerMilestones !== undefined) setBeginnerMilestones(data.beginnerMilestones);
            } else {
              // Firebase missing or denied, fallback to local storage
              const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${currentUser.uid}`);
              if (cached) {
                try {
                  const parsed = JSON.parse(cached);
                  if (parsed.onboarding) setOnboarding(parsed.onboarding);
                  if (parsed.isOnboarded !== undefined) setIsOnboarded(parsed.isOnboarded);
                  if (parsed.plan) setPlan(parsed.plan);
                  if (parsed.dailyLogs) setDailyLogs(parsed.dailyLogs);
                  if (parsed.streak !== undefined) setStreak(parsed.streak);
                  if (parsed.selectedTab) setSelectedTab(parsed.selectedTab);
                } catch (e) {
                  console.error("Local storage fallback parsing error:", e);
                }
              } else {
                // Reset state to prompt onboarding for new remote credentials
                setOnboarding(initialOnboarding);
                setIsOnboarded(false);
                setPlan(null);
                setDailyLogs({});
                setStreak(4);
              }
            }
          } catch (err) {
            console.error("Firestore loading failure:", err);
            // Firebase threw an error (likely permission denied), fallback to local storage
            const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${currentUser.uid}`);
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                if (parsed.onboarding) setOnboarding(parsed.onboarding);
                if (parsed.isOnboarded !== undefined) setIsOnboarded(parsed.isOnboarded);
                if (parsed.plan) setPlan(parsed.plan);
                if (parsed.dailyLogs) setDailyLogs(parsed.dailyLogs);
                if (parsed.streak !== undefined) setStreak(parsed.streak);
                if (parsed.selectedTab) setSelectedTab(parsed.selectedTab);
              } catch (e) {
                console.error("Local storage fallback parsing error in catch block:", e);
              }
            } else {
              // Reset state to prompt onboarding for new remote credentials
              setOnboarding(initialOnboarding);
              setIsOnboarded(false);
              setPlan(null);
              setDailyLogs({});
              setStreak(4);
            }
          } finally {
            setTimeout(() => {
              isFetchingRef.current = false;
            }, 150);
          }
        } else {
          // Reset states to defaults when unauthenticated
          setOnboarding(initialOnboarding);
          setIsOnboarded(false);
          setPlan(null);
          setDailyLogs({});
          setStreak(4);
          setSelectedHurdle('no-hurdle');
          setCyclePhase('none');
          setPcosAwareness(false);
          setPostpartumMode(false);
          setBeginnerMilestones(false);
        }
        setCheckingAuth(false);
      });
      return () => unsubscribe();
    } else {
      // Offline fallback: Read sandbox local storage states
      const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_guest`);
      if (raw) {
        try {
          const parsed: any = JSON.parse(raw);
          if (parsed.onboarding) setOnboarding(parsed.onboarding);
          if (parsed.isOnboarded) setIsOnboarded(parsed.isOnboarded);
          if (parsed.plan) setPlan(parsed.plan2 || parsed.plan);
          if (parsed.dailyLogs) setDailyLogs(parsed.dailyLogs);
          if (parsed.selectedTab) setSelectedTab(parsed.selectedTab);
          if (parsed.selectedPlanType) setSelectedPlanType(parsed.selectedPlanType);
          if (parsed.selectedWorkoutDay) setSelectedWorkoutDay(parsed.selectedWorkoutDay);
          if (parsed.streak !== undefined) setStreak(parsed.streak);
          if (parsed.selectedHurdle) setSelectedHurdle(parsed.selectedHurdle);
          if (parsed.cyclePhase) setCyclePhase(parsed.cyclePhase);
          if (parsed.pcosAwareness !== undefined) setPcosAwareness(parsed.pcosAwareness);
          if (parsed.postpartumMode !== undefined) setPostpartumMode(parsed.postpartumMode);
          if (parsed.beginnerMilestones !== undefined) setBeginnerMilestones(parsed.beginnerMilestones);
        } catch (err) {
          console.error("Failed to parse local storage state, starting clean.", err);
        }
      }
      setCheckingAuth(false);
    }
  }, []);

  // 2. State Sync: Commits changes either to Cloud Firestore or local storage based on config
  React.useEffect(() => {
    // Check if initial fetch operations are still processing to block write feedback loop
    if (isFetchingRef.current) return;

    // ALWAYS backup to local storage in case Firebase permissions fail
    if (isOnboarded) {
      const stateObj: any = {
        onboarding,
        isOnboarded,
        plan,
        dailyLogs,
        selectedTab,
        selectedPlanType,
        selectedWorkoutDay,
        streak,
        selectedHurdle,
        cyclePhase,
        pcosAwareness,
        postpartumMode,
        beginnerMilestones,
        lastPlannedDate: todayStr,
      };
      const keySuffix = user ? user.uid : 'guest';
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${keySuffix}`, JSON.stringify(stateObj));
    }

    if (isFirebaseConfigured && user) {
      const userDocRef = doc(db, 'users', user.uid);
      setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        onboarding,
        isOnboarded,
        plan,
        dailyLogs,
        streak,
        selectedTab,
        selectedPlanType,
        selectedHurdle,
        cyclePhase,
        pcosAwareness,
        postpartumMode,
        beginnerMilestones,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'users/' + user.uid);
      });
    }
  }, [onboarding, isOnboarded, plan, dailyLogs, selectedTab, selectedPlanType, selectedWorkoutDay, streak, todayStr, user, selectedHurdle, cyclePhase, pcosAwareness, postpartumMode, beginnerMilestones]);

  // Ensure current day's log container exists
  const getOrCreateTodayLog = (): DailyLog => {
    if (dailyLogs[todayStr]) {
      return dailyLogs[todayStr];
    }
    return {
      date: todayStr,
      steps: 0,
      waterIntake: 0.0,
      loggedMeals: [],
      customMeals: [],
      completedWorkout: false,
      feeling: 'Neutral',
      craving: '',
      feedbackSubmitted: false,
    };
  };

  const todayLog = getOrCreateTodayLog();

  const updateTodayLog = (updates: Partial<DailyLog>) => {
    const active = getOrCreateTodayLog();
    const updated = { ...active, ...updates };
    setDailyLogs((prev) => ({
      ...prev,
      [todayStr]: updated,
    }));
  };

  // Submit onboarding details
  const handleOnboardingSubmit = async (dietPreference: 'vegetarian' | 'mixed') => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...onboarding, dietPreference }),
      });
      
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Server returned ${resp.status}: ${errText}`);
      }

      const data = await resp.json();
      if (data.plan) {
        setPlan(data.plan);
        setApiSource(data.source || 'gemini');
        setIsOnboarded(true);
        setSelectedTab('dashboard');
        // Register initial weight point in progress history log
        const weightVal = Number(onboarding.weight) || 70;
        setDailyLogs({
          [todayStr]: {
            date: todayStr,
            steps: 0,
            waterIntake: 0.0,
            loggedMeals: [],
            customMeals: [],
            completedWorkout: false,
            feeling: 'Neutral',
            craving: '',
            feedbackSubmitted: false,
            weightAtTime: weightVal,
          },
        });
      } else {
        throw new Error("Invalid response from server: " + JSON.stringify(data));
      }
    } catch (err: any) {
      console.error("Onboarding Plan generation failed:", err);
      alert("Failed to build plan: " + err.message + "\n\nPlease try again or check your server logs.");
    } finally {
      setIsLoading(false);
    }
  };

  // Profile regeneration of plans
  const handlePlanRegeneration = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...onboarding,
          dietPreference: plan?.dietPreference || 'vegetarian',
        }),
      });
      const data = await resp.json();
      if (data.plan) {
        setPlan(data.plan);
        setApiSource(data.source || 'gemini');
        setSelectedTab('dashboard');
      }
    } catch (err) {
      console.error("Failed to regenerate plan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // End of day wellness audit (Transmits to AI Coach)
  const handleAdherenceSubmit = async (feedback: { feeling: 'Full' | 'Neutral' | 'Hungry'; craving: string; coachNotes: string }) => {
    setIsSubmittingFeedback(true);
    try {
      const resp = await fetch('/api/log-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboarding,
          log: feedback,
          completedWorkout: todayLog.completedWorkout,
        }),
      });
      const data = await resp.json();
      if (data.feedback) {
        // Increase streak by 1 upon sending feedback logs
        setStreak((prev) => prev + 1);
        
        updateTodayLog({
          feeling: feedback.feeling,
          craving: feedback.craving,
          feedbackSubmitted: true,
          coachFeedback: data.feedback,
        });
      }
    } catch (err) {
      console.error("Failed to submit coach check-in feedback:", err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Handles sign out action trigger
  const handleSignOut = async () => {
    if (isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Failed to execute logout session:", err);
      }
    }
  };

  // Quick state interaction callbacks
  const handleUpdateWater = (liters: number) => {
    updateTodayLog({ waterIntake: liters });
  };

  const handleUpdateSteps = (steps: number) => {
    updateTodayLog({ steps });
  };

  const handleToggleMeal = (mealId: string) => {
    const list = [...todayLog.loggedMeals];
    const exists = list.some((m) => m.mealId === mealId);
    let updated;
    if (exists) {
      updated = list.filter((m) => m.mealId !== mealId);
    } else {
      updated = [...list, { mealId, loggedAt: new Date().toLocaleTimeString() }];
    }
    updateTodayLog({ loggedMeals: updated });
  };

  const handleAddCustomMeal = (cf: { name: string; calories: number; protein: number; carbs: number; fats: number }) => {
    const updated = [
      ...todayLog.customMeals,
      { ...cf, loggedAt: new Date().toLocaleTimeString() },
    ];
    updateTodayLog({ customMeals: updated });
  };

  const handleLogWorkout = (completed: boolean) => {
    updateTodayLog({ completedWorkout: completed });
  };

  const handleLogWeightChange = (newWeight: number) => {
    // Save in today's logs for target history tracking
    updateTodayLog({ weightAtTime: newWeight });
    // Update onboarding snapshot so BMR formula uses the updated metric
    setOnboarding((prev) => ({ ...prev, weight: newWeight }));
  };

  const handleResetAll = async () => {
    const keySuffix = user ? user.uid : 'guest';
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${keySuffix}`);
    setOnboarding(initialOnboarding);
    setIsOnboarded(false);
    setPlan(null);
    setDailyLogs({});
    setStreak(4);
    setSelectedTab('dashboard');
    setSelectedHurdle('no-hurdle');
    setCyclePhase('none');
    setPcosAwareness(false);
    setPostpartumMode(false);
    setBeginnerMilestones(false);

    if (isFirebaseConfigured && user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          onboarding: initialOnboarding,
          isOnboarded: false,
          plan: null,
          dailyLogs: {},
          streak: 4,
          selectedTab: 'dashboard',
          selectedHurdle: 'no-hurdle',
          cyclePhase: 'none',
          pcosAwareness: false,
          postpartumMode: false,
          beginnerMilestones: false,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'users/' + user.uid);
      }
    }
  };

  // Authentication barrier layer
  const showAuthWall = isFirebaseConfigured && !user;

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" id="session-spinner">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Synchronizing Active Athlete Database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8 flex flex-col justify-between" id="applet-master">
      <main className="flex-1 max-w-7xl w-full mx-auto flex flex-col justify-center">
        
        {showAuthWall ? (
          /* AUTHENTICATION GATE */
          <div className="py-8 flex flex-col items-center">
            <div className="text-center mb-10">
              <span className="font-bold text-slate-800 text-5xl md:text-6xl block leading-tight tracking-tight uppercase mb-2">
                ELITE FITNESS 🏋️
              </span>
              <p className="text-xs uppercase tracking-widest font-semibold text-emerald-600">
                PERSISTENT BIO-METRICAL METABOLIC CALIBRATOR
              </p>
            </div>
            <AuthScreen onSuccess={(authenticatedUser) => setUser(authenticatedUser)} />
          </div>
        ) : !isOnboarded ? (
          /* ONBOARDING FLOW PANEL */
          <div className="py-8">
            <div className="text-center mb-10 flex flex-col items-center">
              <span className="font-bold text-slate-800 text-3xl sm:text-5xl md:text-6xl block leading-tight tracking-tight uppercase mb-2">
                ELITE FITNESS 🏋️
              </span>
              <p className="text-xs uppercase tracking-widest font-semibold text-emerald-600 mb-4 text-center">
                PERSISTENT BIO-METRICAL METABOLIC CALIBRATOR
              </p>
              {isFirebaseConfigured && user && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                  <span>LOGGED IN: {user.email}</span>
                  <button onClick={handleSignOut} className="text-red-600 hover:text-red-700 font-bold ml-1 flex items-center gap-0.5 hover:cursor-pointer underline">
                    (LOG OUT)
                  </button>
                </div>
              )}
            </div>
            
            <AssessmentForm
              onboarding={onboarding}
              onChange={(data) => setOnboarding((prev) => ({ ...prev, ...data }))}
              onSubmit={handleOnboardingSubmit}
              isLoading={isLoading}
            />
          </div>
        ) : (
          /* MAIN ATHLETE INTERFACE PANEL */
          <div className="space-y-6">
            
            {/* Elegant Header with Progress Profile Info */}
            <header className="flex flex-col lg:flex-row items-center justify-between px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800 leading-tight">Elite Fitness Coach</h1>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Personalized Bio-Metrical Calibrator</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6 lg:gap-8 justify-center">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-500 font-medium">Transformation Progress</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 md:w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(100, (streak / 28) * 100)}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">Streak: {streak}d</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-l pl-6 lg:pl-8 border-slate-200">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">Athlete Profile</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate max-w-[150px]" title={user?.email || 'Guest Mode'}>
                      {user?.email || 'Guest Sandbox'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border-2 border-white shadow-sm flex items-center justify-center font-bold text-emerald-700 uppercase">
                    {onboarding.gender ? onboarding.gender[0] : 'A'}
                  </div>
                  {isFirebaseConfigured && user && (
                    <button
                      onClick={handleSignOut}
                      title="Log out from program"
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-red-200 text-red-600 font-bold text-[10px] uppercase hover:bg-red-50 hover:cursor-pointer transition-all ml-2"
                      id="header-sign-out"
                    >
                      <LogOut size={12} />
                      <span className="hidden md:inline">Log Out</span>
                    </button>
                  )}
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Elegant Sidebar Navigation */}
              <div className="lg:col-span-1 space-y-4 flex flex-col justify-start" id="nav-sidebar">
                {/* Micro branding */}
                <div className="border border-slate-200 bg-white p-4 text-center rounded-xl shadow-sm">
                  <h2 className="font-bold text-lg text-slate-800 uppercase tracking-tight">
                    ELITE COACH
                  </h2>
                  <span className="text-[9px] font-bold uppercase text-emerald-600 block tracking-widest mt-1 border-t border-slate-100 pt-1">
                    v2.5 ACTIVE ENGINE
                  </span>
                </div>

                {/* Navigation item array */}
                <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 gap-2 border border-slate-200 bg-white p-2 rounded-xl shadow-sm" id="nav-tabs-dock">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: Trophy },
                    { id: 'my-plan', label: 'My Plan', icon: Dumbbell },
                    { id: 'progress', label: 'Progress', icon: LineChart },
                    { id: 'profile', label: 'Profile', icon: User },
                  ].map((tab) => {
                    const active = selectedTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id as any)}
                        className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 py-2.5 px-4 rounded-lg font-bold uppercase text-xs tracking-wider transition-all select-none hover:cursor-pointer ${
                          active
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon size={14} />
                        <span className="inline-block">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Sidebar bottom visual widget */}
                <div className="hidden lg:block border border-slate-200 bg-emerald-50/50 p-4 rounded-xl shadow-sm text-center">
                  <Flame className="text-orange-500 fill-current mx-auto mb-2 animate-bounce animate-duration-3000" size={24} />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">STREAK LOGS</p>
                  <p className="font-bold text-2xl text-slate-800 mt-1">{streak} DAYS 🔥</p>
                </div>
              </div>

              {/* Primary Tab Outlet Panel */}
              <div className="lg:col-span-4" id="primary-main-outlet">
                {selectedTab === 'dashboard' && plan && (
                  <Dashboard
                    onboarding={onboarding}
                    plan={plan}
                    dailyLog={todayLog}
                    streak={streak}
                    onUpdateWater={handleUpdateWater}
                    onUpdateSteps={handleUpdateSteps}
                    onToggleMeal={handleToggleMeal}
                    onAddCustomMeal={handleAddCustomMeal}
                    onLogWorkoutComplete={handleLogWorkout}
                    onSubmitDailyAdherence={handleAdherenceSubmit}
                    isSubmittingFeedback={isSubmittingFeedback}
                    selectedHurdle={selectedHurdle}
                    setSelectedHurdle={setSelectedHurdle}
                    cyclePhase={cyclePhase}
                    setCyclePhase={setCyclePhase}
                    pcosAwareness={pcosAwareness}
                    setPcosAwareness={setPcosAwareness}
                    postpartumMode={postpartumMode}
                    setPostpartumMode={setPostpartumMode}
                    beginnerMilestones={beginnerMilestones}
                    setBeginnerMilestones={setBeginnerMilestones}
                  />
                )}

                {selectedTab === 'my-plan' && plan && (
                  <MyPlan
                    plan={plan}
                    selectedPlanType={selectedPlanType}
                    onUpdatePlanType={setSelectedPlanType}
                    selectedDay={selectedWorkoutDay}
                    onSelectDay={setSelectedWorkoutDay}
                    selectedHurdle={selectedHurdle}
                    cyclePhase={cyclePhase}
                    pcosAwareness={pcosAwareness}
                    postpartumMode={postpartumMode}
                    beginnerMilestones={beginnerMilestones}
                    gender={onboarding.gender}
                  />
                )}

                {selectedTab === 'progress' && (
                  <Progress
                    onboarding={onboarding}
                    dailyLogs={dailyLogs}
                    onLogWeight={handleLogWeightChange}
                    onLogWater={handleUpdateWater}
                    onLogSteps={handleUpdateSteps}
                    onLogWorkout={handleLogWorkout}
                    plan={plan}
                  />
                )}

                {selectedTab === 'profile' && (
                  <Profile
                    onboarding={onboarding}
                    onUpdateOnboarding={setOnboarding}
                    onRegeneratePlan={handlePlanRegeneration}
                    onResetAll={handleResetAll}
                    isRegenerating={isLoading}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Humble Footer */}
      <footer className="mt-12 text-center text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest border-t border-dashed border-slate-200 pt-4" id="applet-footer">
        ELITE COACH &bull; PERSISTENT CLOUD INTEGRATION &bull; HIGH DENSITY THEME ACTIVE
      </footer>
    </div>
  );
}
