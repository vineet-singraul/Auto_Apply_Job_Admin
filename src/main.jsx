import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles.css';
import { disableCopy } from './noCopy';

disableCopy();

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false } } });

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={qc}>
    <BrowserRouter><App /></BrowserRouter>
  </QueryClientProvider>,
);

// PWA: mobile par "Install app" (sirf production build me)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
