import { Link as RLink } from 'react-router-dom';
import { Alert, Link } from '@mui/material';
import { ListTable, Page, dt, useList } from '../ui';

export default function Resumes() {
  const q = useList('/admin/resumes');
  return (
    <Page title="Resumes">
      <Alert severity="info" sx={{ mb: 2 }}>Only metadata is stored. Resume files stay on the user's computer.</Alert>
      <ListTable q={q} columns={[
        ['Uploaded', (r) => dt(r.uploadedAt)],
        ['User', (r) => <Link component={RLink} to={`/users/${r.userId}`}>{r.userEmail}</Link>],
        ['File', (r) => r.fileName], ['Saved at (user PC)', (r) => r.localPath || '–'], ['Deleted', (r) => (r.deletedAt ? dt(r.deletedAt) : '–')],
      ]} />
    </Page>
  );
}
