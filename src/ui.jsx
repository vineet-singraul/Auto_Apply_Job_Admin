// Shared admin UI: table + cursor pagination hook + status chip
import { useInfiniteQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Card, Chip, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { get, qs } from './api';

export function useList(path, params = {}) {
  return useInfiniteQuery({
    queryKey: [path, params],
    queryFn: ({ pageParam }) => get(`${path}?${qs({ ...params, cursor: pageParam, limit: 25 })}`),
    initialPageParam: undefined,
    getNextPageParam: (last) => last.nextCursor || undefined,
  });
}

export function ListTable({ q, columns, onRow }) {
  if (q.isLoading) return <CircularProgress />;
  if (q.error) return <Alert severity="error">{q.error.message}</Alert>;
  const rows = q.data.pages.flatMap((p) => p.items);
  return (
    <>
      <DataTable rows={rows} columns={columns} onRow={onRow} />
      {q.hasNextPage && <Button sx={{ mt: 1 }} disabled={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>Load more</Button>}
    </>
  );
}

export function DataTable({ rows, columns, onRow }) {
  if (!rows.length) {
    return (
      <Card sx={{ p: 5, textAlign: 'center' }}>
        <Typography fontWeight={600}>Nothing here yet</Typography>
        <Typography variant="body2" color="text.secondary">Data will show up here as users start using the extension.</Typography>
      </Card>
    );
  }
  return (
    <Card sx={{ overflow: 'auto', maxHeight: '75vh' }}>
      <Table size="small" stickyHeader>
        <TableHead><TableRow>{columns.map((c) => <TableCell key={c[0]} sx={{ whiteSpace: 'nowrap', py: 1.25 }}>{c[0]}</TableCell>)}</TableRow></TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r._id || JSON.stringify(r)} hover onClick={onRow ? () => onRow(r) : undefined}
              sx={{ cursor: onRow ? 'pointer' : 'default', '& td': { py: 1.1, borderColor: '#f1f5f9' }, '&:last-child td': { border: 0 } }}>
              {columns.map((c) => <TableCell key={c[0]}>{c[1](r)}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

const COLORS = {
  active: 'success', applied: 'success', approved: 'success', blocked: 'error', failed: 'error', rejected: 'error',
  submitted: 'warning', pending: 'default', skipped: 'default', expired: 'default', cancelled: 'default', refunded: 'default', admin: 'primary',
};
export const Status = ({ v }) => <Chip size="small" color={COLORS[v] || 'default'} label={v === 'submitted' ? 'to verify' : v} sx={{ textTransform: 'capitalize' }} />;

export const dt = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '–');
export const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '–');

export function Page({ title, subtitle, actions, children }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="h5" fontWeight={800}>{title}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', '& .MuiTextField-root': { bgcolor: '#fff' } }}>{actions}</Box>
      </Box>
      {children}
    </Box>
  );
}
