import { useState } from 'react';
import { Link as RLink } from 'react-router-dom';
import { Link, MenuItem, TextField } from '@mui/material';
import { ListTable, Page, Status, dt, useList } from '../ui';

export default function Applications() {
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');
  const q = useList('/admin/applications', { platform, status });
  return (
    <Page title="Applications" actions={<>
      <TextField size="small" select label="Site" value={platform} onChange={(e) => setPlatform(e.target.value)} sx={{ minWidth: 120 }}>
        <MenuItem value="">All</MenuItem><MenuItem value="linkedin">LinkedIn</MenuItem><MenuItem value="naukri">Naukri</MenuItem>
      </TextField>
      <TextField size="small" select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 120 }}>
        <MenuItem value="">All</MenuItem><MenuItem value="applied">Applied</MenuItem><MenuItem value="skipped">Skipped</MenuItem><MenuItem value="failed">Failed</MenuItem>
      </TextField>
    </>}>
      <ListTable q={q} columns={[
        ['Date', (a) => dt(a.appliedAt)],
        ['User', (a) => <Link component={RLink} to={`/users/${a.userId}`}>{a.userEmail}</Link>],
        ['Job', (a) => (a.jobUrl ? <Link href={a.jobUrl} target="_blank" rel="noopener">{a.jobTitle || a.jobId}</Link> : a.jobTitle)],
        ['Company', (a) => a.company], ['Site', (a) => a.platform], ['Score', (a) => (a.matchScore != null ? `${a.matchScore}%` : '–')], ['Status', (a) => <><Status v={a.status} />{a.note && <div style={{ fontSize: 12, color: '#6b7280', maxWidth: 280 }}>{a.note}</div>}</>],
      ]} />
    </Page>
  );
}
