import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Overview from './pages/Overview';
import DashboardLayout from './layouts/DashboardLayout';
import { useAuthStore } from './store/auth.store';

import Profile from './pages/Profile';
import Preferences from './pages/Preferences';
import Households from './pages/Households';
import Supermarkets from './pages/Supermarkets';
import Stats from './pages/Stats';
import VisionAILogs from './pages/VisionAILogs';
import SupermarketPerformance from './pages/SupermarketPerformance';
import PnLDeepDive from './pages/PnLDeepDive';
import GeographicDemographics from './pages/GeographicDemographics';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected dashboard shell */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested pages rendered inside DashboardLayout's <Outlet /> */}
          <Route index element={<Overview />} />
          {/* Future pages plugged in here */}
          <Route path="preferences" element={<Preferences />} />
          <Route path="households" element={<Households />} />
          <Route path="supermarkets" element={<Supermarkets />} />
          <Route path="stats" element={<Stats />} />
          <Route path="vision-ai-logs" element={<VisionAILogs />} />
          <Route path="supermarket-performance" element={<SupermarketPerformance />} />
          <Route path="pnl-deep-dive" element={<PnLDeepDive />} />
          <Route path="geographic-demographics" element={<GeographicDemographics />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
