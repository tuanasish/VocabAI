# 🧠 VocabAI

**VocabAI** is a modern, AI-powered vocabulary learning application designed to help users master new languages efficiently. It leverages a **Spaced Repetition System (SRS)** based on the SM-2 algorithm to optimize review intervals and ensure long-term retention.

![VocabAI Banner](https://via.placeholder.com/1200x400?text=VocabAI+Dashboard+Preview) 
*(Replace with actual screenshot)*

## ✨ Features

-   **📚 Vocabulary Management**: Create, organize, and manage vocabulary sets with ease.
-   **🧠 Spaced Repetition (SRS)**: Smart review scheduling using the SM-2 algorithm to maximize memory retention.
-   **📊 Progress Tracking**: Visual dashboard with learning statistics, streaks, and due words.
-   **🤖 AI Integration**: (Planned) AI-generated quizzes, synonyms/antonyms suggestions, and OCR for quick input.
-   **🎨 Modern UI/UX**: Clean, responsive interface built with TailwindCSS and smooth animations.
-   **🌓 Dark Mode**: Fully supported dark mode for comfortable night study.

## 🛠️ Tech Stack

-   **Frontend**: [React](https://reactjs.org/) (Vite), [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [TailwindCSS](https://tailwindcss.com/)
-   **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **State Management**: React Context + Custom Hooks
-   **Testing**: [Vitest](https://vitest.dev/), React Testing Library
-   **Icons**: [Material Symbols](https://fonts.google.com/icons)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v16 or higher)
-   npm or yarn
-   A Supabase project (for backend)

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
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers (Auth, etc.)
├── lib/            # Core logic, API wrappers, and hooks
│   ├── api/        # Supabase API calls
│   ├── hooks/      # Custom React hooks
│   └── srsAlgorithm.ts # SM-2 Algorithm implementation
├── pages/          # Application pages (Dashboard, Learn, etc.)
├── types/          # TypeScript definitions (Supabase generated)
└── App.tsx         # Main application component
```

## 🧪 Testing

Run the test suite with Vitest:

```bash
npm run test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

---
*Built with ❤️ by Vu Anh Tuan*
