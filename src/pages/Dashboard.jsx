import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Alert, Avatar, Box, Card, CardActionArea, CardContent, CircularProgress, Grid, Typography } from '@mui/material';
import People from '@mui/icons-material/PeopleOutline';
import Verified from '@mui/icons-material/VerifiedOutlined';
import Send from '@mui/icons-material/SendOutlined';
import Pending from '@mui/icons-material/PendingActionsOutlined';
import Currency from '@mui/icons-material/CurrencyRupee';
import Trending from '@mui/icons-material/TrendingUp';
import Psychology from '@mui/icons-material/PsychologyOutlined';
import { get } from '../api';
import { Page, dt } from '../ui';

function Stat({ label, value, hint, icon: Icon, color, to }) {
  const nav = useNavigate();
  const body = (
    <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Avatar sx={{ bgcolor: `${color}.50`, color: `${color}.main`, width: 48, height: 48, background: (t) => `${t.palette[color].main}14` }}><Icon /></Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" noWrap>{label}</Typography>
        <Typography variant="h5" fontWeight={800} lineHeight={1.2}>{value}</Typography>
        {hint && <Typography variant="caption" color="text.secondary" noWrap display="block">{hint}</Typography>}
      </Box>
    </CardContent>
  );
  return <Card sx={{ height: '100%' }}>{to ? <CardActionArea onClick={() => nav(to)} sx={{ height: '100%' }}>{body}</CardActionArea> : body}</Card>;
}

export default function Dashboard() {
  const q = useQuery({ queryKey: ['stats'], queryFn: () => get('/admin/stats'), refetchInterval: 60000 });
  if (q.isLoading) return <CircularProgress />;
  if (q.error) return <Alert severity="error">{q.error.message}</Alert>;
  const s = q.data;
  const max = Math.max(1, ...s.chart.map((c) => c.applied + c.skipped));
  const week = s.chart.reduce((a, c) => a + c.applied, 0);
  return (
    <Page title="Dashboard" subtitle={`Updated ${dt(s.updatedAt)} · refreshes every minute`}>
      {s.pendingPayments > 0 && <Alert severity="warning" sx={{ mb: 2 }} action={<Box component="a" href="/payments" sx={{ fontWeight: 700, color: 'inherit', alignSelf: 'center', mr: 1 }}>Review</Box>}>{s.pendingPayments} payment(s) waiting for verification</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}><Stat label="Total users" value={s.users} hint={`${s.newToday} new today`} icon={People} color="primary" to="/users" /></Grid>
        <Grid item xs={12} sm={6} lg={3}><Stat label="Active subscriptions" value={s.activeSubs} hint={Object.entries(s.byPlan).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'No paid users yet'} icon={Verified} color="secondary" to="/payments" /></Grid>
        <Grid item xs={12} sm={6} lg={3}><Stat label="Applies today" value={s.appliesToday} hint={`${week} in last 7 days`} icon={Send} color="success" to="/applications" /></Grid>
        <Grid item xs={12} sm={6} lg={3}><Stat label="Payments to verify" value={s.pendingPayments} icon={Pending} color={s.pendingPayments ? 'error' : 'warning'} to="/payments" /></Grid>
        <Grid item xs={12} sm={6} lg={4}><Stat label="Revenue (all time)" value={`₹${s.revenue.toLocaleString('en-IN')}`} icon={Currency} color="success" /></Grid>
        <Grid item xs={12} sm={6} lg={4}><Stat label="Revenue (this month)" value={`₹${s.revenueMonth.toLocaleString('en-IN')}`} icon={Trending} color="primary" /></Grid>
        <Grid item xs={12} sm={6} lg={4}><Stat label="Owner AI calls today" value={s.aiCallsToday} hint="Free users (owner key pool)" icon={Psychology} color="secondary" to="/ai" /></Grid>
      </Grid>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography fontWeight={700}>Applications, last 7 days</Typography>
          <Typography variant="caption" color="text.secondary">Blue = applied · Grey = skipped (low match)</Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 1, sm: 2 }, height: 200, mt: 2 }}>
            {s.chart.map((c) => (
              <Box key={c.date} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <Typography variant="caption" fontWeight={700}>{c.applied || ''}</Typography>
                <Box title={`${c.applied} applied, ${c.skipped} skipped`} sx={{ width: '100%', maxWidth: 44, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: `${((c.applied + c.skipped) / max) * 150}px`, minHeight: 3, borderRadius: '6px 6px 0 0', overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: '#e2e8f0', flex: c.skipped }} />
                  <Box sx={{ background: 'linear-gradient(180deg,#3b82f6,#2563eb)', flex: c.applied }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>{new Date(c.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Page>
  );
}
