import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@layouts/DashboardLayout';
import { useAuthStore } from '@store/authStore';

const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Overview = lazy(() => import('./pages/Overview'));
const Profile = lazy(() => import('./pages/Profile'));
const Preferences = lazy(() => import('./pages/Preferences'));
const Households = lazy(() => import('./pages/Households'));
const Supermarkets = lazy(() => import('./pages/Supermarkets'));
const Stats = lazy(() => import('./pages/Stats'));
const VisionAILogs = lazy(() => import('./pages/VisionAILogs'));
const SupermarketPerformance = lazy(() => import('./pages/SupermarketPerformance'));
const PnLDeepDive = lazy(() => import('./pages/PnLDeepDive'));
const GeographicDemographics = lazy(() => import('./pages/GeographicDemographics'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const ScrapingPipeline = lazy(() => import('./pages/ScrapingPipeline'));
const ProductCategories = lazy(() => import('./pages/ProductCategories'));
const OffersHub = lazy(() => import('./pages/OffersHub'));
const MeasuringUnits = lazy(() => import('./pages/MeasuringUnits'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-surface">
    <div className="w-40 h-40 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="preferences" element={<Preferences />} />
            <Route path="categories" element={<ProductCategories />} />
            <Route path="households" element={<Households />} />
            <Route path="supermarkets" element={<Supermarkets />} />
            <Route path="offers" element={<OffersHub />} />
            <Route path="stats" element={<Stats />} />
            <Route path="vision-ai-logs" element={<VisionAILogs />} />
            <Route path="supermarket-performance" element={<SupermarketPerformance />} />
            <Route path="pnl-deep-dive" element={<PnLDeepDive />} />
            <Route path="geographic-demographics" element={<GeographicDemographics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="scraping-pipeline" element={<ScrapingPipeline />} />
            <Route path="measuring-units" element={<MeasuringUnits />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
