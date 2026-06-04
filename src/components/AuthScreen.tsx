/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { Mail, Lock, ShieldAlert, Sparkles, Eye, EyeOff, Activity, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthScreenProps {
  onSuccess: (user: any) => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorCode, setErrorCode] = React.useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      setError("Firebase database is currently not provisioned. Please click 'Accept' on the Firebase platform terms prompt first!");
      return;
    }

    setError(null);
    setErrorCode(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      onSuccess(credential.user);
    } catch (err: any) {
      console.error("Google authentication failed:", err);
      setErrorCode(err?.code || null);
      let friendlyMessage = err.message || "An authentication error occurred.";
      if (err.code === 'auth/popup-closed-by-user') {
        friendlyMessage = "The Google login window was closed before completing.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        friendlyMessage = "The authentication request was cancelled.";
      } else if (err.code === 'auth/network-request-failed') {
        friendlyMessage = "Network error. Please check your internet connection.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      setError("Firebase database is currently not provisioned. Please click 'Accept' on the Firebase platform terms prompt first!");
      return;
    }

    if (!email || !password) {
      setError("Please fill in all core fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError(null);
    setErrorCode(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Log in user
        const credential = await signInWithEmailAndPassword(auth, email, password);
        onSuccess(credential.user);
      } else {
        // Sign up user
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(credential.user, { displayName });
        }
        onSuccess(credential.user);
      }
    } catch (err: any) {
      console.error("Authentication action failed:", err);
      setErrorCode(err?.code || null);
      let friendlyMessage = err.message || "An authentication error occurred.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        friendlyMessage = "Incorrect email or password combination.";
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = "This email is already registered. Please sign in instead.";
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.code === 'auth/network-request-failed') {
        friendlyMessage = "Network error. Please check your internet connection.";
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyMessage = "Email/Password provider is currently not enabled in your Firebase Console.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto" id="auth-main-card">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 relative"
      >
        {/* Dynamic header design */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Activity size={24} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-800">
            {isLogin ? 'Sign In to Coach' : 'Create Athlete Profile'}
          </h2>
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mt-1">
            {isLogin ? 'Welcome back! Synced macro data matches' : 'Register securely using your profile'}
          </p>
        </div>

        {/* Missing configuration banner warning */}
        {!isFirebaseConfigured && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-left" id="firebase-missing-warning">
            <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase text-amber-800 mb-0.5">Firebase Activation Needed</p>
              <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                To connect your real persistent database and accounts, click the **Accept** button in the **Firebase terms prompt** on your screen. This will immediately provision your secure Cloud Firestore!
              </p>
            </div>
          </div>
        )}

        {/* Google Authentication Button (Primary Recommended Option, since Google is already configured and enabled) */}
        <div className="mb-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all hover:cursor-pointer shadow-sm flex items-center justify-center gap-3 disabled:opacity-50 border border-slate-800"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" referrerPolicy="no-referrer">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.81-2.09-1.03-3.61-.19-2.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
          <p className="text-[10px] text-center text-emerald-600 font-bold mt-1.5 uppercase tracking-wide">
            ⚡ Recommended: Log in instantly with list-approved credentials
          </p>
        </div>

        <div className="relative flex items-center justify-center my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative px-3 bg-white text-[10px] font-bold uppercase text-slate-400 tracking-widest leading-none">
            or use email options
          </span>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold leading-relaxed" id="auth-error-banner">
            {errorCode === 'auth/operation-not-allowed' ? (
              <div className="space-y-2 text-left">
                <p className="font-bold text-red-700">Email/Password Sign-In is Disabled</p>
                <p className="text-[11px] leading-relaxed text-red-600 font-medium">
                  Since this is an AI Studio sandbox project, adding new auth providers might be restricted. <strong>Please click the "Continue with Google" button above</strong> to log in instantly!
                </p>
              </div>
            ) : (
              <div className="text-center">{error}</div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Your Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
              />
              <Mail size={14} className="text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6+ characters"
                required
                className="w-full h-10 pl-9 pr-10 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
              />
              <Lock size={14} className="text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 hover:cursor-pointer text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all hover:cursor-pointer shadow-sm shadow-emerald-650/10 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin text-sm">⚙</span> SECURING PROTOCOLS...
              </span>
            ) : (
              <>
                <span>{isLogin ? 'Log In to System' : 'Create My Account'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-400 uppercase tracking-tight">
            {isLogin ? "Need a fresh profile?" : "Already possess account?"}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-emerald-600 hover:text-emerald-700 uppercase tracking-wider hover:underline hover:cursor-pointer"
          >
            {isLogin ? 'REGISTER HERE' : 'LOG IN NOW'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
