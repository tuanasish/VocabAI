import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { currentUser } from '../data';

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideHeader = false }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  // Different themes for Landing vs App
  const navLinkClass = isLanding 
    ? "text-sm font-medium leading-normal text-slate-800 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
    : "text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm font-medium leading-normal";

  const activeNavLinkClass = "text-primary dark:text-primary text-sm font-bold leading-normal";

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden group/design-root bg-background-light dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        {!hideHeader && (
          <div className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
             <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex justify-center">
              <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
                <header className="flex items-center justify-between whitespace-nowrap px-4 sm:px-10 py-3">
                  <Link to="/" className="flex items-center gap-4 text-slate-900 dark:text-slate-50">
                    <div className="size-6 text-primary">
                      <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fillRule="evenodd"></path>
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">VocabAI</h2>
                  </Link>

                  {isLanding ? (
                     <div className="flex flex-1 justify-end gap-8">
                      <div className="hidden md:flex items-center gap-9">
                        <a className={navLinkClass} href="#features">Features</a>
                        <a className={navLinkClass} href="#pricing">Pricing</a>
                      </div>
                      <div className="flex gap-2">
                        <Link to="/auth" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-200 text-slate-900 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <span className="truncate">Log In</span>
                        </Link>
                        <Link to="/auth" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
                          <span className="truncate">Sign Up</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="hidden md:flex flex-1 justify-center gap-8">
                        <div className="flex items-center gap-9">
                          <Link to="/dashboard" className={location.pathname === '/dashboard' ? activeNavLinkClass : navLinkClass}>Dashboard</Link>
                          <Link to="/explore" className={location.pathname === '/explore' || location.pathname.startsWith('/sets') ? activeNavLinkClass : navLinkClass}>Vocabulary Sets</Link>
                          <a href="#" className={navLinkClass}>Quizzes</a>
                          <a href="#" className={navLinkClass}>Community</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <button className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
                          <span className="truncate">Upgrade</span>
                        </button>
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-slate-200 dark:border-slate-700" style={{ backgroundImage: `url("${currentUser.avatar}")` }}></div>
                         <button className="flex md:hidden max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                          <span className="material-symbols-outlined text-xl">menu</span>
                        </button>
                      </div>
                    </>
                  )}
                </header>
              </div>
            </div>
          </div>
        )}

        {children}

        {isLanding && (
          <footer className="px-4 md:px-10 lg:px-20 xl:px-40 flex justify-center py-5 border-t border-slate-200 dark:border-slate-800">
            <div className="layout-content-container flex flex-col sm:flex-row items-center justify-between gap-4 max-w-[960px] flex-1 px-4 sm:px-10">
              <p className="text-sm text-slate-600 dark:text-slate-400">© 2024 VocabAI. All rights reserved.</p>
              <div className="flex items-center gap-6 text-sm">
                <a className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">About Us</a>
                <a className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">Contact</a>
                <a className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" href="#">Privacy Policy</a>
              </div>
            </div>
          </footer>
        )}
         {!isLanding && !hideHeader && (
          <footer className="w-full mt-auto border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <div className="text-primary size-5">
                    <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" /></svg>
                  </div>
                  <span className="text-sm">© 2024 Vocab AI. All rights reserved.</span>
                </div>
                <div className="flex items-center gap-6">
                  <a className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary" href="#">About</a>
                  <a className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary" href="#">Help</a>
                  <a className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary" href="#">Settings</a>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Layout;