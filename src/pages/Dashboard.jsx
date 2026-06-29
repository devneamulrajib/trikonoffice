import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Target, ArrowUpRight, Wallet, Activity,
  Plus, ShieldCheck, ListFilter, ClipboardList, CreditCard,
  Layers, History, Settings as SettingsIcon,
  Headphones, Users, Phone, PhoneCall, ArrowLeftRight,
  MessageSquare, BookOpen, FileText, Table2, Upload,
  BarChart2, ChevronRight
} from 'lucide-react';

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background:   '#FFF',
        border:       '1px solid #F3F4F6',
        borderRadius: 10,
        padding:      '10px 14px',
        boxShadow:    '0 8px 24px rgba(0,0,0,0.08)',
      }}>
        <p style={{ fontWeight: 700, marginBottom: 6, color: '#111', fontSize: 11, textTransform: 'uppercase' }}>
          {label}
        </p>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: p.color }} />
            <span style={{ fontSize: 12, color: '#6B7280' }}>{p.name}:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12, color: '#111' }}>
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
const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background:   '#FFFFFF',
    border:       '1.5px solid #F3F4F6',
    borderRadius: 14,
    padding:      '20px 22px',
    boxShadow:    '0 1px 3px rgba(0,0,0,0.03)',
  }}>
    <p style={{
      fontSize:      11,
      fontWeight:    700,
      color:         '#9CA3AF',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom:  10,
    }}>
      {label}
    </p>
    <h3 style={{
      fontSize:      28,
      fontWeight:    800,
      color:         accent || '#111111',
      fontFamily:    'monospace',
      letterSpacing: '-0.02em',
      marginBottom:  4,
    }}>
      {value}
    </h3>
    {sub && (
      <p style={{ fontSize: 12, color: '#9CA3AF' }}>{sub}</p>
    )}
  </div>
);

// ─── SUB-MENU CARD ────────────────────────────────────────────────────────────
const SubMenuCard = ({ icon, label, description, color, onClick, badge }) => (
  <button
    onClick={onClick}
    style={{
      background:   '#FFFFFF',
      border:       '1.5px solid #F3F4F6',
      borderRadius: 14,
      padding:      '20px',
      cursor:       'pointer',
      textAlign:    'left',
      width:        '100%',
      transition:   'all 0.16s ease',
      position:     'relative',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = '#F9A825';
      e.currentTarget.style.boxShadow   = '0 4px 16px rgba(249,168,37,0.12)';
      e.currentTarget.style.transform   = 'translateY(-1px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = '#F3F4F6';
      e.currentTarget.style.boxShadow   = 'none';
      e.currentTarget.style.transform   = 'translateY(0)';
    }}
  >
    <div style={{
      width:          40,
      height:         40,
      borderRadius:   10,
      background:     color + '18',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      marginBottom:   14,
    }}>
      {React.cloneElement(icon, { size: 18, color })}
    </div>

    {badge && (
      <div style={{
        position:     'absolute',
        top:          14,
        right:        14,
        background:   '#FEE2E2',
        color:        '#DC2626',
        fontSize:     10,
        fontWeight:   700,
        padding:      '2px 8px',
        borderRadius: 20,
      }}>
        {badge}
      </div>
    )}

    <div style={{ fontWeight: 700, fontSize: 13, color: '#111111', marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.5 }}>
      {description}
    </div>

    <div style={{
      display:    'flex',
      alignItems: 'center',
      marginTop:  14,
      color:      '#D1D5DB',
    }}>
      <ChevronRight size={14} />
    </div>
  </button>
);

// ─── SECTION DEFINITIONS ──────────────────────────────────────────────────────
const SECTION_ITEMS = {
  finance: [
    { key: 'add_expense',    icon: <Plus />,          label: 'Log Transaction',  description: 'Record a new expense entry',          color: '#10B981' },
    { key: 'budget_request', icon: <Wallet />,         label: 'Phase Planning',   description: 'Create & manage budget requests',     color: '#3B82F6' },
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

// ─── CHART CARD WRAPPER ───────────────────────────────────────────────────────
const ChartCard = ({ title, children, legend }) => (
  <div style={{
    background:   '#FFFFFF',
    border:       '1.5px solid #F3F4F6',
    borderRadius: 14,
    padding:      '24px 24px 20px',
    boxShadow:    '0 1px 3px rgba(0,0,0,0.03)',
  }}>
    <div style={{
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'center',
      marginBottom:   20,
    }}>
      <h4 style={{ fontWeight: 700, fontSize: 14, color: '#111111' }}>{title}</h4>
      {legend && (
        <div style={{ display: 'flex', gap: 14 }}>
          {legend.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
    {children}
  </div>
);

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

  const pieData   = (chartData || []).filter(d => d.spent > 0).map(d => ({ name: d.name, value: d.spent }));
  const PIE_COLORS = ['#F9A825', '#10B981', '#3B82F6', '#6366F1', '#EF4444', '#64748B'];

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard
          label="Phase Budget"
          value={`৳${approved.toLocaleString()}`}
          sub="Allocated funds"
        />
        <StatCard
          label="Actual Spend"
          value={`৳${spent.toLocaleString()}`}
          sub="Total expenditure"
        />
        <StatCard
          label="Available"
          value={`৳${remaining.toLocaleString()}`}
          sub={remaining < 0 ? 'EXCEEDED' : 'Balance'}
          accent={remaining < 0 ? '#EF4444' : undefined}
        />
        <StatCard
          label="Utilization"
          value={`${util.toFixed(1)}%`}
          sub={`${(db.expenses || []).filter(e => e.date?.startsWith(month)).length} transactions`}
          accent={util > 90 ? '#EF4444' : util > 70 ? '#F9A825' : undefined}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 14 }}>
        <ChartCard
          title="Budget vs Expenditure"
          legend={[{ color: '#E5E7EB', label: 'Budget' }, { color: '#F9A825', label: 'Spent' }]}
        >
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(243,244,246,0.6)' }} />
                <Bar dataKey="budget" name="Budget" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="spent"  name="Spent"  fill="#F9A825" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Sector Distribution">
          {pieData.length === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', fontSize: 13 }}>
              No data logged yet
            </div>
          ) : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={4} dataKey="value">
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
        legend={[{ color: '#E5E7EB', label: 'Budget' }, { color: '#F9A825', label: 'Spent' }]}
      >
        <div style={{ height: 180 }}>
          <ResponsiveContainer>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F9A825" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F9A825" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="budget" name="Budget" stroke="#E5E7EB" strokeWidth={2} fill="transparent" />
              <Area type="monotone" dataKey="spent"  name="Spent"  stroke="#F9A825" strokeWidth={2} fill="url(#gSpend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
};

// ─── SECTION SUB-MENU GRID ────────────────────────────────────────────────────
const SectionGrid = ({ section, setView, pendingCount }) => {
  const items = SECTION_ITEMS[section];
  if (!items) return null;
  return (
    <div style={{
      display:               'grid',
      gridTemplateColumns:   'repeat(auto-fill, minmax(200px, 1fr))',
      gap:                   14,
    }}>
      {items.map(item => (
        <SubMenuCard
          key={item.key}
          icon={item.icon}
          label={item.label}
          description={item.description}
          color={item.color}
          onClick={() => setView(item.key)}
          badge={item.badge ? `${pendingCount} pending` : null}
        />
      ))}
    </div>
  );
};

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
const Dashboard = ({ view = 'dashboard', setView, chartData = [], approved = 0, spent = 0, month, db = {} }) => {
  const pendingCount = (db.budgetRequests || []).filter(r => r.status === 'pending').length;

  const SECTION_META = {
    dashboard:  { title: 'Dashboard',          count: null },
    finance:    { title: 'Finance',            count: null },
    clients:    { title: 'Client Management',  count: null },
    callcenter: { title: 'Call Center',        count: null },
    system:     { title: 'System',             count: null },
  };

  const meta         = SECTION_META[view] || { title: 'Dashboard', count: null };
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return (
    <div>
      {/* ── Page heading (matches Uizard's large bold title + count) ───── */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <h1 style={{
          fontSize:      36,
          fontWeight:    800,
          color:         '#111111',
          letterSpacing: '-0.025em',
          lineHeight:    1,
        }}>
          {meta.title}
        </h1>
        {meta.count !== null && (
          <span style={{
            fontSize:   28,
            fontWeight: 700,
            color:      '#9CA3AF',
          }}>
            {meta.count}
          </span>
        )}
      </div>

      {/* Subtitle for dashboard */}
      {view === 'dashboard' && (
        <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: -18, marginBottom: 24 }}>
          Financial performance overview · {currentMonth}
        </p>
      )}

      {/* ── Content ───────────────────────────────────────────────────── */}
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