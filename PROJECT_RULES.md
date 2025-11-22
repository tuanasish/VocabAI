# VocabAI Project Rules & Context

## 🚀 Project Overview
**VocabAI** is a vocabulary learning application utilizing Spaced Repetition System (SRS), gamification, and AI features.
**Current Status**: Phase 4.2 Complete (Admin System, Explore Page, Sound Effects).

## 🛠️ Tech Stack
- **Frontend**: React 19 (Vite), TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **AI**: Google Gemini API (Quiz Generation, Roleplay)
- **TTS**: VoiceRSS API (High-quality pronunciation)
- **Sound**: Web Audio API (Interactive feedback)
- **UI Components**: Custom components with Material Symbols icons
- **State Management**: React Context + Custom Hooks

## 📂 Architecture & Structure
- `src/lib/api/`: Supabase API wrappers (e.g., `vocabularyApi.ts`, `progressApi.ts`). **Always** use these, never call Supabase directly in components.
- `src/lib/hooks/`: Custom hooks for state & logic (e.g., `useVocabularySets.ts`, `useProgress.ts`).
- `src/hooks/`: Application-level hooks (`useProfile.ts`, `useSound.ts`, `useSpeech.ts`).
- `src/components/`: Reusable UI components.
- `src/pages/`: Route components.
- `src/types/supabase.ts`: Generated Supabase types. **Do not edit manually**.

## 📝 Coding Standards & Rules

### 1. Error Handling & Notifications
- **NEVER** use `alert()` or `console.error()` alone for user feedback.
- **ALWAYS** use `react-hot-toast` for success/error notifications.
- Example: `toast.error(error.message)` or `toast.success('Saved!')`.

### 2. TypeScript & Types
- **Strict Typing**: Avoid `any`. Use defined interfaces.
- **Supabase Types**: Use `Database` type from `types/supabase.ts`.
- **Type Safety**: Always type function parameters and return values.

### 3. Component Patterns
- Use **Functional Components** with Hooks.
- **Logic Separation**: Move complex logic to custom hooks (`lib/hooks/` or `hooks/`).
- **Tailwind**: Use utility classes. Avoid inline styles except for dynamic values.
- **Accessibility**: Use semantic HTML and ARIA labels where needed.

### 4. SRS Implementation (Spaced Repetition)
- **Algorithm**: SM-2 (implemented in `lib/srsAlgorithm.ts`).
- **Progress Tracking**: `user_progress` table.
- **Review Flow**: `LearnPage.tsx` handles the session.
- **Key Logic**:
  - `next_review_at` determines due words.
  - `interval` and `ease_factor` adjust based on performance.

### 5. Gamification System
- **XP Rewards**: Defined in `lib/gamification.ts`
  - Quiz Completed: +50 XP
  - Perfect Quiz: +25 XP
  - Daily Streak: +10 XP
- **Levels**: Calculated from total XP
- **Streaks**: Track consecutive days of learning
- **Functions**: `awardXP()`, `updateStreak()`, `calculateLevel()`

### 6. Sound Effects
- **Hook**: `useSound()` from `hooks/useSound.ts`
- **Implementation**: Web Audio API (synthesized sounds)
- **Settings**: Stored in localStorage
- **Usage**: `sound.play.correct()`, `sound.play.wrong()`, etc.

### 7. Admin System
- **Access Control**: Email-based (hardcoded in `AdminRoute.tsx`)
- **Admin Email**: `tuanasishh@gmail.com`
- **Routes**: Protected with `<AdminRoute>` wrapper
- **Permissions**: Can manage all sets, toggle public status

## 📅 Roadmap Status

### ✅ Completed
- **Phase 1 & 2**: Core CRUD, Auth, Basic UI
- **Phase 3.1 (SRS)**: SM-2 Algorithm, Flashcard Review, Session Summary
- **Phase 3.2 (Dashboard)**: Due Words Widget, Set Progress Bars
- **Phase 3.3 (Gamification)**: XP System, Levels, Streaks, Badges
- **Phase 4.1 (AI Features)**: AI Quiz Generation, Roleplay Mode
- **Phase 4.2 (Enhancements)**:
  - Admin Dashboard & Content Management
  - Explore Page with Featured Sets
  - VoiceRSS TTS Integration
  - Sound Effects System
  - Project Cleanup

### 🚧 Next Steps
- **Phase 4.3**: RLS Policy fixes for admin profile access
- **Phase 5**: Advanced Statistics & Analytics
- **Phase 6**: Social Features (Sharing, Comments)

### 🔮 Future
- Mobile app (React Native)
- Offline mode
- More AI features (OCR, Smart Suggestions)

## 🐛 Known Issues & Solutions

1.  **Supabase RLS**: Admin cannot view other users' profile details
    - **Issue**: RLS policies restrict `SELECT` on `profiles` table
    - **Solution**: Add admin-specific RLS policy (see implementation_plan.md)

2.  **Toast Integration**: Ensure `<Toaster />` is at the root (`App.tsx`)

3.  **Sound Effects**: First sound may be delayed
    - **Reason**: AudioContext needs user interaction to initialize
    - **Solution**: Already handled in `useSound` hook

## 🎨 Design System

### Colors
- **Primary**: Purple/Blue gradient
- **Success**: Green
- **Error**: Red
- **Warning**: Orange

### Typography
- **Font**: Lexend (Google Fonts)
- **Headings**: font-bold, font-black
- **Body**: font-normal, font-medium

### Components
- Use consistent spacing (gap-4, gap-6, gap-8)
- Rounded corners (rounded-lg, rounded-xl)
- Shadows (shadow-sm, shadow-lg)
- Transitions (transition-colors, transition-all)

## 🔐 Environment Variables

Required in `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_VOICERSS_API_KEY=your_voicerss_api_key
```

## 🧪 Testing
- Run tests: `npm run test` (Vitest)
- Write unit tests for logic in `lib/`
- Write component tests for complex UI interactions

## 📦 Build & Deployment
- Build: `npm run build`
- Preview: `npm run preview`
- Deploy: Vercel (automatic from main branch)

---
*Use this file to restore context when starting a new chat session.*
