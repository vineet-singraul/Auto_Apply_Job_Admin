import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' }, secondary: { main: '#7c3aed' }, success: { main: '#059669' }, warning: { main: '#d97706' }, error: { main: '#dc2626' },
    background: { default: '#f8fafc' }, text: { primary: '#0f172a', secondary: '#64748b' }, divider: '#e2e8f0',
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif', button: { textTransform: 'none', fontWeight: 600 } },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 8 } } },
    MuiCard: { defaultProps: { variant: 'outlined' }, styleOverrides: { root: { borderColor: '#e2e8f0' } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTableCell: { styleOverrides: { head: { fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc', fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.3 } } },
  },
});
const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false } } });

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={qc}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter><App /></BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>,
);
