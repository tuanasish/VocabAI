import React from 'react';
import Layout from '../components/Layout';
import { vocabularySets } from '../data';
import { Link } from 'react-router-dom';

const ExploreSetsPage: React.FC = () => {
  return (
    <Layout>
       <main className="px-4 md:px-8 flex-1 py-8 container mx-auto">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filtering Sidebar */}
          <aside className="w-full lg:w-1/4 xl:w-1/5">
            <div className="sticky top-24 flex flex-col gap-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              {/* SearchBar */}
              <div>
                <label className="flex flex-col h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                    <div className="flex items-center justify-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800 pl-4 text-slate-400">
                      <span className="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800 px-4 text-base font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-royal focus:ring-1 focus:ring-royal/50 outline-none" placeholder="Search..." />
                  </div>
                </label>
              </div>
              
              {/* Topic Filters */}
              <div>
                <h3 className="text-base font-semibold mb-3 dark:text-white">Topics</h3>
                <div className="space-y-2">
                  {['Business', 'Travel', 'Science', 'Technology', 'Health'].map(topic => (
                    <label key={topic} className="flex items-center gap-3 cursor-pointer">
                      <input className="form-checkbox h-4 w-4 rounded border-slate-300 text-royal focus:ring-royal" type="checkbox" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{topic}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty Filters */}
              <div>
                <h3 className="text-base font-semibold mb-3 dark:text-white">Difficulty</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-full px-4 py-1.5 text-sm font-medium bg-royal/10 text-royal">Beginner</button>
                  <button className="rounded-full px-4 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Intermediate</button>
                  <button className="rounded-full px-4 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Advanced</button>
                </div>
              </div>
              
              <button className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-lg h-11 bg-royal text-white text-sm font-bold tracking-wide hover:bg-royal/90 transition-colors">
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Vocabulary Sets Grid */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Explore Vocabulary Sets</h1>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {vocabularySets.map((set) => (
                <div key={set.id} className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                   <div className="flex-1">
                    <div className="mb-2">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${set.colorClass}`}>
                        {set.level}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{set.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{set.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{set.wordCount} Words</span>
                    <Link to={`/sets/${set.id}`} className="flex items-center justify-center gap-2 rounded-lg bg-royal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-royal/90">
                      Start
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined !text-lg">chevron_left</span>
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Page 1 of 10</span>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined !text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
       </main>
    </Layout>
  );
};

export default ExploreSetsPage;