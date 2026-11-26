import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, clearSession, restoreSession, setSession, setSessionExpiredHandler } from '../services/apiClient';

const AuthContext = createContext(null);

export function roleName(role) {
  const normalized = String(role || '').toUpperCase();
  if (normalized === 'PLAYER') return 'player';
  if (normalized === 'VENDOR') return 'vendor';
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState('');

  useEffect(() => {
    let active = true;
    setSessionExpiredHandler(() => { if (active) setUser(null); });
    restoreSession()
      .then(session => { if (active) setUser(session?.user || null); })
      .catch(error => {
        if (error.status === 401) clearSession();
        if (active) {
          setUser(null);
          if (error.status !== 401) setStorageNotice(`Your saved session could not be restored: ${error.message}`);
        }
      })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; setSessionExpiredHandler(null); };
  }, []);

  const acceptSession = useCallback(data => {
    const role = roleName(data?.user?.role);
    if (!role) throw new Error('The server returned an account with an unsupported role.');
    const notice = setSession(data);
    setStorageNotice(notice || '');
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async ({ identifier, password }) => {
    const data = await apiRequest('/auth/login', { method: 'POST', body: { identifier, password }, auth: false });
    return acceptSession(data);
  }, [acceptSession]);

  const register = useCallback(async (role, body) => {
    const path = role === 'player' ? '/auth/register/player' : '/auth/register/vendor';
    const data = await apiRequest(path, { method: 'POST', body, auth: false });
    return acceptSession(data);
  }, [acceptSession]);

  const updateUser = useCallback(nextUser => setUser(nextUser), []);

  const logout = useCallback(async () => {
    let warning = '';
    try { await apiRequest('/auth/logout', { method: 'POST', body: {} }); }
    catch (error) { warning = `Signed out on this tab, but the server could not confirm revocation: ${error.message}`; }
    finally { clearSession(); setUser(null); setStorageNotice(''); }
    return warning;
  }, []);

  const value = useMemo(() => ({ user, role: roleName(user?.role), ready, storageNotice, login, register, logout, updateUser }),
    [user, ready, storageNotice, login, register, logout, updateUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
