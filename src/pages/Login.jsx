import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { login } from '../api';

export default function Login() {
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await login(f.email, f.password); location.reload(); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'radial-gradient(circle at 20% 20%, #dbeafe 0, transparent 40%), radial-gradient(circle at 80% 80%, #ede9fe 0, transparent 40%), #f8fafc' }}>
      <Card sx={{ width: '100%', maxWidth: 400, boxShadow: '0 20px 50px -20px rgba(37,99,235,.35)' }}>
        <CardContent component="form" onSubmit={submit} sx={{ p: 4 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, mb: 2 }}>AI</Box>
          <Typography variant="h5" fontWeight={800}>Admin sign in</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Job Apply AI control panel</Typography>
          <Stack spacing={2}>
            {err && <Alert severity="error">{err}</Alert>}
            <TextField label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required autoFocus />
            <TextField label="Password" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
            <Button type="submit" variant="contained" size="large" disabled={busy} sx={{ py: 1.25 }}>{busy ? 'Signing in...' : 'Sign in'}</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
