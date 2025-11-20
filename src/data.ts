import { VocabularySet, UserStats } from './types';

export const currentUser = {
  name: "Anna",
  level: "Beginner level",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-nZ6BvYitDUvjAYM7e5kEgqSwlAtq4s2SFPMZI8H_Z7BkCosm0KbuZCCp4dhxWgqoO-pEdFkMgoMzXHY847nModYnkEdPNERYnkRM8kHYIJSQAmtNVFFjmbudNmOB6jWuNoJDvvj5tnHlVuHUlAt7s8HNFiwtrkT7AoWApUdayrHKmeXU50W6-9akCLD8Kh5KZJ88ksoCYGhCfGpqmF8DDFfGLeyyPKc5FU6a4wvxAKNHk9UMfpZHiK8EOWNolloBLWUl20hjOksj"
};

export const userStats: UserStats = {
  dailyGoal: 10,
  currentProgress: 7,
  wordsLearned: 142,
  quizAccuracy: 92
};

const ieltsWords = [
  { id: '1', word: 'analyze', phonetic: '/ˈænəlaɪz/', type: 'verb', meaning: 'examine in detail the constitution or structure of something', example: 'The scientist will analyze the data.' },
  { id: '2', word: 'approach', phonetic: '/əˈproʊtʃ/', type: 'noun', meaning: 'a way of dealing with something', example: 'We need a new approach to the problem.' },
  { id: '3', word: 'assess', phonetic: '/əˈses/', type: 'verb', meaning: 'evaluate or estimate the nature, ability, or quality of', example: 'The test is used to assess a student\'s ability.' },
  { id: '4', word: 'concept', phonetic: '/ˈkɒnsept/', type: 'noun', meaning: 'an abstract idea', example: 'It\'s a difficult concept to grasp.' },
  { id: '5', word: 'establish', phonetic: '/ɪˈstæblɪʃ/', type: 'verb', meaning: 'set up on a firm or permanent basis', example: 'The company was established in 1990.' },
  { id: '6', word: 'indicate', phonetic: '/ˈɪndɪkeɪt/', type: 'verb', meaning: 'point out; show', example: 'Research indicates that the drug is effective.' },
  { id: '7', word: 'significant', phonetic: '/sɪgˈnɪfɪkənt/', type: 'adj', meaning: 'sufficiently great or important to be worthy of attention', example: 'A significant increase in sales.' },
  { id: '8', word: 'method', phonetic: '/ˈmɛθəd/', type: 'noun', meaning: 'a particular procedure for accomplishing or approaching something', example: 'A new method of production.' },
  { id: '9', word: 'period', phonetic: '/ˈpɪərɪəd/', type: 'noun', meaning: 'a length or portion of time', example: 'A six-week period.' },
  { id: '10', word: 'factor', phonetic: '/ˈfæktər/', type: 'noun', meaning: 'a circumstance, fact, or influence that contributes to a result', example: 'Cost is a major factor.' },
];

const travelWords = [
  { id: '1', word: 'ephemeral', phonetic: '/əˈfem(ə)rəl/', type: 'adj', meaning: 'lasting for a very short time', example: 'The beauty of the cherry blossoms is ephemeral.' },
  { id: '2', word: 'wanderlust', phonetic: '/ˈwɒndəlʌst/', type: 'noun', meaning: 'a strong desire to travel', example: 'His wanderlust took him all over the world.' },
  { id: '3', word: 'itinerary', phonetic: '/ʌɪˈtɪn(ə)(rə)ri/', type: 'noun', meaning: 'a planned route or journey', example: 'We have a packed itinerary.' },
  { id: '4', word: 'scenic', phonetic: '/ˈsiːnɪk/', type: 'adj', meaning: 'providing or relating to views of impressive or beautiful natural scenery', example: 'The scenic route is much nicer.' },
];

export const vocabularySets: VocabularySet[] = [
  {
    id: 'ielts-5',
    title: 'IELTS Academic - Unit 5',
    description: 'Master key terms for meetings, presentations, and professional emails.',
    wordCount: 10,
    level: 'Intermediate',
    icon: 'school',
    words: ieltsWords,
    category: 'Academic',
    colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  },
  {
    id: 'travel-1',
    title: 'Travel & Holidays',
    description: 'Navigate airports, hotels, and new cities with confidence.',
    wordCount: 40,
    level: 'Beginner',
    icon: 'flight',
    words: travelWords,
    category: 'Travel',
    colorClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  },
  {
    id: 'business-1',
    title: 'Essential Business English',
    description: 'Key terms for the corporate world.',
    wordCount: 30,
    level: 'Intermediate',
    icon: 'work',
    words: [],
    category: 'Business',
    colorClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  },
  {
    id: 'nature-1',
    title: 'The Natural World',
    description: 'Explore terminology related to biology and environment.',
    wordCount: 80,
    level: 'Advanced',
    icon: 'nature_people',
    words: [],
    category: 'Science',
    colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  },
   {
    id: 'tech-1',
    title: 'Technology',
    description: 'Words related to computers and AI.',
    wordCount: 150,
    level: 'Advanced',
    icon: 'devices',
    words: [],
    category: 'Technology',
    colorClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  },
  {
    id: 'food-1',
    title: 'Food & Dining',
    description: 'Order with confidence in any restaurant.',
    wordCount: 60,
    level: 'Beginner',
    icon: 'restaurant',
    words: [],
    category: 'Food',
    colorClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }
];
