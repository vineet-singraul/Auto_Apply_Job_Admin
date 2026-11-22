import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Close from '@mui/icons-material/Close';
import { api, get } from '../api';
import { ErrorBox, ListTable, Note, Page, Select, Status, day, dt, inr, useList } from '../ui';

function PaymentsTab() {
  const [status, setStatus] = useState('submitted');
  const [shot, setShot] = useState(null);
  const qc = useQueryClient();
  const q = useList('/admin/payments', { status });
  const act = useMutation({
    mutationFn: ([path, body]) => api('PATCH', path, body || {}),
    onSuccess: () => ['/admin/payments', '/admin/subscriptions', 'stats'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
  const approve = (p) => confirm(`Approve ${inr(p.amount)} (${p.planName}) for ${p.userEmail}?\nUTR: ${p.utr}\n\nFirst check this UTR in your bank / UPI app.`) && act.mutate([`/admin/payments/${p._id}/approve`]);
  const reject = (p) => { const note = prompt('Reason (shown to the user):', 'UTR not found'); if (note !== null) act.mutate([`/admin/payments/${p._id}/reject`, { note }]); };
  const refund = (p) => { const note = prompt('Refund note (send the money back by UPI first):', 'Refunded'); if (note !== null) act.mutate([`/admin/payments/${p._id}/refund`, { note }]); };

  return (
    <>
      <div className="row">
        <Select label="Status" value={status} onChange={setStatus}
          options={[['', 'All'], ['submitted', 'To verify'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['refunded', 'Refunded']]} />
      </div>
      {act.error && <div className="mt"><ErrorBox error={act.error} /></div>}
      <div className="mt">
        <ListTable q={q} columns={[
          ['Date', (p) => <span className="muted">{dt(p.createdAt)}</span>],
          ['User', (p) => <Link to={`/users/${p.userId}`}>{p.userEmail}</Link>],
          ['Plan', (p) => <Status v="admin" label={p.planName} />],
          ['Amount', (p) => <b>{inr(p.amount)}</b>],
          ['Invoice', (p) => <span className="mono">{p.invoiceNo}</span>],
          ['UTR', (p) => <span className="mono">{p.utr || '–'}</span>],
          ['Proof', (p) => (p.hasScreenshot ? <button className="btn btn-sm" onClick={async () => setShot((await get(`/admin/payments/${p._id}/screenshot`)).screenshot)}>View</button> : '–')],
          ['Status', (p) => <div><Status v={p.status} /><Note>{p.note}</Note></div>],
          ['Actions', (p) => (
            <div className="row">
              {['submitted', 'pending'].includes(p.status) && <button className="btn btn-success btn-sm" disabled={act.isPending} onClick={() => approve(p)}>Approve</button>}
              {['submitted', 'pending'].includes(p.status) && <button className="btn btn-danger btn-sm" disabled={act.isPending} onClick={() => reject(p)}>Reject</button>}
              {p.status === 'approved' && <button className="btn btn-sm" disabled={act.isPending} onClick={() => refund(p)}>Refund</button>}
            </div>
          )],
        ]} empty={<div className="empty"><b>No payments here</b><span>Payments users submit (UTR + screenshot) will appear here.</span></div>} />
      </div>
      {shot && (
        <div className="modal-backdrop" onClick={() => setShot(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h3>Payment screenshot</h3><button className="btn btn-ghost icon-btn" onClick={() => setShot(null)} aria-label="Close"><Close /></button></div>
            <img src={shot} alt="Payment proof" />
          </div>
        </div>
      )}
    </>
  );
}

function SubsTab() {
  const [status, setStatus] = useState('active');
  const q = useList('/admin/subscriptions', { status });
  return (
    <>
      <div className="row"><Select label="Status" value={status} onChange={setStatus} options={[['', 'All'], ['active', 'Active'], ['expired', 'Expired'], ['cancelled', 'Cancelled']]} /></div>
      <div className="mt">
        <ListTable q={q} columns={[
          ['User', (s) => <Link to={`/users/${s.userId}`}>{s.userEmail}</Link>],
          ['Plan', (s) => <Status v="admin" label={s.planName} />],
          ['Start', (s) => day(s.startAt)],
          ['Expires', (s) => day(s.expiresAt)],
          ['Ref', (s) => <span className="mono">{s.paymentRef}</span>],
          ['Status', (s) => <Status v={s.status} />],
        ]} />
      </div>
    </>
  );
}

export default function Payments() {
  const [tab, setTab] = useState('payments');
  return (
    <Page title="Payments & subscriptions" subtitle="Verify UPI payments and manage active plans">
      <div className="tabs">
        <button className={`tab${tab === 'payments' ? ' active' : ''}`} onClick={() => setTab('payments')}>Payments</button>
        <button className={`tab${tab === 'subs' ? ' active' : ''}`} onClick={() => setTab('subs')}>Subscriptions</button>
      </div>
      {tab === 'payments' ? <PaymentsTab /> : <SubsTab />}
    </Page>
  );
}
