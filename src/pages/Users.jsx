import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItem, TextField } from '@mui/material';
import { ListTable, Page, Status, day, useList } from '../ui';

export default function Users() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const nav = useNavigate();
  const q = useList('/admin/users', { q: search, status });
  return (
    <Page title="Users" actions={<>
      <TextField size="small" placeholder="Search email or name" value={search} onChange={(e) => setSearch(e.target.value)} />
      <TextField size="small" select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 120 }}>
        <MenuItem value="">All</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="blocked">Blocked</MenuItem>
      </TextField>
    </>}>
      <ListTable q={q} onRow={(u) => nav(`/users/${u._id}`)} columns={[
        ['Email', (u) => u.email],
        ['Name', (u) => u.name || '–'],
        ['Login', (u) => (u.googleId ? 'Google' : 'Email')],
        ['Free applies used', (u) => u.freeAppliesUsed],
        ['Location', (u) => (u.location?.lat ? `${u.location.lat.toFixed(2)}, ${u.location.lng.toFixed(2)}` : '–')],
        ['Status', (u) => <><Status v={u.status} /> {u.role === 'admin' && <Status v="admin" />}</>],
        ['Joined', (u) => day(u.createdAt)],
      ]} />
    </Page>
  );
}
