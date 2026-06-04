/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OnboardingData } from '../types';
import { Info, Sparkles, ArrowRight, ArrowLeft, Rocket } from 'lucide-react';

interface AssessmentFormProps {
  onboarding: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onSubmit: (dietPreference: 'vegetarian' | 'mixed') => void;
  isLoading: boolean;
}

export default function AssessmentForm({ onboarding, onChange, onSubmit, isLoading }: AssessmentFormProps) {
  const [step, setStep] = React.useState(1);
  const totalSteps = 4;

  const [localDietPref, setLocalDietPref] = React.useState<'vegetarian' | 'mixed'>('vegetarian');

  // Multi-step validation guards
  const isNextDisabled = () => {
    if (step === 1) {
      return !onboarding.gender || !onboarding.age || !onboarding.height || !onboarding.weight;
    }
    return false;
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onSubmit(localDietPref);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const selectGender = (gender: 'Male' | 'Female') => {
    onChange({ gender });
  };

  const toggleEquipment = (eq: string) => {
    const list = [...onboarding.equipment];
    if (list.includes(eq)) {
      onChange({ equipment: list.filter((item) => item !== eq) });
    } else {
      onChange({ equipment: [...list, eq] });
    }
  };

  const selectExperience = (experience: 'Beginner' | 'Intermediate' | 'Advanced') => {
    onChange({ experience });
  };

  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto z-10" id="assessment-container">
      {/* High Density Progress Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-3">
          <div>
            <span className="font-bold text-sky-600 uppercase tracking-wider text-[10px] block mb-0.5">
              Onboarding Form
            </span>
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-slate-800">
              Start Your Journey
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-700 px-3 py-1 rounded-md bg-slate-100 border border-slate-200/50 self-start" id="progress-step-indicator">
            Step {step} of {totalSteps}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/40 relative">
          <div 
            className="h-full bg-emerald-650 transition-all duration-300 ease-out rounded-full" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-5 md:p-6 rounded-xl shadow-sm mb-8">
        {/* STEP 1: IDENTITY & STATS */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in" id="onboarding-step-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Gender selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Gender Selection
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => selectGender('Male')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border font-bold uppercase text-xs transition-all hover:cursor-pointer ${
                      onboarding.gender === 'Male'
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    id="gender-male-btn"
                  >
                    ♂ Male
                  </button>
                  <button
                    type="button"
                    onClick={() => selectGender('Female')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border font-bold uppercase text-xs transition-all hover:cursor-pointer ${
                      onboarding.gender === 'Female'
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    id="gender-female-btn"
                  >
                    ♀ Female
                  </button>
                </div>
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Age (Years)
                </label>
                <input
                  type="number"
                  placeholder="Years (e.g. 24)"
                  value={onboarding.age}
                  min={10}
                  max={120}
                  onChange={(e) => onChange({ age: e.target.value ? Number(e.target.value) : '' })}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 appearance-none"
                  id="input-stats-age"
                />
              </div>
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Height (CM)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 175"
                  value={onboarding.height}
                  min={100}
                  max={250}
                  onChange={(e) => onChange({ height: e.target.value ? Number(e.target.value) : '' })}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
                  id="input-stats-height"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Weight (KG)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={onboarding.weight}
                  min={30}
                  max={200}
                  onChange={(e) => onChange({ weight: e.target.value ? Number(e.target.value) : '' })}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
                  id="input-stats-weight"
                />
              </div>
            </div>

            {/* BMR Info box */}
            <div className="border border-sky-100 bg-sky-50/55 p-4 rounded-xl flex gap-3 items-start" id="metric-disclaimer-box">
              <div className="w-8 h-8 rounded-lg bg-white border border-sky-200 flex items-center justify-center shrink-0">
                <Info size={14} className="text-sky-600" />
              </div>
              <div>
                <p className="text-slate-800 font-bold text-xs uppercase leading-tight tracking-tight mb-0.5">
                  METABOLIC DATA INTEGRITY
                </p>
                <p className="text-slate-500 text-[10px] font-semibold uppercase leading-snug">
                  Your biometric statistics are parsed dynamically to evaluate your Basal Metabolic Rate (BMR) and derive targeted macromolecule ratios.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: EXPERIENCE, DIET & GOALS */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in" id="onboarding-step-2">
            {/* Experience level custom buttons */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Fitness Experience
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => selectExperience(lvl)}
                    className={`p-3 border rounded-xl text-left transition-all hover:cursor-pointer ${
                      onboarding.experience === lvl
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className={`font-bold text-sm uppercase leading-none mb-1 ${onboarding.experience === lvl ? 'text-emerald-950' : 'text-slate-850'}`}>{lvl}</p>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                      {lvl === 'Beginner' ? '0-6 months train' : lvl === 'Intermediate' ? '6-24 months train' : '2+ years lifting'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Indian Diet Preference Toggle */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Indian Specific Diet Category
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLocalDietPref('vegetarian')}
                  className={`p-4 border-2 rounded-xl text-left transition-all hover:cursor-pointer ${
                    localDietPref === 'vegetarian'
                      ? 'bg-emerald-50/80 border-emerald-600'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                  id="diet-vegetarian-btn"
                >
                  <p className="font-bold text-sm uppercase leading-none mb-1 text-slate-850">🥦 Pure Vegetarian</p>
                  <p className="text-[10px] font-semibold uppercase text-slate-500 leading-normal">
                    High focus on Paneer, Roti, Khichdi, Makhana, Dals, and Curd splits.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setLocalDietPref('mixed')}
                  className={`p-4 border-2 rounded-xl text-left transition-all hover:cursor-pointer ${
                    localDietPref === 'mixed'
                      ? 'bg-emerald-50/80 border-emerald-600'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                  id="diet-mixed-btn"
                >
                  <p className="font-bold text-sm uppercase leading-none mb-1 text-slate-850">🍗 Mixed Diet (Non-Veg)</p>
                  <p className="text-[10px] font-semibold uppercase text-slate-500 leading-normal">
                    Includes Eggs, Grilled Chicken, fish, Dals, paired with classic Indian carb structures.
                  </p>
                </button>
              </div>
            </div>

            {/* Primary Goal selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Primary Target Goal
              </label>
              <div className="relative">
                <select
                  value={onboarding.goal}
                  onChange={(e) => onChange({ goal: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold text-xs uppercase outline-none appearance-none cursor-pointer text-slate-700"
                  id="select-goal-input"
                >
                  <option value="Weight Loss & Tone">Weight Loss & Tone</option>
                  <option value="Build Muscle & Strength">Build Muscle & Strength</option>
                  <option value="Endurance & Performance">Endurance & Performance</option>
                  <option value="General Fitness & Longevity">General Fitness & Longevity</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none font-bold text-[10px] text-slate-400">
                  ▼
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LIMITATIONS & EQUIPMENT */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in" id="onboarding-step-3">
            {/* Injuries or physical limitations */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Physical Limitations or Injury Logs
              </label>
              <textarea
                value={onboarding.limitations}
                onChange={(e) => onChange({ limitations: e.target.value })}
                placeholder="Describe any lingering knee injuries, lower back pain, wrist strain, or leave blank if fully mobile..."
                className="w-full h-24 p-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-650 outline-none resize-none placeholder:text-slate-400"
                id="textarea-limitations"
              />
            </div>

            {/* Equipment checklist using beautiful custom cards */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Equipment Access
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                {[
                  { value: 'Gym', label: 'Full Gym Access' },
                  { value: 'Dumbbells', label: 'Dumbbells Only' },
                  { value: 'Bodyweight', label: 'Bodyweight (Home)' }
                ].map((eq) => {
                  const checked = onboarding.equipment.includes(eq.value);
                  return (
                    <button
                      key={eq.value}
                      type="button"
                      onClick={() => toggleEquipment(eq.value)}
                      className={`flex-1 py-3 px-4 border rounded-xl text-center font-bold text-xs uppercase transition-all hover:cursor-pointer shadow-sm ${
                        checked
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {eq.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FINAL AFFIRMATION */}
        {step === 4 && (
          <div className="text-center space-y-5 py-2 animate-fade-in" id="onboarding-step-4">
            <div className="relative inline-block border border-slate-200 p-1.5 bg-slate-50/50 rounded-2xl mx-auto">
              <div className="w-28 h-28 overflow-hidden rounded-xl border border-slate-200 bg-gray-50 flex items-center justify-center">
                <img 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                  alt="Ready to Transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXQvu2wUVXfx8wKK2Q1iy_801A_a8jPDblyZh4dMdtg-SttlnKEEt8bGpXbzrXIw1qbnzU9BvXJd3gcy7qsFQzt_Ltvlgz77-BPw5lg_VrYyRUYUUHVf2TPnaB3UFqVz9xP_4QLzRsroYFNaoIRoAcZRjFBTU1zVTwhPbcX2QeqZicn1vDfHsC0BrcWHcP1zPWYyErqR1ZRstbuf-JVT8lLSDQ1UmcGTKynBoCYUQlgmllbtE4NhyAOeMRjjurpeM3PJACU_c7E-OT"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-slate-800">
                Ready to Transform?
              </h3>
              <p className="text-xs font-semibold uppercase tracking-tight text-slate-500 max-w-md mx-auto leading-relaxed">
                We will now parse your biometrics to craft a bespoke 4-week split. Our algorithm maps recipes designed specifically for Indian domestic cooking patterns.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg inline-flex items-center gap-2 mx-auto" id="secure-badge">
              <Sparkles size={16} className="text-emerald-700 animate-pulse animate-duration-1000" />
              <span className="font-bold uppercase text-[10px] text-emerald-800 tracking-wider">
                AI Calibration Engine Active
              </span>
            </div>
          </div>
        )}

        {/* Form navigation controls */}
        <div className="mt-6 flex justify-between items-center gap-4 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1 || isLoading}
            className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-50 hover:cursor-pointer transition-all ${
              step === 1 || isLoading ? 'opacity-0 pointer-events-none' : ''
            }`}
            id="prev-step-btn"
          >
            <ArrowLeft size={14} />
            BACK
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isNextDisabled() || isLoading}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all hover:cursor-pointer shadow-sm shadow-emerald-650/10 disabled:opacity-50 disabled:pointer-events-none ${
              step === totalSteps ? 'bg-indigo-600 shadow-indigo-650/10' : ''
            }`}
            id="next-step-btn"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin text-sm">⚙</span> GENERATING PLAN...
              </span>
            ) : step === totalSteps ? (
              <>
                BUILD PLAN
                <Rocket size={14} />
              </>
            ) : (
              <>
                CONTINUE
                <ArrowRight size={14} className="font-black" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
