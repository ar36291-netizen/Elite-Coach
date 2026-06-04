/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OnboardingData } from '../types';
import { ShieldAlert, Trash2, RotateCw, User, HelpCircle } from 'lucide-react';

interface ProfileProps {
  onboarding: OnboardingData;
  onUpdateOnboarding: (data: Partial<OnboardingData>) => void;
  onRegeneratePlan: () => Promise<void>;
  onResetAll: () => void;
  isRegenerating: boolean;
}

export default function Profile({
  onboarding,
  onUpdateOnboarding,
  onRegeneratePlan,
  onResetAll,
  isRegenerating,
}: ProfileProps) {
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const handleUpdate = (field: keyof OnboardingData, value: any) => {
    onUpdateOnboarding({ [field]: value });
  };

  const toggleEquipment = (eq: string) => {
    const list = [...onboarding.equipment];
    if (list.includes(eq)) {
      handleUpdate('equipment', list.filter((item) => item !== eq));
    } else {
      handleUpdate('equipment', [...list, eq]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="profile-tab-view">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Inputs Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 md:p-6 rounded-xl shadow-sm relative">
          <div className="flex justify-between items-start border-b border-slate-100 pb-5 mb-5">
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider block">ATHLETE PASSPORT</span>
              <h3 className="text-xl font-bold uppercase tracking-tight text-slate-805">
                Update Profile Info
              </h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
              <User size={14} className="text-slate-500" />
            </div>
          </div>

          <div className="space-y-5">
            {/* Age, Height, Weight row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block mb-1">AGE (YEARS)</label>
                <input
                  type="number"
                  value={onboarding.age}
                  min={1}
                  max={120}
                  onChange={(e) => handleUpdate('age', e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-semibold text-xs text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block mb-1">HEIGHT (CM)</label>
                <input
                  type="number"
                  value={onboarding.height}
                  min={1}
                  max={250}
                  onChange={(e) => handleUpdate('height', e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-semibold text-xs text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block mb-1">WEIGHT (KG)</label>
                <input
                  type="number"
                  value={onboarding.weight}
                  min={1}
                  max={200}
                  onChange={(e) => handleUpdate('weight', e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-semibold text-xs text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Experience and Goal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block mb-1">EXPERIENCE LEVEL</label>
                <select
                  value={onboarding.experience}
                  onChange={(e) => handleUpdate('experience', e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold text-xs text-slate-800 outline-none cursor-pointer focus:border-emerald-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block mb-1">ATHLETIC TARGET GOAL</label>
                <select
                  value={onboarding.goal}
                  onChange={(e) => handleUpdate('goal', e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg font-bold text-xs text-slate-800 outline-none cursor-pointer focus:border-emerald-500"
                >
                  <option value="Weight Loss & Tone">Weight Loss & Tone</option>
                  <option value="Build Muscle & Strength">Build Muscle & Strength</option>
                  <option value="Endurance & Performance">Endurance & Performance</option>
                  <option value="General Fitness & Longevity">General Fitness & Longevity</option>
                </select>
              </div>
            </div>

            {/* General Equipment array */}
            <div>
              <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block mb-2">EQUIPMENT SETTING</label>
              <div className="flex flex-wrap gap-2">
                {['Gym', 'Dumbbells', 'Bodyweight'].map((eq) => {
                  const active = onboarding.equipment.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase transition-all hover:cursor-pointer shadow-sm ${
                        active 
                          ? 'bg-slate-900 border-slate-900 text-white' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {eq === 'Gym' ? '🏋️ Full Gym' : eq === 'Dumbbells' ? '💪 Dumbbells Only' : '🏡 Bodyweight'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Limitations text field */}
            <div>
              <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block mb-1">DISCOMFORTS & LIMITATIONS</label>
              <textarea
                value={onboarding.limitations}
                onChange={(e) => handleUpdate('limitations', e.target.value)}
                className="w-full h-20 p-3 bg-white border border-slate-200 rounded-lg font-semibold text-xs text-slate-650 outline-none resize-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* AI Calibration and reset controls */}
        <div className="space-y-6">
          
          {/* Plan Re-calculation Panel */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm text-center">
            <h4 className="font-bold text-base uppercase text-slate-800 mb-2">
              Recalibrate Engine
            </h4>
            <p className="text-xs font-semibold text-slate-500 uppercase leading-relaxed mb-4">
              Changed weight stats or modified gym access? Recalculate your customized program to trigger fresh macros and workout routines.
            </p>

            <button
              onClick={onRegeneratePlan}
              disabled={isRegenerating}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all hover:cursor-pointer shadow-sm shadow-emerald-650/10 disabled:opacity-50"
              id="regenerate-plan-profile-btn"
            >
              {isRegenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin text-lg">⚙</span> INTERPOLATING SPLITS...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <RotateCw size={14} /> REGENERATE ACTIVE PLAN
                </span>
              )}
            </button>
          </div>

          {/* Reset profile state panel */}
          <div className="bg-white border border-red-200 p-5 rounded-xl shadow-sm relative text-center" id="profile-danger-zone">
            <h4 className="font-bold text-base uppercase text-red-600 mb-2">
              ⚠️ DANGER ZONE
            </h4>
            <p className="text-xs font-semibold text-slate-505 uppercase leading-relaxed mb-4">
              This resets your onboarding questionnaire answers and deletes all daily food compliance, step counters, and hydration logs permanent.
            </p>

            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-sm uppercase rounded-lg transition-all tracking-wider hover:cursor-pointer"
                id="reset-state-button"
              >
                RESET PROGRESS &amp; ANSWERS
              </button>
            ) : (
              <div className="space-y-3" id="reset-confirm-box">
                <p className="text-xs font-bold text-red-600 uppercase text-center animate-pulse">
                  ARE YOU ABSOLUTELY SURE?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2 border border-slate-200 bg-white text-xs font-bold uppercase rounded-lg hover:cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={onResetAll}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-550 text-white text-xs font-bold uppercase rounded-lg hover:cursor-pointer"
                    id="confirm-reset-btn"
                  >
                    YES, DELETE ALL
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
