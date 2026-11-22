import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListTable, Page, Search, Select, Status, day, useList } from '../ui';

export default function Users() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const nav = useNavigate();
  const q = useList('/admin/users', { q: search, status });
  return (
    <Page title="Users" subtitle="Everyone who signed up through the extension" actions={<>
      <Search value={search} onChange={setSearch} placeholder="Email or name" />
      <Select label="Status" value={status} onChange={setStatus} options={[['', 'All'], ['active', 'Active'], ['blocked', 'Blocked']]} />
    </>}>
      <ListTable q={q} onRow={(u) => nav(`/users/${u._id}`)} columns={[
        ['User', (u) => (
          <div className="row">
            <div className="avatar">{(u.name || u.email)[0].toUpperCase()}</div>
            <div><div className="strong">{u.name || '–'}</div><div className="muted small">{u.email}</div></div>
          </div>
        )],
        ['Login', (u) => <Status v={u.googleId ? 'on' : 'pending'} label={u.googleId ? 'Google' : 'Email'} />],
        ['Free applies used', (u) => u.freeAppliesUsed],
        ['Status', (u) => <span className="row"><Status v={u.status} />{u.role === 'admin' && <Status v="admin" />}</span>],
        ['Joined', (u) => day(u.createdAt)],
      ]} />
    </Page>
  );
}

