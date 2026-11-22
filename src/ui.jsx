// Shared admin UI (styles.css ki classes use karta hai)
import { useInfiniteQuery } from '@tanstack/react-query';
import SearchIcon from '@mui/icons-material/Search';
import { get, qs } from './api';

export function useList(path, params = {}) {
  return useInfiniteQuery({
    queryKey: [path, params],
    queryFn: ({ pageParam }) => get(`${path}?${qs({ ...params, cursor: pageParam, limit: 25 })}`),
    initialPageParam: undefined,
    getNextPageParam: (last) => last.nextCursor || undefined,
  });
}

export const Loader = () => <div className="loader"><span /></div>;
export const ErrorBox = ({ error }) => <div className="alert alert-danger">{error?.message || String(error)}</div>;
export const Empty = ({ title = 'Nothing here yet', text = 'Data will show up here as users start using the extension.' }) => (
  <div className="empty"><b>{title}</b><span>{text}</span></div>
);

export function ListTable({ q, columns, onRow, empty }) {
  if (q.isLoading) return <Loader />;
  if (q.error) return <ErrorBox error={q.error} />;
  const rows = q.data.pages.flatMap((p) => p.items);
  return (
    <>
      <DataTable rows={rows} columns={columns} onRow={onRow} empty={empty} />
      {q.hasNextPage && (
        <div className="load-more">
          <button className="btn" disabled={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>{q.isFetchingNextPage ? 'Loading...' : 'Load more'}</button>
        </div>
      )}
    </>
  );
}

// columns: [label, (row) => cell]
export function DataTable({ rows, columns, onRow, empty }) {
  if (!rows.length) return empty || <Empty />;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr>{columns.map((c) => <th key={c[0]}>{c[0]}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id || JSON.stringify(r)} className={onRow ? 'clickable' : undefined} onClick={onRow ? () => onRow(r) : undefined}>
              {columns.map((c) => <td key={c[0]} data-label={c[0]}>{c[1](r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TONE = {
  active: 'success', applied: 'success', approved: 'success', on: 'success',
  blocked: 'danger', failed: 'danger', rejected: 'danger', deleted: 'danger',
  submitted: 'warning', pending: 'muted', skipped: 'muted', expired: 'muted', cancelled: 'muted', refunded: 'info', admin: 'primary', user: 'muted',
};
export const Status = ({ v, label }) => <span className={`chip chip-${TONE[v] || 'muted'}`}>{label || (v === 'submitted' ? 'to verify' : v)}</span>;
export const Note = ({ children }) => (children ? <span className="note">{children}</span> : null);

export function Page({ title, subtitle, actions, children }) {
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-sub">{subtitle}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </header>
      {children}
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

export function Search({ value, onChange, placeholder = 'Search...' }) {
  return (
    <label className="field search">
      <span>Search</span>
      <div className="search-box">
        <SearchIcon />
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      </div>
    </label>
  );
}

export const dt = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '–');
export const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '–');
export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
