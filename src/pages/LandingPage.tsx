import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <Layout>
      <main className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          {/* HeroSection */}
          <section className="py-16 md:py-24 @container">
            <div className="flex flex-col gap-6 px-4 md:flex-row-reverse md:items-center">
              <div 
                className="w-full bg-center bg-no-repeat aspect-square md:aspect-video bg-cover rounded-xl min-h-[300px]" 
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAVsLdSy5u71mBs_LPlSOatIXUxePNMcfLI5DluCJzEYwyg0xzNQl8ccD0vRnt6raUU3AI43GNP971_pLymJNyHA06GEsPVmF-U_yD90-cHhd_nLctig8kY1BqnDfKE2qMq_q3v3mtuKNrx-Pxfn-TzyVns4J3fRh0M3nRWCRhHLaG7fR4dJPf3BMci1I9eRbMCckSA_ecQQSa2-O8vsfa9xo3wjmbF_Ua9W4fx7EVz2yieY4DlDJDgEILo3-9rsM8s9gE0RUQMYJDy")' }}
              ></div>
              <div className="flex flex-col gap-6 text-center md:text-left justify-center">
                <div className="flex flex-col gap-4">
                  <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-slate-50 sm:text-5xl">
                    Practice English Vocabulary with AI-Generated Quizzes and Explanations.
                  </h1>
                  <h2 className="text-base font-normal leading-normal text-slate-600 dark:text-slate-400 sm:text-lg">
                    Learn faster and more effectively with personalized exercises and instant feedback tailored just for you.
                  </h2>
                </div>
                <Link to="/dashboard" className="flex self-center md:self-start min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
                  <span className="truncate">Start Learning Now</span>
                </Link>
              </div>
            </div>
          </section>

          {/* FeatureSection */}
          <section className="flex flex-col gap-10 px-4 py-16 md:py-24" id="features">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl max-w-3xl mx-auto">
                Everything You Need to Master Vocabulary
              </h2>
              <p className="text-base font-normal leading-normal text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Our platform is packed with powerful features designed to make learning engaging and effective.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-0">
              {[
                { icon: 'style', title: 'Dynamic Flashcards', text: 'Study new words with our intelligent flashcard system.' },
                { icon: 'smart_toy', title: 'Personalized AI Exercises', text: 'Take quizzes that adapt to your skill level and learning pace.' },
                { icon: 'spark', title: 'Instant AI Explanations', text: 'Understand words deeply with clear, AI-powered definitions.' },
                { icon: 'monitoring', title: 'Track Your Progress', text: 'Monitor your improvement with detailed performance reports.' }
              ].map((feature, idx) => (
                <div key={idx} className="flex flex-1 gap-4 rounded-xl border border-slate-200 bg-white/50 p-6 flex-col dark:bg-slate-900/50 dark:border-slate-800">
                  <span className="material-symbols-outlined text-primary text-3xl">{feature.icon}</span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-50">{feature.title}</h3>
                    <p className="text-sm font-normal leading-normal text-slate-600 dark:text-slate-400">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-16 md:py-24">
            <div className="text-center">
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-50 px-4 pb-10">Learning in Three Simple Steps</h2>
            </div>
            <div className="grid grid-cols-[40px_1fr] gap-x-4 px-4 max-w-2xl mx-auto">
               {[
                { icon: 'person_add', title: 'Sign Up for Free', text: 'Create your personalized learning account in seconds.' },
                { icon: 'quiz', title: 'Take a Quiz', text: 'Start with our adaptive quizzes that identify your vocabulary level.' },
                { icon: 'task_alt', title: 'Get Instant Feedback', text: 'Receive AI-generated explanations to solidify your understanding.', last: true }
               ].map((step, idx) => (
                 <React.Fragment key={idx}>
                    <div className="flex flex-col items-center gap-2 pt-3">
                      <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary">
                        <span className="material-symbols-outlined">{step.icon}</span>
                      </div>
                      {!step.last && <div className="w-[2px] bg-slate-200 dark:bg-slate-800 h-full grow min-h-[20px]"></div>}
                    </div>
                    <div className="flex flex-1 flex-col py-3 pb-10">
                      <p className="text-lg font-medium leading-normal text-slate-900 dark:text-slate-50">{step.title}</p>
                      <p className="text-base font-normal leading-normal text-slate-600 dark:text-slate-400">{step.text}</p>
                    </div>
                 </React.Fragment>
               ))}
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-16 md:py-24">
            <div className="flex flex-col items-center justify-center gap-6 rounded-xl bg-slate-100 dark:bg-slate-900 p-8 md:p-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Ready to Boost Your Vocabulary?</h2>
              <p className="max-w-md text-base text-slate-600 dark:text-slate-400">Join thousands of learners and start improving your English skills today. It's free to get started!</p>
              <Link to="/auth" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
                <span className="truncate">Sign Up for Free</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
};

export default LandingPage;