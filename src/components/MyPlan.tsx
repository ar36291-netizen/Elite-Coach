/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FitnessPlan, DailyWorkout, Meal } from '../types';
import { Play, Clipboard, BookOpen, AlertCircle, ShoppingBag, ListChecks, CheckCircle } from 'lucide-react';
import { getAdaptedWorkout, getAdaptedMeals } from '../lib/engine';

interface MyPlanProps {
  plan: FitnessPlan;
  selectedPlanType: 'workout' | 'nutrition';
  onUpdatePlanType: (type: 'workout' | 'nutrition') => void;
  selectedDay: number;
  onSelectDay: (dayNum: number) => void;
  selectedHurdle: string;
  cyclePhase: string;
  pcosAwareness: boolean;
  postpartumMode: boolean;
  beginnerMilestones: boolean;
  gender: 'Male' | 'Female' | '';
}

export default function MyPlan({
  plan,
  selectedPlanType,
  onUpdatePlanType,
  selectedDay,
  onSelectDay,
  selectedHurdle,
  cyclePhase,
  pcosAwareness,
  postpartumMode,
  beginnerMilestones,
  gender,
}: MyPlanProps) {
  // Let's implement local diet swap toggle within MyPlan as a secondary layer! 
  // It gives instant feedback and custom suggestions for Indian cooking.
  const [localVegToggle, setLocalVegToggle] = React.useState<'veg' | 'mixed'>(
    plan.dietPreference === 'vegetarian' ? 'veg' : 'mixed'
  );

  const isFemale = gender === 'Female';
  const settings = {
    selectedHurdle: isFemale ? selectedHurdle : (selectedHurdle === 'cramps' ? 'no-hurdle' : selectedHurdle),
    cyclePhase: isFemale ? cyclePhase : 'none',
    pcosAwareness: isFemale ? pcosAwareness : false,
    postpartumMode: isFemale ? postpartumMode : false,
    beginnerMilestones,
  };

  const baseWorkout = plan.workoutPlan.find(w => w.dayNum === selectedDay) || plan.workoutPlan[0];
  const selectedWorkout = getAdaptedWorkout(baseWorkout, settings);
  const currentMeals = getAdaptedMeals(plan.meals, settings);

  // Classic Indian diet tips based on standard food preferences
  const dietTips = [
    {
      title: "Roti Vs Rice Portioning",
      desc: "One standard 6-inch whole wheat chapati has ~70-80 kcal. A small cup of cooked white Basmati rice has ~130 kcal. If you are targeting weight loss, substitute half of your white rice portion with sautéed green beans or double-boiled Dal Tadka."
    },
    {
      title: "Paneer / Tofu Swaps",
      desc: "If on Pure Vegetarian splits, 100g of low-fat Paneer yields ~18g of pristine casein protein but contains ~15g of fats. Swap with 150g of Organic Soya Chunks or Tofu once in a while to keep fats within the 20% bracket."
    },
    {
      title: "Digestive Optimization",
      desc: "Incorporate spiced Curd (yogurt with cumin powder / Jeera) into your lunch. Dynamic probiotics in Indian curd boost digestion, prevent bloating from high-protein lentil diets, and optimize nutrient extraction."
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="plan-tab-view">
      {/* Dynamic Header Toggle */}
      <div className="flex border border-slate-200 bg-white p-1 rounded-xl shadow-sm" id="plan-view-tabs">
        <button
          onClick={() => onUpdatePlanType('workout')}
          className={`flex-1 py-3.5 flex items-center justify-center gap-3 font-bold text-xs uppercase rounded-lg transition-all hover:cursor-pointer ${
            selectedPlanType === 'workout'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
          id="toggle-workout-view"
        >
          <Clipboard size={14} />
          WORKOUT CALENDAR
        </button>
        <button
          onClick={() => onUpdatePlanType('nutrition')}
          className={`flex-1 py-3.5 flex items-center justify-center gap-3 font-bold text-xs uppercase rounded-lg transition-all hover:cursor-pointer ${
            selectedPlanType === 'nutrition'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
          id="toggle-nutrition-view"
        >
          <BookOpen size={14} />
          INDIAN NUTRITION GUIDE
        </button>
      </div>

      {/* 1. WORKOUT VIEW */}
      {selectedPlanType === 'workout' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="workout-calendar-panel">
          {/* Days vertical/horizontal dock */}
          <div className="lg:col-span-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 gap-2 shrink-0 animate-fade-in" id="workout-days-picker">
            {plan.workoutPlan.map((w) => {
              const isSelected = w.dayNum === selectedDay;
              return (
                <button
                  key={w.dayNum}
                  onClick={() => onSelectDay(w.dayNum)}
                  className={`w-full text-left p-3.5 border rounded-xl transition-all shrink-0 md:shrink hover:cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-650/10' 
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <p className={`text-[9px] font-bold uppercase leading-none mb-1 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                    DAY 0{w.dayNum}
                  </p>
                  <p className="font-bold text-sm uppercase leading-tight tracking-tight">
                    {w.day}
                  </p>
                  <span className={`text-[10px] block truncate mt-1 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {w.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Workout Day Details */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 p-5 md:p-6 rounded-xl shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider block mb-1">
                    CURRENT DAY SPLIT
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-slate-850">
                    {selectedWorkout.day} - {selectedWorkout.name}
                  </h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-md self-start border border-emerald-200/50">
                  ACTIVE WEEK 1
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl mb-5">
                <p className="text-xs font-semibold leading-relaxed text-slate-600">
                  <span className="font-bold text-slate-800">COACH OBJECTIVE:</span> {selectedWorkout.description} ({selectedWorkout.focus})
                </p>
              </div>

              {/* Workout exercise card grid */}
              <div className="space-y-4" id="workout-exercises-cards">
                {selectedWorkout.exercises.map((ex, index) => (
                  <div key={index} className="border border-slate-200 bg-white p-4 rounded-xl shadow-sm hover:border-slate-350 transition-all flex flex-col md:flex-row gap-5">
                    {ex.image && (
                      <div className="w-full md:w-32 h-24 md:h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                        <img 
                          referrerPolicy="no-referrer"
                          src={ex.image} 
                          alt={ex.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-slate-100 text-slate-800 font-bold text-[9px] px-2 py-0.5 rounded">
                          EXERCISE 0{index + 1}
                        </span>
                        <h4 className="text-base font-bold uppercase tracking-tight text-slate-800">
                          {ex.name}
                        </h4>
                      </div>
                      
                      <div className="flex gap-4 border-y border-dashed border-slate-150 py-1.5 text-xs">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">SETS</p>
                          <p className="font-bold text-slate-700">{ex.sets} sets</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400">TARGET REPS</p>
                          <p className="font-bold text-emerald-600">{ex.reps}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 uppercase leading-normal">
                        {ex.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. NUTRITION VIEW */}
      {selectedPlanType === 'nutrition' && (
        <div className="space-y-6" id="nutrition-guide-panel">
          {/* Top macros overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-amber-50/60 border border-amber-200 p-4 text-center rounded-xl shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">CALORIES LIMIT</span>
              <p className="font-extrabold text-xl text-amber-950">{plan.calories} kcal</p>
              <p className="text-[10px] text-amber-600 uppercase mt-1">Daily Budget</p>
            </div>
            <div className="bg-emerald-50/60 border border-emerald-200 p-4 text-center rounded-xl shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">PROTEIN TOTAL</span>
              <p className="font-extrabold text-xl text-emerald-950">{plan.protein}g</p>
              <p className="text-[10px] text-emerald-600 uppercase mt-1">Muscle Building</p>
            </div>
            <div className="bg-orange-50/60 border border-orange-200 p-4 text-center rounded-xl shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 block mb-1">DAILY CARBS</span>
              <p className="font-extrabold text-xl text-orange-950">{plan.carbs}g</p>
              <p className="text-[10px] text-orange-600 uppercase mt-1">Athletic Energy</p>
            </div>
            <div className="bg-sky-50/60 border border-sky-200 p-4 text-center rounded-xl shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block mb-1">FAT BUDGET</span>
              <p className="font-extrabold text-xl text-sky-950">{plan.fats}g</p>
              <p className="text-[10px] text-sky-600 uppercase mt-1">Hormonal Support</p>
            </div>
          </div>

          {/* Sub vegetarian/non veg diet switcher */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                  NUTRITION PREFERENCE
                </span>
                <h3 className="text-xl font-bold uppercase tracking-tight text-slate-800">
                  Indian Recipe Guidelines
                </h3>
              </div>
              
              <div className="flex items-center gap-1 border border-slate-200 p-1 bg-white rounded-lg self-start">
                <button
                  onClick={() => setLocalVegToggle('veg')}
                  className={`px-3 py-1.5 rounded-md font-bold text-xs uppercase transition-all hover:cursor-pointer ${
                    localVegToggle === 'veg'
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  🥦 Veg Options
                </button>
                <button
                  onClick={() => setLocalVegToggle('mixed')}
                  className={`px-3 py-1.5 rounded-md font-bold text-xs uppercase transition-all hover:cursor-pointer ${
                    localVegToggle === 'mixed'
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  🍗 Mixed Swaps
                </button>
              </div>
            </div>

            {/* Simulated swap alert banner */}
            {localVegToggle !== (plan.dietPreference === 'vegetarian' ? 'veg' : 'mixed') && (
              <div className="border border-amber-200 bg-amber-50 p-4 rounded-lg flex gap-3 items-center mb-6 animate-pulse" id="swap-notice">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span className="text-xs uppercase font-medium text-amber-800 leading-tight">
                  SWAP MODE: SHOWING TEMPORARY {localVegToggle === 'veg' ? 'VEGETARIAN' : 'NON-VEGETARIAN'} PROTEIN SUBSTITUTIONS. RE-OPEN PROFILE TO PERMANENTLY ADJUST AI MODELS CALIBRATION.
                </span>
              </div>
            )}

            {/* List meals cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="nutrition-meals-deck">
              {currentMeals.map((meal) => {
                // If user toggled a diet preference different than originally planned, let's show responsive, helpful swaps in-line!
                let name = meal.name;
                let desc = meal.description;
                if (localVegToggle === 'veg' && plan.dietPreference === 'mixed') {
                  if (meal.type === 'breakfast') {
                    name = "Vegetable Paneer Bhurji with Roti";
                    desc = "Substitution: Swap egg whites with 120g sautéed Low-fat Paneer scrambled with onions, tomato, turmeric, and 2 standard whole wheat rotis.";
                  } else if (meal.type === 'lunch') {
                    name = "Soya Chunks Stir-fry with Jeera Rice";
                    desc = "Substitution: Swap grilled chicken breast with 100g of high-protein boiled Soya Chunks sautéed in ginger-garlic paste and cucumber-mint raita.";
                  } else if (meal.type === 'dinner') {
                    name = "Tofu Curry & Brown Rice";
                    desc = "Substitution: Swap fish/egg curry with 150g grilled local Tofu simmering in rich onion-tomato gravy with steamed brown rice.";
                  }
                } else if (localVegToggle === 'mixed' && plan.dietPreference === 'vegetarian') {
                  if (meal.type === 'breakfast') {
                    name = "Egg Bhurji & Roti";
                    desc = "Protein Boost: Sauté 3 egg whites + 1 whole egg scrambled with local spices, paired with 2 simple rotis for premium bioavailability.";
                  } else if (meal.type === 'lunch') {
                    name = "Grilled Chicken Breast with Dal & Rice";
                    desc = "Protein Boost: Integrate 120g skinless double-boiled grilled chicken breast fillets alongside dal to boost amino density.";
                  } else if (meal.type === 'dinner') {
                    name = "Lighter Fish Curry & Roti";
                    desc = "Omega-3 Boost: Substitute paneer curry with 120g steamed Rohu or pomfret fish fillets in thin mustard-dill curry.";
                  }
                }

                return (
                  <div key={meal.id} className="border border-slate-200 bg-white p-4 rounded-xl shadow-sm hover:border-slate-350 transition-all flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-1000 rounded px-2 py-0.5">
                          {meal.type}
                        </span>
                        <h4 className="text-base font-bold uppercase text-slate-800">
                          {name}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-500 uppercase leading-relaxed">
                        {desc}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-2.5 flex justify-between rounded-lg font-mono text-[10px] font-semibold text-slate-600">
                      <span>CAL: {meal.calories} kcal</span>
                      <span>P: {meal.protein}g</span>
                      <span>C: {meal.carbs}g</span>
                      <span>F: {meal.fats}g</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bento dynamic tips block */}
          <div className="bg-white border border-slate-200 p-5 md:p-6 rounded-xl shadow-sm" id="indian-dietitian-tips">
            <h3 className="text-lg font-bold uppercase tracking-tight text-slate-800 mb-4">
              DIETITIAN INSIGHTS FOR INDIAN LIFESTYLE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dietTips.map((tip, idx) => (
                <div key={idx} className="border border-slate-150 bg-slate-50/50 p-4 rounded-xl hover:bg-white transition-all">
                  <h4 className="font-bold text-xs uppercase text-emerald-600 mb-2 leading-tight">
                    📢 {tip.title}
                  </h4>
                  <p className="text-xs font-semibold leading-normal uppercase text-slate-500">
                    {tip.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
