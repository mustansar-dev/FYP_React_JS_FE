import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import WorkspaceFrame from '../components/WorkspaceFrame';
import { Button, Card, Field } from '../components/ui';
import { apiRequest } from '../services/apiClient';

function sportCodes(user) {
  if (!Array.isArray(user?.preferredSports)) return [];
  return user.preferredSports.map(item => item?.sport?.code || item?.code).filter(Boolean);
}

export function AccountProfile() {
  const { user, role, updateUser } = useAuth();
  const [sports, setSports] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', businessName: '', contactPhone: '', preferredSports: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    const userRequest = apiRequest('/users/me');
    const profileRequest = role === 'vendor' ? apiRequest('/vendors/me') : Promise.resolve(null);
    const sportsRequest = role === 'player' ? apiRequest('/sports', { auth: false }).catch(() => []) : Promise.resolve([]);
    Promise.all([userRequest, profileRequest, sportsRequest]).then(([currentUser, vendorProfile, catalog]) => {
      if (!active) return;
      setForm({
        name: currentUser.name || '', phone: currentUser.phone || '',
        businessName: vendorProfile?.businessName || '', contactPhone: vendorProfile?.contactPhone || '',
        preferredSports: sportCodes(currentUser),
      });
      setSports(Array.isArray(catalog) ? catalog : []);
      updateUser(currentUser);
    }).catch(requestError => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, role, updateUser]);

  function setField(key, value) { setForm(current => ({ ...current, [key]: value })); setSuccess(''); }
  function toggleSport(code) { setForm(current => ({ ...current, preferredSports: current.preferredSports.includes(code) ? current.preferredSports.filter(item => item !== code) : [...current.preferredSports, code] })); }

  async function save(event) {
    event.preventDefault(); setSaving(true); setError(''); setSuccess('');
    if (!form.name.trim()) { setError('Enter your name.'); setSaving(false); return; }
    if (role === 'vendor' && !form.businessName.trim()) { setError('Enter your business name.'); setSaving(false); return; }
    if (role === 'vendor' && form.contactPhone.replace(/\D/g, '').length < 7) { setError('Enter a business contact phone with at least 7 digits.'); setSaving(false); return; }
    try {
      const body = { name: form.name.trim(), phone: form.phone.trim() || null };
      if (role === 'player' && sports.length > 0) body.preferredSports = form.preferredSports;
      const updatedUser = await apiRequest('/users/me', { method: 'PATCH', body });
      updateUser(updatedUser);
      if (role === 'vendor') {
        await apiRequest('/vendors/me', { method: 'PATCH', body: { businessName: form.businessName.trim(), contactPhone: form.contactPhone.trim() } });
      }
      setSuccess('Your profile changes were saved.');
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  return <WorkspaceFrame role={role}>
    <section className="account-content profile-content">
      <p className="account-kicker">Account settings</p><h1>{role === 'vendor' ? 'Provider profile' : 'Player profile'}</h1>
      <p className="account-subtitle">{user.name} · {role === 'vendor' ? 'Venue provider account' : 'Player account'}</p>
      <Card as="section" className="account-card">
        {loading ? <p className="loading-inline" aria-live="polite">Loading profile…</p> : error && !form.name ? <div className="form-message form-message-error" role="alert">{error} <button type="button" className="text-button" onClick={() => window.location.reload()}>Try again</button></div> : (
          <form className="account-form" onSubmit={save} noValidate>
            {error && <div className="form-message form-message-error" role="alert">{error}</div>}
            {success && <div className="form-message form-message-success" role="status">{success}</div>}
            <p className="profile-email"><strong>{user.email}</strong><span>Account email is managed by PlaySpot.</span></p>
            <Field id="profile-name" label="Full name" type="text" required maxLength={120} value={form.name} onChange={event => setField('name', event.target.value)} />
            <Field id="profile-phone" label="Phone number" type="tel" hint="Leave blank to remove your phone number." value={form.phone} onChange={event => setField('phone', event.target.value)} />
            {role === 'player' ? <fieldset className="sports-fieldset"><legend>Sports preferences</legend>{sports.length ? <div className="sport-options">{sports.map(sport => <button key={sport.id} type="button" className={`sport-option${form.preferredSports.includes(sport.code) ? ' selected' : ''}`} aria-pressed={form.preferredSports.includes(sport.code)} onClick={() => toggleSport(sport.code)}>{sport.name}</button>)}</div> : <p className="field-hint">The sports catalog could not be loaded. You can update your name and phone now; preferences can be retried later.</p>}</fieldset> : <><Field id="profile-business" label="Business name" type="text" required maxLength={160} value={form.businessName} onChange={event => setField('businessName', event.target.value)} /><Field id="profile-contact" label="Business contact phone" type="tel" required value={form.contactPhone} onChange={event => setField('contactPhone', event.target.value)} /></>}
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
          </form>
        )}
      </Card>
    </section>
  </WorkspaceFrame>;
}

function RoleHome({ role }) {
  const { user } = useAuth();
  const vendor = role === 'vendor';
  const verified = user?.vendorProfile?.verificationStatus;
  return <WorkspaceFrame role={role}>
    <section className="workspace-welcome">
      <p className="account-kicker">{vendor ? 'Venue provider workspace' : 'Player workspace'}</p>
      <h1>{vendor ? `Welcome, ${user.name}` : `Good to see you, ${user.name}`}</h1>
      <p>{vendor ? 'Your provider account is ready. Venue details, courts, and inventory are set up in the next stage.' : 'Your player account is ready. Venue discovery and bookings are coming in the next stages.'}</p>
      {vendor && verified === 'PENDING' && <div className="status-banner"><strong>Verification pending</strong><span>Your provider profile is pending operator approval. Registration does not publish or create a venue.</span></div>}
    </section>
    <div className="workspace-cards">
      <Card className="workspace-card"><h2>{vendor ? 'Provider account' : 'Your account'}</h2><p>{vendor ? user.vendorProfile?.businessName || 'Business profile' : 'Player profile and sports preferences'}</p><Button as={Link} to="/profile" variant="secondary">View profile</Button></Card>
      <Card className="workspace-card"><h2>Next steps</h2><p>{vendor ? 'Venue setup will be added in the vendor operations stage.' : 'Explore venues, booking, and community features will be added in later stages.'}</p></Card>
    </div>
  </WorkspaceFrame>;
}

function WorkspacePlaceholder({ role }) {
  const page = window.location.pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') || 'overview';
  return <WorkspaceFrame role={role}><section className="workspace-welcome"><p className="account-kicker">{role === 'vendor' ? 'Provider workspace' : 'Player workspace'}</p><h1>{page.replace(/^\w/, letter => letter.toUpperCase())}</h1><p>This protected {role} route is ready for its feature stage. No sample data or fake actions are shown here.</p><Button as={Link} to={role === 'vendor' ? '/vendor' : '/player'} variant="secondary">Back to overview</Button></section></WorkspaceFrame>;
}

export function PlayerWorkspace() {
  return <Routes><Route index element={<RoleHome role="player" />} /><Route path="*" element={<WorkspacePlaceholder role="player" />} /></Routes>;
}

export function VendorWorkspace() {
  return <Routes><Route index element={<RoleHome role="vendor" />} /><Route path="*" element={<WorkspacePlaceholder role="vendor" />} /></Routes>;
}

