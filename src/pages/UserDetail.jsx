import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, Link, Stack, TextField, Typography } from '@mui/material';
import { api, get } from '../api';
import { DataTable, Page, Status, day, dt } from '../ui';

const Row = ({ k, v }) => <Stack direction="row" spacing={2} sx={{ py: 0.4 }}><Typography variant="body2" color="text.secondary" sx={{ width: 140, flexShrink: 0 }}>{k}</Typography><Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{v ?? '–'}</Typography></Stack>;

export default function UserDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['user', id], queryFn: () => get(`/admin/users/${id}`) });
  const [free, setFree] = useState('');
  const act = useMutation({
    mutationFn: ([method, path, body]) => api(method, path, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user', id] }); qc.invalidateQueries({ queryKey: ['/admin/users'] }); },
  });
  const run = (msg, ...args) => { if (confirm(msg)) act.mutate(args); };

  if (q.isLoading) return <CircularProgress />;
  if (q.error) return <Alert severity="error">{q.error.message}</Alert>;
  const { user: u, device, quota, subscriptions, payments, resumes, applications, appliedCount } = q.data;
  const blocked = u.status === 'blocked';

  return (
    <Page title={u.email} actions={<Status v={u.status} />}>
      {act.error && <Alert severity="error" sx={{ mb: 2 }}>{act.error.message}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined"><CardContent>
            <Typography fontWeight={600} sx={{ mb: 1 }}>Profile</Typography>
            <Row k="Name" v={u.name} />
            <Row k="Role" v={u.role} />
            <Row k="Login" v={u.googleId ? 'Google' : 'Email + password'} />
            <Row k="Joined" v={dt(u.createdAt)} />
            <Row k="Consent" v={dt(u.consentAt)} />
            <Row k="Location" v={u.location?.lat ? <Link href={`https://maps.google.com/?q=${u.location.lat},${u.location.lng}`} target="_blank" rel="noopener">{u.location.lat.toFixed(4)}, {u.location.lng.toFixed(4)}</Link> : null} />
            <Row k="Notifications" v={u.notificationsEnabled ? 'On' : 'Off'} />
            <Row k="Device" v={device ? `${device.deviceId.slice(0, 18)}… · last login ${dt(device.lastLoginAt)}` : 'None'} />
            <Row k="Browser" v={device?.userAgent?.slice(0, 80)} />
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined"><CardContent>
            <Typography fontWeight={600} sx={{ mb: 1 }}>Plan & usage</Typography>
            <Row k="Plan" v={<Chip size="small" label={quota.plan} color={quota.plan === 'free' ? 'default' : 'primary'} />} />
            <Row k="Expires" v={day(quota.expiresAt)} />
            <Row k="Applies" v={`${quota.used} used / ${quota.limit} ${quota.type === 'daily' ? 'today' : 'total'}`} />
            <Row k="Total applied" v={appliedCount} />
            <Typography fontWeight={600} sx={{ mt: 2, mb: 1 }}>Controls</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {u.role !== 'admin' && (
                <Button size="small" variant="outlined" color={blocked ? 'success' : 'error'}
                  onClick={() => run(`${blocked ? 'Unblock' : 'Block'} ${u.email}?`, 'POST', `/admin/users/${id}/block`, { blocked: !blocked })}>
                  {blocked ? 'Unblock' : 'Block'}
                </Button>
              )}
              <Button size="small" variant="outlined" onClick={() => run('Reset device? The user will be logged out and can log in on a new device.', 'POST', `/admin/users/${id}/reset-device`)}>Reset device</Button>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <TextField size="small" type="number" label="Free applies used" value={free} onChange={(e) => setFree(e.target.value)} placeholder={String(u.freeAppliesUsed)} sx={{ width: 170 }} />
              <Button size="small" disabled={free === ''} onClick={() => run(`Set free applies used to ${free}?`, 'PATCH', `/admin/users/${id}/free-quota`, { freeAppliesUsed: Number(free) })}>Save</Button>
            </Stack>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Resumes</Typography>
      <DataTable rows={resumes} columns={[
        ['File', (r) => r.fileName], ['Name in resume', (r) => r.parsedProfile?.name], ['Experience', (r) => (r.parsedProfile?.totalExperienceYears != null ? `${r.parsedProfile.totalExperienceYears} yrs` : '–')],
        ['Skills', (r) => (r.parsedProfile?.skills || []).slice(0, 6).join(', ')], ['Saved at (user PC)', (r) => r.localPath], ['Uploaded', (r) => dt(r.uploadedAt)], ['', (r) => (r.deletedAt ? <Status v="deleted" /> : '')],
      ]} />

      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Subscriptions</Typography>
      <DataTable rows={subscriptions} columns={[
        ['Plan', (s) => s.planId?.name], ['Start', (s) => day(s.startAt)], ['Expires', (s) => day(s.expiresAt)], ['Ref', (s) => s.paymentRef], ['Status', (s) => <Status v={s.status} />],
      ]} />

      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Payments</Typography>
      <DataTable rows={payments} columns={[
        ['Date', (p) => dt(p.createdAt)], ['Invoice', (p) => p.invoiceNo], ['Plan', (p) => p.planName], ['Amount', (p) => `₹${p.amount}`], ['UTR', (p) => p.utr || '–'], ['Status', (p) => <Status v={p.status} />],
      ]} />

      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Recent applications</Typography>
      <DataTable rows={applications} columns={[
        ['Date', (a) => dt(a.appliedAt)], ['Job', (a) => (a.jobUrl ? <Link href={a.jobUrl} target="_blank" rel="noopener">{a.jobTitle || a.jobId}</Link> : a.jobTitle)],
        ['Company', (a) => a.company], ['Site', (a) => a.platform], ['Score', (a) => (a.matchScore != null ? `${a.matchScore}%` : '–')], ['Status', (a) => <><Status v={a.status} />{a.note && <div style={{ fontSize: 12, color: '#6b7280', maxWidth: 280 }}>{a.note}</div>}</>],
      ]} />
      <Box sx={{ height: 24 }} />
    </Page>
  );
}
