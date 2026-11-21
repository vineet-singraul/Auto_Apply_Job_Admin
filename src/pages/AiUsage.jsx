import { useQuery } from '@tanstack/react-query';
import { Alert, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { get } from '../api';
import { DataTable, Page } from '../ui';

export default function AiUsage() {
  const q = useQuery({ queryKey: ['ai'], queryFn: () => get('/admin/ai-usage?days=7'), refetchInterval: 60000 });
  if (q.isLoading) return <CircularProgress />;
  if (q.error) return <Alert severity="error">{q.error.message}</Alert>;
  const { keys, rows, limits } = q.data;
  return (
    <Page title="AI usage (owner key pool)">
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">Model {limits.model} · limits per key: {limits.rpm} RPM, {limits.rpd} RPD (from config; check your AI Studio)</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
            {keys.map((k) => <Chip key={k.key} label={`${k.key}: ${k.coolingDown ? 'resting (429)' : 'ready'}`} color={k.coolingDown ? 'warning' : 'success'} />)}
            {!keys.length && <Alert severity="warning">No owner keys in backend .env (OWNER_GEMINI_KEYS)</Alert>}
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>Paid users use their own keys in their browser; that usage is not shown here.</Typography>
        </CardContent>
      </Card>
      <DataTable rows={rows.filter((r) => r.calls || r.errors || r.rateLimited)} columns={[
        ['Date', (r) => r.date], ['Key', (r) => r.key], ['Calls', (r) => r.calls], ['429 (rate limited)', (r) => r.rateLimited], ['Errors', (r) => r.errors],
      ]} />
    </Page>
  );
}
