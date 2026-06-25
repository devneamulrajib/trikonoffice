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
  BarChart2
} from 'lucide-react';

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#FFF',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)'
      }}>
        <p style={{ fontWeight: 700, marginBottom: 8, color: '#0F172A', fontSize: 12, textTransform: 'uppercase' }}>
          {label}
        </p>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
            <span style={{ fontSize: 13, color: '#64748B' }}>{p.name}:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>
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
const StatCard = ({ label, value, icon, color, sub }) => (
  <div style={{
    background: '#FFF',
    border: '1px solid #F1F5F9',
    borderRadius: 16,
    padding: '20px 24px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  }}>
    <div style={{
      position: 'absolute', top: 0, right: 0, padding: 16, opacity: 0.06, color
    }}>
      {React.cloneElement(icon, { size: 56 })}
    </div>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <p style={{
        fontSize: 11, fontWeight: 600, color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10
      }}>
        {label}
      </p>
      <h3 style={{
        fontSize: 26, fontWeight: 800, color: '#0F172A',
        fontFamily: 'monospace', letterSpacing: '-0.02em', marginBottom: 4
      }}>
        {value}
      </h3>
      {sub && (
        <p style={{ fontSize: 12, color: '#94A3B8' }}>{sub}</p>
      )}
    </div>
  </div>
);

// ─── SUB-MENU CARD ────────────────────────────────────────────────────────────
const SubMenuCard = ({ icon, label, description, color, onClick, badge }) => (
  <button
    onClick={onClick}
    style={{
      background: '#FFF',
      border: '1px solid #F1F5F9',
      borderRadius: 16,
      padding: 20,
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      transition: 'all 0.18s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      position: 'relative',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)';
      e.currentTarget.style.borderColor = '#E2E8F0';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
      e.currentTarget.style.borderColor = '#F1F5F9';
    }}
  >
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 14,
    }}>
      {React.cloneElement(icon, { size: 20, color })}
    </div>

    {badge && (
      <div style={{
        position: 'absolute', top: 16, right: 16,
        background: '#FEE2E2', color: '#DC2626',
        fontSize: 10, fontWeight: 700,
        padding: '2px 8px', borderRadius: 20,
        letterSpacing: '0.02em',
      }}>
        {badge}
      </div>
    )}

    <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>
      {description}
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

// ─── DASHBOARD CHARTS & STATS ─────────────────────────────────────────────────
const DashboardHome = ({ chartData, approved, spent, month, db }) => {
  const remaining = approved - spent;
  const util = approved > 0 ? (spent / approved) * 100 : 0;

  const trendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(month + '-01');
      d.setMonth(d.getMonth() - i);
      const m = d.toISOString().slice(0, 7);
      const label = d.toLocaleString('default', { month: 'short' });
      const spentAmt = (db.expenses || []).filter(e => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0);
      const budgetAmt = (db.budgetRequests || []).filter(b => b.month === m && b.status === 'approved').reduce((s, b) => s + b.total, 0);
      months.push({ month: label, spent: spentAmt, budget: budgetAmt });
    }
    return months;
  }, [db, month]);

  const pieData = (chartData || []).filter(d => d.spent > 0).map(d => ({ name: d.name, value: d.spent }));
  const PIE_COLORS = ['#10B981', '#3B82F6', '#6366F1', '#F59E0B', '#EF4444', '#64748B'];

  return (
    <div>
      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Phase Budget" value={`৳${approved.toLocaleString()}`}  icon={<Target />}       color="#3B82F6" sub="Allocated funds" />
        <StatCard label="Actual Spend" value={`৳${spent.toLocaleString()}`}     icon={<ArrowUpRight />} color="#10B981" sub="Total expenditure" />
        <StatCard label="Available"    value={`৳${remaining.toLocaleString()}`} icon={<Wallet />}       color={remaining < 0 ? '#EF4444' : '#10B981'} sub={remaining < 0 ? 'EXCEEDED' : 'Balance'} />
        <StatCard label="Utilization"  value={`${util.toFixed(1)}%`}            icon={<Activity />}     color="#6366F1" sub={`${(db.expenses || []).filter(e => e.date?.startsWith(month)).length} transactions`} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#FFF', border: '1px solid #F1F5F9', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
            <h4 style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Budget vs Expenditure</h4>
            <div style={{ display: 'flex', gap: 14 }}>
              {[{ c: '#E2E8F0', l: 'Budget' }, { c: '#10B981', l: 'Spent' }].map(it => (
                <div key={it.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: it.c }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>{it.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241,245,249,0.5)' }} />
                <Bar dataKey="budget" name="Budget" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="spent"  name="Spent"  fill="#10B981" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: '#FFF', border: '1px solid #F1F5F9', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h4 style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 24 }}>Sector Distribution</h4>
          {pieData.length === 0 ? (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', fontSize: 13 }}>
              No data logged yet
            </div>
          ) : (
            <div style={{ height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 16 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 6-month trend */}
      <div style={{ background: '#FFF', border: '1px solid #F1F5F9', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h4 style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 24 }}>6-Month Trend</h4>
        <div style={{ height: 200 }}>
          <ResponsiveContainer>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="budget" name="Budget" stroke="#E2E8F0" strokeWidth={2.5} fill="transparent" />
              <Area type="monotone" dataKey="spent"  name="Spent"  stroke="#10B981" strokeWidth={2.5} fill="url(#gS)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ─── SECTION SUB-MENU GRID ────────────────────────────────────────────────────
const SectionGrid = ({ section, setView, pendingCount }) => {
  const items = SECTION_ITEMS[section];
  if (!items) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: 14,
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
// This component renders ONLY the page content (stats + charts OR section grid).
// It does NOT include a sidebar or layout wrapper — those live in your app shell.
//
// Props:
//   view        – current active view key (e.g. 'dashboard', 'finance', 'clients', ...)
//   setView     – setter to navigate to a sub-view (e.g. 'add_expense')
//   chartData   – array of { name, budget, spent }
//   approved    – number (total approved budget)
//   spent       – number (total spent)
//   month       – string 'YYYY-MM'
//   db          – { expenses: [], budgetRequests: [] }

const Dashboard = ({ view = 'dashboard', setView, chartData = [], approved = 0, spent = 0, month, db = {} }) => {
  const pendingCount = (db.budgetRequests || []).filter(r => r.status === 'pending').length;

  const SECTION_LABELS = {
    dashboard:   'Dashboard',
    finance:     'Finance',
    clients:     'Client Management',
    callcenter:  'Call Center',
    system:      'System',
  };

  const title = SECTION_LABELS[view] || 'Dashboard';
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return (
    <div>
      {/* Page heading */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
          {title}
        </h1>
        <p style={{ fontSize: 13, color: '#94A3B8' }}>
          {view === 'dashboard'
            ? `Financial performance overview · ${currentMonth}`
            : 'Select an option to get started'}
        </p>
      </div>

      {/* Content */}
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