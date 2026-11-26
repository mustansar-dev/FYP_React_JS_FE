import { lazy, Suspense } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import { AuthProvider, roleName, useAuth } from './auth/AuthContext';
import WorkspaceFrame from './components/WorkspaceFrame';
import { Button, Card, Container } from './components/ui';

const LoginPage = lazy(() => import('./pages/AuthPages').then(module => ({ default: module.LoginPage })));
const RegistrationChoicePage = lazy(() => import('./pages/AuthPages').then(module => ({ default: module.RegistrationChoicePage })));
const PlayerRegistrationPage = lazy(() => import('./pages/AuthPages').then(module => ({ default: module.PlayerRegistrationPage })));
const VendorRegistrationPage = lazy(() => import('./pages/AuthPages').then(module => ({ default: module.VendorRegistrationPage })));
const ForgotPasswordPage = lazy(() => import('./pages/AuthPages').then(module => ({ default: module.ForgotPasswordPage })));
const AccountProfile = lazy(() => import('./pages/WorkspacePages').then(module => ({ default: module.AccountProfile })));
const PlayerWorkspace = lazy(() => import('./pages/WorkspacePages').then(module => ({ default: module.PlayerWorkspace })));
const VendorWorkspace = lazy(() => import('./pages/WorkspacePages').then(module => ({ default: module.VendorWorkspace })));

const games = [
  { name: 'Cricket', emoji: '🏏', detail: 'Find your pitch', color: 'gold' },
  { name: 'Padel', emoji: '🎾', detail: 'Book a court', color: 'mint' },
  { name: 'Badminton', emoji: '🏸', detail: 'Play a rally', color: 'lilac' },
];

function Brand() {
  return <Link className="brand" to="/" aria-label="PlaySpot PK home"><span className="brand-mark" aria-hidden="true" /><span>PlaySpot <strong>PK</strong></span></Link>;
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  async function signOut() {
    const warning = await logout();
    navigate('/', { replace: true, state: warning ? { notice: warning } : null });
  }
  return (
    <header className="site-header">
      <Container className="header-inner">
        <Brand />
        <nav className="main-nav" aria-label="Main navigation"><a href="#features">Explore venues</a><a href="#features">Games</a><a href="#features">Tournaments</a><a href="#providers">For providers</a></nav>
        <div className="header-actions">{user ? <><Link className="login-link" to={`/${roleName(user.role)}`}>My workspace</Link><Button variant="secondary" onClick={signOut}>Log out</Button></> : <><Link className="login-link" to="/login">Log in</Link><Button as={Link} to="/register">Create account</Button></>}</div>
      </Container>
    </header>
  );
}

function LandingPage() {
  const location = useLocation();
  return <>
    <Header />
    {location.state?.notice && <Container><div className="form-message form-message-error" role="status">{location.state.notice}</div></Container>}
    <main>
      <section className="hero"><Container className="hero-inner">
        <div className="hero-copy"><p className="eyebrow">Your next game starts here</p><h1>Find your<br />place to play.</h1><p className="hero-description">Discover local sports venues, book a court, and find people ready to play.</p><div className="hero-actions"><Button as="a" href="#features">Explore venues</Button><Button as="a" href="#providers" variant="secondary">I manage a venue</Button></div><p className="hero-note">A local platform for sports players and venue providers in Pakistan.</p></div>
        <Card className="game-picker"><div className="picker-heading"><h2>Pick your game</h2><span>Scrolling sports</span></div><div className="game-list">{games.map((game, index) => <article className="game-item" key={game.name}><div className={`game-tile ${game.color}`}><span className="game-emoji" aria-hidden="true">{game.emoji}</span><h3>{game.name}</h3><p>{game.detail}</p></div><span className="game-step">0{index + 1} &nbsp;{['Find venues', 'Book & play', 'Meet players'][index]}</span></article>)}</div></Card>
      </Container></section>
      <nav className="feature-nav" id="features" aria-label="PlaySpot features"><Container className="feature-nav-inner"><a href="#features" className="selected">Venue discovery</a><a href="#features">Booking management</a><a href="#features">Public &amp; private game rooms</a><a href="#features">Tournaments &amp; leaderboards</a></Container></nav>
      <section className="feature-intro" id="providers"><Container><h2>Everything you need to get in the game</h2><p>One place for players and sports venue providers.</p></Container></section>
    </main>
    <footer className="site-footer"><Container><Brand /><span>Made for the sports community in Pakistan.</span></Container></footer>
  </>;
}

function NotFoundPage() {
  return <WorkspaceFrame role="public"><section className="account-content"><p className="account-kicker">404 · Page not found</p><h1>This page isn’t ready yet.</h1><p className="account-subtitle">The link may be incorrect, or this part of PlaySpot is coming in a later stage.</p><Button as={Link} to="/">Back to home</Button></section></WorkspaceFrame>;
}

function AppRoutes() {
  const { ready, storageNotice } = useAuth();
  if (!ready) return <main className="loading-page" aria-live="polite"><span className="loading-spinner" aria-hidden="true" />Restoring your session…</main>;
  return <>
    {storageNotice && <div className="session-notice" role="status">{storageNotice}</div>}
    <Suspense fallback={<main className="loading-page" aria-live="polite"><span className="loading-spinner" aria-hidden="true" />Loading PlaySpot…</main>}>
    <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegistrationChoicePage />} />
    <Route path="/register/player" element={<PlayerRegistrationPage />} />
    <Route path="/register/vendor" element={<VendorRegistrationPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route element={<ProtectedRoute />}><Route path="/profile" element={<AccountProfile />} /></Route>
    <Route element={<ProtectedRoute role="player" />}><Route path="/player/*" element={<PlayerWorkspace />} /></Route>
    <Route element={<ProtectedRoute role="vendor" />}><Route path="/vendor/*" element={<VendorWorkspace />} /></Route>
    <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  </>;
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
