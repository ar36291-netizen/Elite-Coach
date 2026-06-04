/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyWorkout, Exercise, Meal, FitnessPlan } from '../types';

export interface AdaptorSettings {
  selectedHurdle: string;
  cyclePhase: string;
  pcosAwareness: boolean;
  postpartumMode: boolean;
  beginnerMilestones: boolean;
}

export function getAdaptedWorkout(
  baseWorkout: DailyWorkout,
  settings: AdaptorSettings
): DailyWorkout {
  const { selectedHurdle, cyclePhase, postpartumMode, beginnerMilestones } = settings;
  const adapted: DailyWorkout = JSON.parse(JSON.stringify(baseWorkout));

  // 1. Process Hurdles first since they override physical exercises instantly
  if (selectedHurdle && selectedHurdle !== 'no-hurdle') {
    switch (selectedHurdle) {
      case 'exhausted':
        adapted.name = "🌙 LATE SHIFT / LOW-BATTERY MODE";
        adapted.focus = "Parasympathetic Nervous System Relief";
        adapted.description = "Battery-saver pacing. Complete consistency matches over high intensity to preserve central nervous system fatigue.";
        adapted.exercises = [
          {
            name: "Decompressing Child's Pose & Cat-Cow",
            sets: 2,
            reps: "3 mins",
            description: "Deep, rhythmic breathing. Releases spinal pressure from long desk seating."
          },
          {
            name: "Unloaded Glute Bridges",
            sets: 2,
            reps: "12 reps",
            description: "Restores hip extension and blood flow to gluteal regions without stress."
          },
          {
            name: "Postural Wall Slides",
            sets: 2,
            reps: "10 reps",
            description: "Decompresses the neck, stretches the thoracic spine, and resets shoulder girdle."
          }
        ];
        break;

      case 'soreness':
        adapted.name = "💪 JOINT PROTECTION & SYNOVIAL DOCK";
        adapted.focus = "Synovial Mobilization & Blood-Flow Circulation";
        adapted.description = "Strictly non-joint-loading preservation movements. Synovial friction levels minimized.";
        adapted.exercises = [
          {
            name: "Synovial Joint Circles (No-Load)",
            sets: 3,
            reps: "12 circles/joint",
            description: "Move upper neck, shoulders, and ankles in smooth, slow loops to promote synovial lubrication."
          },
          {
            name: "Bodyweight Wall Sits",
            sets: 3,
            reps: "25 secs hold",
            description: "Static quadricep loading keeps the knees safe. Good circulation without grind."
          },
          {
            name: "Extremely Light Lateral Raises",
            sets: 3,
            reps: "15 reps",
            description: "Pump oxygenated blood into shoulders using minor weight or bands. Zero shoulder capsule stress."
          }
        ];
        break;

      case 'shaadi':
        adapted.name = "🍛 SHAADI METABOLIC OFFSET PLAN";
        adapted.focus = "Muscular Glucose Siphoning & Active Pump";
        adapted.description = "Sweets/festive calorie offsets. We use deep muscular pumps to draw excess glucose out of blood instantly.";
        adapted.exercises = [
          {
            name: "Shaadi Prep Air Squats (High-Volume)",
            sets: 4,
            reps: "20 reps",
            description: "Siphons glucose directly into large leg muscular tissue. Run before plates are served!"
          },
          {
            name: "Tempo Desk/Wall Pushups",
            sets: 3,
            reps: "12 reps",
            description: "Triggers GLUT-4 translocation in the chest and shoulders to buffer high energy meals."
          },
          {
            name: "Post-Feast Metabolic Brisk Walk",
            sets: 1,
            reps: "15 mins",
            description: "A leisure walk immediately after calorie splurge. Slashes bloodstream insulin spikes."
          }
        ];
        break;

      case 'cramps':
        adapted.name = "🩸 DAY 1 MENSTRUAL CYCLE RELIEF";
        adapted.focus = "Pelvic Warmth & Spinal Decompression";
        adapted.description = "Strictly non-impact, zero pelvic pressure recovery phase. Safe, warming, and comforting.";
        adapted.exercises = [
          {
            name: "Deep Restorative Child's Pose",
            sets: 2,
            reps: "4 mins",
            description: "Widen knees to protect pelvic region. Focus on deep belly breathing. Gently release pelvic floor."
          },
          {
            name: "Warming Cat-Cow Stretches",
            sets: 2,
            reps: "2 mins each",
            description: "Excellent for lower back stiffness and dynamic uterine blood supply. Safety first."
          },
          {
            name: "Supine Goddess Breathing",
            sets: 1,
            reps: "5 mins",
            description: "Stay flat on your back, relax abdominal wall. Ideal with a warm water bottle compress."
          }
        ];
        break;

      case 'fever':
        adapted.name = "🤒 IMMUNE SHIELD REST DAY";
        adapted.focus = "Lymphatic Clearance & Bed Rest";
        adapted.description = "Let your body target systemic infection. High hydration, zero metabolic stress.";
        adapted.exercises = [
          {
            name: "Supine Diaphragmatic Deep Breathing",
            sets: 1,
            reps: "8 mins",
            description: "Relaxes muscles, de-congests respiratory system, and stimulates lymphatic drainage."
          },
          {
            name: "Placid Joint Twists",
            sets: 1,
            reps: "3 mins",
            description: "Very gentle mobilizers in bed or standing to keep body from feeling cramped."
          },
          {
            name: "Anabolic Bed Rest / Full Sleep",
            sets: 1,
            reps: "9+ hours",
            description: "High quality rest is the premier recovery engine. No guilt for staying in bed today!"
          }
        ];
        break;
    }
  }

  // 2. Process Women-Specific Cycle Syncing if no hurdle overrides
  else if (cyclePhase && cyclePhase !== 'none') {
    switch (cyclePhase) {
      case 'menstrual':
        adapted.name = "🩸 CYCLE: MENSTRUAL PHASE (DAY 1-5)";
        adapted.focus = "Strict Non-Impact Pelvic Recovery";
        adapted.description = "Low estrogen and progesterone. Strictly non-impact; replace high intensity with restorative stretches, gentle walks, and warm water. No pelvic pressure.";
        adapted.exercises = [
          {
            name: "Cycle-Synced Deep Belly Breathing",
            sets: 2,
            reps: "3 mins",
            description: "De-escalates stress hormones, improves vascular uterine blood supply."
          },
          {
            name: "Relaxing Cat-Cow Stretches",
            sets: 2,
            reps: "10 flows",
            description: "Reduces pelvic lower-back compression without vertical load."
          },
          {
            name: "Gentle Leisurely Walk",
            sets: 1,
            reps: "15 mins",
            description: "Low-impact circulatory booster. Prevents joint stiffness, feels refreshing."
          }
        ];
        break;

      case 'follicular':
      case 'ovulatory':
        adapted.name = `⚡ CYCLE: ${cyclePhase.toUpperCase()} (HIGH ENERGY)`;
        adapted.focus = "Peak Estrogen Adaptation & Strength Load";
        adapted.description = "Estrogen is surging! Ideal phase for active, progress-oriented strength challenges or cardio thresholds.";
        // Boost existing exercises by 1 set to leverage high energy!
        adapted.exercises = adapted.exercises.map(ex => ({
          ...ex,
          sets: Math.min(5, ex.sets + 1),
          description: `${ex.description} (Surging Estrogen gives extra stamina!)`
        }));
        break;

      case 'luteal':
        adapted.name = "🧘 CYCLE: LUTEAL TRANSITION (REST MODERATE)";
        adapted.focus = "Steady Resistance & Flow Stabilization";
        adapted.description = "Progesterone ramping up, temperature slightly elevated. Focus on moderate resistance, steady hikes, or restorative yoga.";
        adapted.exercises = adapted.exercises.map(ex => {
          let modifiedReps = ex.reps;
          if (ex.reps.includes('reps')) {
            const num = parseInt(ex.reps);
            if (!isNaN(num)) modifiedReps = `${Math.max(6, num - 2)} moderate reps`;
          }
          return {
            ...ex,
            reps: modifiedReps,
            description: `${ex.description} (Steady steady tempo, cool hydration).`
          };
        });
        break;
    }
  }

  // 3. Process Postpartum core recovery safety checks (replaces heavy squats/crunches with TvA vacs)
  if (postpartumMode) {
    adapted.name = `🤱 POSTPARTUM: ${adapted.name}`;
    adapted.focus = `Transverse Abdominis Core Binding (${adapted.focus})`;
    adapted.description = `Safe and gentle binder parameters. Avoid crunches, heavy squats, or jumps that risk Diastasis Recti or pelvic floor friction.`;
    
    // Scan exercises and substitute heavy risk movements
    adapted.exercises = adapted.exercises.map(ex => {
      const lowerName = ex.name.toLowerCase();
      if (lowerName.includes('squat') && !lowerName.includes('wall')) {
        return {
          name: "Gentle Unloaded Glute Bridges",
          sets: 3,
          reps: "12 reps",
          description: "Replaces heavy squats. Safe pelvic flooring, guards lower lumbar region."
        };
      }
      if (lowerName.includes('crunch') || lowerName.includes('situp') || lowerName.includes('sit-up') || lowerName.includes('plank')) {
        return {
          name: "TvA Vacuum Breathing (Safe Core)",
          sets: 3,
          reps: "15 secs hold",
          description: "Strictly replaces high-compression crunches to heal Diastasis Recti securely."
        };
      }
      return ex;
    });
  }

  // 4. Absolute Beginners Easy Milestone Adaptations
  if (beginnerMilestones) {
    adapted.name = `🔰 BEGINNER: ${adapted.name}`;
    adapted.description = `Gentle progressive onboarding milestones. Adherence matches 100% when you log a single, low-pressure target!`;
    adapted.exercises = adapted.exercises.map(ex => ({
      ...ex,
      sets: 1, // STRICT 1 SET milestone
      reps: ex.reps.includes('secs') || ex.reps.includes('mins') ? "5 mins" : "5 slow reps",
      description: `EASY MILESTONE: Just complete this 1 set of 5! That is a massive transformational win.`
    }));
  }

  return adapted;
}

export function getAdaptedCoachAdvice(
  settings: AdaptorSettings,
  baseNote: string
): string {
  const { selectedHurdle, cyclePhase, pcosAwareness, postpartumMode, beginnerMilestones } = settings;

  if (selectedHurdle && selectedHurdle !== 'no-hurdle') {
    switch (selectedHurdle) {
      case 'exhausted':
        return "Coach: Late shifts are absolute energy drains. Don't worry about lifting heavy iron. Do these 3 gentle spinal decompression mobilizers and take hot teas to activate parasympathetic relief. Your streak log is 100% safe and secure tonight.";
      case 'soreness':
        return "Coach: Joint discomfort should never be ignored. We have locked in zero-load circulation warmups for you. Keep structural compression out of your knees/elbows. Synovial fluid is our priority today!";
      case 'shaadi':
        return "Coach: Celebrate the shaadi to the fullest! No culinary guilt. Saffron sweets represent instant glycogen. Do 20 rapid air squats before dinners to funnel those sweets straight into leg muscles! Drink warm lemon water tomorrow.";
      case 'cramps':
        return "Coach: Menstrual Day 1 is about restorative healing. Strictly zero pelvic pressure and gentle cat-cow stretches. Brew some warm ginger and tea. You are building an admirable, healthy long-term relationship with your body. Rest with pride.";
      case 'fever':
        return "Coach: Immunity requires every calorie. Do not lift, do not run. Sleep 9 hours, drink warm turmeric-cinnamon waters, and let your WBCs defend the fort. Full validation for healing today!";
    }
  }

  const notesAccum: string[] = [];

  if (pcosAwareness) {
    notesAccum.push("PCOS Coach Advisor: Added supportive cinnamon-water recommendations and warm lemon-mint to aid insulin resistance. Keep stressful heavy lifting moderate on heavy symptoms days to lower cortisol levels.");
  }

  if (postpartumMode) {
    notesAccum.push("Postpartum Advisor: Core binding is priority. Replaced heavy pelvic-floor risks. Direct gentle breath vacuums protect diastasis recti.");
  }

  if (beginnerMilestones) {
    notesAccum.push("Beginners Blueprint: 1 single set of 5 reps is a full victory. Focus on establishing the daily routine; load comes later.");
  }

  if (cyclePhase === 'menstrual') {
    notesAccum.push("Cycle Sync Advisor: Estrogen is at its absolute baseline. Focus strictly on cellular restoration, warmth, and non-impact mobility. Cinnamon tea decreases cramps dynamically.");
  }

  if (notesAccum.length > 0) {
    return `Active Adaptive Core: ${notesAccum.join(' | ')}`;
  }

  return baseNote;
}

export function getAdaptedMeals(
  baseMeals: Meal[],
  settings: AdaptorSettings
): Meal[] {
  const { pcosAwareness } = settings;
  if (!pcosAwareness) return baseMeals;

  // Add PCOS adaptive additions in description!
  return baseMeals.map(m => {
    let pcosAddition = "";
    if (m.type === 'breakfast') {
      pcosAddition = " PCOS Boost: Add 1/2 tsp of Ceylon Cinnamon powder in warm water before having this meal to improve insulin sensitivity.";
    } else if (m.type === 'dinner') {
      pcosAddition = " PCOS Relief: Ensure dynamic stress de-escalation by avoiding heavy carbohydrates at night; swap dessert choices for roasted spearmint tea.";
    }
    return {
      ...m,
      description: m.description + pcosAddition,
      tags: [...m.tags, "Insulin Safe"]
    };
  });
}
