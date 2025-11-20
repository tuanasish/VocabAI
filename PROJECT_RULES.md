# VocabAI Project Rules & Context

## 🚀 Project Overview
**VocabAI** is a vocabulary learning application utilizing Spaced Repetition System (SRS) and AI features.
**Current Status**: Phase 3.2 Complete (SRS & Dashboard Progress).

## 🛠️ Tech Stack
- **Frontend**: React (Vite), TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Testing**: Vitest, React Testing Library
- **UI Components**: Headless UI (optional), Lucide React (icons), Recharts (planned)
- **State Management**: React Context + Custom Hooks

## 📂 Architecture & Structure
- `src/lib/api/`: Supabase API wrappers (e.g., `vocabularyApi.ts`, `progressApi.ts`). **Always** use these, never call Supabase directly in components.
- `src/lib/hooks/`: Custom hooks for state & logic (e.g., `useVocabularySets.ts`, `useProgress.ts`).
- `src/components/`: Reusable UI components.
- `src/pages/`: Route components.
- `src/types/supabase.ts`: Generated Supabase types. **Do not edit manually** (except for specific fixes noted below).

## 📝 Coding Standards & Rules

### 1. Error Handling & Notifications
- **NEVER** use `alert()` or `console.error()` alone for user feedback.
- **ALWAYS** use `react-hot-toast` for success/error notifications.
- Example: `toast.error(error.message)` or `toast.success('Saved!')`.

### 2. TypeScript & Types
- **Strict Typing**: Avoid `any`. Use defined interfaces.
- **Supabase Types**: Use `Database` type from `types/supabase.ts`.
- **Fix for `supabase.ts`**: If regenerating types, ensure helper types (Tables, Insert, etc.) exclude `__InternalSupabase` to avoid indexing errors:
  ```typescript
  // Correct pattern for helper types
  DefaultSchemaTableNameOrOptions extends { schema: keyof Database } ...
  // Should be:
  // Exclude<keyof Database, "__InternalSupabase">
  // (Or ensure the helper type logic handles the missing internal key)
  ```

### 3. Component Patterns
- Use **Functional Components** with Hooks.
- **Logic Separation**: Move complex logic to custom hooks (`lib/hooks/`).
- **Tailwind**: Use utility classes. Avoid inline styles.

### 4. SRS Implementation (Spaced Repetition)
- **Algorithm**: SM-2 (implemented in `lib/srsAlgorithm.ts`).
- **Progress Tracking**: `user_progress` table.
- **Review Flow**: `LearnPage.tsx` handles the session.
- **Key Logic**:
  - `next_review_at` determines due words.
  - `status` can be 'learning', 'reviewing', 'relearning'.

## 📅 Roadmap Status

### ✅ Completed
- **Phase 1 & 2**: Core CRUD, Auth, Basic UI.
- **Phase 3.1 (SRS)**: SM-2 Algorithm, Flashcard Review, Session Summary.
- **Phase 3.2 (Dashboard)**: Due Words Widget, Set Progress Bars.

### 🚧 In Progress / Next
- **Phase 3.3**: Statistics Dashboard (Charts, Streak, History).

### 🔮 Future
- **Phase 4**: AI Features (OCR, GenAI).
- **Phase 5**: Social Features.

## 🐛 Known Issues / Lessons Learned
1.  **Supabase Type Indexing**: The `Database` type includes `__InternalSupabase` which breaks generic helper types. **Fix**: Exclude it or use specific type guards.
2.  **SRS Redirect Bug**: Fixed by ensuring `dueWords` array access is safe and handling potential race conditions in `LearnPage`.
3.  **Toast Integration**: Ensure `<Toaster />` is at the root (`App.tsx`).

## 🧪 Testing
- Run tests: `npm run test` (Vitest).
- Write unit tests for logic in `lib/`.
- Write component tests for complex UI interactions.

---
*Use this file to restore context when starting a new chat session.*
