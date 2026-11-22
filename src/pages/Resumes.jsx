import { Link } from 'react-router-dom';
import { ListTable, Page, Status, dt, useList } from '../ui';

export default function Resumes() {
  const q = useList('/admin/resumes');
  return (
    <Page title="Resumes" subtitle="Only metadata is stored. Resume files stay on the user's computer.">
      <ListTable q={q} columns={[
        ['Uploaded', (r) => <span className="muted">{dt(r.uploadedAt)}</span>],
        ['User', (r) => <Link to={`/users/${r.userId}`}>{r.userEmail}</Link>],
        ['File', (r) => <span className="strong">{r.fileName}</span>],
        ['Saved at (user PC)', (r) => <span className="mono">{r.localPath || '–'}</span>],
        ['Status', (r) => (r.deletedAt ? <Status v="deleted" /> : <Status v="active" />)],
      ]} />
    </Page>
  );
}
