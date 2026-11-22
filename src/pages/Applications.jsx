import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListTable, Note, Page, Select, Status, dt, useList } from '../ui';

export default function Applications() {
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('');
  const q = useList('/admin/applications', { platform, status });
  return (
    <Page title="Applications" subtitle="Every job the extension applied to, skipped or failed" actions={<>
      <Select label="Site" value={platform} onChange={setPlatform} options={[['', 'All sites'], ['linkedin', 'LinkedIn'], ['naukri', 'Naukri']]} />
      <Select label="Status" value={status} onChange={setStatus} options={[['', 'All'], ['applied', 'Applied'], ['skipped', 'Skipped'], ['failed', 'Failed']]} />
    </>}>
      <ListTable q={q} columns={[
        ['Date', (a) => <span className="muted">{dt(a.appliedAt)}</span>],
        ['User', (a) => <Link to={`/users/${a.userId}`}>{a.userEmail}</Link>],
        ['Job', (a) => (a.jobUrl ? <a href={a.jobUrl} target="_blank" rel="noopener noreferrer" className="strong">{a.jobTitle || a.jobId}</a> : a.jobTitle)],
        ['Company', (a) => a.company || '–'],
        ['Site', (a) => <Status v={a.platform === 'linkedin' ? 'admin' : 'refunded'} label={a.platform} />],
        ['Score', (a) => (a.matchScore != null ? <b>{a.matchScore}%</b> : '–')],
        ['Status', (a) => <div><Status v={a.status} /><Note>{a.note}</Note></div>],
      ]} />
    </Page>
  );
}
