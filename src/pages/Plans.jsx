import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, get } from '../api';
import { ErrorBox, Loader, Page, inr } from '../ui';

const FIELDS = [
  ['price', 'Price (₹)'], ['durationDays', 'Duration (days)'], ['dailyApplyLimit', 'Applies per day'], ['totalApplies', 'Total applies (free)'],
  ['dailyLeadLimit', 'Leads per day'], ['totalLeads', 'Total leads (free)'],
  ['resumeLimit', 'Resume uploads'], ['batchSize', 'Batch size'], ['batchBreakSec', 'Batch break (sec)'],
];

function PlanCard({ plan }) {
  const qc = useQueryClient();
  const [f, setF] = useState(plan);
  const [saved, setSaved] = useState(false);
  const save = useMutation({
    mutationFn: () => {
      const body = {};
      for (const [k] of FIELDS) if (f[k] !== plan[k]) body[k] = f[k] === '' || f[k] == null ? null : Number(f[k]);
      return api('PATCH', `/admin/plans/${plan._id}`, body);
    },
    onSuccess: () => { setSaved(true); qc.invalidateQueries({ queryKey: ['plans'] }); },
  });
  const fields = FIELDS.filter(([k]) => (plan.name === 'free' ? !['price', 'durationDays', 'dailyApplyLimit', 'dailyLeadLimit'].includes(k) : !['totalApplies', 'totalLeads'].includes(k)));
  return (
    <section className="card plan-card">
      <div>
        <div className="plan-name">{plan.name}</div>
        <div className="plan-price">{plan.name === 'free' ? `${plan.totalApplies} applies · ${plan.totalLeads ?? 0} leads total` : `${inr(plan.price)} · ${plan.durationDays} days · ${plan.dailyApplyLimit} applies + ${plan.dailyLeadLimit ?? 0} leads/day`}</div>
      </div>
      {fields.map(([k, label]) => (
        <label className="field" key={k}>
          <span>{label}</span>
          <input className="input" type="number" value={f[k] ?? ''} onChange={(e) => { setSaved(false); setF({ ...f, [k]: e.target.value }); }} />
        </label>
      ))}
      {save.error && <ErrorBox error={save.error} />}
      {saved && <div className="alert alert-success">Saved. Users see it within 5 minutes.</div>}
      <button className="btn btn-primary btn-block" disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? 'Saving...' : 'Save changes'}</button>
    </section>
  );
}

export default function Plans() {
  const q = useQuery({ queryKey: ['plans'], queryFn: () => get('/admin/plans') });
  if (q.isLoading) return <Loader />;
  if (q.error) return <ErrorBox error={q.error} />;
  return (
    <Page title="Plan settings" subtitle="Prices and limits for each plan">
      <div className="grid grid-3">{q.data.plans.map((p) => <PlanCard key={p._id} plan={p} />)}</div>
    </Page>
  );
}
