import { Suspense, lazy, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AppBar, Avatar, Badge, Box, Button, CircularProgress, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery,
} from '@mui/material';
import Dashboard from '@mui/icons-material/SpaceDashboardOutlined';
import People from '@mui/icons-material/PeopleOutline';
import Payments from '@mui/icons-material/PaymentsOutlined';
import Work from '@mui/icons-material/WorkOutline';
import Description from '@mui/icons-material/DescriptionOutlined';
import Tune from '@mui/icons-material/TuneOutlined';
import Psychology from '@mui/icons-material/PsychologyOutlined';
import Receipt from '@mui/icons-material/ReceiptLongOutlined';
import Menu from '@mui/icons-material/Menu';
import Logout from '@mui/icons-material/Logout';
import { get, getAuth, logout } from './api';
import Login from './pages/Login';

const pages = [
  ['/', 'Dashboard', Dashboard, lazy(() => import('./pages/Dashboard'))],
  ['/users', 'Users', People, lazy(() => import('./pages/Users'))],
  ['/payments', 'Payments', Payments, lazy(() => import('./pages/Payments'))],
  ['/applications', 'Applications', Work, lazy(() => import('./pages/Applications'))],
  ['/resumes', 'Resumes', Description, lazy(() => import('./pages/Resumes'))],
  ['/plans', 'Plan settings', Tune, lazy(() => import('./pages/Plans'))],
  ['/ai', 'AI usage', Psychology, lazy(() => import('./pages/AiUsage'))],
  ['/logs', 'Logs', Receipt, lazy(() => import('./pages/Logs'))],
];
const UserDetail = lazy(() => import('./pages/UserDetail'));
const W = 236;

export default function App() {
  const auth = getAuth();
  const wide = useMediaQuery('(min-width:900px)');
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const stats = useQuery({ queryKey: ['stats'], queryFn: () => get('/admin/stats'), refetchInterval: 60000, enabled: !!auth });
  if (!auth) return <Login />;
  const pending = stats.data?.pendingPayments || 0;
  const current = pages.find(([to]) => (to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(to)))?.[1] || 'User';

  const nav = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: 2, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14 }}>AI</Box>
        <Box>
          <Typography fontWeight={800} lineHeight={1.2}>Job Apply AI</Typography>
          <Typography variant="caption" color="text.secondary">Admin console</Typography>
        </Box>
      </Box>
      <List sx={{ px: 1.25, flex: 1 }}>
        {pages.map(([to, label, Icon]) => (
          <ListItemButton key={to} component={NavLink} to={to} end={to === '/'} onClick={() => setOpen(false)}
            sx={{ borderRadius: 2, my: 0.25, py: 0.9, color: 'text.secondary', '&.active': { bgcolor: '#eff6ff', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } } }}>
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              {to === '/payments' ? <Badge color="error" badgeContent={pending} max={99}><Icon fontSize="small" /></Badge> : <Icon fontSize="small" />}
            </ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>{auth.user.email[0].toUpperCase()}</Avatar>
        <Typography variant="body2" noWrap sx={{ flex: 1 }}>{auth.user.email}</Typography>
        <IconButton size="small" onClick={logout} aria-label="Log out"><Logout fontSize="small" /></IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {!wide && (
        <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <IconButton onClick={() => setOpen(true)} aria-label="Menu" edge="start" sx={{ mr: 1 }}><Menu /></IconButton>
            <Typography fontWeight={700} sx={{ flex: 1 }}>{current}</Typography>
            {pending > 0 && <Button size="small" color="error" component={NavLink} to="/payments">{pending} to verify</Button>}
          </Toolbar>
        </AppBar>
      )}
      <Drawer variant={wide ? 'permanent' : 'temporary'} open={wide || open} onClose={() => setOpen(false)}
        sx={{ width: W, flexShrink: 0, '& .MuiDrawer-paper': { width: W, boxSizing: 'border-box', borderRight: '1px solid #e2e8f0' } }}>
        {nav}
      </Drawer>
      <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 4 }, maxWidth: 1400 }}>
        {!wide && <Toolbar />}
        <Suspense fallback={<CircularProgress />}>
          <Routes>
            {pages.map(([to, , , C]) => <Route key={to} path={to} element={<C />} />)}
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Box>
    </Box>
  );
}
