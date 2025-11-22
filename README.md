# 🧠 VocabAI

An AI-powered vocabulary learning application with Spaced Repetition System (SRS) and gamification features.

## ✨ Features

- **📚 Vocabulary Management** - Create and organize vocabulary sets
- **🧠 Spaced Repetition (SRS)** - Smart review scheduling using SM-2 algorithm
- **🎮 Gamification** - XP, levels, streaks, and badges
- **🤖 AI Quizzes** - AI-generated questions for better learning
- **🎙️ Text-to-Speech** - High-quality pronunciation with VoiceRSS
- **🔊 Sound Effects** - Interactive audio feedback
- **🌐 Explore Page** - Browse and clone public vocabulary sets
- **👨‍💼 Admin Dashboard** - Content management system
- **🌓 Dark Mode** - Full dark mode support

## 🛠️ Tech Stack

- React 19 + TypeScript + Vite
- TailwindCSS
- Supabase (PostgreSQL, Auth)
- Google Gemini API
- VoiceRSS API

## 🚀 Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/tuanasish/VocabAI.git
   cd VocabAI
   npm install
   ```

2. **Setup environment** (`.env.local`)
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_VOICERSS_API_KEY=your_voicerss_api_key
   ```

3. **Run**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```
src/
├── components/     # UI components
├── pages/          # Route pages
├── hooks/          # Custom hooks
├── lib/            # Core logic & API
└── types/          # TypeScript types
```

## 📝 License

MIT License

---
*Built with ❤️ by Vu Anh Tuan*
