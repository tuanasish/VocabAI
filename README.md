# 🧠 VocabAI

**VocabAI** is a modern, AI-powered vocabulary learning application designed to help users master English vocabulary efficiently. It leverages a **Spaced Repetition System (SRS)** based on the SM-2 algorithm, gamification features, and AI-generated content to optimize learning and ensure long-term retention.

## ✨ Features

### 📚 Core Learning Features
-   **Vocabulary Management**: Create, organize, and manage vocabulary sets with categories and difficulty levels
-   **Spaced Repetition (SRS)**: Smart review scheduling using the SM-2 algorithm to maximize memory retention
-   **Flashcard Learning**: Interactive flashcard system with flip animations and progress tracking
-   **AI-Generated Quizzes**: Two quiz modes - Standard and AI-generated questions for context-based learning
-   **Roleplay Practice**: AI-powered conversation scenarios for practical vocabulary usage

### 🎮 Gamification & Progress
-   **XP System**: Earn experience points for completing quizzes, learning words, and maintaining streaks
-   **Levels & Badges**: Progress through levels and unlock achievements
-   **Daily Streaks**: Track consecutive days of learning with streak milestones
-   **Progress Dashboard**: Visual statistics showing learning progress, due words, and performance metrics
-   **Leaderboard**: Community rankings to motivate competitive learning

### 🎨 User Experience
-   **Modern UI/UX**: Clean, responsive interface built with TailwindCSS and smooth animations
-   **Dark Mode**: Fully supported dark mode for comfortable night study
-   **Sound Effects**: Interactive audio feedback for quiz answers, achievements, and UI interactions
-   **Text-to-Speech**: High-quality pronunciation using VoiceRSS API
-   **Mobile Responsive**: Optimized for all screen sizes

### 🔐 Admin Features
-   **Admin Dashboard**: Manage all vocabulary sets and user statistics
-   **Content Curation**: Publish/unpublish sets to the Explore page
-   **User Management**: View total users, sets, and public content statistics

### 🌐 Explore & Discover
-   **Featured Sets**: Curated vocabulary sets with high-quality content
-   **Public Library**: Browse and clone community-created vocabulary sets
-   **Search & Filter**: Find sets by category, difficulty, and keywords
-   **Set Cloning**: Import public sets to your personal library

## 🛠️ Tech Stack

-   **Frontend**: [React](https://reactjs.org/) 19 (Vite), [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [TailwindCSS](https://tailwindcss.com/) with custom design system
-   **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security)
-   **AI Integration**: Google Gemini API for quiz generation and roleplay
-   **Text-to-Speech**: VoiceRSS API for pronunciation
-   **Sound Effects**: Web Audio API for interactive feedback
-   **State Management**: React Context + Custom Hooks
-   **Icons**: [Material Symbols](https://fonts.google.com/icons)
-   **Deployment**: Vercel

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   A Supabase project (for backend)
-   VoiceRSS API key (for text-to-speech)
-   Google Gemini API key (for AI features)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/tuanasish/VocabAI.git
    cd VocabAI
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add your credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_GEMINI_API_KEY=your_gemini_api_key
    VITE_VOICERSS_API_KEY=your_voicerss_api_key
    ```

4.  **Database Setup**
    - Run the SQL schema in your Supabase project (see `schema.sql`)
    - Set up Row Level Security policies
    - Configure admin access (see PROJECT_RULES.md)

5.  **Run the development server**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AdminRoute.tsx   # Admin route protection
│   ├── CreateSetModal.tsx
│   ├── EditSetModal.tsx
│   ├── DueWordsWidget.tsx
│   └── ...
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Authentication state
├── hooks/               # Custom React hooks
│   ├── useProfile.ts    # User profile management
│   ├── useSound.ts      # Sound effects system
│   └── useSpeech.ts     # Text-to-speech
├── lib/                 # Core logic and utilities
│   ├── api/             # Supabase API wrappers
│   │   ├── vocabularyApi.ts
│   │   └── progressApi.ts
│   ├── aiGenerator.ts   # AI quiz generation
│   ├── gamification.ts  # XP, levels, streaks
│   └── srsAlgorithm.ts  # SM-2 implementation
├── pages/               # Application pages
│   ├── Dashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── ExploreSetsPage.tsx
│   ├── QuizPage.tsx
│   ├── LearnPage.tsx
│   ├── RoleplayPage.tsx
│   └── ...
├── types/               # TypeScript definitions
│   └── supabase.ts      # Generated Supabase types
└── App.tsx              # Main application component
```

## 🎯 Key Features Explained

### Spaced Repetition System (SRS)
- Uses SM-2 algorithm for optimal review intervals
- Tracks word difficulty and user performance
- Automatically schedules reviews based on retention
- Shows "due for review" words on dashboard

### Gamification
- **XP Rewards**: Quiz completion (+50 XP), Perfect score (+25 XP), Daily streak (+10 XP)
- **Levels**: Progress through levels based on total XP
- **Streaks**: Track consecutive days of learning
- **Badges**: Unlock achievements for milestones

### Sound Effects
- Correct/wrong answer feedback
- Quiz completion celebration
- Level up and achievement sounds
- Customizable volume and enable/disable toggle

### Admin System
- Protected routes (email-based authentication)
- Manage all vocabulary sets
- Toggle public/private status
- View user statistics

## 🔧 Configuration

### Admin Access
To grant admin access, update the email in:
- `src/components/AdminRoute.tsx`
- `src/components/Layout.tsx`

Default admin email: `tuanasishh@gmail.com`

### Sound Settings
Users can configure sound effects in Settings → Audio:
- Enable/disable sound effects
- Adjust volume (0-100%)
- Settings persist in localStorage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the amazing backend platform
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [VoiceRSS](https://www.voicerss.org/) for text-to-speech
- [TailwindCSS](https://tailwindcss.com/) for the styling framework

---
*Built with ❤️ by Vu Anh Tuan*
