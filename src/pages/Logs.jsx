import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListTable, Page, Select, Status, dt, useList } from '../ui';

const TYPES = ['login', 'login_failed', 'blocked_login', 'blocked_device', 'device_replaced', 'error', 'payment_approved', 'payment_rejected', 'payment_refunded',
  'admin_block', 'admin_unblock', 'admin_reset_device', 'admin_free_quota', 'admin_plan_update', 'admin_promoted'];
const tone = (t) => (/error|failed|blocked|rejected/.test(t) ? 'failed' : /approved|login$|promoted|unblock/.test(t) ? 'applied' : /admin|refund/.test(t) ? 'admin' : 'pending');

export default function Logs() {
  const [type, setType] = useState('');
  const q = useList('/admin/logs', { type });
  return (
    <Page title="Logs" subtitle="Logins, errors, blocked attempts and admin actions" actions={
      <Select label="Type" value={type} onChange={setType} options={[['', 'All types'], ...TYPES.map((t) => [t, t.replace(/_/g, ' ')])]} />
    }>
      <ListTable q={q} columns={[
        ['Time', (l) => <span className="muted">{dt(l.createdAt)}</span>],
        ['Type', (l) => <Status v={tone(l.type)} label={l.type.replace(/_/g, ' ')} />],
        ['User', (l) => (l.userEmail ? <Link to={`/users/${l.userId}`}>{l.userEmail}</Link> : '–')],
        ['Message', (l) => <span className="mono">{l.message}</span>],
      ]} />
    </Page>
  );
}
