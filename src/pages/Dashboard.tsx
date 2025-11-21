import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { currentUser, userStats } from '../data'; // Keep userStats mock for now
import { Link } from 'react-router-dom';
import { useVocabularySets } from '../lib/hooks';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../types/supabase';
import CreateSetModal from '../components/CreateSetModal';
import GenerateSetModal from '../components/GenerateSetModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EditSetModal from '../components/EditSetModal';
import DueWordsWidget from '../components/DueWordsWidget';
import { progressApi, SetProgress } from '../lib/api/progressApi';
import ActionMenu from '../components/ActionMenu';
import { useProfile } from '../hooks/useProfile';

type VocabularySet = Database['public']['Tables']['vocabulary_sets']['Row'] & {
  words: { count: number }[];
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  // Use custom hook instead of manual state management
  const { sets, loading, fetchSets, deleteSet: deleteSetApi, updateSet } = useVocabularySets();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Delete confirmation states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<VocabularySet | null>(null);

  // Edit states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [setToEdit, setSetToEdit] = useState<VocabularySet | null>(null);

  // Progress tracking states
  const [totalWordsDue, setTotalWordsDue] = useState(0);
  const [setProgress, setSetProgress] = useState<Record<string, SetProgress>>({});
  const [progressLoading, setProgressLoading] = useState(false);

  // Filter and sort sets
  const filteredAndSortedSets = React.useMemo(() => {
    let filtered = sets;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(set =>
        set.title?.toLowerCase().includes(query) ||
        set.description?.toLowerCase().includes(query) ||
        set.topic?.toLowerCase().includes(query) ||
        set.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(set => set.category === categoryFilter);
    }

    // Level filter
    if (levelFilter !== 'All') {
      filtered = filtered.filter(set => set.level === levelFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'alphabetical':
          return (a.title || '').localeCompare(b.title || '');
        case 'most-words':
          return (b.words?.[0]?.count || 0) - (a.words?.[0]?.count || 0);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return sorted;
  }, [sets, searchQuery, categoryFilter, levelFilter, sortBy]);

  const handleDeleteSet = async () => {
    if (!setToDelete) return;

    try {
      await deleteSetApi(setToDelete.id);
      setConfirmDialogOpen(false);
      setSetToDelete(null);
    } catch (error: any) {
      alert(error.message || 'Failed to delete vocabulary set');
    }
  };

  const handleEditSet = (set: VocabularySet) => {
    setSetToEdit(set);
    setEditModalOpen(true);
  };

  const handleSetUpdated = () => {
    fetchSets();
  };

  // Fetch progress data for all sets
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user || sets.length === 0) return;

      setProgressLoading(true);
      try {
        // Fetch progress for each set
        const progressPromises = sets.map(async (set) => {
          const progress = await progressApi.getSetProgress(user.id, set.id);
          return { setId: set.id, progress };
        });

        const results = await Promise.all(progressPromises);

        // Build progress map
        const progressMap: Record<string, SetProgress> = {};
        let totalDue = 0;

        results.forEach(({ setId, progress }) => {
          progressMap[setId] = progress;
          totalDue += progress.wordsDueToday;
        });

        setSetProgress(progressMap);
        setTotalWordsDue(totalDue);
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setProgressLoading(false);
      }
    };

    fetchProgress();
  }, [user, sets]);

  return (
    <Layout>
      <main className="px-4 sm:px-6 lg:px-8 xl:px-20 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1 gap-8">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-[#0d171b] dark:text-slate-50 text-4xl font-black leading-tight tracking-[-0.033em]">Hi, {user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">Ready to learn?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsGenerateModalOpen(true)}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-purple-600 text-white text-sm font-bold leading-normal hover:bg-purple-700 transition-colors gap-2"
              >
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                <span className="truncate">Generate with AI</span>
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal hover:opacity-90 transition-opacity gap-2"
              >
                <span className="material-symbols-outlined text-xl">add</span>
                <span className="truncate">Create New Set</span>
              </button>
            </div>
          </div>

          {/* Overview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 @container">
            {/* Continue Card */}
            <div className="flex flex-col items-stretch justify-start rounded-xl shadow-[0_0_12px_rgba(0,0,0,0.05)] bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
              <div className="w-full bg-center bg-no-repeat aspect-[16/6] bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBEhsL1IL7W4V0EOOtwHCycGVy97O8l_9cOw4bn-q8ZSPvmIAXwqgveWC_sOl0kiK-DWsiM_XZdPYsX9xd7z5zp85KNET3ySjmbJ23sXKSOMe-1LFqj-zXjX4oK3OrnK523fW2djHaKjTSihcRlcR1_Ur7VsByosAkiGyy_vspeStWegRp1nRCY4_UHkHS4hXnvsDurzpLfHCt8fxWmF8AkFuryAtybUoT8S0lnNysVGMb9WV0exJXgIN8QDPHu2Q_UsYnqtaUSZMt1")' }}></div>
              <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-4 p-6">
                <p className="text-[#0d171b] dark:text-slate-50 text-lg font-bold leading-tight tracking-[-0.015em]">Continue where you left off</p>
                <div className="flex flex-col gap-1">
                  <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">IELTS Academic - Unit 5</p>
                  <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">You are 60% through this lesson.</p>
                </div>
                {/* Progress Bar */}
                <div className="flex flex-col gap-2">
                  <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-2 w-full">
                    <div className="h-2 rounded-full bg-primary" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-3 pt-2">
                  <Link to="/sets/ielts-5" className="flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-slate-50 text-sm font-medium leading-normal hover:opacity-90 transition-opacity">
                    <span className="truncate">Resume Learning</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Gamification Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Level Card */}
              <div className="flex flex-col gap-3 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900 shadow-[0_0_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold uppercase tracking-wide">Level</p>
                  <span className="material-symbols-outlined text-purple-500 text-2xl">military_tech</span>
                </div>
                <p className="text-slate-900 dark:text-slate-50 text-4xl font-black">{profile?.level || 1}</p>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{profile?.xp || 0} XP</span>
                    <span className="text-slate-500 dark:text-slate-400">{((profile?.level || 1) * 100)} XP</span>
                  </div>
                  <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-2 w-full overflow-hidden">
                    <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${((profile?.xp || 0) % 100)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* XP Card */}
              <div className="flex flex-col gap-3 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 shadow-[0_0_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold uppercase tracking-wide">Total XP</p>
                  <span className="material-symbols-outlined text-blue-500 text-2xl">stars</span>
                </div>
                <p className="text-slate-900 dark:text-slate-50 text-4xl font-black">{profile?.xp || 0}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Keep learning to earn more!</p>
              </div>

              {/* Streak Card */}
              <div className="flex flex-col gap-3 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-slate-900 shadow-[0_0_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold uppercase tracking-wide">Streak</p>
                  <span className="material-symbols-outlined text-orange-500 text-2xl">local_fire_department</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-slate-900 dark:text-slate-50 text-4xl font-black">{profile?.streak_days || 0}</p>
                  <span className="text-slate-500 dark:text-slate-400 text-lg font-medium">days</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  {profile?.streak_days && profile.streak_days > 0 ? "Don't break the chain!" : "Start your streak today!"}
                </p>
              </div>
            </div>
          </div>

          {/* Due Words Widget */}
          <DueWordsWidget
            wordsDue={totalWordsDue}
            loading={progressLoading}
            firstSetWithDueWords={
              Object.entries(setProgress).find(([_, progress]) => (progress as SetProgress).wordsDueToday > 0)?.[0]
            }
          />

          {/* Vocabulary Sets Section */}
          <div className="flex flex-col gap-6 pt-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h3 className="text-2xl font-bold dark:text-white">Your Vocabulary Sets</h3>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-primary focus:border-primary text-sm outline-none"
                    placeholder="Search topics..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Filters and Sort */}
              <div className="flex flex-wrap gap-3">
                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="General">General</option>
                  <option value="Academic">Academic</option>
                  <option value="Business">Business</option>
                  <option value="Travel">Travel</option>
                  <option value="Technology">Technology</option>
                </select>

                {/* Level Filter */}
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="most-words">Most Words</option>
                </select>

                {/* Clear Filters Button */}
                {(searchQuery || categoryFilter !== 'All' || levelFilter !== 'All' || sortBy !== 'newest') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('All');
                      setLevelFilter('All');
                      setSortBy('newest');
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : filteredAndSortedSets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  <span className="material-symbols-outlined text-3xl text-slate-400">
                    {searchQuery || categoryFilter !== 'All' || levelFilter !== 'All' ? 'search_off' : 'library_books'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {searchQuery || categoryFilter !== 'All' || levelFilter !== 'All' ? 'No matching sets' : 'No sets yet'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
                  {searchQuery || categoryFilter !== 'All' || levelFilter !== 'All'
                    ? 'Try adjusting your filters or search query.'
                    : 'Create your first vocabulary set to start learning.'}
                </p>
                {!(searchQuery || categoryFilter !== 'All' || levelFilter !== 'All') && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
                  >
                    Create Set
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results count */}
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {filteredAndSortedSets.length} of {sets.length} vocabulary sets
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedSets.map((set) => (
                    <div key={set.id} className="relative group/card">
                      {/* Action Buttons - Visible on Hover */}
                      {/* Action Menu */}
                      <div className="absolute top-3 right-3 z-10">
                        <ActionMenu
                          items={[
                            {
                              label: 'Edit Set',
                              icon: 'edit',
                              onClick: () => handleEditSet(set)
                            },
                            {
                              label: 'Delete Set',
                              icon: 'delete',
                              variant: 'danger',
                              onClick: () => {
                                setSetToDelete(set);
                                setConfirmDialogOpen(true);
                              }
                            }
                          ]}
                          className="bg-white/90 dark:bg-slate-800/90 rounded-full"
                        />
                      </div>     <Link to={`/sets/${set.id}`} className="flex flex-col gap-4 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined">{set.icon || 'school'}</span>
                          </div>
                          <p className="text-lg font-bold text-slate-900 dark:text-white truncate">{set.topic || set.category}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{set.title}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 h-10">{set.description}</p>
                        </div>

                        {/* Progress Bar */}
                        {setProgress[set.id] && setProgress[set.id].totalWords > 0 && (
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 dark:text-slate-400">
                                {setProgress[set.id].wordsLearned + setProgress[set.id].wordsLearning} / {setProgress[set.id].totalWords} learned
                              </span>
                              <span className="font-medium text-primary">
                                {setProgress[set.id].progressPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-primary h-full transition-all duration-300"
                                style={{ width: `${setProgress[set.id].progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-auto">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${set.level === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                              set.level === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                                set.level === 'Advanced' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                              {set.level}
                            </span>
                            {setProgress[set.id]?.wordsDueToday > 0 && (
                              <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 animate-pulse">
                                {setProgress[set.id].wordsDueToday} due
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {set.words?.[0]?.count || 0} words
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <CreateSetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSetCreated={fetchSets}
      />
      <GenerateSetModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSetCreated={fetchSets}
      />
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        title="Delete Vocabulary Set"
        message={`Are you sure you want to delete "${setToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteSet}
        onCancel={() => setConfirmDialogOpen(false)}
      />

      <EditSetModal
        isOpen={editModalOpen}
        set={setToEdit}
        onClose={() => {
          setEditModalOpen(false);
          setSetToEdit(null);
        }}
        onSetUpdated={handleSetUpdated}
        onUpdate={updateSet}
      />
    </Layout>
  );
};

export default Dashboard;