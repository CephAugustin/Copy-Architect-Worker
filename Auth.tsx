import React, { useState } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, signOut, signInWithPopup } from 'firebase/auth';
import { ZapIcon, Loader2, ShieldCheck, Mail, Lock, CheckCircle2, Chrome } from 'lucide-react';

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await sendEmailVerification(userCredential.user);
        setVerificationEmail(email.trim());
        await signOut(auth);
        setShowVerification(true);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (!userCredential.user.emailVerified) {
          setVerificationEmail(email.trim());
          await signOut(auth);
          setShowVerification(true);
        } else {
          onLogin();
        }
      }
    } catch (err: any) {
      console.error('Auth failed', err);
      if (isSignUp) {
        if (err.code === 'auth/email-already-in-use') {
          setError('User already exists. Please sign in');
        } else {
          setError(err.message);
        }
      } else {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          setError('Email or password is incorrect');
        } else {
          setError(err.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (err: any) {
      console.error('Google auth failed', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="w-full max-w-md bg-[#0f172a]/80 border border-slate-800/60 rounded-[2rem] p-10 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500 relative z-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-6">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Verify <span className="text-emerald-400">Email</span></h1>
            <p className="text-slate-300 text-sm font-medium leading-relaxed">
              We have sent you a verification email to <span className="text-emerald-400 font-bold">{verificationEmail}</span>. Please verify it and log in.
            </p>
          </div>
          
          <button
            onClick={() => { setShowVerification(false); setIsSignUp(false); setEmail(''); setPassword(''); }}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(99,102,241,0.2)]"
          >
            Login
          </button>

          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
            Security Verification Required
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="w-full max-w-md bg-[#0f172a]/80 border border-slate-800/60 rounded-[2rem] p-10 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500 relative z-10">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
          <ZapIcon size={32} className="text-white" fill="currentColor" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">New <span className="text-indigo-400">Copy Factory</span></h1>
          <p className="text-slate-400 text-sm font-medium">
            {isSignUp ? 'Create your account to continue.' : 'Sign in to your account to continue.'}
          </p>
        </div>
        
        {error && (
          <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="w-full space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(99,102,241,0.2)] disabled:opacity-50 disabled:grayscale"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <ShieldCheck size={20} />
            )}
            {isSignUp ? 'Sign Up' : 'Access System'}
          </button>
        </form>

        <div className="w-full flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-slate-800"></div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">OR</span>
          <div className="h-px flex-1 bg-slate-800"></div>
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Chrome size={20} />}
          Continue with Google
        </button>

        <div className="pt-2">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-black uppercase tracking-widest transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
          Secured by Firebase Enterprise Authentication
        </p>
      </div>
    </div>
  );
}
