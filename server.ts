/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google Gen AI lazily
let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY environment variable is not configured. Falling back to rule-based generation.");
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// BMR and Plan Generator fallback
function generateLocalPlan(input: any): any {
  const { gender, age, height, weight, experience, goal, limitations, equipment, dietPreference } = input;
  
  // Calculate BMR using Harris-Benedict Equation
  let bmr = 0;
  const w = Number(weight) || 70;
  const h = Number(height) || 175;
  const a = Number(age) || 25;
  
  if (gender === 'Male') {
    bmr = 10 * w + 6.25 * h - 5 * a + 5;
  } else {
    bmr = 10 * w + 6.25 * h - 5 * a - 161;
  }
  
  // Adjust daily target based on goals
  let targetCalories = Math.round(bmr * 1.375); // Active factor
  if (goal.includes('Loss') || goal.includes('Weight')) {
    targetCalories -= 450;
  } else if (goal.includes('Muscle') || goal.includes('Gain') || goal.includes('Strength')) {
    targetCalories += 350;
  }
  
  if (targetCalories < 1200) targetCalories = 1200;
  if (targetCalories > 4000) targetCalories = 4000;

  // Macros (Protein: 2g/kg base, Fats: 25% of calories, remaining Carbs)
  const proteinGrams = Math.round(Math.min(w * 2, (targetCalories * 0.3) / 4));
  const fatsGrams = Math.round((targetCalories * 0.25) / 9);
  const carbsGrams = Math.round((targetCalories - (proteinGrams * 4) - (fatsGrams * 9)) / 4);

  // Define meals predicated on diet preference
  const isVeg = dietPreference === 'vegetarian';
  
  const meals = isVeg ? [
    {
      id: "meal-1",
      name: "Vegetable Poha",
      description: "Low-fat flattened rice tossed with fresh green peas, grated organic carrots, fresh curry leaves, and crunchy roasted peanuts.",
      calories: Math.round(targetCalories * 0.17),
      protein: Math.round(proteinGrams * 0.15),
      carbs: Math.round(carbsGrams * 0.22),
      fats: Math.round(fatsGrams * 0.12),
      type: "breakfast",
      tags: ["High Fiber", "Low Fat"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuATkQGgWkU_-K2omGaPMFFdwYq478eKSzkH-wSVhHspjFe0-roAfNb1UjOYpE-rOTR-dZxw8OExwIfY0NPbXO8EUyCzPXHN3OMwoJjGuD_GaJo96jRt4nLC4ru3JPrveFEcNyKJYldXH1VaQJs8_MV-tpNk64o2QIM1p1EvhDo00Nud172SibhHlyZvRQ541I65iNr8otZYiMwHKsL8nE5TsmvN2SJqqWWoghnhci8C-uhoJuaBqGcR0TrXhnH-gRwpDm5jUxqgdvCC"
    },
    {
      id: "meal-2",
      name: "Paneer & Roti with Dal",
      description: "Mildly spiced paneer cubes sautéed with bell peppers and tomatoes, accompanied by 2 whole wheat rotis and a bowl of high-protein Dal Tadka.",
      calories: Math.round(targetCalories * 0.38),
      protein: Math.round(proteinGrams * 0.45),
      carbs: Math.round(carbsGrams * 0.35),
      fats: Math.round(fatsGrams * 0.40),
      type: "lunch",
      tags: ["High Protein", "Vegetarian"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzaR6XTrs8pMuQfL81Iir81NT6DWebD1csWIEdQauB9W2HNQUzdWgDTAhC_Rqn_fE5K7CoT8jszCTpr-qzXTqKB43bGhAUzLKncTfu1IIob_7b9GkjhsfVhtRz8Mxkwtcn4dxyRK6qmhWHF03XjT8RQo8iBqeUmX7zmMGR-ipbFmmWAxFGwa0poXDUnggfiBBpDw5hUMdRkEaazjGv051MJkF2R4rv4UEgCIYQBJUBNrkpSiAHbWQBw-Nx1zXK99GgN3vgierK0A_w"
    },
    {
      id: "meal-3",
      name: "Roasted Makhana",
      description: "Air-roasted fox nuts flavored with pinch of turmeric and Himalayan pink salt, served with 1 cup of hot organic green tea.",
      calories: Math.round(targetCalories * 0.12),
      protein: Math.round(proteinGrams * 0.08),
      carbs: Math.round(carbsGrams * 0.15),
      fats: Math.round(fatsGrams * 0.10),
      type: "snacks",
      tags: ["Low Calorie", "Antioxidant"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCicdMaseP1MqTfPF3tMQL96HdZrn4X2ZouhYY9jlUqOvf837gYgU-DpfYuRWwFfaDYapXdrQelG3mSTq4BhdoCGxSuEkuwbLFaeyLvE7IUksLVwMuddcMTiyxfTtBmX1KyLyZ8C5PIWOzJfEKIH8FwWozCQSgDhrcMahOft6JfXG7TdQVvyRyU3WhNfTMZgKQ7vGbhzCPN7gzDTTDKeGB5fNSB_ISUZX90n4HresQzbZMSWQb4ECD3b_B2KxTlX5k41eyfJMXTU4f9"
    },
    {
      id: "meal-4",
      name: "Moong Dal Khichdi",
      description: "Comforting split yellow moong lentil and brown rice savory porridge topped with half a teaspoon of pure A2 cow ghee, served with double-boiled fat-free curd and cucumber-mint salad.",
      calories: Math.round(targetCalories * 0.33),
      protein: Math.round(proteinGrams * 0.32),
      carbs: Math.round(carbsGrams * 0.28),
      fats: Math.round(fatsGrams * 0.38),
      type: "dinner",
      tags: ["Probiotic", "Easy Digest"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfflIeBFJ9coKDPETC9EJe5LteEEDTKVTc8db1xDB1u-5IDidHxS81AvLLSdQOT4Uge_zmnhEZQrCgPIVM9_C2mXLg2tnIfz31uLIUCSN4Eoi9MZOw4Yeq8seOV9mtNTmt7SbV83AD_C8yr15fQ664pBn6S96GHWToURWLdDSfqgsA0kHHdL7iYvxAoq0dsge1klWGJ9pwXip5DoN0n_PfDwf1mVo2H1IEaMqpcDmNYlk8hbTS52F2KEMS6ScuTlbsjmroIMH9HjUs"
    }
  ] : [
    {
      id: "meal-1",
      name: "Whey Oats & Seeds",
      description: "Organic rolled oats cooked in plain water, blended with 1 scoop of Premium Whey Isolate protein, topped with fresh strawberries and sliced almonds.",
      calories: Math.round(targetCalories * 0.22),
      protein: Math.round(proteinGrams * 0.30),
      carbs: Math.round(carbsGrams * 0.20),
      fats: Math.round(fatsGrams * 0.15),
      type: "breakfast",
      tags: ["High Protein", "Quick Prep"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQCJF_UEroTBFFwq-He55XlJHfyy_ozGEJMtF6Jfd93hI5YC25pek597PXkGwTn3VqUK7ArKzd2z-9WHP-D5GhQs1QZW1Xtrxgo_RwODPisjVCjHh3UI4dGvoc46xNB65sv6xZoIxqKxc1lAQYbkdbcKMxN2OPwcAuIq72bCHbZiy-iki0-tPcxzhl8LrJJ-U1jaEhQp8q_dn1O_KgpLSYlOm4aoDsE1qoIlU-8qIJjEmt3IR9mL5Pla8St_eKc--Pa7AmdzksPl20"
    },
    {
      id: "meal-2",
      name: "Grilled Chicken & Quinoa",
      description: "Succulent herb-grilled lean chicken breast strips served on a bed of warm organic quinoa grain, tossed with micro-greens, bell pepper slivers, and sliced cucumbers.",
      calories: Math.round(targetCalories * 0.38),
      protein: Math.round(proteinGrams * 0.42),
      carbs: Math.round(carbsGrams * 0.35),
      fats: Math.round(fatsGrams * 0.35),
      type: "lunch",
      tags: ["High Protein", "Lean Cut"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0ku8dtf7kgt8XO6ymeP7gWYXao5BSgtWEyT7vJnJaKIpVH8ffbqwCoPLkfrwsJasinD_YPcFofqzNM9XbGiQMmvCXUf0kTha7hFxd5t5jf2qDamVlW86t2Z-Vy3X3kFGiscHEPF8eAuIjZWgFPmGLAUTS6EbIAlrQzPTmMsypTxk6KvGPezj9tlFFd4zzvv809nOeZsT_y-03TRCe16V8__XODCYAJdoTyzOr1fB2QzEZhUNJnVrcLgyswbhkrd2CsMO2mHwV4JsC"
    },
    {
      id: "meal-3",
      name: "Boiled Eggs & Makhana",
      description: "2 whole hard-boiled free-range eggs sprinkled with ground black pepper, accompanied by a small bowl of roasted fox nuts and refreshing mint water.",
      calories: Math.round(targetCalories * 0.12),
      protein: Math.round(proteinGrams * 0.13),
      carbs: Math.round(carbsGrams * 0.10),
      fats: Math.round(fatsGrams * 0.15),
      type: "snacks",
      tags: ["High Protein", "Keto Friendly"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCicdMaseP1MqTfPF3tMQL96HdZrn4X2ZouhYY9jlUqOvf837gYgU-DpfYuRWwFfaDYapXdrQelG3mSTq4BhdoCGxSuEkuwbLFaeyLvE7IUksLVwMuddcMTiyxfTtBmX1KyLyZ8C5PIWOzJfEKIH8FwWozCQSgDhrcMahOft6JfXG7TdQVvyRyU3WhNfTMZgKQ7vGbhzCPN7gzDTTDKeGB5fNSB_ISUZX90n4HresQzbZMSWQb4ECD3b_B2KxTlX5k41eyfJMXTU4f9"
    },
    {
      id: "meal-4",
      name: "Fish Curry & Basmati Rice",
      description: "Lighter steamed Rohu/Surmai fish fillet simmering in a classic tomato-onion mustard curry sauce, paired with 1 cup of steamed aromatic Basmati rice.",
      calories: Math.round(targetCalories * 0.28),
      protein: Math.round(proteinGrams * 0.15),
      carbs: Math.round(carbsGrams * 0.35),
      fats: Math.round(fatsGrams * 0.35),
      type: "dinner",
      tags: ["Omega-3 Rich", "High Protein"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfflIeBFJ9coKDPETC9EJe5LteEEDTKVTc8db1xDB1u-5IDidHxS81AvLLSdQOT4Uge_zmnhEZQrCgPIVM9_C2mXLg2tnIfz31uLIUCSN4Eoi9MZOw4Yeq8seOV9mtNTmt7SbV83AD_C8yr15fQ664pBn6S96GHWToURWLdDSfqgsA0kHHdL7iYvxAoq0dsge1klWGJ9pwXip5DoN0n_PfDwf1mVo2H1IEaMqpcDmNYlk8hbTS52F2KEMS6ScuTlbsjmroIMH9HjUs"
    }
  ];

  const workoutPlan = [
    {
      day: "Monday",
      dayNum: 1,
      name: "Upper Body Push",
      focus: "Chest, Shoulders, Triceps Intensity",
      description: "A focused routines targeting push mechanics to maximize anterior torso mass and joint alignment.",
      exercises: [
        {
          name: "Barbell Bench Press",
          sets: 4,
          reps: "10 reps",
          description: "Keep elbows tucked at a strict 45-degree angle, controlled descent, and explode up.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5yfgvYorbLvSWesxLXuE6vEDdnUQir670HylvDadeMT4F_WGXd0arfBBKHyKWZNGNoggjDkDShJM1QP8y_fZRP6cxs2pziVE_On7HNrCFNxRiY8U9jBsCtgOfIgiKxF3hAJg5IZBwFamrCoBISeJ5En1l2gzt3liDhB6hmJy96_c2O5Ijunmp8UvOPAh-9P750EbCN2Lf5KLUjPuNYkOgNqCPYOB9ASW5AHoP2WlaU3cq46FPUnSrk0yJ-HhOO9AiyHxeD49H2fJR"
        },
        {
          name: "Dumbbell Shoulder Press",
          sets: 3,
          reps: "12 reps",
          description: "Hold vertical posture, leverage full eccentric range of motion, avoid hyperextension of the low back.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8qepCzrXtTPlUFJ8WBaj_hUhNvamLFiVF8Ls7zLOQRqOAopdurVi7P8ubsbL3vk5_VwPRZv_UctYZLAwANgLKBkdyD6XfLAGvDy65i_Adwi5_Q2DZEeLLqjSaFzQeLHtdXmXurAi_w4o0kbS-l7IT1Prn2OQb41UDmnaxTmMfq_SZanWE72uybdH5DtwbTQoaUBRJh2UJVfRMYrU2Bv7ydGV03ekboQi5wQ6oodKWquRaUIkZMw3LBDup9lQ2JFdxJMwZFc3WuiGO"
        },
        {
          name: "Tricep Rope Pushdowns",
          sets: 3,
          reps: "15 reps",
          description: "Pull down, then flare ropes horizontally at the absolute lowest block to optimize lateral-head peak expansion.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1Y-Bb3b9PDtRD6tp3VSa5HwI6eUMJUqy37HT2JGWJ-DzV3ne5SaNIGfK_yQRnVM5z49Yg7DSpzSeqCNyZri5fTup0L4CTdYGElQYKCUFhMj3qfK9xs26tp032vDqxp9LctMRmC_T_VQzKpBjigdyIv7xZQ6HXVxy0aptoDBFi8eEXdrQXJEyqmKHmtVU1WSIaNyVNPCfS9wZclvsNYQCUXN2ghnu4DHkUnGviFgLdirDpT8wpScOhKyt2AT5_9k4_Z-z-MC70_xhK"
        }
      ]
    },
    {
      day: "Tuesday",
      dayNum: 2,
      name: "Lower Body Power",
      focus: "Quads, Hamstrings & Calves",
      description: "Build deep structural strength and leg mass with high-tension functional squats and pivots.",
      exercises: [
        {
          name: "Barbell Back Squats",
          sets: 4,
          reps: "10 reps",
          description: "Keep weight balanced across full foot. Drop hips below parallel while keeping chest high.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeOCxcysI21Pfio9GihKUu_9s_uJxOo0-z9hu8UyDkxUK3LEHaRWxXylPVTRoRcT0oeYcEHBl9xph3Uh0xsgqUT5jToZHsDKEXK-SjPdrmiPu4bu2zbS2pQobHrZcYwyQbJx35K7146pElPsb-YnrqLl08x8Wqwt7Nf94829saVGOuSqVM40ySKlDCcUCaxmYDv3SuP3Touj_ME3slfQBbObWAaiWi8df8RqmtqCBlg4o5Kh57D3zDiMfqiEnrhJORmAyNmwYfa_7-"
        },
        {
          name: "Romanian Deadlifts",
          sets: 3,
          reps: "12 reps",
          description: "Hinge backward from the beltline. Keep the bar close to shins with back fully straight to isolate hamstrings.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeOCxcysI21Pfio9GihKUu_9s_uJxOo0-z9hu8UyDkxUK3LEHaRWxXylPVTRoRcT0oeYcEHBl9xph3Uh0xsgqUT5jToZHsDKEXK-SjPdrmiPu4bu2zbS2pQobHrZcYwyQbJx35K7146pElPsb-YnrqLl08x8Wqwt7Nf94829saVGOuSqVM40ySKlDCcUCaxmYDv3SuP3Touj_ME3slfQBbObWAaiWi8df8RqmtqCBlg4o5Kh57D3zDiMfqiEnrhJORmAyNmwYfa_7-"
        },
        {
          name: "Calf Raises on Hack Squat",
          sets: 4,
          reps: "15 reps",
          description: "Full extension at the peak with a strict 2-second hold to engage muscular tissue of gastrocnemius.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeOCxcysI21Pfio9GihKUu_9s_uJxOo0-z9hu8UyDkxUK3LEHaRWxXylPVTRoRcT0oeYcEHBl9xph3Uh0xsgqUT5jToZHsDKEXK-SjPdrmiPu4bu2zbS2pQobHrZcYwyQbJx35K7146pElPsb-YnrqLl08x8Wqwt7Nf94829saVGOuSqVM40ySKlDCcUCaxmYDv3SuP3Touj_ME3slfQBbObWAaiWi8df8RqmtqCBlg4o5Kh57D3zDiMfqiEnrhJORmAyNmwYfa_7-"
        }
      ]
    },
    {
      day: "Wednesday",
      dayNum: 3,
      name: "Active Recovery & Core",
      focus: "Cardio conditioning and core stabilizers",
      description: "Low-impact recovery circuits engineered to lower internal DOMS and spike insulin sensitivity.",
      exercises: [
        {
          name: "LISS Brisk Jogging",
          sets: 1,
          reps: "30 mins",
          description: "Maintain a steady jog at 65% of your heart rate to boost circulation, speed recovery.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0vS4LS2egmG1nOKHBRnGPf7tO_Mqgt5MtvF6owzA_TZswizJzignM-mx13ZkhGFaxxj-HVhgu5-K0lScrybakpG-e0X8D1ttHGZTeMvJRCJYXyxTG13NQ79iomhaRwqXn0WGu6dNfQ0jLD6Kr5AEjrKOFOZuCDHBOB0sj767Xft6md82xrCz-Vtn4ezljshZmJtZfNBAN9nQTXkdySB5sImzOweIENrW53G-o0sDnPRGzPv1b1xzdUac7mW4BPY_axmOrOCUL0qx1"
        },
        {
          name: "Plank Hold",
          sets: 3,
          reps: "60 secs",
          description: "Keep glutes and lower abdomen fully locked with deep diaphragm breathing.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0vS4LS2egmG1nOKHBRnGPf7tO_Mqgt5MtvF6owzA_TZswizJzignM-mx13ZkhGFaxxj-HVhgu5-K0lScrybakpG-e0X8D1ttHGZTeMvJRCJYXyxTG13NQ79iomhaRwqXn0WGu6dNfQ0jLD6Kr5AEjrKOFOZuCDHBOB0sj767Xft6md82xrCz-Vtn4ezljshZmJtZfNBAN9nQTXkdySB5sImzOweIENrW53G-o0sDnPRGzPv1b1xzdUac7mW4BPY_axmOrOCUL0qx1"
        }
      ]
    },
    {
      day: "Thursday",
      dayNum: 4,
      name: "Upper Body Pull",
      focus: "Lats, Rhomboids & Posterior Delts",
      description: "Pull mechanics targeting direct thickness and width for stabilizing the spine.",
      exercises: [
        {
          name: "Lat Pulldown (Wide Grip)",
          sets: 4,
          reps: "10 reps",
          description: "Squeeze the shoulder blades firmly at the bottom of the movement before slow ascent.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1Y-Bb3b9PDtRD6tp3VSa5HwI6eUMJUqy37HT2JGWJ-DzV3ne5SaNIGfK_yQRnVM5z49Yg7DSpzSeqCNyZri5fTup0L4CTdYGElQYKCUFhMj3qfK9xs26tp032vDqxp9LctMRmC_T_VQzKpBjigdyIv7xZQ6HXVxy0aptoDBFi8eEXdrQXJEyqmKHmtVU1WSIaNyVNPCfS9wZclvsNYQCUXN2ghnu4DHkUnGviFgLdirDpT8wpScOhKyt2AT5_9k4_Z-z-MC70_xhK"
        },
        {
          name: "Seated Cable Rows",
          sets: 3,
          reps: "12 reps",
          description: "Keep back fixed. Maintain vertical torso. Row towards the lower belly button block.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1Y-Bb3b9PDtRD6tp3VSa5HwI6eUMJUqy37HT2JGWJ-DzV3ne5SaNIGfK_yQRnVM5z49Yg7DSpzSeqCNyZri5fTup0L4CTdYGElQYKCUFhMj3qfK9xs26tp032vDqxp9LctMRmC_T_VQzKpBjigdyIv7xZQ6HXVxy0aptoDBFi8eEXdrQXJEyqmKHmtVU1WSIaNyVNPCfS9wZclvsNYQCUXN2ghnu4DHkUnGviFgLdirDpT8wpScOhKyt2AT5_9k4_Z-z-MC70_xhK"
        },
        {
          name: "Incline Hammer Curls",
          sets: 3,
          reps: "12 reps",
          description: "Keep elbows pointed vertically. Move only the forearms to pump the brachialis muscle.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1Y-Bb3b9PDtRD6tp3VSa5HwI6eUMJUqy37HT2JGWJ-DzV3ne5SaNIGfK_yQRnVM5z49Yg7DSpzSeqCNyZri5fTup0L4CTdYGElQYKCUFhMj3qfK9xs26tp032vDqxp9LctMRmC_T_VQzKpBjigdyIv7xZQ6HXVxy0aptoDBFi8eEXdrQXJEyqmKHmtVU1WSIaNyVNPCfS9wZclvsNYQCUXN2ghnu4DHkUnGviFgLdirDpT8wpScOhKyt2AT5_9k4_Z-z-MC70_xhK"
        }
      ]
    },
    {
      day: "Friday",
      dayNum: 5,
      name: "Lower Body Conditioning",
      focus: "Hamstring and Quad endurance",
      description: "Lunge progressions and volume press to condition leg endurance without overtaxing central nervous fatigue.",
      exercises: [
        {
          name: "Walking Dumbbell Lunges",
          sets: 3,
          reps: "12 steps/leg",
          description: "Step cleanly, maintaining full core activation, keep front knee stacked above ankle block.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeOCxcysI21Pfio9GihKUu_9s_uJxOo0-z9hu8UyDkxUK3LEHaRWxXylPVTRoRcT0oeYcEHBl9xph3Uh0xsgqUT5jToZHsDKEXK-SjPdrmiPu4bu2zbS2pQobHrZcYwyQbJx35K7146pElPsb-YnrqLl08x8Wqwt7Nf94829saVGOuSqVM40ySKlDCcUCaxmYDv3SuP3Touj_ME3slfQBbObWAaiWi8df8RqmtqCBlg4o5Kh57D3zDiMfqiEnrhJORmAyNmwYfa_7-"
        },
        {
          name: "Leg Press Volume",
          sets: 4,
          reps: "12 reps",
          description: "Drop knees deeply to the outer rib lines. Push without ever locking out knees at the top lock.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeOCxcysI21Pfio9GihKUu_9s_uJxOo0-z9hu8UyDkxUK3LEHaRWxXylPVTRoRcT0oeYcEHBl9xph3Uh0xsgqUT5jToZHsDKEXK-SjPdrmiPu4bu2zbS2pQobHrZcYwyQbJx35K7146pElPsb-YnrqLl08x8Wqwt7Nf94829saVGOuSqVM40ySKlDCcUCaxmYDv3SuP3Touj_ME3slfQBbObWAaiWi8df8RqmtqCBlg4o5Kh57D3zDiMfqiEnrhJORmAyNmwYfa_7-"
        }
      ]
    },
    {
      day: "Saturday",
      dayNum: 6,
      name: "Functional Full-Body HIIT",
      focus: "Fast muscle fibers & heart rate",
      description: "High-intensity full body conditioning parameters to elevate metabolic engine output.",
      exercises: [
        {
          name: "Dumbbell Kettlebell Swings",
          sets: 4,
          reps: "15 swings",
          description: "Hinge intensely at the hips. Snap glutes and hamstrings to leverage weight elevation.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0vS4LS2egmG1nOKHBRnGPf7tO_Mqgt5MtvF6owzA_TZswizJzignM-mx13ZkhGFaxxj-HVhgu5-K0lScrybakpG-e0X8D1ttHGZTeMvJRCJYXyxTG13NQ79iomhaRwqXn0WGu6dNfQ0jLD6Kr5AEjrKOFOZuCDHBOB0sj767Xft6md82xrCz-Vtn4ezljshZmJtZfNBAN9nQTXkdySB5sImzOweIENrW53G-o0sDnPRGzPv1b1xzdUac7mW4BPY_axmOrOCUL0qx1"
        },
        {
          name: "Strict Pushups",
          sets: 3,
          reps: "Max reps",
          description: "Descend slowly as one cohesive plank plane. Engage whole abdominal column.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5yfgvYorbLvSWesxLXuE6vEDdnUQir670HylvDadeMT4F_WGXd0arfBBKHyKWZNGNoggjDkDShJM1QP8y_fZRP6cxs2pziVE_On7HNrCFNxRiY8U9jBsCtgOfIgiKxF3hAJg5IZBwFamrCoBISeJ5En1l2gzt3liDhB6hmJy96_c2O5Ijunmp8UvOPAh-9P750EbCN2Lf5KLUjPuNYkOgNqCPYOB9ASW5AHoP2WlaU3cq46FPUnSrk0yJ-HhOO9AiyHxeD49H2fJR"
        }
      ]
    },
    {
      day: "Sunday",
      dayNum: 7,
      name: "Rest & Yoga Recovery",
      focus: "Muscle rejuvenation & flexibility",
      description: "Unplugged neural rest day designed with deep bodyweight tissue recovery stretching and meditation.",
      exercises: [
        {
          name: "Vinyasa Flow Stretching",
          sets: 1,
          reps: "20 mins",
          description: "Extend fully into basic poses. Focus on hamstring, lowerback, and glute relief breathing.",
          image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0vS4LS2egmG1nOKHBRnGPf7tO_Mqgt5MtvF6owzA_TZswizJzignM-mx13ZkhGFaxxj-HVhgu5-K0lScrybakpG-e0X8D1ttHGZTeMvJRCJYXyxTG13NQ79iomhaRwqXn0WGu6dNfQ0jLD6Kr5AEjrKOFOZuCDHBOB0sj767Xft6md82xrCz-Vtn4ezljshZmJtZfNBAN9nQTXkdySB5sImzOweIENrW53G-o0sDnPRGzPv1b1xzdUac7mW4BPY_axmOrOCUL0qx1"
        }
      ]
    }
  ];

  return {
    calories: targetCalories,
    protein: proteinGrams,
    carbs: carbsGrams,
    fats: fatsGrams,
    dietPreference: dietPreference,
    meals,
    workoutPlan,
    coachNote: `Welcome to Elite Coaching! Let's conquer Week 1. Based on your BMR metrics, your daily intake should be exactly ${targetCalories} Calories. Stick closely to the splits. Remember, hard work beats talent when talent fails to work hard.`
  };
}

// 1. API: Generate Actionable Plan with Gemini AI
app.post("/api/generate-plan", async (req, res) => {
  const { gender, age, height, weight, experience, goal, limitations, equipment, dietPreference } = req.body;
  
  if (!gender || !age || !height || !weight) {
    return res.status(400).json({ error: "Missing required onboarding parameters (gender, age, height, weight)." });
  }

  // Derive static plan as immediate source of truth
  const localPlan = generateLocalPlan(req.body);

  const ai = getGenAI();
  if (!ai) {
    // If Gemini key is missing or invalid, immediately return the scientifically derived fallback
    return res.json({ plan: localPlan, source: "calculated" });
  }

  try {
    const prompt = `
      Act as an elite personal fitness coach and specialized athletic dietitian.
      Write a highly personalized, immediately actionable, 4-week Indian-friendly fitness and nutrition plan based on this user card:
      
      User Profile:
      - Gender: ${gender}
      - Age: ${age} years old
      - Height: ${height} cm
      - Weight: ${weight} kg
      - Fitness Experience level: ${experience}
      - Target Goal: ${goal}
      - Physical Limitations / Injuries: ${limitations || "None stated"}
      - Equipment Access: ${equipment && equipment.length > 0 ? equipment.join(", ") : "Bodyweight only"}
      - Diet preferences: ${dietPreference} (with high focus on Indian cuisine, meal availability, local affordable ingredients)

      Target macro baseline:
      - Calories: ${localPlan.calories} kcal
      - Protein: ${localPlan.protein}g
      - Carbs: ${localPlan.carbs}g
      - Fats: ${localPlan.fats}g

      Please output STRICTLY a structural JSON object matching the TypeScript interface below. Do NOT include markdown styling blocks like \`\`\`json. Output ONLY valid, parsable JSON.
      
      TypeScript Interface Schema:
      interface Exercise {
        name: string;
        sets: number;
        reps: string;
        description: string;
        image?: string; // Choose logically from public domain or leave empty.
      }
      interface DailyWorkout {
        day: string; // "Monday", "Tuesday", etc.
        dayNum: number; // 1 to 7
        name: string; // e.g. "Upper Body Push"
        focus: string; // e.g. "Chest, shoulders, triceps"
        description: string;
        exercises: Exercise[]; // Exactly 2-3 exercises representing the day's split
      }
      interface Meal {
        id: string; // "meal-1", "meal-2" etc
        name: string; // Must be Indian foods (e.g. "Veg Poha", "Paneer Roti", "Moong Dal Khichdi", "Grilled Chicken Kebab")
        description: string; // Nutrient breakdown and description
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        type: "breakfast" | "lunch" | "snacks" | "dinner";
        tags: string[]; // e.g. ["High Fiber", "Low Fat"]
        image?: string;
      }
      interface FitnessPlan {
        calories: number; // calculated target
        protein: number;
        carbs: number;
        fats: number;
        dietPreference: "vegetarian" | "mixed";
        meals: Meal[]; // Exactly 4 items (1 breakfast, 1 lunch, 1 snacks, 1 dinner)
        workoutPlan: DailyWorkout[]; // Exactly 7 items representing Monday to Sunday
        coachNote: string; // An encouraging, specific neobrutalist coaching note based on their goal & limitations
      }

      Provide fully realistic Indian recipes (e.g., using Paneer, Roti, Dal, Poha, Makhana, Khichdi, or egg/chicken equivalents for mixed diets) matching the guidelines. Set sets and reps according to their experience (${experience}). Avoid lists of exercises that violate their physical limitations (${limitations}).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const textStr = response.text || "";
    const cleanJson = textStr.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedPlan = JSON.parse(cleanJson);
    
    // Validate we got something useful, otherwise merge or fallback
    if (parsedPlan && parsedPlan.meals && parsedPlan.workoutPlan && parsedPlan.workoutPlan.length === 7) {
      // Retain pre-vetted images for our exercises & meals if the AI doesn't specify them
      parsedPlan.meals = parsedPlan.meals.map((m: any, idx: number) => ({
        ...m,
        image: m.image || localPlan.meals[idx]?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuATkQGgWkU_-K2omGaPMFFdwYq478eKSzkH-wSVhHspjFe0-roAfNb1UjOYpE-rOTR-dZxw8OExwIfY0NPbXO8EUyCzPXHN3OMwoJjGuD_GaJo96jRt4nLC4ru3JPrveFEcNyKJYldXH1VaQJs8_MV-tpNk64o2QIM1p1EvhDo00Nud172SibhHlyZvRQ541I65iNr8otZYiMwHKsL8nE5TsmvN2SJqqWWoghnhci8C-uhoJuaBqGcR0TrXhnH-gRwpDm5jUxqgdvCC"
      }));
      parsedPlan.workoutPlan = parsedPlan.workoutPlan.map((w: any, idx: number) => ({
        ...w,
        exercises: w.exercises.map((ex: any, exIdx: number) => ({
          ...ex,
          image: ex.image || localPlan.workoutPlan[idx]?.exercises[exIdx]?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuBeOCxcysI21Pfio9GihKUu_9s_uJxOo0-z9hu8UyDkxUK3LEHaRWxXylPVTRoRcT0oeYcEHBl9xph3Uh0xsgqUT5jToZHsDKEXK-SjPdrmiPu4bu2zbS2pQobHrZcYwyQbJx35K7146pElPsb-YnrqLl08x8Wqwt7Nf94829saVGOuSqVM40ySKlDCcUCaxmYDv3SuP3Touj_ME3slfQBbObWAaiWi8df8RqmtqCBlg4o5Kh57D3zDiMfqiEnrhJORmAyNmwYfa_7-"
        }))
      }));

      return res.json({ plan: parsedPlan, source: "gemini" });
    } else {
      console.warn("Gemini output structure was invalid, falling back to local model.");
      return res.json({ plan: localPlan, source: "calculated-fallback" });
    }
  } catch (err: any) {
    console.error("Gemini Plan Generation Error:", err);
    return res.json({ plan: localPlan, source: "error-fallback", error: err.message });
  }
});

// 2. API: Coach Adaptability Check-in
app.post("/api/log-feedback", async (req, res) => {
  const { onboarding, log, completedWorkout } = req.body;

  if (!log) {
    return res.status(400).json({ error: "Missing daily log package." });
  }

  const defaultFeedback = `Good effort today on completing your checks! Keep drinking water and tracking your meals. It takes 21 days to form a habit, and you are charging forward directly. Keep it up!`;

  const ai = getGenAI();
  if (!ai) {
    return res.json({ feedback: defaultFeedback });
  }

  try {
    const prompt = `
      Act as an encouraging but realistic elite fitness coach.
      A user has logged their daily notes and feelings for their fitness journey.
      Provide a personalized, encouraging 2-4 sentence check-in response from the coach.
      Keep it direct, motivating, neo-brutalist (focused on results and consistency), avoid overly sweet fluff, and keep it friendly.
      
      User stats:
      - Goal: ${onboarding?.goal || "Fitness"}
      - Level: ${onboarding?.experience || "Intermediate"}
      - Limitations: ${onboarding?.limitations || "None"}
      
      Today's User Logs:
      - Completed Prescribed Workout: ${completedWorkout ? "YES" : "NO"}
      - Diet feeling right now: ${log.feeling} (e.g. Full, Neutral, Hungry)
      - Cravings logged: ${log.craving || "None"}
      - Core Energy rating / Comments: "${log.coachNotes || log.feeling || "Feeling good"}"
      
      Coach output guidelines:
      - Give support on their motivators.
      - If they report hunger, tell them how to adjust the meal density (e.g. add leafy greens, fiber).
      - If they report pain/discomfort, recommend reducing volume or switching to recovery options.
      - Do NOT output any JSON wrapping. Just output the coach's direct note back as plain text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    });

    return res.json({ feedback: response.text || defaultFeedback });
  } catch (err: any) {
    console.error("Gemini Coach Feedback Error:", err);
    return res.json({ feedback: defaultFeedback });
  }
});


// Vite Integration for Serving UI
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
