/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OnboardingData, FitnessPlan, DailyLog, Meal } from '../types';
import QuickAccess from './QuickAccess';
import { Sparkles, Check, Flame, ClipboardCheck, Dumbbell, Coffee, Plus, HelpCircle, X, CheckSquare, MessageSquare, ShieldAlert, Heart, Activity } from 'lucide-react';
import { getAdaptedWorkout, getAdaptedCoachAdvice, getAdaptedMeals } from '../lib/engine';

interface DashboardProps {
  onboarding: OnboardingData;
  plan: FitnessPlan;
  dailyLog: DailyLog;
  streak: number;
  onUpdateWater: (liters: number) => void;
  onUpdateSteps: (steps: number) => void;
  onToggleMeal: (mealId: string) => void;
  onAddCustomMeal: (meal: { name: string; calories: number; protein: number; carbs: number; fats: number }) => void;
  onLogWorkoutComplete: (completed: boolean) => void;
  onSubmitDailyAdherence: (data: { feeling: 'Full' | 'Neutral' | 'Hungry'; craving: string; coachNotes: string }) => Promise<void>;
  isSubmittingFeedback: boolean;
  selectedHurdle: string;
  setSelectedHurdle: (h: string) => void;
  cyclePhase: string;
  setCyclePhase: (cp: string) => void;
  pcosAwareness: boolean;
  setPcosAwareness: (b: boolean) => void;
  postpartumMode: boolean;
  setPostpartumMode: (b: boolean) => void;
  beginnerMilestones: boolean;
  setBeginnerMilestones: (b: boolean) => void;
}

export default function Dashboard({
  onboarding,
  plan,
  dailyLog,
  streak,
  onUpdateWater,
  onUpdateSteps,
  onToggleMeal,
  onAddCustomMeal,
  onLogWorkoutComplete,
  onSubmitDailyAdherence,
  isSubmittingFeedback,
  selectedHurdle,
  setSelectedHurdle,
  cyclePhase,
  setCyclePhase,
  pcosAwareness,
  setPcosAwareness,
  postpartumMode,
  setPostpartumMode,
  beginnerMilestones,
  setBeginnerMilestones,
}: DashboardProps) {
  // Modal states
  const [showCustomFoodModal, setShowCustomFoodModal] = React.useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);

  // Custom food inputs
  const [cfName, setCfName] = React.useState('');
  const [cfCal, setCfCal] = React.useState('');
  const [cfProt, setCfProt] = React.useState('');
  const [cfCarbs, setCfCarbs] = React.useState('');
  const [cfFats, setCfFats] = React.useState('');

  // Daily feedback inputs
  const [feeling, setFeeling] = React.useState<'Full' | 'Neutral' | 'Hungry'>('Neutral');
  const [craving, setCraving] = React.useState('');
  const [coachNotes, setCoachNotes] = React.useState('');

  // Setup Adaptor Settings
  const isFemale = onboarding.gender === 'Female';
  const settings = {
    selectedHurdle: isFemale ? selectedHurdle : (selectedHurdle === 'cramps' ? 'no-hurdle' : selectedHurdle),
    cyclePhase: isFemale ? cyclePhase : 'none',
    pcosAwareness: isFemale ? pcosAwareness : false,
    postpartumMode: isFemale ? postpartumMode : false,
    beginnerMilestones,
  };

  // Track today's day of week to highlight exercise
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];
  const todayWorkout = plan.workoutPlan.find(w => w.day.toLowerCase() === todayName.toLowerCase()) || plan.workoutPlan[0];

  // Derive dynamic adapted configurations
  const currentWorkout = getAdaptedWorkout(todayWorkout, settings);
  const currentMeals = getAdaptedMeals(plan.meals, settings);
  const activeCoachNote = getAdaptedCoachAdvice(settings, dailyLog.coachFeedback || plan.coachNote);

  // Calculations based on dynamically adapted plans
  const loggedMealsList = dailyLog.loggedMeals.map(lm => currentMeals.find(m => m.id === lm.mealId)).filter(Boolean) as Meal[];
  const mealCalories = loggedMealsList.reduce((acc, current) => acc + current.calories, 0);
  const customMealCalories = dailyLog.customMeals.reduce((acc, curr) => acc + curr.calories, 0);
  const totalCaloriesIntake = mealCalories + customMealCalories;
  const remainingCaloriesBudget = Math.max(0, plan.calories - totalCaloriesIntake);

  const mealProtein = loggedMealsList.reduce((acc, current) => acc + current.protein, 0);
  const customMealProtein = dailyLog.customMeals.reduce((acc, curr) => acc + curr.protein, 0);
  const currentProtein = mealProtein + customMealProtein;

  const mealCarbs = loggedMealsList.reduce((acc, current) => acc + current.carbs, 0);
  const customMealCarbs = dailyLog.customMeals.reduce((acc, curr) => acc + curr.carbs, 0);
  const currentCarbs = mealCarbs + customMealCarbs;

  const mealFats = loggedMealsList.reduce((acc, current) => acc + current.fats, 0);
  const customMealFats = dailyLog.customMeals.reduce((acc, curr) => acc + curr.fats, 0);
  const currentFats = mealFats + customMealFats;

  const handleCustomFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfName) return;
    onAddCustomMeal({
      name: cfName,
      calories: parseInt(cfCal, 10) || 0,
      protein: parseInt(cfProt, 10) || 0,
      carbs: parseInt(cfCarbs, 10) || 0,
      fats: parseInt(cfFats, 10) || 0,
    });
    // Reset
    setCfName('');
    setCfCal('');
    setCfProt('');
    setCfCarbs('');
    setCfFats('');
    setShowCustomFoodModal(false);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitDailyAdherence({
      feeling,
      craving,
      coachNotes,
    });
    setShowFeedbackModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-tab-view">
      {/* 2. HEADER CONTAINER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 md:p-8 border border-slate-800 rounded-xl shadow-sm relative overflow-hidden" id="dashboard-header-block">
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-12 translate-y-6">
          <Sparkles size={220} className="text-emerald-500 animate-pulse" />
        </div>
        <div className="space-y-1 z-10">
          <p className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
            JAI HIND • ELITE REVOLUTION
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">
            Namaste, Athlete! 👋
          </h1>
          <p className="font-mono text-xs text-slate-400 font-bold uppercase">
            ACTIVE PORT: 3000 • SYSTEM CALIBRATED
          </p>
        </div>
        
        {/* Streak element */}
        <div className="flex items-center gap-3 bg-slate-850 border border-slate-750 px-4 py-2.5 rounded-lg text-white z-10" id="adherence-streak-badge">
          <Flame size={24} className="text-orange-500 animate-bounce fill-current" />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-none block">STREAK LOG</span>
            <span className="font-bold text-lg leading-none">{streak} DAYS MET 🔥</span>
          </div>
        </div>
      </div>

      {/* 3. COACH ADVICE BANNER */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative flex flex-col md:flex-row gap-5 items-start" id="coach-active-advice-card">
        <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shrink-0">
          <MessageSquare size={24} className="text-emerald-600" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded">
              AI Coach Feedback Live
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              STATUS: STABLE
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-800">
            Active Coaching Instructions
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-3.5 rounded-xl font-medium italic">
            "{activeCoachNote}"
          </p>
        </div>
      </div>

          {/* ADAPTIVE COACH CONTROL CENTER (BENTO GRID) */}
      <div className={`grid grid-cols-1 ${isFemale ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`} id="adaptive-coach-control-center">
        {/* Left Col: Daily Life Hurdle Simulator */}
        <div className={`${isFemale ? 'lg:col-span-2' : 'lg:col-span-1'} bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between`} id="daily-hurdle-simulator-card">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-50 text-amber-700 px-2.5 py-1 rounded border border-amber-200">
                AI Adaptive Engine
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                TRIGGER: REAL-TIME OVERRIDES
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
              🧠 Real-Life Hurdle Simulator
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed uppercase mt-1 mb-4 font-semibold">
              Adherence slips due to hurdles, not motivation. Select a hurdle below to see how our AI instantly adapts your workout and nutrition to guarantee zero-guilt consistency!
            </p>

            {/* Badges Flow */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5" id="hurdles-badges-deck">
              {[
                { id: 'no-hurdle', label: '🌟 No Hurdle (Ideal Day)', theme: 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white shadow-sm', activeTheme: 'bg-slate-900 border-slate-900 text-white shadow-sm ring-1 ring-slate-900' },
                { id: 'exhausted', label: '🌙 Late Shift / Weary', theme: 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white shadow-sm', activeTheme: 'bg-violet-600 border-violet-600 text-white shadow-sm ring-1 ring-violet-600' },
                { id: 'soreness', label: '💪 Joint Soreness', theme: 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white shadow-sm', activeTheme: 'bg-amber-600 border-amber-600 text-white shadow-sm ring-1 ring-amber-600' },
                { id: 'shaadi', label: "🍛 Cousin's Shaadi", theme: 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white shadow-sm', activeTheme: 'bg-orange-600 border-orange-600 text-white shadow-sm ring-1 ring-orange-600' },
                { id: 'cramps', label: '🩸 Menstrual Cramps', theme: 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white shadow-sm', activeTheme: 'bg-rose-600 border-rose-600 text-white shadow-sm ring-1 ring-rose-600' },
                { id: 'fever', label: '🤒 Cold & Mild Fever', theme: 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white shadow-sm', activeTheme: 'bg-red-600 border-red-600 text-white shadow-sm ring-1 ring-red-600' }
              ].filter(badge => isFemale || badge.id !== 'cramps').map((badge) => {
                const isActive = selectedHurdle === badge.id;
                
                const handleSelect = () => {
                  setSelectedHurdle(badge.id);
                  if (badge.id === 'cramps') {
                    setCyclePhase('menstrual');
                  } else if (badge.id === 'no-hurdle') {
                    setCyclePhase('none');
                  }
                };

                return (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={handleSelect}
                    className={`p-3 border text-xs font-bold uppercase rounded-lg transition-all text-center flex items-center justify-center min-h-[50px] leading-tight hover:cursor-pointer ${
                      isActive ? badge.activeTheme : badge.theme
                    }`}
                  >
                    {badge.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active hurdle confirmation banner */}
          <div className="mt-4 border-t border-dashed border-slate-150 pt-3 flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-400 uppercase">ACTIVE ADAPTATION OVERLAY:</span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-750 font-bold uppercase" id="selected-hurdle-badge">
              {selectedHurdle === 'no-hurdle' ? '🟢 IDEAL DAY ACTIVE - STANDARDS DEPLOYED' : `⚠️ HURDLES OVERRIDE: ${selectedHurdle.toUpperCase()} ACTIVE`}
            </span>
          </div>
        </div>

        {/* Right Col: Special Population Engines */}
        {isFemale && (
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between" id="special-populations-calibrator-card">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-sky-50 text-sky-700 px-2.5 py-1 rounded border border-sky-200">
                  Special Populations
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                  ENGINES ACTIVE
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                🧬 Special Engines
              </h3>
              <p className="text-xs text-slate-400 leading-normal uppercase mt-1 mb-4 font-semibold">
                Physiological profiling boundaries to support safe transformation. Enable as needed.
              </p>

              <div className="space-y-3">
                {/* PCOS & Symptoms toggle */}
                <div className="flex items-center justify-between border border-slate-100 bg-slate-50/50 p-2 text-xs rounded-lg">
                  <div className="max-w-[190px]">
                    <p className="font-bold text-slate-800 uppercase">Symptom / PCOS Support</p>
                    <p className="text-[9px] text-slate-400 uppercase leading-tight mt-0.5">Insulin sensitivity & cortisol protection advice.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPcosAwareness(!pcosAwareness)}
                    className={`w-12 h-6 rounded-full p-0.5 transition-all flex items-center ${pcosAwareness ? 'bg-emerald-600 justify-end' : 'bg-slate-200 justify-start'} hover:cursor-pointer`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {/* Cycle syncing selector */}
                <div className="border border-slate-100 bg-slate-50/50 p-2.5 text-xs rounded-lg space-y-1.5">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-slate-800 uppercase">Cycle-Synced Planner</p>
                    <span className="font-bold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-[8px] uppercase">
                      WOMEN_SYNC
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'menstrual', label: 'Men' },
                      { id: 'follicular', label: 'Fol' },
                      { id: 'luteal', label: 'Lut' }
                    ].map((phase) => (
                      <button
                        key={phase.id}
                        type="button"
                        onClick={() => {
                          setCyclePhase(phase.id);
                          if (phase.id === 'menstrual') {
                            setSelectedHurdle('cramps');
                          } else if (selectedHurdle === 'cramps') {
                            setSelectedHurdle('no-hurdle');
                          }
                        }}
                        className={`py-1 text-[9px] font-bold uppercase rounded text-center transition-all hover:cursor-pointer ${
                          cyclePhase === phase.id
                            ? 'bg-rose-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {phase.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Postpartum core support */}
                <div className="flex items-center justify-between border border-slate-100 bg-slate-50/50 p-2 text-xs rounded-lg">
                  <div className="max-w-[190px]">
                    <p className="font-bold text-slate-800 uppercase">Postpartum core focus</p>
                    <p className="text-[9px] text-slate-400 uppercase leading-tight mt-0.5">Core binding focus, avoids diastasis risk.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPostpartumMode(!postpartumMode)}
                    className={`w-12 h-6 rounded-full p-0.5 transition-all flex items-center ${postpartumMode ? 'bg-emerald-600 justify-end' : 'bg-slate-200 justify-start'} hover:cursor-pointer`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {/* Absolute beginners checklist switcher */}
                <div className="flex items-center justify-between border border-slate-100 bg-slate-50/50 p-2 text-xs rounded-lg">
                  <div className="max-w-[190px]">
                    <p className="font-bold text-slate-800 uppercase">Beginners Milestones</p>
                    <p className="text-[9px] text-slate-400 uppercase leading-tight mt-0.5">1-set simple limits & easy cues active.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBeginnerMilestones(!beginnerMilestones)}
                    className={`w-12 h-6 rounded-full p-0.5 transition-all flex items-center ${beginnerMilestones ? 'bg-emerald-600 justify-end' : 'bg-slate-200 justify-start'} hover:cursor-pointer`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick stats grid */}
      <QuickAccess 
        waterLiters={dailyLog.waterIntake}
        stepsCount={dailyLog.steps}
        onUpdateWater={onUpdateWater}
        onUpdateSteps={onUpdateSteps}
      />

      {/* 4. CALORIC BUDGET remaining meter */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm" id="caloric-budget-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-600">NUTRITIONAL ENVELOPE</span>
            <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-800">CALORIC BUDGET</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900" id="budget-remaining">
              {remainingCaloriesBudget}
            </p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Kcal Remaining</p>
          </div>
        </div>

        {/* Triple micro meter bars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Main calorie progress radial emulation */}
          <div className="border border-slate-200 bg-slate-50/50 p-4 text-center rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-500">CONSUMED</p>
            <p className="text-2xl font-black text-rose-600 my-1">{totalCaloriesIntake} Kcal</p>
            <p className="text-xs font-semibold text-slate-400">of {plan.calories} kcal</p>
          </div>

          <div className="md:col-span-3 space-y-4">
            {/* Protein Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold uppercase mb-1 text-slate-600">
                <span>PROTEIN (TARGET: {plan.protein}g)</span>
                <span>{currentProtein}g / {plan.protein}g</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (currentProtein / plan.protein) * 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold uppercase mb-1 text-slate-600">
                <span>CARBS (TARGET: {plan.carbs}g)</span>
                <span>{currentCarbs}g / {plan.carbs}g</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (currentCarbs / plan.carbs) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fats Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold uppercase mb-1 text-slate-600">
                <span>FATS (TARGET: {plan.fats}g)</span>
                <span>{currentFats}g / {plan.fats}g</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className="bg-sky-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (currentFats / plan.fats) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Split section: Workout of the Day vs Meals checkmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Workout of the day block */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between" id="workout-highlight-block">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider block">TODAY'S SPLIT ({todayName})</span>
                <h3 className="text-xl font-bold uppercase tracking-tight text-slate-800">
                  {currentWorkout.name}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Dumbbell size={20} className="text-emerald-600" />
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-500 uppercase mb-4 leading-relaxed">
              Focus: {currentWorkout.focus}. {currentWorkout.description}
            </p>

            <div className="space-y-3" id="today-exercises-preview-container">
              {currentWorkout.exercises.map((ex, index) => (
                <div key={index} className="flex gap-4 border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 hover:border-slate-200 rounded-lg transition-all">
                  {ex.image && (
                    <img
                      referrerPolicy="no-referrer"
                      src={ex.image}
                      alt={ex.name}
                      className="w-12 h-12 object-cover rounded-md border border-slate-200 bg-white shrink-0"
                    />
                  )}
                  <div>
                    <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded px-1.5 py-0.5 select-none mr-2">
                      EX {index + 1}
                    </span>
                    <p className="text-sm font-bold uppercase inline-block text-slate-850">{ex.name}</p>
                    <p className="text-xs font-mono font-semibold text-emerald-600 uppercase mt-1">
                      Sets: {ex.sets} &bull; Reps: {ex.reps}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-dashed border-slate-200 pt-5 flex flex-col sm:flex-row gap-3" id="workout-dashboard-actions">
            {!dailyLog.completedWorkout ? (
              <button
                type="button"
                onClick={() => onLogWorkoutComplete(true)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all shadow-sm hover:cursor-pointer"
                id="workout-done-dashboard-btn"
              >
                ✓ LOG WORKOUT FINISHED
              </button>
            ) : (
              <div className="flex-1 py-3 bg-emerald-50 text-emerald-700 text-center font-bold text-xs rounded-lg uppercase tracking-wider border border-emerald-100" id="workout-completed-state">
                ✓ WORKOUT REGISTERED!
              </div>
            )}
            
            <button
              onClick={() => setShowFeedbackModal(true)}
              disabled={dailyLog.feedbackSubmitted}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all disabled:opacity-40 hover:cursor-pointer"
              id="coach-checkin-btn"
            >
              COACH CHECK-IN
            </button>
          </div>
        </div>

        {/* Indian Diet checkmarks */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm flex flex-col justify-between" id="nutrition-adherence-block">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">TODAY'S FUEL DECK</span>
                <h3 className="text-xl font-bold uppercase tracking-tight text-slate-800">DAILY MEALS</h3>
              </div>
              <button
                onClick={() => setShowCustomFoodModal(true)}
                className="h-9 px-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all hover:cursor-pointer"
                id="add-custom-food-dashboard-btn"
              >
                + ADD FOOD
              </button>
            </div>

            {/* List of food items */}
            <div className="space-y-3" id="dashboard-meals-container">
              {currentMeals.map((meal) => {
                const isChecked = dailyLog.loggedMeals.some(lm => lm.mealId === meal.id);
                return (
                  <div 
                    key={meal.id} 
                    onClick={() => onToggleMeal(meal.id)}
                    className={`flex items-center justify-between gap-4 p-3 border rounded-lg cursor-pointer transition-all ${
                      isChecked 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                        : 'bg-white border-slate-150 hover:bg-slate-50/80 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'
                      }`}>
                        {isChecked && <Check size={12} className="stroke-[3]" />}
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-850 rounded px-2 py-0.5 mr-2">
                          {meal.type}
                        </span>
                        <p className="text-sm font-bold uppercase text-slate-800 inline-block">
                          {meal.name}
                        </p>
                        <p className="text-xs text-slate-500 uppercase mt-1 block">
                          {meal.calories} kcal &bull; P: {meal.protein}g C: {meal.carbs}g F: {meal.fats}g
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Custom registered foods list */}
              {dailyLog.customMeals.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 p-3 border border-orange-200 bg-orange-50/50 rounded-lg">
                  <div className="flex gap-4 items-center">
                    <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                      <Plus size={12} className="stroke-[3]" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase bg-orange-200 text-orange-950 rounded px-1.5 py-0.5 mr-2">
                        Custom
                      </span>
                      <p className="text-sm font-bold uppercase text-orange-950 inline-block">
                        {m.name}
                      </p>
                      <p className="text-xs text-orange-800 uppercase mt-0.5 block">
                        {m.calories} kcal &bull; P: {m.protein}g C: {m.carbs}g F: {m.fats}g
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight text-center">
              * Click the cards above to log meal intake instantly. Remembers macros in total budget!
            </p>
          </div>
        </div>

      </div>


      {/* A. MODAL: ADD CUSTOM FOOD */}
      {showCustomFoodModal && (
        <div className="fixed inset-0 bg-brand-primary/50 flex items-center justify-center p-4 z-50 animate-fade-in" id="custom-food-modal">
          <div className="absolute inset-0" onClick={() => setShowCustomFoodModal(false)} />
          <div className="bg-brand-card border-4 border-brand-primary p-6 md:p-8 w-full max-w-md relative z-10 neo-shadow">
            <button 
              onClick={() => setShowCustomFoodModal(false)} 
              className="absolute right-4 top-4 w-8 h-8 border-2 border-brand-primary hover:bg-brand-background flex items-center justify-center neo-border-sm"
              id="close-custom-food-modal"
            >
              <X size={16} />
            </button>

            <h3 className="font-display text-2xl font-black uppercase tracking-tight text-brand-primary mb-6">
              LOG CUSTOM MEAL
            </h3>

            <form onSubmit={handleCustomFoodSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black tracking-wider block mb-1">FOOD NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spiced Chana Salad"
                  value={cfName}
                  onChange={(e) => setCfName(e.target.value)}
                  className="w-full h-10 px-3 bg-white border-2 border-brand-primary font-display font-bold text-sm outline-none placeholder:text-gray-400 focus:bg-brand-background"
                  id="custom-food-name-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black tracking-wider block mb-1">CALORIES (KCAL)</label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={cfCal}
                    onChange={(e) => setCfCal(e.target.value)}
                    className="w-full h-10 px-3 bg-white border-2 border-brand-primary font-display font-bold text-sm outline-none placeholder:text-gray-400 focus:bg-brand-background"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black tracking-wider block mb-1">PROTEIN (GRAMS)</label>
                  <input
                    type="number"
                    placeholder="g"
                    value={cfProt}
                    onChange={(e) => setCfProt(e.target.value)}
                    className="w-full h-10 px-3 bg-white border-2 border-brand-primary font-display font-bold text-sm outline-none placeholder:text-gray-400 focus:bg-brand-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black tracking-wider block mb-1">CARBS (GRAMS)</label>
                  <input
                    type="number"
                    placeholder="g"
                    value={cfCarbs}
                    onChange={(e) => setCfCarbs(e.target.value)}
                    className="w-full h-10 px-3 bg-white border-2 border-brand-primary font-display font-bold text-sm outline-none placeholder:text-gray-400 focus:bg-brand-background"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black tracking-wider block mb-1">FATS (GRAMS)</label>
                  <input
                    type="number"
                    placeholder="g"
                    value={cfFats}
                    onChange={(e) => setCfFats(e.target.value)}
                    className="w-full h-10 px-3 bg-white border-2 border-brand-primary font-display font-bold text-sm outline-none placeholder:text-gray-400 focus:bg-brand-background"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 border-4 border-brand-primary bg-brand-primary text-white font-display font-black text-sm uppercase tracking-wider transition-all hover:bg-black active:translate-x-[2px] active:translate-y-[2px]"
                id="submit-custom-food-btn"
              >
                ✓ LOG CALORIES
              </button>
            </form>
          </div>
        </div>
      )}

      {/* B. MODAL: COACH CHECK-IN (ADHERENCE & FEELINGS) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-brand-primary/50 flex items-center justify-center p-4 z-50 animate-fade-in" id="coach-feedback-modal">
          <div className="absolute inset-0" onClick={() => setShowFeedbackModal(false)} />
          <div className="bg-brand-card border-4 border-brand-primary p-6 md:p-8 w-full max-w-lg relative z-10 neo-shadow">
            <button 
              onClick={() => setShowFeedbackModal(false)} 
              className="absolute right-4 top-4 w-8 h-8 border-2 border-brand-primary hover:bg-brand-background flex items-center justify-center neo-border-sm"
              id="close-feedback-modal"
            >
              <X size={16} />
            </button>

            <span className="text-[10px] uppercase font-black tracking-widest text-brand-accent-blue block mb-1">COACH COMPLIANCE REPORT</span>
            <h3 className="font-display text-2xl font-black uppercase tracking-tight text-brand-primary mb-6">
              DAILY COACH SESSION CHECK-IN
            </h3>

            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              {/* Feel hunger tracker */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-brand-primary block">
                  Dietary Feeling Today
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Full', 'Neutral', 'Hungry'] as const).map((feel) => (
                    <button
                      key={feel}
                      type="button"
                      onClick={() => setFeeling(feel)}
                      className={`py-3 border-2 border-brand-primary font-display font-black text-xs uppercase transition-all ${
                        feeling === feel
                          ? 'bg-brand-accent neo-shadow-active translate-x-[1px] translate-y-[1px]'
                          : 'bg-white text-brand-primary hover:bg-brand-background'
                      }`}
                    >
                      {feel === 'Full' ? '😋 Full' : feel === 'Neutral' ? '😐 Neutral' : '🥱 Hungry'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Craving checklist */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-brand-primary block mb-2">
                  Cravings Experienced
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sweet Jalebis, Masala tea, Salty chips, or None"
                  value={craving}
                  onChange={(e) => setCraving(e.target.value)}
                  className="w-full h-10 px-3 bg-white border-2 border-brand-primary font-display font-bold text-sm outline-none placeholder:text-gray-400 focus:bg-brand-background"
                  id="craving-input-box"
                />
              </div>

              {/* Notes containing feedback details */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-brand-primary block mb-2">
                  Soreness, Discomfort or Coach Comments
                </label>
                <textarea
                  placeholder="Let your Elite Coach know any knee discomfort, tiredness, high energy, or general progress details..."
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  className="w-full h-24 p-3 bg-white border-2 border-brand-primary font-display font-bold text-sm outline-none resize-none placeholder:text-gray-400 focus:bg-brand-background"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingFeedback}
                className="w-full h-14 border-4 border-brand-primary bg-brand-accent-blue text-white font-display font-black text-base uppercase tracking-wider transition-all neo-shadow active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-40"
                id="submit-adherence-btn"
              >
                {isSubmittingFeedback ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚙</span> ANALYZING PERFORMANCE...
                  </span>
                ) : (
                  "✓ TRANSMIT TO AI COACH"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
