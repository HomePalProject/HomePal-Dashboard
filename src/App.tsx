import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { useAuthStore } from './store/auth.store';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function DashboardPlaceholder() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-24 font-cairo">
      <div className="w-64 h-64 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-16">
        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </div>
      <h1 className="text-28 font-bold text-text-primary mb-8">Admin Dashboard</h1>
      <p className="text-text-secondary text-16">
        Welcome, Ammar! You have successfully signed in.
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPlaceholder />
            </ProtectedRoute>
          }
        />
        {/* Fallback route redirects to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
