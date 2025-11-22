import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        if (error) throw error;
        toast.success('Registration successful! Please check your email to verify your account.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200">
      {/* Header */}
      <header className="absolute top-0 left-0 flex w-full items-center justify-between p-6 sm:p-8">
        <Link to="/" className="flex items-center gap-3 text-slate-900 dark:text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-royal text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Vocab AI</h2>
        </Link>
      </header>

      <main className="w-full max-w-md">
        <div className="flex flex-col rounded-xl bg-surface-light dark:bg-surface-dark shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
          {/* Page Heading & Toggle */}
          <div className="p-8">
            <div className="flex flex-col gap-2 text-center">
              <p className="text-3xl font-black tracking-tighter">{isLogin ? 'Welcome Back' : 'Create Your Account'}</p>
              <p className="text-slate-500 dark:text-slate-400">
                {isLogin ? 'Enter your details to access your account.' : 'Start your journey to mastering English vocabulary.'}
              </p>
            </div>
            <div className="mt-8">
              <div className="flex h-12 flex-1 items-center justify-center rounded-lg bg-background-light dark:bg-background-dark p-1.5 ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal transition-all ${!isLogin ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  <span className="truncate">Sign Up</span>
                </button>
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal transition-all ${isLogin ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  <span className="truncate">Log In</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-6 px-8 pb-8" onSubmit={handleAuth}>
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}
            <label className="flex flex-col gap-2">
              <p className="text-sm font-medium">Email Address</p>
              <input
                className="h-12 w-full rounded-lg border-slate-200 bg-background-light p-3 text-sm placeholder:text-slate-400 focus:border-royal focus:ring-2 focus:ring-royal/20 dark:border-slate-700 dark:bg-background-dark dark:placeholder:text-slate-500 dark:focus:border-royal outline-none transition-all"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium">Password</p>
                {isLogin && <a className="text-sm text-royal hover:underline" href="#">Forgot Password?</a>}
              </div>
              <div className="relative flex w-full items-stretch">
                <input
                  className="h-12 w-full rounded-lg border-slate-200 bg-background-light p-3 pr-10 text-sm placeholder:text-slate-400 focus:border-royal focus:ring-2 focus:ring-royal/20 dark:border-slate-700 dark:bg-background-dark dark:placeholder:text-slate-500 dark:focus:border-royal outline-none transition-all"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button aria-label="Toggle password visibility" className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" type="button">
                  <span className="material-symbols-outlined text-xl">visibility_off</span>
                </button>
              </div>
              {!isLogin && <p className="text-xs text-slate-500 dark:text-slate-400">Password must be at least 6 characters.</p>}
            </label>

            {!isLogin && (
              <label className="flex flex-col gap-2">
                <p className="text-sm font-medium">Confirm Password</p>
                <div className="relative flex w-full items-stretch">
                  <input
                    className={`h-12 w-full rounded-lg border-slate-200 bg-background-light p-3 pr-10 text-sm placeholder:text-slate-400 focus:border-royal focus:ring-2 focus:ring-royal/20 dark:border-slate-700 dark:bg-background-dark dark:placeholder:text-slate-500 dark:focus:border-royal outline-none transition-all ${confirmPassword && password !== confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                    placeholder="Re-enter your password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {confirmPassword && password !== confirmPassword && <p className="text-xs text-red-500">Passwords do not match.</p>}
              </label>
            )}

            <div className="flex flex-col gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-royal text-base font-bold text-white shadow-sm transition-colors hover:bg-royal/90 disabled:opacity-70"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span>{isLogin ? 'Log In' : 'Create Account'}</span>
                )}
              </button>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <span className="mx-4 flex-shrink text-xs font-medium text-slate-500 dark:text-slate-400">OR</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              </div>

              <button type="button" className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-lg bg-white text-base font-medium text-slate-900 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-gray-50 dark:bg-surface-dark dark:text-white dark:ring-slate-700 dark:hover:bg-slate-800">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_303_52)"><path d="M22.4831 12.2619C22.4831 11.4552 22.4116 10.6667 22.2753 9.90476H12.2422V14.3492H18.1731C17.9103 15.9365 17.0674 17.2794 15.7731 18.1556V21.1079H19.6881C21.5714 19.3492 22.4831 16.1429 22.4831 12.2619Z" fill="#4285F4"></path><path d="M12.2422 23.0001C15.2285 23.0001 17.727 22.0191 19.6881 20.4572L15.7731 17.5048C14.792 18.181 13.5857 18.581 12.2422 18.581C9.64278 18.581 7.42849 16.8921 6.57135 14.581H2.53564V17.6191C4.48309 20.8731 8.08658 23.0001 12.2422 23.0001Z" fill="#34A853"></path><path d="M6.57135 14.5809C6.34754 13.9047 6.21421 13.1809 6.21421 12.4285C6.21421 11.6761 6.34754 10.9523 6.57135 10.2761V7.23804H2.53564C1.72849 8.84439 1.25309 10.5936 1.25309 12.4285C1.25309 14.2634 1.72849 16.0126 2.53564 17.619L6.57135 14.5809Z" fill="#FBBC05"></path><path d="M12.2422 6.27619C13.7848 6.27619 15.0531 6.8254 15.7048 7.44127L19.7762 3.53016C17.727 1.68571 15.2285 0.857143 12.2422 0.857143C8.08658 0.857143 4.48309 2.98413 2.53564 6.2381L6.57135 9.27619C7.42849 6.96508 9.64278 6.27619 12.2422 6.27619Z" fill="#EA4335"></path></g><defs><clipPath id="clip0_303_52"><rect fill="white" height="22.1429" transform="translate(1.1748 0.857143)" width="21.3333"></rect></clipPath></defs></svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </form>
        </div>
        <footer className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>By creating an account, you agree to our <a className="font-medium text-royal hover:underline" href="#">Terms of Service</a> and <a className="font-medium text-royal hover:underline" href="#">Privacy Policy</a>.</p>
        </footer>
      </main>
    </div>
  );
};

export default AuthPage;