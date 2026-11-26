import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button, Card, Field } from '../components/ui';
import WorkspaceFrame from '../components/WorkspaceFrame';
import { apiRequest } from '../services/apiClient';

const formatError = error => {
  const details = Array.isArray(error?.details) ? error.details.map(detail => `${detail.field ? `${detail.field}: ` : ''}${detail.message}`).filter(Boolean) : [];
  return [error?.message || 'The request could not be completed.', ...details].join(' ');
};

function FormMessage({ error, success }) {
  if (!error && !success) return null;
  return <div className={`form-message ${error ? 'form-message-error' : 'form-message-success'}`} role={error ? 'alert' : 'status'}>{error || success}</div>;
}

function rolePath(user) {
  return String(user?.role).toUpperCase() === 'VENDOR' ? '/vendor' : '/player';
}

function AccountPage({ title, subtitle, children, role }) {
  return <WorkspaceFrame role={role}><section className="account-content"><p className="account-kicker">{role === 'vendor' ? 'Venue provider' : 'Your PlaySpot account'}</p><h1>{title}</h1><p className="account-subtitle">{subtitle}</p>{children}</section></WorkspaceFrame>;
}

export function LoginPage() {
  const { user, ready, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (ready && user) return <Navigate to={rolePath(user)} replace />;

  async function submit(event) {
    event.preventDefault(); setError(''); setSubmitting(true);
    try {
      const signedIn = await login({ identifier: identifier.trim(), password });
      const returnTo = location.state?.from;
      navigate(returnTo?.startsWith(`/${String(signedIn.role).toLowerCase()}`) ? returnTo : rolePath(signedIn), { replace: true });
    } catch (requestError) { setError(formatError(requestError)); }
    finally { setSubmitting(false); }
  }

  return <AccountPage title="Welcome back" subtitle="Log in to your PlaySpot account.">
    <Card as="section" className="account-card">
      <form className="account-form" onSubmit={submit} noValidate>
        <FormMessage error={error} />
        <Field id="login-identifier" label="Email address or phone number" type="text" autoComplete="username" required maxLength={320} value={identifier} onChange={event => setIdentifier(event.target.value)} />
        <Field id="login-password" label="Password" type="password" autoComplete="current-password" required maxLength={72} value={password} onChange={event => setPassword(event.target.value)} />
        <div className="form-utility-row"><span className="form-hint">Session stays active in this browser tab.</span><Link to="/forgot-password">Forgot password?</Link></div>
        <Button type="submit" disabled={submitting}>{submitting ? 'Logging in…' : 'Log in'}</Button>
        <p className="form-bottom-copy">New to PlaySpot? <Link to="/register">Create an account</Link></p>
      </form>
    </Card>
  </AccountPage>;
}

export function RegistrationChoicePage() {
  const { user, ready } = useAuth();
  if (ready && user) return <Navigate to={rolePath(user)} replace />;
  return <AccountPage title="Create your account" subtitle="Choose how you want to use PlaySpot.">
    <div className="role-choice-grid">
      <Card as="article" className="role-choice-card"><span className="role-choice-icon" aria-hidden="true">⚽</span><h2>Player</h2><p>Find venues, book courts, and connect with players.</p><Button as={Link} to="/register/player">Continue as a player</Button></Card>
      <Card as="article" className="role-choice-card"><span className="role-choice-icon" aria-hidden="true">⌂</span><h2>Venue provider</h2><p>Create a provider account and set up your venue later.</p><Button as={Link} to="/register/vendor" variant="secondary">Continue as a provider</Button></Card>
    </div>
    <p className="form-bottom-copy">Already have an account? <Link to="/login">Log in</Link></p>
  </AccountPage>;
}

function useSportsCatalog(enabled = true) {
  const [sports, setSports] = useState([]);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    apiRequest('/sports', { auth: false }).then(items => { if (active) setSports(Array.isArray(items) ? items : []); })
      .catch(() => { if (active) setNotice('Sports preferences could not be loaded. You can add them later in profile settings.'); });
    return () => { active = false; };
  }, [enabled]);
  return { sports, notice };
}

function RegistrationForm({ role }) {
  const { user, ready, register } = useAuth();
  const navigate = useNavigate();
  const vendor = role === 'vendor';
  const { sports, notice: sportsNotice } = useSportsCatalog(!vendor);
  const [values, setValues] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', businessName: '', contactPhone: '' });
  const [preferredSports, setPreferredSports] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (ready && user) return <Navigate to={rolePath(user)} replace />;

  function setField(field, value) { setValues(current => ({ ...current, [field]: value })); }
  function toggleSport(code) { setPreferredSports(current => current.includes(code) ? current.filter(item => item !== code) : [...current, code]); }

  async function submit(event) {
    event.preventDefault(); setError('');
    if (!values.firstName.trim() || !values.email.trim()) { setError('Enter your name and email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) { setError('Enter a valid email address.'); return; }
    if (vendor && values.phone.replace(/\D/g, '').length < 7) { setError('Enter a phone number with at least 7 digits.'); return; }
    if (vendor && !values.businessName.trim()) { setError('Enter your business name.'); return; }
    if (values.contactPhone.trim() && values.contactPhone.replace(/\D/g, '').length < 7) { setError('The business contact phone must contain at least 7 digits.'); return; }
    if (values.password !== values.confirmPassword) { setError('Passwords do not match.'); return; }
    if (values.password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    if (new TextEncoder().encode(values.password).length > 72) { setError('Passwords must be no more than 72 bytes.'); return; }
    setSubmitting(true);
    const body = {
      name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
      email: values.email.trim(), phone: values.phone.trim() || undefined, password: values.password,
      confirmPassword: values.confirmPassword,
      ...(vendor ? { businessName: values.businessName.trim(), ...(values.contactPhone.trim() ? { contactPhone: values.contactPhone.trim() } : {}) }
        : { preferredSports }),
    };
    try { const created = await register(role, body); navigate(rolePath(created), { replace: true }); }
    catch (requestError) { setError(formatError(requestError)); }
    finally { setSubmitting(false); }
  }

  return <AccountPage role={role} title={vendor ? 'Create a provider account' : 'Create your player account'} subtitle={vendor ? 'Start with your account details. Venue setup is a separate step.' : 'Join players and discover sports venues.'}>
    <Card as="section" className="account-card">
      <form className="account-form" onSubmit={submit} noValidate>
        <FormMessage error={error} />
        {inputError(error) && <p className="field-error-note">{inputError(error)}</p>}
        <div className="form-two-columns">
          <Field id="register-first-name" label="First name" type="text" autoComplete="given-name" required maxLength={60} value={values.firstName} onChange={event => setField('firstName', event.target.value)} />
          <Field id="register-last-name" label="Last name" type="text" autoComplete="family-name" required maxLength={60} value={values.lastName} onChange={event => setField('lastName', event.target.value)} />
        </div>
        <Field id="register-email" label="Email address" type="email" autoComplete="email" required maxLength={320} value={values.email} onChange={event => setField('email', event.target.value)} />
        <Field id="register-phone" label="Phone number" type="tel" autoComplete="tel" required={vendor} hint={vendor ? 'Required for provider accounts.' : 'Optional for player accounts.'} value={values.phone} onChange={event => setField('phone', event.target.value)} />
        {vendor && <><Field id="register-business" label="Business name" type="text" autoComplete="organization" required maxLength={160} value={values.businessName} onChange={event => setField('businessName', event.target.value)} /><Field id="register-contact-phone" label="Business contact phone" type="tel" autoComplete="tel" hint="Optional; the account phone will be used if left blank." value={values.contactPhone} onChange={event => setField('contactPhone', event.target.value)} /></>}
        {!vendor && <fieldset className="sports-fieldset"><legend>Sports you enjoy <span>(optional)</span></legend>{sportsNotice && <p className="field-hint">{sportsNotice}</p>}{sports.length > 0 ? <div className="sport-options">{sports.map(sport => <button key={sport.id} className={`sport-option${preferredSports.includes(sport.code) ? ' selected' : ''}`} type="button" aria-pressed={preferredSports.includes(sport.code)} onClick={() => toggleSport(sport.code)}>{sport.name}</button>)}</div> : !sportsNotice && <p className="field-hint">Loading available sports…</p>}</fieldset>}
        <div className="form-two-columns">
          <Field id="register-password" label="Password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={values.password} onChange={event => setField('password', event.target.value)} />
          <Field id="register-confirm-password" label="Confirm password" type="password" autoComplete="new-password" required maxLength={72} value={values.confirmPassword} onChange={event => setField('confirmPassword', event.target.value)} />
        </div>
        <p className="password-hint">Use at least 8 characters. Your password is sent only to the backend and is never saved by this web app.</p>
        <Button type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</Button>
        <p className="form-bottom-copy">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </Card>
  </AccountPage>;
}

export function PlayerRegistrationPage() { return <RegistrationForm role="player" />; }
export function VendorRegistrationPage() { return <RegistrationForm role="vendor" />; }

export function ForgotPasswordPage() {
  return <AccountPage title="Password recovery isn’t available yet" subtitle="Keep your account credentials in a safe place.">
    <Card className="notice-card"><p>The backend does not send password reset email or OTP codes. This page cannot reset your password or confirm an email was sent.</p><p>Contact the PlaySpot project administrator for help with account access.</p><Button as={Link} to="/login" variant="secondary">Back to log in</Button></Card>
  </AccountPage>;
}
