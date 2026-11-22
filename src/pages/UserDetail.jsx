import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, get } from '../api';
import { DataTable, ErrorBox, Loader, Note, Page, Status, day, dt, inr } from '../ui';

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

  if (q.isLoading) return <Loader />;
  if (q.error) return <ErrorBox error={q.error} />;
  const { user: u, device, quota, subscriptions, payments, resumes, applications, appliedCount } = q.data;
  const blocked = u.status === 'blocked';

  return (
    <Page title={u.name || u.email} subtitle={u.email} actions={<><Status v={u.status} /><Status v={u.role} /></>}>
      {act.error && <ErrorBox error={act.error} />}
      <div className="grid grid-2">
        <section className="card">
          <h2 className="card-title">Profile</h2>
          <p className="card-sub">Account and device</p>
          <dl className="kv">
            <dt>Login</dt><dd>{u.googleId ? 'Google' : 'Email + password'}</dd>
            <dt>Joined</dt><dd>{dt(u.createdAt)}</dd>
            <dt>Consent</dt><dd>{dt(u.consentAt)}</dd>
            <dt>Location</dt><dd>{u.location?.lat ? <a href={`https://maps.google.com/?q=${u.location.lat},${u.location.lng}`} target="_blank" rel="noopener noreferrer">{u.location.lat.toFixed(4)}, {u.location.lng.toFixed(4)}</a> : '–'}</dd>
            <dt>Notifications</dt><dd>{u.notificationsEnabled ? 'On' : 'Off'}</dd>
            <dt>Device</dt><dd className="mono">{device ? `${device.deviceId.slice(0, 20)}…` : 'None'}</dd>
            <dt>Last login</dt><dd>{dt(device?.lastLoginAt)}</dd>
          </dl>
        </section>

        <section className="card">
          <h2 className="card-title">Plan & usage</h2>
          <p className="card-sub">Current plan and controls</p>
          <dl className="kv">
            <dt>Plan</dt><dd><Status v={quota.plan === 'free' ? 'pending' : 'admin'} label={quota.plan} /></dd>
            <dt>Expires</dt><dd>{day(quota.expiresAt)}</dd>
            <dt>Applies</dt><dd>{quota.used} used / {quota.limit} {quota.type === 'daily' ? 'today' : 'total'}</dd>
            <dt>Total applied</dt><dd className="strong">{appliedCount}</dd>
          </dl>
          <div className="row mt">
            {u.role !== 'admin' && (
              <button className={`btn btn-sm ${blocked ? 'btn-success' : 'btn-danger'}`} onClick={() => run(`${blocked ? 'Unblock' : 'Block'} ${u.email}?`, 'POST', `/admin/users/${id}/block`, { blocked: !blocked })}>
                {blocked ? 'Unblock user' : 'Block user'}
              </button>
            )}
            <button className="btn btn-sm" onClick={() => run('Reset device? The user will be logged out and can log in on a new device.', 'POST', `/admin/users/${id}/reset-device`)}>Reset device</button>
          </div>
          <div className="row row-end mt">
            <label className="field">
              <span>Free applies used (now {u.freeAppliesUsed})</span>
              <input className="input" type="number" min="0" value={free} onChange={(e) => setFree(e.target.value)} placeholder="e.g. 0 to reset" />
            </label>
            <button className="btn btn-primary" disabled={free === ''} onClick={() => run(`Set free applies used to ${free}?`, 'PATCH', `/admin/users/${id}/free-quota`, { freeAppliesUsed: Number(free) })}>Save</button>
          </div>
        </section>
      </div>

      <h2 className="section-title">Resumes</h2>
      <DataTable rows={resumes} columns={[
        ['File', (r) => <span className="strong">{r.fileName}</span>],
        ['Name in resume', (r) => r.parsedProfile?.name || '–'],
        ['Experience', (r) => (r.parsedProfile?.totalExperienceYears != null ? `${r.parsedProfile.totalExperienceYears} yrs` : '–')],
        ['Skills', (r) => <div className="skills">{(r.parsedProfile?.skills || []).slice(0, 6).map((s) => <span key={s} className="skill">{s}</span>)}</div>],
        ['Uploaded', (r) => day(r.uploadedAt)],
        ['Status', (r) => (r.deletedAt ? <Status v="deleted" /> : <Status v="active" />)],
      ]} empty={<div className="empty"><b>No resume uploaded</b></div>} />

      <h2 className="section-title">Subscriptions</h2>
      <DataTable rows={subscriptions} columns={[
        ['Plan', (s) => <Status v="admin" label={s.planId?.name} />], ['Start', (s) => day(s.startAt)], ['Expires', (s) => day(s.expiresAt)],
        ['Ref', (s) => <span className="mono">{s.paymentRef}</span>], ['Status', (s) => <Status v={s.status} />],
      ]} empty={<div className="empty"><b>No paid plan yet</b></div>} />

      <h2 className="section-title">Payments</h2>
      <DataTable rows={payments} columns={[
        ['Date', (p) => dt(p.createdAt)], ['Invoice', (p) => <span className="mono">{p.invoiceNo}</span>], ['Plan', (p) => p.planName],
        ['Amount', (p) => <b>{inr(p.amount)}</b>], ['UTR', (p) => <span className="mono">{p.utr || '–'}</span>], ['Status', (p) => <Status v={p.status} />],
      ]} empty={<div className="empty"><b>No payments</b></div>} />

      <h2 className="section-title">Recent applications</h2>
      <DataTable rows={applications} columns={[
        ['Date', (a) => <span className="muted">{dt(a.appliedAt)}</span>],
        ['Job', (a) => (a.jobUrl ? <a href={a.jobUrl} target="_blank" rel="noopener noreferrer" className="strong">{a.jobTitle || a.jobId}</a> : a.jobTitle)],
        ['Company', (a) => a.company || '–'], ['Site', (a) => a.platform],
        ['Score', (a) => (a.matchScore != null ? <b>{a.matchScore}%</b> : '–')],
        ['Status', (a) => <div><Status v={a.status} /><Note>{a.note}</Note></div>],
      ]} empty={<div className="empty"><b>No applications yet</b></div>} />
    </Page>
  );
}
