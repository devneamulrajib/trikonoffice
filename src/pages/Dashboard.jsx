import React, { useMemo, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Target, Wallet, Activity,
  Plus, ShieldCheck, ListFilter, ClipboardList, CreditCard,
  Layers, History, Settings as SettingsIcon,
  Headphones, Users, Phone, PhoneCall, ArrowLeftRight,
  MessageSquare, BookOpen, FileText, Table2, Upload,
  BarChart2, ChevronRight, TrendingUp, TrendingDown
} from 'lucide-react';

// ─── ANIMATION KEYFRAMES (injected once) ──────────────────────────────────────
const STYLES = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.35); }
    70%  { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
    100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
  }
  .dash-card {
    animation: fadeSlideUp 0.38s ease both;
  }
  .stat-value {
    animation: countUp 0.45s cubic-bezier(.22,.68,0,1.2) both;
  }
  .sub-card:hover {
    transform: translateY(-3px) !important;
  }
`;

// ─── STAT CARD CONFIG ─────────────────────────────────────────────────────────
const STAT_CONFIGS = [
  { key: 'budget',   label: 'Phase Budget',  gradient: ['#6366F1','#818CF8'], icon: <Target size={18}/>,    iconBg: '#EEF2FF', sub: 'Allocated funds' },
  { key: 'spent',    label: 'Actual Spend',  gradient: ['#F59E0B','#FBBF24'], icon: <Wallet size={18}/>,    iconBg: '#FFFBEB', sub: 'Total expenditure' },
  { key: 'avail',    label: 'Available',     gradient: ['#10B981','#34D399'], icon: <TrendingUp size={18}/>, iconBg: '#ECFDF5', sub: 'Balance' },
  { key: 'util',     label: 'Utilization',   gradient: ['#EC4899','#F472B6'], icon: <Activity size={18}/>,  iconBg: '#FDF2F8', sub: '' },
];

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#1E293B', border: 'none',
        borderRadius: 12, padding: '10px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
      }}>
        <p style={{ fontWeight: 700, marginBottom: 6, color: '#94A3B8', fontSize: 11, textTransform: 'uppercase' }}>{label}</p>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: p.color }} />
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{p.name}:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: '#F1F5F9' }}>
              ৳{Number(p.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, gradient, icon, iconBg, delay = 0, accent }) => (
  <div
    className="dash-card"
    style={{
      background:   '#FFFFFF',
      border:       '1.5px solid #F1F5F9',
      borderRadius: 16,
      padding:      '20px 22px',
      boxShadow:    '0 2px 12px rgba(0,0,0,0.05)',
      animationDelay: `${delay}ms`,
      position:     'relative',
      overflow:     'hidden',
    }}
  >
    {/* Top gradient stripe */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      background: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})`,
      borderRadius: '16px 16px 0 0',
    }} />

    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {label}
      </p>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: gradient[0],
      }}>
        {icon}
      </div>
    </div>

    <h3
      className="stat-value"
      style={{
        fontSize: 28, fontWeight: 800,
        color: accent || '#0F172A',
        fontFamily: 'monospace', letterSpacing: '-0.02em',
        animationDelay: `${delay + 60}ms`,
        marginBottom: 4,
      }}
    >
      {value}
    </h3>
    {sub && <p style={{ fontSize: 12, color: '#94A3B8' }}>{sub}</p>}
  </div>
);

// ─── CHART CARD ───────────────────────────────────────────────────────────────
const ChartCard = ({ title, children, legend, delay = 0 }) => (
  <div
    className="dash-card"
    style={{
      background: '#FFFFFF',
      border: '1.5px solid #F1F5F9',
      borderRadius: 16,
      padding: '22px 24px 18px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      animationDelay: `${delay}ms`,
    }}
  >
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 18,
    }}>
      <h4 style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{title}</h4>
      {legend && (
        <div style={{ display: 'flex', gap: 14 }}>
          {legend.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
    {children}
  </div>
);

// ─── SUB-MENU CARD ────────────────────────────────────────────────────────────
const SubMenuCard = ({ icon, label, description, color, onClick, badge, delay = 0 }) => {
  const ref = useRef(null);
  return (
    <button
      ref={ref}
      className="dash-card sub-card"
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #F1F5F9',
        borderRadius: 16,
        padding: '20px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.2s ease',
        position: 'relative',
        animationDelay: `${delay}ms`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow   = `0 8px 28px ${color}28`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#F1F5F9';
        e.currentTarget.style.boxShadow   = '0 1px 4px rgba(0,0,0,0.04)';
      }}
    >
      {/* Background color blob */}
      <div style={{
        position: 'absolute', top: -18, right: -18,
        width: 72, height: 72, borderRadius: '50%',
        background: color + '14',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
        border: `1.5px solid ${color}30`,
      }}>
        {React.cloneElement(icon, { size: 18, color })}
      </div>

      {badge && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: '#FEE2E2', color: '#DC2626',
          fontSize: 10, fontWeight: 700,
          padding: '2px 8px', borderRadius: 20,
        }}>
          {badge}
        </div>
      )}

      <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 11.5, color: '#94A3B8', lineHeight: 1.5 }}>
        {description}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: 14, color }}>
        <ChevronRight size={14} />
      </div>
    </button>
  );
};

// ─── SECTION ITEMS ────────────────────────────────────────────────────────────
const SECTION_ITEMS = {
  finance: [
    { key: 'add_expense',    icon: <Plus />,          label: 'Log Transaction',  description: 'Record a new expense entry',          color: '#10B981' },
    { key: 'budget_request', icon: <Wallet />,         label: 'Phase Planning',   description: 'Create & manage budget requests',     color: '#6366F1' },
    { key: 'budget_history', icon: <ListFilter />,     label: 'History Ledger',   description: 'Browse all budget history records',   color: '#F59E0B' },
    { key: 'reports',        icon: <ClipboardList />,  label: 'Audit Reports',    description: 'Generate financial audit reports',    color: '#8B5CF6' },
    { key: 'salary_advance', icon: <CreditCard />,     label: 'Pay Advance',      description: 'Manage salary advance requests',      color: '#EF4444' },
    { key: 'approvals',      icon: <ShieldCheck />,    label: 'Authorizations',   description: 'Review & approve pending requests',   color: '#EC4899', badge: true },
  ],
  clients: [
    { key: 'clients',        icon: <Users />,   label: 'Clients',        description: 'View & manage all client records',   color: '#8B5CF6' },
    { key: 'clients_manage', icon: <Table2 />,  label: 'Manage Clients', description: 'Edit, search & organise clients',    color: '#3B82F6' },
    { key: 'clients_import', icon: <Upload />,  label: 'Import Clients', description: 'Bulk import from CSV or Excel',       color: '#10B981' },
  ],
  callcenter: [
    { key: 'call_center',     icon: <Headphones />,     label: 'Call Center Hub',  description: 'All call center operations',           color: '#0EA5E9' },
    { key: 'cc_new_call',     icon: <Phone />,           label: 'New Call',         description: 'Log inbound or outbound call',         color: '#10B981' },
    { key: 'cc_follow_up',    icon: <PhoneCall />,       label: 'Follow Up',        description: 'Track scheduled follow-up calls',      color: '#6366F1' },
    { key: 'cc_transfer',     icon: <ArrowLeftRight />,  label: 'Transfer Request', description: 'Submit & review call transfers',        color: '#F59E0B' },
    { key: 'cc_comments',     icon: <MessageSquare />,   label: 'Comments',         description: 'Notes & comments on call records',     color: '#EC4899' },
    { key: 'cc_call_logs',    icon: <BookOpen />,        label: 'Call Logs',        description: 'Full searchable call history',         color: '#64748B' },
    { key: 'cc_requirements', icon: <FileText />,        label: 'Requirements',     description: 'Client requirements from calls',       color: '#059669' },
  ],
  system: [
    { key: 'categories', icon: <Layers />,       label: 'Sectors',     description: 'Manage expense categories & sectors',  color: '#6366F1' },
    { key: 'activity',   icon: <History />,       label: 'Audit Trail', description: 'View all system activity logs',         color: '#0EA5E9' },
    { key: 'analytics',  icon: <BarChart2 />,     label: 'Analytics',   description: 'Usage & financial analytics',           color: '#10B981' },
    { key: 'settings',   icon: <SettingsIcon />,  label: 'Settings',    description: 'App preferences & configuration',      color: '#94A3B8' },
  ],
};

// ─── DASHBOARD HOME ───────────────────────────────────────────────────────────
const DashboardHome = ({ chartData, approved, spent, month, db }) => {
  const remaining = approved - spent;
  const util      = approved > 0 ? (spent / approved) * 100 : 0;

  const trendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(month + '-01');
      d.setMonth(d.getMonth() - i);
      const m     = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('default', { month: 'short' });
      const spentAmt  = (db.expenses || []).filter(e => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0);
      const budgetAmt = (db.budgetRequests || []).filter(b => b.month === m && b.status === 'approved').reduce((s, b) => s + b.total, 0);
      months.push({ month: label, spent: spentAmt, budget: budgetAmt });
    }
    return months;
  }, [db, month]);

  const pieData    = (chartData || []).filter(d => d.spent > 0).map(d => ({ name: d.name, value: d.spent }));
  const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#EF4444', '#0EA5E9'];

  const txCount = (db.expenses || []).filter(e => e.date?.startsWith(month)).length;

  const stats = [
    { ...STAT_CONFIGS[0], value: `৳${approved.toLocaleString()}` },
    { ...STAT_CONFIGS[1], value: `৳${spent.toLocaleString()}` },
    {
      ...STAT_CONFIGS[2],
      value: `৳${remaining.toLocaleString()}`,
      sub:   remaining < 0 ? '⚠️ EXCEEDED' : 'Balance',
      accent: remaining < 0 ? '#EF4444' : undefined,
      gradient: remaining < 0 ? ['#EF4444','#F87171'] : STAT_CONFIGS[2].gradient,
      iconBg:   remaining < 0 ? '#FEF2F2' : STAT_CONFIGS[2].iconBg,
      icon:     remaining < 0 ? <TrendingDown size={18}/> : STAT_CONFIGS[2].icon,
    },
    {
      ...STAT_CONFIGS[3],
      value:  `${util.toFixed(1)}%`,
      sub:    `${txCount} transactions`,
      accent: util > 90 ? '#EF4444' : util > 70 ? '#F59E0B' : undefined,
      gradient: util > 90 ? ['#EF4444','#F87171'] : util > 70 ? ['#F59E0B','#FCD34D'] : STAT_CONFIGS[3].gradient,
    },
  ];

  return (
    <div>
      <style>{STYLES}</style>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        {stats.map((s, i) => (
          <StatCard key={s.key} {...s} delay={i * 60} />
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 14 }}>
        <ChartCard
          title="Budget vs Expenditure"
          legend={[{ color: '#C7D2FE', label: 'Budget' }, { color: '#6366F1', label: 'Spent' }]}
          delay={240}
        >
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241,245,249,0.6)' }} />
                <Bar dataKey="budget" name="Budget" fill="#C7D2FE" radius={[5, 5, 0, 0]} barSize={16} />
                <Bar dataKey="spent"  name="Spent"  fill="#6366F1" radius={[5, 5, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Sector Distribution" delay={300}>
          {pieData.length === 0 ? (
            <div style={{
              height: 220, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              color: '#CBD5E1', fontSize: 13,
            }}>
              <div style={{ fontSize: 32 }}>📊</div>
              No data logged yet
            </div>
          ) : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                    paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* 6-month trend */}
      <ChartCard
        title="6-Month Trend"
        legend={[{ color: '#C7D2FE', label: 'Budget' }, { color: '#10B981', label: 'Spent' }]}
        delay={360}
      >
        <div style={{ height: 180 }}>
          <ResponsiveContainer>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="budget" name="Budget" stroke="#C7D2FE" strokeWidth={2} fill="url(#gBudget)" />
              <Area type="monotone" dataKey="spent"  name="Spent"  stroke="#10B981" strokeWidth={2} fill="url(#gSpend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
};

// ─── SECTION GRID ─────────────────────────────────────────────────────────────
const SectionGrid = ({ section, setView, pendingCount }) => {
  const items = SECTION_ITEMS[section];
  if (!items) return null;
  return (
    <>
      <style>{STYLES}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 14,
      }}>
        {items.map((item, i) => (
          <SubMenuCard
            key={item.key}
            icon={item.icon}
            label={item.label}
            description={item.description}
            color={item.color}
            onClick={() => setView(item.key)}
            badge={item.badge ? `${pendingCount} pending` : null}
            delay={i * 55}
          />
        ))}
      </div>
    </>
  );
};

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
const Dashboard = ({ view = 'dashboard', setView, chartData = [], approved = 0, spent = 0, month, db = {} }) => {
  const pendingCount = (db.budgetRequests || []).filter(r => r.status === 'pending').length;

  const SECTION_META = {
    dashboard:  { title: 'Dashboard',          subtitle: 'Financial performance overview' },
    finance:    { title: 'Finance',            subtitle: 'Budget, expenses & reports' },
    clients:    { title: 'Client Management',  subtitle: 'All your client operations' },
    callcenter: { title: 'Call Center',        subtitle: 'Calls, follow-ups & requirements' },
    system:     { title: 'System',             subtitle: 'Configuration & administration' },
  };

  const meta         = SECTION_META[view] || SECTION_META.dashboard;
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return (
    <div>
      <style>{STYLES}</style>

      {/* Page heading */}
      <div style={{ marginBottom: 28 }} className="dash-card">
        <h1 style={{
          fontSize: 34, fontWeight: 800, color: '#0F172A',
          letterSpacing: '-0.025em', lineHeight: 1, marginBottom: 6,
        }}>
          {meta.title}
        </h1>
        <p style={{ fontSize: 13, color: '#94A3B8' }}>
          {meta.subtitle}
          {view === 'dashboard' && ` · ${currentMonth}`}
        </p>
      </div>

      {view === 'dashboard' ? (
        <DashboardHome
          chartData={chartData}
          approved={approved}
          spent={spent}
          month={currentMonth}
          db={db}
        />
      ) : (
        <SectionGrid
          section={view}
          setView={setView}
          pendingCount={pendingCount}
        />
      )}
    </div>
  );
};

export default Dashboard;