import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function Brand() {
  return <Link className="workspace-brand" to="/" aria-label="PlaySpot PK home"><span className="brand-mark" aria-hidden="true" /><span>PlaySpot <strong>PK</strong></span></Link>;
}

const navigation = {
  public: [
    { to: '/', label: 'Home', end: true },
    { to: '/login', label: 'Log in' },
    { to: '/register', label: 'Create account' },
    { to: '/register/vendor', label: 'For providers' },
  ],
  player: [
    { to: '/player', label: 'Home', end: true },
    { to: '/player/venues', label: 'Find venues' },
    { to: '/player/rooms', label: 'Games & rooms' },
    { to: '/player/tournaments', label: 'Tournaments' },
    { to: '/player/bookings', label: 'My bookings' },
    { to: '/profile', label: 'Profile & settings' },
  ],
  vendor: [
    { to: '/vendor', label: 'Overview', end: true },
    { to: '/vendor/bookings', label: 'Bookings' },
    { to: '/vendor/venues', label: 'Venue details' },
    { to: '/vendor/availability', label: 'Availability' },
    { to: '/vendor/add-ons', label: 'Add-ons' },
    { to: '/vendor/analytics', label: 'Analytics' },
    { to: '/profile', label: 'Profile & settings' },
  ],
};

export default function WorkspaceFrame({ role, children }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const items = navigation[role || 'public'];

  async function handleLogout() {
    const warning = await auth.logout();
    navigate('/', { replace: true, state: warning ? { notice: warning } : null });
  }

  return (
    <div className="workspace-layout">
      <aside className="workspace-rail">
        <Brand />
        <div className="rail-label">{role === 'vendor' ? 'Venue provider' : role === 'player' ? 'Player menu' : 'PlaySpot'}</div>
        <nav className="rail-nav" aria-label={`${role || 'public'} navigation`}>
          {items.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `rail-link${isActive ? ' active' : ''}`}><span aria-hidden="true">•</span>{item.label}</NavLink>)}
        </nav>
      </aside>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <Link className="topbar-title" to={role === 'vendor' ? '/vendor' : role === 'player' ? '/player' : '/'}>PlaySpot PK</Link>
          <div className="topbar-account">
            {auth.user ? <><span>{auth.user.name}</span><span className="topbar-separator" aria-hidden="true">·</span><Link to="/profile">Account</Link><button type="button" onClick={handleLogout}>Log out</button></> : <><span>Sports venues and community</span><Link to="/login">Account</Link></>}
          </div>
        </header>
        <main className="workspace-main">{children}</main>
      </div>
    </div>
  );
}
