import { Suspense, lazy, useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardIcon from '@mui/icons-material/GridViewRounded';
import People from '@mui/icons-material/PeopleOutline';
import Payments from '@mui/icons-material/CreditCardOutlined';
import Work from '@mui/icons-material/WorkOutline';
import Description from '@mui/icons-material/DescriptionOutlined';
import Tune from '@mui/icons-material/TuneOutlined';
import AutoAwesome from '@mui/icons-material/AutoAwesomeOutlined';
import Receipt from '@mui/icons-material/ReceiptLongOutlined';
import Menu from '@mui/icons-material/Menu';
import Logout from '@mui/icons-material/Logout';
import InstallMobile from '@mui/icons-material/InstallMobile';
import { get, getAuth, logout } from './api';
import { Loader } from './ui';
import Login from './pages/Login';

const pages = [
  ['/', 'Dashboard', DashboardIcon, lazy(() => import('./pages/Dashboard'))],
  ['/users', 'Users', People, lazy(() => import('./pages/Users'))],
  ['/payments', 'Payments', Payments, lazy(() => import('./pages/Payments'))],
  ['/applications', 'Applications', Work, lazy(() => import('./pages/Applications'))],
  ['/resumes', 'Resumes', Description, lazy(() => import('./pages/Resumes'))],
  ['/plans', 'Plan settings', Tune, lazy(() => import('./pages/Plans'))],
  ['/ai', 'AI usage', AutoAwesome, lazy(() => import('./pages/AiUsage'))],
  ['/logs', 'Logs', Receipt, lazy(() => import('./pages/Logs'))],
];
const UserDetail = lazy(() => import('./pages/UserDetail'));

// "Install app" (PWA): browser allow kare tab button dikhta hai
function useInstall() {
  const [evt, setEvt] = useState(null);
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setEvt(e); };
    window.addEventListener('beforeinstallprompt', h);
    window.addEventListener('appinstalled', () => setEvt(null));
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  return evt ? async () => { evt.prompt(); await evt.userChoice; setEvt(null); } : null;
}

export default function App() {
  const auth = getAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const install = useInstall();
  const stats = useQuery({ queryKey: ['stats'], queryFn: () => get('/admin/stats'), refetchInterval: 60000, enabled: !!auth });
  useEffect(() => setOpen(false), [loc.pathname]);
  if (!auth) return <Login />;

  const pending = stats.data?.pendingPayments || 0;
  const current = pages.find(([to]) => (to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(to)))?.[1] || 'User';

  return (
    <div className="layout">
      <header className="topbar">
        <button className="btn btn-ghost icon-btn" onClick={() => setOpen(true)} aria-label="Menu"><Menu /></button>
        <span className="topbar-title">{current}</span>
        {pending > 0 && <NavLink to="/payments" className="btn btn-warning btn-sm">{pending} to verify</NavLink>}
      </header>
      <div className={`backdrop${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="brand">
          <div className="brand-logo">AI</div>
          <div>
            <div className="brand-name">Job Apply AI</div>
            <div className="brand-sub">Admin console</div>
          </div>
        </div>
        <nav className="nav">
          {pages.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon fontSize="small" />
              <span>{label}</span>
              {to === '/payments' && pending > 0 && <span className="nav-badge">{pending}</span>}
            </NavLink>
          ))}
        </nav>
        {install && <div className="sidebar-install"><button className="btn btn-block" onClick={install}><InstallMobile /> Install app</button></div>}
        <div className="sidebar-foot">
          <div className="avatar">{auth.user.email[0].toUpperCase()}</div>
          <span className="email">{auth.user.email}</span>
          <button className="btn btn-ghost icon-btn" onClick={logout} aria-label="Log out"><Logout fontSize="small" /></button>
        </div>
      </aside>

      <main className="main">
        <Suspense fallback={<Loader />}>
          <Routes>
            {pages.map(([to, , , C]) => <Route key={to} path={to} element={<C />} />)}
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
