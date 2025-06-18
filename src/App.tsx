import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserDestinationProvider } from './contexts/UserDestinationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TabNavigation from './components/layout/TabNavigation';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import MapPage from './pages/MapPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <UserDestinationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <HomePage />
                  <TabNavigation />
                </ProtectedRoute>
              } />
              <Route path="/explore" element={
                <ProtectedRoute>
                  <ExplorePage />
                  <TabNavigation />
                </ProtectedRoute>
              } />
              <Route path="/map" element={
                <ProtectedRoute>
                  <MapPage />
                  <TabNavigation />
                </ProtectedRoute>
              } />
              <Route path="/alerts" element={
                <ProtectedRoute>
                  <AlertsPage />
                  <TabNavigation />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                  <TabNavigation />
                </ProtectedRoute>
              } />
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/landing" replace />} />
            </Routes>
          </div>
        </Router>
      </UserDestinationProvider>
    </AuthProvider>
  );
}

export default App;