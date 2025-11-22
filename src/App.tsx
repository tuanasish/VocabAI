import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import SettingsPage from './pages/SettingsPage';
import CommunityPage from './pages/CommunityPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
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
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/setting" element={<Navigate to="/settings" replace />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/explore" element={<ExploreSetsPage />} />
            <Route path="/sets/:id" element={<SetDetailsPage />} />
            <Route path="/practice/:id" element={<FlashcardPracticePage />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/learn/:id" element={<LearnPage />} />
            <Route path="/roleplay/:id" element={<RoleplayPage />} />
            <Route path="/story/:id" element={<StoryModePage />} />
            <Route path="/speaking/:id" element={<SpeakingPracticePage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;