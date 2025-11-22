import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface VocabularySet {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  color_class: string;
  icon: string;
  author_name: string | null;
  downloads: number;
  word_count?: number;
  image_url?: string | null;
  created_at: string;
}

const ExploreSetsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sets, setSets] = useState<VocabularySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'a-z'>('popular');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchPublicSets();
  }, [sortBy, page]); // Re-fetch when sort or page changes

  const fetchPublicSets = async () => {
    try {
      let query = supabase
        .from('vocabulary_sets')
        .select('*, words(count)')
        .eq('is_public', true);

      // Sorting
      if (sortBy === 'popular') {
        query = query.order('downloads', { ascending: false });
      } else if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'a-z') {
        query = query.order('title', { ascending: true });
      }

      // Pagination
      const from = 0;
      const to = page * ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      const formattedSets = data?.map(set => ({
        ...set,
        word_count: set.words?.[0]?.count || 0
      })) || [];

      setSets(formattedSets);

      // Check if there are more items to load
      if (data && data.length < page * ITEMS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    } catch (error) {
      console.error('Error fetching sets:', error);
      toast.error('Failed to load vocabulary sets');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const filteredSets = sets.filter(set => {
    const matchesSearch = set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !selectedLevel || set.level === selectedLevel;
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(set.category);

    return matchesSearch && matchesLevel && matchesCategory;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Featured sets are always the top 3 most downloaded, regardless of current sort/filter
  const featuredSets = [...sets].sort((a, b) => b.downloads - a.downloads).slice(0, 3);

  if (loading && sets.length === 0) {
    return (
      <Layout>
        <main className="px-4 md:px-8 flex-1 py-8 container mx-auto">
          <LoadingSkeleton />
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="px-4 md:px-8 flex-1 py-8 container mx-auto">
        <div className="flex flex-col gap-8">

          {/* Featured Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-500">star</span>
              Featured Sets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredSets.map(set => (
                <Link
                  key={set.id}
                  to={`/sets/${set.id}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[16/9] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url("${set.image_url || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'}")` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/10">
                        {set.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary text-white">
                        {set.level}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{set.title}</h3>
                    <p className="text-slate-300 text-sm line-clamp-1">{set.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-slate-300 text-xs font-medium">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">download</span>
                        {set.downloads}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                        {set.word_count} words
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <div className="flex flex-col lg:flex-row gap-8 mt-8">
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
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800 px-4 text-base font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none"
                        placeholder="Search..."
                      />
                    </div>
                  </label>
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="text-base font-semibold mb-3 dark:text-white">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 dark:text-white"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest First</option>
                    <option value="a-z">Name (A-Z)</option>
                  </select>
                </div>

                {/* Category Filters */}
                <div>
                  <h3 className="text-base font-semibold mb-3 dark:text-white">Categories</h3>
                  <div className="space-y-2">
                    {['Business', 'Travel', 'Education', 'Technology', 'Health'].map(category => (
                      <label key={category} className="flex items-center gap-3 cursor-pointer">
                        <input
                          className="form-checkbox h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filters */}
                <div>
                  <h3 className="text-base font-semibold mb-3 dark:text-white">Difficulty</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedLevel === level
                          ? 'bg-primary/10 text-primary'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLevel(null);
                    setSelectedCategories([]);
                    setSortBy('popular');
                  }}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-lg h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold tracking-wide hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </aside>

            {/* Vocabulary Sets Grid */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">All Sets</h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{filteredSets.length} sets found</p>
                </div>
              </div>

              {filteredSets.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700">search_off</span>
                  <p className="mt-4 text-slate-600 dark:text-slate-400">No sets found matching your criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredSets.map((set) => (
                    <div key={set.id} className="group flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                      {/* Card Image Header */}
                      <div
                        className="h-32 bg-cover bg-center relative"
                        style={{ backgroundImage: `url("${set.image_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80'}")` }}
                      >
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute top-3 right-3">
                          <span className={`inline-block rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur-sm border border-white/20`}>
                            {set.level}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-primary">
                          <span className="material-symbols-outlined text-sm">folder_open</span>
                          {set.category}
                        </div>

                        <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">{set.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-1">{set.description}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1" title="Downloads">
                              <span className="material-symbols-outlined text-sm">download</span>
                              {set.downloads}
                            </span>
                            <span className="flex items-center gap-1" title="Words">
                              <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                              {set.word_count}
                            </span>
                          </div>

                          <Link
                            to={`/sets/${set.id}`}
                            className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && filteredSets.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined">expand_more</span>
                    )}
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ExploreSetsPage;