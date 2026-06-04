/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GlassWater, Trophy, Plus, Minus, Footprints } from 'lucide-react';

interface QuickAccessProps {
  waterLiters: number;
  stepsCount: number;
  onUpdateWater: (liters: number) => void;
  onUpdateSteps: (steps: number) => void;
}

export default function QuickAccess({ waterLiters, stepsCount, onUpdateWater, onUpdateSteps }: QuickAccessProps) {
  const [stepInput, setStepInput] = React.useState('');

  const handleStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(stepInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateSteps(parsed);
      setStepInput('');
    }
  };

  const incrementWater = () => {
    onUpdateWater(Math.min(6, waterLiters + 0.25));
  };

  const decrementWater = () => {
    onUpdateWater(Math.max(0, waterLiters - 0.25));
  };

  const stepPct = Math.min(100, (stepsCount / 10000) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="quick-access-widget-container">
      {/* 1. INTERACTIVE HYDRATION TRACKER */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[220px]" id="water-tracker">
        <div>
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-600 block">SYSTEM RATIO</span>
              <h3 className="text-xl font-bold uppercase tracking-tight text-slate-800">WATER LOGS</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
              <GlassWater size={18} className="text-sky-600" />
            </div>
          </div>
          <p className="font-bold text-2xl text-slate-800 mb-2" id="water-liters-count">
            {waterLiters.toFixed(2)} / <span className="opacity-60 text-base">3.50 Liters</span>
          </p>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
            <div 
              className="bg-sky-500 transition-all duration-300 ease-out h-full rounded-full"
              style={{ width: `${Math.min(100, (waterLiters / 3.5) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={decrementWater}
            disabled={waterLiters <= 0}
            className="flex-1 py-2 border border-slate-200 bg-white font-bold text-xs uppercase rounded-lg text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40 hover:cursor-pointer"
            id="water-minus-btn"
          >
            - 250ml
          </button>
          <button
            onClick={incrementWater}
            className="flex-1 py-2 bg-sky-600 text-white font-bold text-xs uppercase rounded-lg hover:bg-sky-700 transition-all shadow-md shadow-sky-600/10 hover:cursor-pointer"
            id="water-plus-btn"
          >
            + 250ml
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC STEPS TRACKER */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between min-h-[220px]" id="steps-tracker">
        <div>
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-orange-600 block">METRICAL LOG</span>
              <h3 className="text-xl font-bold uppercase tracking-tight text-slate-800">STEPS ENGAGED</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
              <Footprints size={18} className="text-orange-600" />
            </div>
          </div>
          
          <div className="flex justify-between items-baseline mb-2">
            <p className="font-bold text-2xl text-slate-800" id="steps-logged-tag">
              {stepsCount.toLocaleString()} / <span className="opacity-60 text-base">10,000</span>
            </p>
            {stepsCount >= 10000 && (
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1 animate-bounce" id="workout-challenge-trophy">
                <Trophy size={10} /> GOAL MET
              </span>
            )}
          </div>

          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
            <div 
              className="bg-orange-500 transition-all duration-300 ease-out h-full rounded-full"
              style={{ width: `${stepPct}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleStepSubmit} className="flex gap-2">
          <input
            type="number"
            placeholder="Log steps today (e.g. 5000)"
            value={stepInput}
            min={0}
            onChange={(e) => setStepInput(e.target.value)}
            className="flex-1 min-w-0 h-10 px-3 bg-white border border-slate-200 rounded-lg font-semibold text-xs outline-none placeholder:text-slate-400 focus:border-orange-500"
            id="log-steps-input"
          />
          <button
            type="submit"
            className="h-10 px-4 bg-slate-900 text-white font-bold text-xs uppercase rounded-lg tracking-wider hover:bg-slate-800 transition-all hover:cursor-pointer"
            id="log-steps-btn"
          >
            LOG STEP
          </button>
        </form>
      </div>
    </div>
  );
}
