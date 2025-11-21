import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ExploreSetsPage from './pages/ExploreSetsPage';
import SetDetailsPage from './pages/SetDetailsPage';
import FlashcardPracticePage from './pages/FlashcardPracticePage';
import QuizPage from './pages/QuizPage';
import LearnPage from './pages/LearnPage';
import RoleplayPage from './pages/RoleplayPage';
import StoryModePage from './pages/StoryModePage';
import SpeakingPracticePage from './pages/SpeakingPracticePage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/explore" element={<ExploreSetsPage />} />
            <Route path="/sets/:id" element={<SetDetailsPage />} />
            <Route path="/practice/:id" element={<FlashcardPracticePage />} />
            <Route path="/quiz/:id" element={<QuizPage />} /> {/* Added route for QuizPage */}
            <Route path="/learn/:id" element={<LearnPage />} />
            <Route path="/roleplay/:id" element={<RoleplayPage />} /> {/* Added route for RoleplayPage */}
            <Route path="/story/:id" element={<StoryModePage />} /> {/* Added route for StoryModePage */}
            <Route path="/speaking/:id" element={<SpeakingPracticePage />} /> {/* Added route for SpeakingPracticePage */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;