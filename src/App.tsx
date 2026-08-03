import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Overview from './pages/Overview';
import DashboardLayout from './layouts/DashboardLayout';
import { useAuthStore } from './store/auth.store';

import Profile from './pages/Profile';

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
          <Route
            path="preferences"
            element={<div className="text-text-secondary p-24">Preferences page — coming soon</div>}
          />
          <Route
            path="households"
            element={<div className="text-text-secondary p-24">Households page — coming soon</div>}
          />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
