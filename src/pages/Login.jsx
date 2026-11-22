import { useState } from 'react';
import { login } from '../api';

export default function Login() {
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await login(f.email, f.password); location.reload(); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-logo">AI</div>
        <div>
          <h1>Admin sign in</h1>
          <p>Job Apply AI control panel</p>
        </div>
        {err && <div className="alert alert-danger">{err}</div>}
        <label className="field">
          <span>Email</span>
          <input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required autoFocus autoComplete="username" />
        </label>
        <label className="field">
          <span>Password</span>
          <input className="input" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required autoComplete="current-password" />
        </label>
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  );
}
