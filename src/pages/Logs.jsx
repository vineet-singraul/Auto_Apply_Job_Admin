import { useState } from 'react';
import { Link as RLink } from 'react-router-dom';
import { Link, MenuItem, TextField } from '@mui/material';
import { ListTable, Page, dt, useList } from '../ui';

const TYPES = ['login', 'login_failed', 'blocked_login', 'blocked_device', 'device_replaced', 'error', 'payment_approved', 'payment_rejected', 'payment_refunded',
  'admin_block', 'admin_unblock', 'admin_reset_device', 'admin_free_quota', 'admin_plan_update', 'admin_promoted'];

export default function Logs() {
  const [type, setType] = useState('');
  const q = useList('/admin/logs', { type });
  return (
    <Page title="Logs" actions={
      <TextField size="small" select label="Type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 200 }}>
        <MenuItem value="">All</MenuItem>
        {TYPES.map((t) => <MenuItem key={t} value={t}>{t.replace(/_/g, ' ')}</MenuItem>)}
      </TextField>
    }>
      <ListTable q={q} columns={[
        ['Time', (l) => dt(l.createdAt)], ['Type', (l) => l.type],
        ['User', (l) => (l.userEmail ? <Link component={RLink} to={`/users/${l.userId}`}>{l.userEmail}</Link> : '–')],
        ['Message', (l) => l.message],
      ]} />
    </Page>
  );
}
