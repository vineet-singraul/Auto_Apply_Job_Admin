import { useState } from 'react';
import { Link as RLink } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, Link, MenuItem, Stack, Tab, Tabs, TextField } from '@mui/material';
import { api, get } from '../api';
import { ListTable, Page, Status, day, dt, useList } from '../ui';

function PaymentsTab() {
  const [status, setStatus] = useState('submitted');
  const [shot, setShot] = useState(null);
  const qc = useQueryClient();
  const q = useList('/admin/payments', { status });
  const act = useMutation({
    mutationFn: ([path, body]) => api('PATCH', path, body || {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['/admin/payments'] }); qc.invalidateQueries({ queryKey: ['/admin/subscriptions'] }); qc.invalidateQueries({ queryKey: ['stats'] }); },
  });
  const approve = (p) => confirm(`Approve ₹${p.amount} (${p.planName}) for ${p.userEmail}?\nUTR: ${p.utr}\n\nCheck that this UTR is in your bank/UPI app first.`) && act.mutate([`/admin/payments/${p._id}/approve`]);
  const reject = (p) => { const note = prompt('Reason for rejecting (shown to the user):', 'UTR not found'); if (note !== null) act.mutate([`/admin/payments/${p._id}/reject`, { note }]); };
  const refund = (p) => { const note = prompt('Refund note (send the money back by UPI yourself first):', 'Refunded'); if (note !== null) act.mutate([`/admin/payments/${p._id}/refund`, { note }]); };
  const viewShot = async (p) => setShot((await get(`/admin/payments/${p._id}/screenshot`)).screenshot);

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField size="small" select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          {['submitted', 'pending', 'approved', 'rejected', 'refunded'].map((s) => <MenuItem key={s} value={s}>{s === 'submitted' ? 'To verify' : s}</MenuItem>)}
        </TextField>
      </Stack>
      {act.error && <Alert severity="error" sx={{ mb: 2 }}>{act.error.message}</Alert>}
      <ListTable q={q} columns={[
        ['Date', (p) => dt(p.createdAt)],
        ['User', (p) => <Link component={RLink} to={`/users/${p.userId}`}>{p.userEmail}</Link>],
        ['Plan', (p) => p.planName], ['Amount', (p) => `₹${p.amount}`], ['Invoice', (p) => p.invoiceNo],
        ['UTR', (p) => p.utr || '–'],
        ['Proof', (p) => (p.hasScreenshot ? <Button size="small" onClick={() => viewShot(p)}>View</Button> : '–')],
        ['Status', (p) => <><Status v={p.status} />{p.note && <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{p.note}</Box>}</>],
        ['Actions', (p) => (
          <Stack direction="row" spacing={0.5}>
            {['submitted', 'pending'].includes(p.status) && <Button size="small" variant="contained" color="success" disabled={act.isPending} onClick={() => approve(p)}>Approve</Button>}
            {['submitted', 'pending'].includes(p.status) && <Button size="small" color="error" disabled={act.isPending} onClick={() => reject(p)}>Reject</Button>}
            {p.status === 'approved' && <Button size="small" disabled={act.isPending} onClick={() => refund(p)}>Refund</Button>}
          </Stack>
        )],
      ]} />
      <Dialog open={!!shot} onClose={() => setShot(null)} maxWidth="sm">
        <DialogTitle>Payment screenshot</DialogTitle>
        <DialogContent>{shot && <img src={shot} alt="Payment proof" style={{ maxWidth: '100%' }} />}</DialogContent>
      </Dialog>
    </>
  );
}

function SubsTab() {
  const [status, setStatus] = useState('active');
  const q = useList('/admin/subscriptions', { status });
  return (
    <>
      <TextField size="small" select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160, mb: 2 }}>
        <MenuItem value="">All</MenuItem>
        {['active', 'expired', 'cancelled'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>
      <ListTable q={q} columns={[
        ['User', (s) => <Link component={RLink} to={`/users/${s.userId}`}>{s.userEmail}</Link>],
        ['Plan', (s) => s.planName], ['Start', (s) => day(s.startAt)], ['Expires', (s) => day(s.expiresAt)], ['Ref', (s) => s.paymentRef], ['Status', (s) => <Status v={s.status} />],
      ]} />
    </>
  );
}

export default function Payments() {
  const [tab, setTab] = useState('payments');
  return (
    <Page title="Payments & subscriptions">
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab value="payments" label="Payments" /><Tab value="subs" label="Subscriptions" />
      </Tabs>
      {tab === 'payments' ? <PaymentsTab /> : <SubsTab />}
    </Page>
  );
}
