import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import EventExplorer from './pages/EventExplorer';
import ThreatAnalytics from './pages/ThreatAnalytics';
import AttackChains from './pages/AttackChains';
import MLPerformance from './pages/MLPerformance';
import Recommendations from './pages/Recommendations';
import Compliance from './pages/Compliance';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/landing" element={<LandingPage />} />

        {/* Dashboard SOC App Routes */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<EventExplorer />} />
          <Route path="/threats" element={<ThreatAnalytics />} />
          <Route path="/attack-chains" element={<AttackChains />} />
          <Route path="/ml" element={<MLPerformance />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="*" element={<Navigate replace to="/dashboard" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
