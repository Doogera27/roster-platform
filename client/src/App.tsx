import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { configureApiAuth, api } from './services/api';
import { isAuth0Configured } from './config';

// Pages — Authenticated (eager)
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreativesPage } from './pages/CreativesPage';
import { CreativeProfilePage } from './pages/CreativeProfilePage';
import { RostersPage } from './pages/RostersPage';
import { RosterDetailPage } from './pages/RosterDetailPage';
import { VaultPage } from './pages/VaultPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { NewProjectPage } from './pages/NewProjectPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { MessagesPage } from './pages/MessagesPage';
import { AdminPage } from './pages/AdminPage';

// Pages — Marketing (lazy, code-split)
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage').then((m) => ({ default: m.FeaturesPage })));
const ClientsLandingPage = lazy(() => import('./pages/ClientsLandingPage').then((m) => ({ default: m.ClientsLandingPage })));
const ClientsPricingPage = lazy(() => import('./pages/ClientsPricingPage').then((m) => ({ default: m.ClientsPricingPage })));
const ClientsFeaturesPage = lazy(() => import('./pages/ClientsFeaturesPage').then((m) => ({ default: m.ClientsFeaturesPage })));
const CreativesLandingPage = lazy(() => import('./pages/CreativesLandingPage').then((m) => ({ default: m.CreativesLandingPage })));
const CreativesPricingPage = lazy(() => import('./pages/CreativesPricingPage').then((m) => ({ default: m.CreativesPricingPage })));
const CreativesFeaturesPage = lazy(() => import('./pages/CreativesFeaturesPage').then((m) => ({ default: m.CreativesFeaturesPage })));
const CharterPage = lazy(() => import('./pages/CharterPage').then((m) => ({ default: m.CharterPage })));

// Layout & Components
import { AppLayout } from './components/AppLayout';
import { MarketingLayout } from './components/marketing/MarketingLayout';
import { ErrorBoundary } from './components/ErrorBoundary';

/** Loading fallback for lazy-loaded marketing pages */
function MarketingLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-navy)]">
      <div className="flex items-center gap-2">
        <span className="text-[22px] font-semibold tracking-tight text-white" style={{ fontFamily: 'var(--font-serif)' }}>ROSTER</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
      </div>
    </div>
  );
}

/** Marketing (public) routes */
function PublicRoutes() {
  return (
    <Suspense fallback={<MarketingLoading />}>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/for-clients" element={<ClientsLandingPage />} />
          <Route path="/for-clients/pricing" element={<ClientsPricingPage />} />
          <Route path="/for-clients/features" element={<ClientsFeaturesPage />} />
          <Route path="/for-creatives" element={<CreativesLandingPage />} />
          <Route path="/for-creatives/pricing" element={<CreativesPricingPage />} />
          <Route path="/for-creatives/features" element={<CreativesFeaturesPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/charter/:inviteCode" element={<CharterPage />} />
      </Routes>
    </Suspense>
  );
}

/** Authenticated app routes (wrapped in AppLayout) */
function AppRoutes() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/creatives" element={<CreativesPage />} />
          <Route path="/creatives/:id" element={<CreativeProfilePage />} />
          <Route path="/rosters" element={<RostersPage />} />
          <Route path="/rosters/:id" element={<RosterDetailPage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<NewProjectPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ErrorBoundary>
    </AppLayout>
  );
}

/** Set of paths that are public marketing routes */
const PUBLIC_PATHS = [
  '/',
  '/pricing',
  '/features',
  '/login',
  '/for-clients',
  '/for-clients/pricing',
  '/for-clients/features',
  '/for-creatives',
  '/for-creatives/pricing',
  '/for-creatives/features',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/charter/');
}

/** Wrapper that checks if client user needs onboarding */
function OnboardingGate() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data.data),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (me && me.role === 'CLIENT') {
      const org = me.organization;
      if (!org || !org.onboarding_completed_at) {
        setShowOnboarding(true);
      }
    }
  }, [me]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-navy)]">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-4">
            <span className="text-[22px] font-semibold tracking-tight text-white" style={{ fontFamily: 'var(--font-serif)' }}>ROSTER</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">Loading...</div>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingPage
        onComplete={() => {
          setShowOnboarding(false);
          navigate('/dashboard');
        }}
      />
    );
  }

  return <AppRoutes />;
}

/** Auth0-backed app shell — used when Auth0 is configured */
function AuthenticatedApp() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      configureApiAuth(getAccessTokenSilently);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // Public marketing pages are always accessible
  if (isPublicPath(location.pathname)) {
    return <PublicRoutes />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-navy)]">
        <div className="text-lg text-[var(--color-text-muted)]">Loading...</div>
      </div>
    );
  }

  // Not authenticated and not on a public page → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <OnboardingGate />;
}

/** Dev-mode app shell — skips auth entirely */
function DevApp() {
  const location = useLocation();

  // Public marketing pages are always accessible
  if (isPublicPath(location.pathname)) {
    return <PublicRoutes />;
  }

  return <OnboardingGate />;
}

export function App() {
  return isAuth0Configured ? <AuthenticatedApp /> : <DevApp />;
}
