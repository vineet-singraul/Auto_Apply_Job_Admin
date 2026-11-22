import { useQuery } from '@tanstack/react-query';
import { get } from '../api';
import { DataTable, ErrorBox, Loader, Page, Status } from '../ui';

export default function AiUsage() {
  const q = useQuery({ queryKey: ['ai'], queryFn: () => get('/admin/ai-usage?days=7'), refetchInterval: 60000 });
  if (q.isLoading) return <Loader />;
  if (q.error) return <ErrorBox error={q.error} />;
  const { keys, rows, limits } = q.data;
  return (
    <Page title="AI usage" subtitle="Owner Gemini key pool (used by free users)">
      <section className="card">
        <h2 className="card-title">Keys</h2>
        <p className="card-sub">Model {limits.model} · per key {limits.rpm} requests/min, {limits.rpd} requests/day (from config; check your AI Studio)</p>
        {keys.length ? (
          <div className="row">{keys.map((k) => <Status key={k.key} v={k.coolingDown ? 'submitted' : 'active'} label={`${k.key}: ${k.coolingDown ? 'resting (429)' : 'ready'}`} />)}</div>
        ) : <div className="alert alert-warning">No owner keys in backend settings (OWNER_GEMINI_KEYS).</div>}
        <p className="muted small">Paid users use their own keys in their browser; that usage is not shown here.</p>
      </section>
      <h2 className="section-title">Last 7 days</h2>
      <DataTable rows={rows.filter((r) => r.calls || r.errors || r.rateLimited)} columns={[
        ['Date', (r) => r.date], ['Key', (r) => <span className="mono">{r.key}</span>], ['Calls', (r) => <b>{r.calls}</b>],
        ['429 (rate limited)', (r) => (r.rateLimited ? <Status v="submitted" label={String(r.rateLimited)} /> : 0)],
        ['Errors', (r) => (r.errors ? <Status v="failed" label={String(r.errors)} /> : 0)],
      ]} empty={<div className="empty"><b>No AI calls yet</b><span>Calls from free users will show up here.</span></div>} />
    </Page>
  );
}
