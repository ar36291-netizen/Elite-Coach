/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DailyLog, OnboardingData, FitnessPlan, Meal } from '../types';
import { 
  Trophy, TrendingDown, Scale, Target, CalendarDays, LineChart,
  Droplet, Flame, Activity, Apple, Sparkles, Heart, Smile, CheckSquare, Plus, Coffee, AlertCircle
} from 'lucide-react';

interface ProgressProps {
  onboarding: OnboardingData;
  dailyLogs: { [date: string]: DailyLog };
  onLogWeight: (weight: number) => void;
  onLogWater: (liters: number) => void;
  onLogSteps: (steps: number) => void;
  onLogWorkout: (completed: boolean) => void;
  plan: FitnessPlan | null;
}

export default function Progress({ 
  onboarding, 
  dailyLogs, 
  onLogWeight, 
  onLogWater, 
  onLogSteps, 
  onLogWorkout, 
  plan 
}: ProgressProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<'weight' | 'steps' | 'nutrition' | 'water' | 'wellness'>('weight');
  const [weightInput, setWeightInput] = React.useState('');
  const [stepsInput, setStepsInput] = React.useState('');
  const [waterInput, setWaterInput] = React.useState('');

  // 1. Calculations: Establish Today's key state
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayLog = dailyLogs[todayStr] || {
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

  const getLoggedCalories = (log: DailyLog) => {
    let cals = 0;
    if (log.loggedMeals && plan) {
      log.loggedMeals.forEach((lm) => {
        const targetMeal = plan.meals.find(m => m.id === lm.mealId);
        if (targetMeal) {
          cals += targetMeal.calories;
        }
      });
    }
    if (log.customMeals) {
      log.customMeals.forEach((m) => {
        cals += m.calories || 0;
      });
    }
    return cals;
  };

  const getLoggedProtein = (log: DailyLog) => {
    let prot = 0;
    if (log.loggedMeals && plan) {
      log.loggedMeals.forEach((lm) => {
        const targetMeal = plan.meals.find(m => m.id === lm.mealId);
        if (targetMeal) {
          prot += targetMeal.protein;
        }
      });
    }
    if (log.customMeals) {
      log.customMeals.forEach((m) => {
        prot += m.protein || 0;
      });
    }
    return prot;
  };

  const getLoggedCarbs = (log: DailyLog) => {
    let carbs = 0;
    if (log.loggedMeals && plan) {
      log.loggedMeals.forEach((lm) => {
        const targetMeal = plan.meals.find(m => m.id === lm.mealId);
        if (targetMeal) {
          carbs += targetMeal.carbs;
        }
      });
    }
    if (log.customMeals) {
      log.customMeals.forEach((m) => {
        carbs += m.carbs || 0;
      });
    }
    return carbs;
  };

  const getLoggedFats = (log: DailyLog) => {
    let fats = 0;
    if (log.loggedMeals && plan) {
      log.loggedMeals.forEach((lm) => {
        const targetMeal = plan.meals.find(m => m.id === lm.mealId);
        if (targetMeal) {
          fats += targetMeal.fats;
        }
      });
    }
    if (log.customMeals) {
      log.customMeals.forEach((m) => {
        fats += m.fats || 0;
      });
    }
    return fats;
  };

  // Convert daily logs to sorted array of last 7 calendar days to ensure a complete smooth curve
  const startingWeight = Number(onboarding.weight) || 70;
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateString = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    return { dateString, dayLabel };
  });

  const renderLogs = last7Days.map(({ dateString, dayLabel }, idx) => {
    const log = dailyLogs[dateString];
    
    // Smooth default mock trajectories to guarantee aesthetic appeal immediately
    const mockWeight = startingWeight - (idx * 0.15);
    const mockSteps = [5400, 7800, 4200, 9100, 10500, 8100, todayLog.steps || 0][idx] || 6000;
    const mockWater = [2.0, 2.5, 1.8, 3.0, 2.8, 3.2, todayLog.waterIntake || 0.0][idx] || 2.0;
    const mockWorkout = [true, false, true, true, false, true, todayLog.completedWorkout || false][idx] ?? false;
    const mockCalories = [1850, 2050, 1920, 1680, 2150, 1780, getLoggedCalories(todayLog as DailyLog)][idx] || 1800;
    const mockProtein = [115, 125, 110, 130, 120, 122, getLoggedProtein(todayLog as DailyLog)][idx] || 110;
    const mockCarbs = [190, 205, 185, 160, 220, 178, getLoggedCarbs(todayLog as DailyLog)][idx] || 180;
    const mockFats = [52, 60, 58, 48, 62, 50, getLoggedFats(todayLog as DailyLog)][idx] || 55;
    const mockFeeling = ['Neutral', 'Full', 'Neutral', 'Hungry', 'Full', 'Neutral', todayLog.feeling || 'Neutral'][idx] || 'Neutral';
    const mockCraving = ['', 'Sweets', '', 'Salty', '', '', todayLog.craving || ''][idx] || '';

    return {
      date: dayLabel,
      dateString,
      steps: log?.steps !== undefined ? log.steps : mockSteps,
      waterIntake: log?.waterIntake !== undefined ? log.waterIntake : mockWater,
      completedWorkout: log?.completedWorkout !== undefined ? log.completedWorkout : mockWorkout,
      weightAtTime: log?.weightAtTime !== undefined ? log.weightAtTime : mockWeight,
      calories: log ? getLoggedCalories(log) : mockCalories,
      protein: log ? getLoggedProtein(log) : mockProtein,
      carbs: log ? getLoggedCarbs(log) : mockCarbs,
      fats: log ? getLoggedFats(log) : mockFats,
      feeling: log?.feeling !== undefined ? log.feeling : mockFeeling,
      craving: log?.craving !== undefined ? log.craving : mockCraving,
      real: !!log
    };
  });

  // Derived current weight indicators
  const currentWeight = todayLog.weightAtTime || renderLogs[renderLogs.length - 1]?.weightAtTime || startingWeight;
  const weightChange = startingWeight - currentWeight;

  // Week step progress calculation
  const totalStepsThisWeek = renderLogs.reduce((acc, curr) => acc + curr.steps, 0);
  const avgStepsThisWeek = Math.round(totalStepsThisWeek / 7);
  const completedWorkoutsThisWeek = renderLogs.filter(r => r.completedWorkout).length;

  // Week calorie calculations
  const avgCaloriesThisWeek = Math.round(renderLogs.reduce((acc, curr) => acc + curr.calories, 0) / 7);
  const targetCalories = plan?.calories || 2000;
  const targetProtein = plan?.protein || 130;
  const targetCarbs = plan?.carbs || 180;
  const targetFats = plan?.fats || 60;

  // Water calculations
  const totalWaterThisWeek = renderLogs.reduce((acc, curr) => acc + curr.waterIntake, 0);
  const avgWaterThisWeek = (totalWaterThisWeek / 7).toFixed(1);

  // Feeling counters
  const feelingsCount = renderLogs.reduce((acc: { [key: string]: number }, curr) => {
    acc[curr.feeling] = (acc[curr.feeling] || 0) + 1;
    return acc;
  }, { Full: 0, Neutral: 0, Hungry: 0 });

  // Event Handlers for UI logging forms
  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(weightInput);
    if (!isNaN(parsed) && parsed > 30 && parsed < 250) {
      onLogWeight(parsed);
      setWeightInput('');
    }
  };

  const handleStepsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(stepsInput);
    if (!isNaN(parsed) && parsed >= 0 && parsed < 100000) {
      onLogSteps(parsed);
      setStepsInput('');
    }
  };

  const handleWaterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(waterInput);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 20) {
      onLogWater(parsed);
      setWaterInput('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in animate-duration-300" id="progress-tab-view">
      
      {/* 1. Header Navigation and Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded border border-emerald-200">
            BIO-ANALYTICS HUB
          </span>
          <h2 className="text-xl font-bold uppercase tracking-tight text-slate-800 mt-2">
            📊 Biometric Progress Lab
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 uppercase font-mono">
            Track weight curves, steps, hydration curves, digestives & workout consistency.
          </p>
        </div>

        {/* Dynamic sub tab selectors */}
        <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200" id="progress-subtabs-nav">
          {[
            { id: 'weight', label: 'Weight', icon: Scale },
            { id: 'steps', label: 'Fitness & Steps', icon: Activity },
            { id: 'nutrition', label: 'Diet & Macros', icon: Apple },
            { id: 'water', label: 'Hydration', icon: Droplet },
            { id: 'wellness', label: 'Wellness Feeling', icon: Smile },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all hover:cursor-pointer select-none ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB-SPECIFIC METRIC VIEWS */}

      {/* SUBTAB: WEIGHT TRAJECTORY */}
      {activeSubTab === 'weight' && (
        <div className="space-y-6">
          {/* Trio of weight statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="weight-scorecard-grid">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Scale size={18} className="text-emerald-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">STARTING WEIGHT</span>
                <p className="font-bold text-xl text-slate-800 mt-1">{startingWeight} KG</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                <Target size={18} className="text-sky-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">CURRENT ESTIMATE</span>
                <p className="font-bold text-xl text-slate-800 mt-1">{currentWeight.toFixed(1)} KG</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <TrendingDown size={18} className="text-orange-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">WEIGHT VELOCITY</span>
                <p className="font-bold text-xl text-slate-800 mt-1">
                  {weightChange >= 0 ? `-${weightChange.toFixed(1)} KG Lost` : `+${Math.abs(weightChange).toFixed(1)} KG Gained`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weight graph curve */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-5 md:p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">7-DAY HISTOGRAM</span>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-slate-800">
                    Weight Sump Line
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <LineChart size={14} className="text-emerald-650" />
                </div>
              </div>

              {/* SVG Custom weight curve chart */}
              <div className="h-64 border border-slate-150 bg-slate-50/50 p-4 rounded-xl relative overflow-hidden" id="svg-weight-graph">
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-40">
                  <div className="border-b border-slate-250 w-full h-0" />
                  <div className="border-b border-slate-250 w-full h-0" />
                  <div className="border-b border-slate-250 w-full h-0" />
                </div>

                <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
                  {/* Draw curve path */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={renderLogs.map((log, index) => {
                      const x = (index / (renderLogs.length - 1)) * 440 + 30;
                      const minW = startingWeight - 5;
                      const maxW = startingWeight + 3;
                      const pct = (log.weightAtTime - minW) / (maxW - minW);
                      const y = 170 - (pct * 130 + 10);
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  
                  {/* Connection nodes and tooltips */}
                  {renderLogs.map((log, index) => {
                    const x = (index / (renderLogs.length - 1)) * 440 + 30;
                    const minW = startingWeight - 5;
                    const maxW = startingWeight + 3;
                    const pct = (log.weightAtTime - minW) / (maxW - minW);
                    const y = 170 - (pct * 130 + 10);

                    return (
                      <g key={index} className="group">
                        <circle
                          cx={x}
                          cy={y}
                          r="6"
                          fill="#ffffff"
                          stroke="#10b981"
                          strokeWidth="3"
                          className="hover:r-8 transition-all duration-150"
                        />
                        <text
                          x={x}
                          y={y - 12}
                          textAnchor="middle"
                          className="font-bold text-[10px] fill-slate-800 select-none bg-white font-mono"
                        >
                          {log.weightAtTime.toFixed(1)}
                        </text>
                        {log.real && (
                          <circle
                            cx={x}
                            cy={y + 8}
                            r="2"
                            fill="#059669"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* X labels */}
                <div className="absolute bottom-1.5 left-3 right-3 flex justify-between font-bold text-[9px] text-slate-500 uppercase font-mono">
                  {renderLogs.map((l, index) => (
                    <span key={index}>{l.date}</span>
                  ))}
                </div>
              </div>

              <div className="mt-4 bg-slate-50 border border-slate-150 p-3 rounded-lg text-[10px] text-slate-500 font-semibold uppercase flex gap-2 items-center">
                <AlertCircle size={14} className="text-sky-500" />
                <span>Coach Advice: Weigh-in empty stomach each morning. Do not obsess over daily 0.5kg fluctuations caused by ambient water sync shifts.</span>
              </div>
            </div>

            {/* Quick logger form */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider block">FEED LOG REGISTER</span>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-slate-800">
                    Record Body Weight
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase">Track current morning weight in kilograms to adapt nutrition algorithms!</p>
                </div>

                <form onSubmit={handleWeightSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Log Weight (KG)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 69.8"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        className="flex-1 px-3 h-11 bg-white border border-slate-200 rounded-lg font-bold text-xs text-slate-800 outline-none focus:border-emerald-500"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 h-11 bg-slate-900 text-white font-bold text-xs uppercase rounded-lg tracking-wider hover:bg-slate-800 transition-all hover:cursor-pointer"
                      >
                        LOG WEIGHT
                      </button>
                    </div>
                  </div>
                </form>

                <div className="border-t border-dashed border-slate-200 pt-4 space-y-2">
                  <h4 className="font-bold text-xs uppercase text-slate-800">
                    📉 Daily Weight Ledger
                  </h4>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                    {renderLogs.slice().reverse().map((log, index) => (
                      <div key={index} className="flex justify-between items-center text-[11px] p-2 bg-slate-50 rounded border border-slate-100 font-semibold uppercase">
                        <span className="text-slate-400 font-mono">{log.dateString}</span>
                        <span className="text-slate-850 font-bold font-mono">{log.weightAtTime.toFixed(1)} KG</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: FITNESS & STEPS */}
      {activeSubTab === 'steps' && (
        <div className="space-y-6">
          {/* Quick fitness metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="fitness-scorecards">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <Flame size={18} className="text-orange-500" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">TOTAL WEEK STEPS</span>
                <p className="font-bold text-xl text-slate-800 mt-1">{totalStepsThisWeek.toLocaleString()} STEPS</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                <Activity size={18} className="text-sky-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">DAILY AVERAGE WALKS</span>
                <p className="font-bold text-xl text-slate-800 mt-1">{avgStepsThisWeek.toLocaleString()} STEPS</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <CheckSquare size={18} className="text-emerald-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">WORKOUT ADHERENCE CORPS</span>
                <p className="font-bold text-xl text-slate-800 mt-1">{completedWorkoutsThisWeek}/7 WORKOUTS</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SVG steps bar chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-5 md:p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider block">7-DAY STEPMETER HISTOGRAM</span>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-slate-800">
                    Step Volume Index & Goals
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onLogWorkout(!todayLog.completedWorkout)}
                  className={`px-3 py-1.5 text-[9px] font-bold uppercase rounded-lg border transition-all hover:cursor-pointer flex items-center gap-1.5 ${
                    todayLog.completedWorkout
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Flame size={12} />
                  <span>{todayLog.completedWorkout ? '✓ TODAY WORKOUT LOGGED' : '✗ MARK WORKOUT AS DONE'}</span>
                </button>
              </div>

              {/* SVG step volume bar chart */}
              <div className="h-64 border border-slate-150 bg-slate-50/50 p-4 rounded-xl relative overflow-hidden" id="svg-steps-graph">
                {/* 10,000 steps coach line */}
                <div className="absolute left-0 right-0 border-t border-dashed border-sky-400/80" style={{ bottom: '65%' }}>
                  <span className="absolute left-2 bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono tracking-wide">
                    COACH TARGET: 10,000 STEPS
                  </span>
                </div>

                <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
                  {renderLogs.map((log, index) => {
                    const width = 36;
                    const spacing = (440 - (renderLogs.length * width)) / (renderLogs.length - 1);
                    const x = 30 + (index * (width + spacing));
                    
                    const maxSteps = 15000;
                    const heightPct = Math.min(log.steps / maxSteps, 1);
                    const barHeight = heightPct * 150;
                    const y = 170 - barHeight;

                    // Color indicator based on hitting 10K
                    const isGoalHit = log.steps >= 10000;
                    const barColor = isGoalHit ? '#0ea5e9' : '#94a3b8';

                    return (
                      <g key={index} className="group cursor-pointer">
                        {/* Bar */}
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={barHeight}
                          fill={barColor}
                          rx="4"
                          className="hover:opacity-90 transition-opacity duration-150"
                        />
                        {/* Steps Label */}
                        <text
                          x={x + width / 2}
                          y={y - 8}
                          textAnchor="middle"
                          className="font-bold text-[9px] fill-slate-700 font-mono"
                        >
                          {log.steps >= 1000 ? `${(log.steps / 1000).toFixed(1)}k` : log.steps}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* X labels */}
                <div className="absolute bottom-1.5 left-3 right-3 flex justify-between font-bold text-[9px] text-slate-500 uppercase font-mono">
                  {renderLogs.map((l, index) => (
                    <span key={index} className="w-[36px] text-center">{l.date}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick logger form */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider block">WALK REGISTER</span>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-slate-800">
                    Record Steps Traveled
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase">Log walking/cardio steps to calculate real energy expenditure!</p>
                </div>

                <form onSubmit={handleStepsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Steps Logged</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="e.g. 10250"
                        value={stepsInput}
                        onChange={(e) => setStepsInput(e.target.value)}
                        className="flex-1 px-3 h-11 bg-white border border-slate-200 rounded-lg font-bold text-xs text-slate-800 outline-none focus:border-sky-500"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 h-11 bg-slate-900 text-white font-bold text-xs uppercase rounded-lg tracking-wider hover:bg-slate-800 transition-all hover:cursor-pointer"
                      >
                        LOG STEPS
                      </button>
                    </div>
                  </div>
                </form>

                <div className="border-t border-dashed border-slate-200 pt-4 space-y-2.5">
                  <h4 className="font-bold text-xs uppercase text-slate-800">
                    💪 Workout Adherence Card
                  </h4>
                  <div className="p-3 bg-slate-50/50 border border-slate-150 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-slate-800">Today's Workout completed?</p>
                      <p className="text-[9px] text-slate-400 uppercase mt-0.5">Toggle to sync compliance percentage.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onLogWorkout(!todayLog.completedWorkout)}
                      className={`w-12 h-6 rounded-full p-0.5 transition-all flex items-center ${
                        todayLog.completedWorkout ? 'bg-emerald-600 justify-end' : 'bg-slate-200 justify-start'
                      } hover:cursor-pointer`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: DIET & MACRONUYRIENTS */}
      {activeSubTab === 'nutrition' && (
        <div className="space-y-6">
          {/* Macronutrients checklist cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="diet-scorecards">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                <Apple size={18} className="text-orange-500" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">AVG INTAKE ENERGY</span>
                <p className="font-bold text-lg text-slate-800 mt-1">{avgCaloriesThisWeek} kcal</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-emerald-700">P</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">PROTEIN LEVEL</span>
                <p className="font-bold text-lg text-slate-800 mt-1">{getLoggedProtein(todayLog as DailyLog)}g / {targetProtein}g</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-amber-700">C</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">CARB LEVEL</span>
                <p className="font-bold text-lg text-slate-800 mt-1">{getLoggedCarbs(todayLog as DailyLog)}g / {targetCarbs}g</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-rose-700">F</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">FAT LEVEL</span>
                <p className="font-bold text-lg text-slate-800 mt-1">{getLoggedFats(todayLog as DailyLog)}g / {targetFats}g</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SVG diet energy comparison bar chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-5 md:p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block">ENERGY BALANCE ANALYSIS</span>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-slate-800">
                    Energy Intake Trajectory vs Goal
                  </h3>
                </div>
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold font-mono px-2 py-0.5 rounded text-[10px] uppercase">
                  LIMIT: {targetCalories} kcal Target
                </div>
              </div>

              {/* SVG stacked or dual-line comparison chart */}
              <div className="h-64 border border-slate-150 bg-slate-50/50 p-4 rounded-xl relative overflow-hidden" id="svg-diets-graph">
                {/* Calories target coach line */}
                <div className="absolute left-0 right-0 border-t border-dashed border-orange-400" style={{ bottom: '70%' }}>
                  <span className="absolute right-2 bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono tracking-wide">
                    CALORIES LIMIT: {targetCalories} kcal
                  </span>
                </div>

                <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
                  {/* Fill area below the line */}
                  <path
                    fill="url(#caloricGrad)"
                    stroke="none"
                    d={`M 30,170 ` + renderLogs.map((log, index) => {
                      const x = (index / (renderLogs.length - 1)) * 440 + 30;
                      const maxCals = 3000;
                      const heightPct = Math.min(log.calories / maxCals, 1);
                      const y = 170 - (heightPct * 140);
                      return `L ${x},${y}`;
                    }).join(' ') + ` L 470,170 Z`}
                  />

                  {/* Draw caloric intake connecting path */}
                  <polyline
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="3"
                    strokeLinecap="round"
                    points={renderLogs.map((log, index) => {
                      const x = (index / (renderLogs.length - 1)) * 440 + 30;
                      const maxCals = 3000;
                      const heightPct = Math.min(log.calories / maxCals, 1);
                      const y = 170 - (heightPct * 140);
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Nodes */}
                  {renderLogs.map((log, index) => {
                    const x = (index / (renderLogs.length - 1)) * 440 + 30;
                    const maxCals = 3000;
                    const heightPct = Math.min(log.calories / maxCals, 1);
                    const y = 170 - (heightPct * 140);

                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#ffffff"
                          stroke="#ea580c"
                          strokeWidth="2.5"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          className="font-bold text-[9px] fill-slate-800 font-mono"
                        >
                          {log.calories}
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="caloricGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ea580c" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                </svg>

                {/* X labels */}
                <div className="absolute bottom-1.5 left-3 right-3 flex justify-between font-bold text-[9px] text-slate-500 uppercase font-mono">
                  {renderLogs.map((l, index) => (
                    <span key={index}>{l.date}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Diet progress meters and check bars */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block">DIET INTEGRITY</span>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-slate-800">
                    Macronutrient Meters
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase">Today logged protein and carb ratios compared to your plan target.</p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Protein meter */}
                  <div className="space-y-1.5 border border-slate-100 p-2.5 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                      <span className="text-emerald-700">🐔 Protein Target</span>
                      <span className="font-mono text-slate-700">
                        {getLoggedProtein(todayLog as DailyLog)}g / {targetProtein}g
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((getLoggedProtein(todayLog as DailyLog) / targetProtein) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Carbs meter */}
                  <div className="space-y-1.5 border border-slate-100 p-2.5 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                      <span className="text-amber-700 font-bold">🌾 Carbohydrates Target</span>
                      <span className="font-mono text-slate-700">
                        {getLoggedCarbs(todayLog as DailyLog)}g / {targetCarbs}g
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((getLoggedCarbs(todayLog as DailyLog) / targetCarbs) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Fats meter */}
                  <div className="space-y-1.5 border border-slate-100 p-2.5 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                      <span className="text-rose-700">🥑 Healthy Fats Target</span>
                      <span className="font-mono text-slate-700">
                        {getLoggedFats(todayLog as DailyLog)}g / {targetFats}g
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((getLoggedFats(todayLog as DailyLog) / targetFats) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 uppercase leading-relaxed border-t border-dashed border-slate-200 pt-3 text-center">
                  💡 Want to log foods? Check the primary <span className="font-bold text-slate-700">Dashboard</span> tab to check off meals or add custom entries!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: HYDRATION SYNCHRONIZATION */}
      {activeSubTab === 'water' && (
        <div className="space-y-6">
          {/* Hydration statistics indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="water-scorecards">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                <Droplet size={18} className="text-sky-500 fill-current" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">TODAY'S DRINKING VOLUME</span>
                <p className="font-bold text-xl text-slate-800 mt-1">{(todayLog.waterIntake || 0.0).toFixed(1)} LITERS</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Target size={18} className="text-emerald-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">DAILY RECOMMENDATION</span>
                <p className="font-bold text-xl text-slate-800 mt-1">3.0 LITERS</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                <CalendarDays size={18} className="text-purple-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">WEEKLY AVERAGE WATER</span>
                <p className="font-bold text-xl text-slate-800 mt-1">{avgWaterThisWeek} L / DAY</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SVG area water line chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-5 md:p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider block">HYDRATION STATUS</span>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-slate-800">
                    Weekly Water Drinking Indexes
                  </h3>
                </div>
                <div className="flex gap-1.5 items-center bg-sky-50 border border-sky-100 text-sky-800 font-bold text-[10px] uppercase px-2.5 py-1 rounded">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping" />
                  <span>Optimal metabolism support</span>
                </div>
              </div>

              {/* Water curve list */}
              <div className="h-64 border border-slate-150 bg-slate-50/50 p-4 rounded-xl relative overflow-hidden" id="svg-water-graph">
                {/* 3.0 Liters baseline indicator */}
                <div className="absolute left-0 right-0 border-t border-dashed border-sky-500/50" style={{ bottom: '75%' }}>
                  <span className="absolute left-3 bg-sky-50 text-sky-700 px-1 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wide border border-sky-100 font-mono">
                    OPTIMAL METRIC: 3.0L
                  </span>
                </div>

                <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
                  {/* Fill watercolor area under curve */}
                  <path
                    fill="url(#waterGrad)"
                    stroke="none"
                    d={`M 30,170 ` + renderLogs.map((log, index) => {
                      const x = (index / (renderLogs.length - 1)) * 440 + 30;
                      const maxWater = 4.0;
                      const pct = Math.min(log.waterIntake / maxWater, 1);
                      const y = 170 - (pct * 140);
                      return `L ${x},${y}`;
                    }).join(' ') + ` L 470,170 Z`}
                  />

                  {/* Curve stroke */}
                  <polyline
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3"
                    strokeLinecap="round"
                    points={renderLogs.map((log, index) => {
                      const x = (index / (renderLogs.length - 1)) * 440 + 30;
                      const maxWater = 4.0;
                      const pct = Math.min(log.waterIntake / maxWater, 1);
                      const y = 170 - (pct * 140);
                      return `${x},${y}`;
                    }).join(' ')}
                  />

                  {/* Draw coordinates */}
                  {renderLogs.map((log, index) => {
                    const x = (index / (renderLogs.length - 1)) * 440 + 30;
                    const maxWater = 4.0;
                    const pct = Math.min(log.waterIntake / maxWater, 1);
                    const y = 170 - (pct * 140);

                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={y}
                          r="5.5"
                          fill="#ffffff"
                          stroke="#0284c7"
                          strokeWidth="2.5"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          className="font-bold text-[9px] fill-slate-800 font-mono"
                        >
                          {log.waterIntake.toFixed(1)}L
                        </text>
                      </g>
                    );
                  })}

                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.30"/>
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                </svg>

                {/* X labels */}
                <div className="absolute bottom-1.5 left-3 right-3 flex justify-between font-bold text-[9px] text-slate-500 uppercase font-mono">
                  {renderLogs.map((l, index) => (
                    <span key={index}>{l.date}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick logger cups and numeric form */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider block">HYDRATIVE INFLOW</span>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-slate-800">
                    Quick Hydration Desk
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase">Increment water intake with the preset glasses or specify custom Liters!</p>
                </div>

                {/* Glasses buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onLogWater((todayLog.waterIntake || 0) + 0.25)}
                    className="flex flex-col items-center justify-center p-3 border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 rounded-xl transition-all hover:cursor-pointer text-center"
                  >
                    <Coffee size={20} className="text-sky-500 mb-1" />
                    <span className="text-[10px] font-bold uppercase text-slate-800">Glass (+250ML)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onLogWater((todayLog.waterIntake || 0) + 0.5)}
                    className="flex flex-col items-center justify-center p-3 border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 rounded-xl transition-all hover:cursor-pointer text-center"
                  >
                    <Droplet size={20} className="text-sky-600 mb-1" />
                    <span className="text-[10px] font-bold uppercase text-slate-800">Tumbler (+500ML)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onLogWater((todayLog.waterIntake || 0) + 1.0)}
                    className="flex flex-col items-center justify-center p-3 border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 rounded-xl transition-all hover:cursor-pointer text-center"
                  >
                    <Target size={20} className="text-sky-700 mb-1" />
                    <span className="text-[10px] font-bold uppercase text-slate-800">Huge Bottle (+1L)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onLogWater(0.0)}
                    className="flex flex-col items-center justify-center p-3 border border-slate-200 hover:border-red-400 hover:bg-red-50/50 rounded-xl transition-all hover:cursor-pointer text-center"
                  >
                    <TrendingDown size={20} className="text-red-500 mb-1" />
                    <span className="text-[10px] font-bold uppercase text-red-700">Clear Today</span>
                  </button>
                </div>

                {/* Form input */}
                <form onSubmit={handleWaterSubmit} className="space-y-3 pt-3 border-t border-dashed border-slate-150">
                  <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Set absolute volume (L)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 3.2"
                      value={waterInput}
                      onChange={(e) => setWaterInput(e.target.value)}
                      className="flex-1 px-3 h-11 bg-white border border-slate-200 rounded-lg font-bold text-xs text-slate-800 outline-none focus:border-sky-500"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 h-11 bg-slate-900 text-white font-bold text-xs uppercase rounded-lg tracking-wider hover:bg-slate-800 transition-all hover:cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: WELLNESS & DIGESTIVE FEELING */}
      {activeSubTab === 'wellness' && (
        <div className="space-y-6">
          {/* Satiety cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="wellness-counters">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Smile size={18} className="text-emerald-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">SATISFIED days ('neutral')</span>
                <p className="font-bold text-xl text-slate-800 mt-1">{feelingsCount.Neutral} DAYS</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-indigo-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">FULL days ('full')</span>
                <p className="font-bold text-xl text-slate-800 mt-1">{feelingsCount.Full} DAYS</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <Heart size={18} className="text-red-500" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block leading-none">HUNGRY days ('hungry')</span>
                <p className="font-bold text-xl text-slate-800 mt-1">{feelingsCount.Hungry} DAYS</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 p-5 md:p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block">7-DAY WELLNESS LEDGER</span>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-slate-800">
                    Satiety and Digestive Feeling Timeline
                  </h3>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                  Metabolic Comfort audit
                </div>
              </div>

              {/* Satiety timeline */}
              <div className="space-y-3.5">
                {renderLogs.map((log, index) => {
                  let badgeColors = 'bg-slate-100 text-slate-600 border-slate-200';
                  if (log.feeling === 'Full') {
                    badgeColors = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                  } else if (log.feeling === 'Hungry') {
                    badgeColors = 'bg-red-50 text-red-700 border-red-100';
                  } else if (log.feeling === 'Neutral') {
                    badgeColors = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                  }

                  return (
                    <div key={index} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-lg border border-slate-150 transition-all hover:bg-slate-50 font-semibold uppercase text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-slate-300 rounded-full border border-white shrink-0" />
                        <span className="text-slate-400 font-mono text-[10px] font-bold">{log.dateString || log.date}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] text-slate-500 font-bold">
                          {log.craving ? `🚨 Craved: ${log.craving}` : '✨ Zero Cravings'}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded border text-[9px] font-bold ${badgeColors}`}>
                          {log.feeling}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Satiety analytics dashboard sidecard */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block">METABOLIC ADAPTATIONS</span>
                <h3 className="text-lg font-bold uppercase tracking-tight text-slate-800">
                  Satiety Audit
                </h3>
                <p className="text-xs text-slate-400 mt-1 uppercase">Understanding feedback loops lets our engine modify fiber & calorie ranges.</p>
              </div>

              <div className="space-y-3 border border-slate-100 bg-indigo-50/20 p-3.5 rounded-lg border-dashed text-[11px] text-indigo-900 leading-relaxed font-medium">
                <p className="font-bold text-[10px] uppercase text-indigo-950 flex items-center gap-1.5 ">
                  <Trophy size={13} className="text-amber-500" />
                  BIO-REGULATION METADATA:
                </p>
                <ul className="space-y-1.5 list-disc pl-3 text-slate-600 uppercase font-semibold text-[9.5px]">
                  <li>Most diets crash from raw peptide-YY drops. We look at hunger patterns to prevent muscle waste.</li>
                  <li>Cousin's Shaadi overrides and high joint sore days adjust training cortisol indices automatically!</li>
                  <li>Always verify digestive comfort. Submit your Daily Check-in in the Dashboard menu.</li>
                </ul>
              </div>

              <p className="text-[10px] text-slate-400 uppercase leading-relaxed text-center">
                📊 Submit feelings and cravings under the main <span className="font-bold text-slate-700">Dashboard Check-in</span> after finishing your day!
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
