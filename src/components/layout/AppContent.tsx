import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import TabNavigation from './TabNavigation';
import TrialBanner from '../trial/TrialBanner';

// Pages
import LandingPage from '../../pages/LandingPage';
import AuthPage from '../../pages/AuthPage';
import HomePage from '../../pages/HomePage';
import AlertsPage from '../../pages/AlertsPage';
import MapPage from '../../pages/MapPage';
import ExplorePage from '../../pages/ExplorePage';
import ProfilePage from '../../pages/ProfilePage';
import AddDestinationPage from '../../pages/AddDestinationPage';
import PricingPage from '../../pages/PricingPage';
import PaymentSuccessPage from '../../pages/PaymentSuccessPage';

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TrialBanner />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Protected routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
            <TabNavigation />
          </ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute>
            <AlertsPage />
            <TabNavigation />
          </ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute>
            <MapPage />
            <TabNavigation />
          </ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute>
            <ExplorePage />
            <TabNavigation />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
            <TabNavigation />
          </ProtectedRoute>
        } />
        <Route path="/add-destination" element={
          <ProtectedRoute>
            <AddDestinationPage />
            <TabNavigation />
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={
          <ProtectedRoute>
            <PricingPage />
            <TabNavigation />
          </ProtectedRoute>
        } />
        <Route path="/payment-success" element={
          <ProtectedRoute>
            <PaymentSuccessPage />
            <TabNavigation />
          </ProtectedRoute>
        } />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default AppContent; 