import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, CardContent, CircularProgress, Grid, Stack, TextField, Typography } from '@mui/material';
import { api, get } from '../api';
import { Page } from '../ui';

const FIELDS = [
  ['price', 'Price (₹)'], ['durationDays', 'Duration (days)'], ['dailyApplyLimit', 'Applies per day'], ['totalApplies', 'Total applies (free)'],
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
  const fields = FIELDS.filter(([k]) => (plan.name === 'free' ? !['price', 'durationDays', 'dailyApplyLimit'].includes(k) : k !== 'totalApplies'));
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" fontWeight={700} textTransform="capitalize" sx={{ mb: 2 }}>{plan.name}</Typography>
        <Stack spacing={1.5}>
          {fields.map(([k, label]) => (
            <TextField key={k} size="small" type="number" label={label} value={f[k] ?? ''} onChange={(e) => { setSaved(false); setF({ ...f, [k]: e.target.value }); }} />
          ))}
          {save.error && <Alert severity="error">{save.error.message}</Alert>}
          {saved && <Alert severity="success">Saved. Users see it within 5 minutes.</Alert>}
          <Button variant="contained" disabled={save.isPending} onClick={() => save.mutate()}>Save</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Plans() {
  const q = useQuery({ queryKey: ['plans'], queryFn: () => get('/admin/plans') });
  if (q.isLoading) return <CircularProgress />;
  if (q.error) return <Alert severity="error">{q.error.message}</Alert>;
  return (
    <Page title="Plan settings">
      <Grid container spacing={2}>
        {q.data.plans.map((p) => <Grid item xs={12} md={4} key={p._id}><PlanCard plan={p} /></Grid>)}
      </Grid>
    </Page>
  );
}
