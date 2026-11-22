import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import People from '@mui/icons-material/PeopleOutline';
import Verified from '@mui/icons-material/VerifiedOutlined';
import Send from '@mui/icons-material/SendOutlined';
import Schedule from '@mui/icons-material/Schedule';
import Currency from '@mui/icons-material/CurrencyRupee';
import Trending from '@mui/icons-material/TrendingUp';
import Bolt from '@mui/icons-material/BoltOutlined';
import { get } from '../api';
import { ErrorBox, Loader, Page, dt, inr } from '../ui';

function Stat({ label, value, hint, icon: Icon, tone, to, progress }) {
  const nav = useNavigate();
  return (
    <div className={`stat g-${tone}${to ? ' clickable' : ''}`} onClick={to ? () => nav(to) : undefined}>
      <div className="stat-head">
        <div className="stat-icon"><Icon fontSize="small" /></div>
        <div className="stat-label">{label}</div>
      </div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
      {progress != null && <div className="stat-bar"><span style={{ width: `${Math.min(100, progress)}%` }} /></div>}
    </div>
  );
}

// Smooth line (control points clamp: line 0 se neeche nahi jaati)
function smooth(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1] || pts[i]; const [x1, y1] = pts[i]; const [x2, y2] = pts[i + 1]; const [x3, y3] = pts[i + 2] || pts[i + 1];
    const lo = Math.min(y1, y2), hi = Math.max(y1, y2), c = (v) => Math.max(lo, Math.min(hi, v));
    d += ` C${x1 + (x2 - x0) / 6},${c(y1 + (y2 - y0) / 6)} ${x2 - (x3 - x1) / 6},${c(y2 - (y3 - y1) / 6)} ${x2},${y2}`;
  }
  return d;
}

function useNarrow() {
  const q = '(max-width: 600px)';
  const [n, setN] = useState(() => matchMedia(q).matches);
  useEffect(() => { const m = matchMedia(q); const h = () => setN(m.matches); m.addEventListener('change', h); return () => m.removeEventListener('change', h); }, []);
  return n;
}

function Chart({ data }) {
  const narrow = useNarrow();
  const W = narrow ? 380 : 760, H = narrow ? 240 : 280, L = narrow ? 30 : 44, R = 14, T = 16, B = 34;
  const step = Math.ceil(Math.max(4, ...data.flatMap((d) => [d.applied, d.skipped])) / 4);
  const top = step * 4;
  const x = (i) => L + (i * (W - L - R)) / Math.max(1, data.length - 1);
  const y = (v) => T + (1 - v / top) * (H - T - B);
  const series = [{ key: 'skipped', color: '#fb7185', fill: 'url(#gSkip)' }, { key: 'applied', color: '#818cf8', fill: 'url(#gApp)' }];
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="gApp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#818cf8" stopOpacity=".35" /><stop offset="1" stopColor="#818cf8" stopOpacity="0" /></linearGradient>
        <linearGradient id="gSkip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fb7185" stopOpacity=".22" /><stop offset="1" stopColor="#fb7185" stopOpacity="0" /></linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <line x1={L} x2={W - R} y1={y(k * step)} y2={y(k * step)} stroke="rgba(255,255,255,.07)" strokeDasharray="4 6" />
          <text x={L - 10} y={y(k * step) + 4} textAnchor="end" fontSize="12" fill="#9ea3c9">{k * step}</text>
        </g>
      ))}
      {series.map((s) => {
        const pts = data.map((d, i) => [x(i), y(d[s.key])]);
        const line = smooth(pts);
        return (
          <g key={s.key}>
            <path d={`${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={s.fill} />
            <path d={line} fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round" />
            {pts.map(([px, py], i) => <circle key={i} cx={px} cy={py} r={narrow ? 3.5 : 5} fill="#0b0b1e" stroke={s.color} strokeWidth="2.5"><title>{`${data[i].date}: ${data[i][s.key]} ${s.key}`}</title></circle>)}
          </g>
        );
      })}
      {data.map((d, i) => (
        <text key={d.date} x={x(i)} y={H - 10} textAnchor="middle" fontSize="12" fill="#9ea3c9">
          {narrow ? new Date(d.date).getDate() : new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </text>
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const q = useQuery({ queryKey: ['stats'], queryFn: () => get('/admin/stats'), refetchInterval: 60000 });
  if (q.isLoading) return <Loader />;
  if (q.error) return <ErrorBox error={q.error} />;
  const s = q.data;
  const applied = s.chart.reduce((a, c) => a + c.applied, 0);
  const skipped = s.chart.reduce((a, c) => a + c.skipped, 0);
  const rate = applied + skipped ? Math.round((applied / (applied + skipped)) * 100) : 0;

  return (
    <Page title="Dashboard" subtitle={`Updated ${dt(s.updatedAt)} · refreshes every minute`}>
      {s.pendingPayments > 0 && (
        <div className="alert alert-warning">{s.pendingPayments} payment(s) waiting for your approval <span className="spacer" /><Link to="/payments">Review</Link></div>
      )}
      <div className="grid grid-4">
        <Stat label="Total users" value={s.users} hint={`${s.newToday} new today`} icon={People} tone="purple" to="/users" />
        <Stat label="Active subscriptions" value={s.activeSubs} hint={Object.entries(s.byPlan).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'Paid plans running'} icon={Verified} tone="green" to="/payments" />
        <Stat label="Applies today" value={s.appliesToday} hint={`${applied} in last 7 days`} icon={Send} tone="blue" to="/applications" />
        <Stat label="Payments to verify" value={s.pendingPayments} hint={s.pendingPayments ? 'Needs your approval' : 'All clear'} icon={Schedule} tone="orange" to="/payments" />
      </div>
      <div className="grid grid-3 mt">
        <Stat label="Revenue (all time)" value={inr(s.revenue)} icon={Currency} tone="red" />
        <Stat label="Revenue (this month)" value={inr(s.revenueMonth)} icon={Trending} tone="violet" />
        <Stat label="Owner AI calls today" value={s.aiCallsToday} icon={Bolt} tone="night" to="/ai"
          hint={s.aiDailyLimit ? `of ${s.aiDailyLimit} daily calls · free users` : 'Free users (owner key pool)'}
          progress={s.aiDailyLimit ? (s.aiCallsToday / s.aiDailyLimit) * 100 : null} />
      </div>

      <section className="card mt">
        <div className="row">
          <div className="spacer">
            <h2 className="card-title">Applications, last 7 days</h2>
            <p className="card-sub">Applied vs skipped (low match)</p>
          </div>
          <div className="pills">
            <div className="pill indigo"><small>Applied</small><b>{applied}</b></div>
            <div className="pill rose"><small>Skipped</small><b>{skipped}</b></div>
            <div className="pill green"><small>Apply rate</small><b>{rate}%</b></div>
          </div>
        </div>
        <Chart data={s.chart} />
      </section>
    </Page>
  );
}
