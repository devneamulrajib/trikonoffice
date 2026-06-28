import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';

// ─── THEME ────────────────────────────────────────────────────────────────────
import GlobalStyles from './theme/GlobalStyles';

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
import Sidebar from './components/Sidebar';

// ─── PAGES ────────────────────────────────────────────────────────────────────
import AuthPage        from './pages/AuthPage';
import Dashboard       from './pages/Dashboard';
import AddExpense      from './pages/AddExpense';
import BudgetRequest   from './pages/BudgetRequest';
import BudgetHistory   from './pages/BudgetHistory';
import Approvals       from './pages/Approvals';
import CategoryManager from './pages/CategoryManager';
import ActivityLog     from './pages/ActivityLog';
import Reports         from './pages/Reports';
import SalaryAdvance   from './pages/SalaryAdvance';
import Settings        from './pages/Settings';
import ManageUsers     from './pages/ManageUsers';

// ─── CALL CENTER PAGES ────────────────────────────────────────────────────────
import CallCenterHub   from './pages/callcenter/CallCenterHub';
import NewCall         from './pages/callcenter/NewCall';
import FollowUp        from './pages/callcenter/FollowUp';
import TransferRequest from './pages/callcenter/TransferRequest';
import Comments        from './pages/callcenter/Comments';
import CallLogs        from './pages/callcenter/CallLogs';
import Requirements    from './pages/callcenter/Requirements';

// ─── CLIENT PAGES ─────────────────────────────────────────────────────────────
import ClientsHub      from './pages/clients/ClientsHub';
import ManageClients   from './pages/clients/ManageClients';
import ImportClients   from './pages/clients/ImportClients';

// ─── DEFAULT DB ───────────────────────────────────────────────────────────────
const DEFAULT_DB = {
  categories: [
    { id: 1, name: 'Operations', subs: ['Rent', 'Utilities'] },
    { id: 2, name: 'Marketing',  subs: ['Digital Ads', 'Print'] },
    { id: 3, name: 'HR',         subs: ['Payroll', 'Training'] }
  ],
  expenses:         [],
  budgetRequests:   [],
  salaryAdvances:   [],
  members:          [],
  activityLog:      [],
  callLogs:         [],
  callQueue:        [],
  followUps:        [],
  transferRequests: [],
  ccComments:       [],
  requirements:     [],
  clients:          [],
};

// ─── VIEWS THAT ARE ALWAYS SUPERADMIN-ONLY (never assignable) ─────────────────
const SUPERADMIN_ONLY_VIEWS = new Set([
  'approvals',
  'budget_request',
  'reports',
  'categories',
  'activity',
  'manage_users',
  'clients_manage',
  'clients_import',
]);

// ─── MAP: view id → permission key required for regular users ─────────────────
// If a view id is in this map, a regular user needs that permKey in their
// permissions array to access it. Views NOT in this map (and not superadmin-only)
// are always accessible (e.g. dashboard).
const VIEW_PERM_MAP = {
  add_expense:      'add_expense',
  budget_history:   'budget_history',
  salary_advance:   'salary_advance',
  settings:         'settings',
  call_center:      'call_center',
  cc_new_call:      'cc_new_call',
  cc_follow_up:     'cc_follow_up',
  cc_transfer:      'cc_transfer',
  cc_comments:      'cc_comments',
  cc_call_logs:     'cc_call_logs',
  cc_requirements:  'cc_requirements',
  clients:          'clients',
};

// ─── ACCESS GUARD ─────────────────────────────────────────────────────────────
const Forbidden = ({ onBack }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', gap: 16, textAlign: 'center'
  }}>
    <div style={{ fontSize: 48 }}>🔒</div>
    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A' }}>Access Restricted</h2>
    <p style={{ color: '#94A3B8', fontSize: 14 }}>You don't have permission to view this page.</p>
    <button
      onClick={onBack}
      style={{
        marginTop: 8, padding: '10px 24px',
        background: 'var(--primary)', color: '#FFF',
        border: 'none', borderRadius: 10,
        fontWeight: 600, fontSize: 14, cursor: 'pointer'
      }}
    >
      Go to Dashboard
    </button>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const ClearSuite = () => {
  const [view,   setView]   = useState('dashboard');
  const [isAuth, setIsAuth] = useState(false);
  const [user,   setUser]   = useState(null);
  const [month,  setMonth]  = useState(new Date().toISOString().slice(0, 7));

  const [db, setDb] = useState(() => {
    const s = localStorage.getItem('clear_db_v6');
    if (s) {
      const parsed = JSON.parse(s);
      return {
        ...DEFAULT_DB,
        ...parsed,
        callLogs:         parsed.callLogs         ?? [],
        callQueue:        parsed.callQueue         ?? [],
        followUps:        parsed.followUps         ?? [],
        transferRequests: parsed.transferRequests  ?? [],
        ccComments:       parsed.ccComments        ?? [],
        requirements:     parsed.requirements      ?? [],
        clients:          parsed.clients           ?? [],
      };
    }
    return DEFAULT_DB;
  });

  useEffect(() => {
    localStorage.setItem('clear_db_v6', JSON.stringify(db));
  }, [db]);

  // ── Restore session on load ──────────────────────────────────────────────
  useEffect(() => {
    const s = localStorage.getItem('clear_session_v6');
    const t = localStorage.getItem('token');
    if (s && t) {
      setUser(JSON.parse(s));
      setIsAuth(true);
    }
  }, []);

  const logAction = (action, type, target) => {
    const entry = {
      id:        Date.now(),
      user:      user?.name || user?.firstName || 'User',
      action, type, target,
      timestamp: new Date().toISOString()
    };
    setDb(prev => ({
      ...prev,
      activityLog: [entry, ...(prev.activityLog || [])].slice(0, 100)
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('clear_session_v6');
    localStorage.removeItem('token');
    setIsAuth(false);
    setUser(null);
    setView('dashboard');
  };

  const handleLoginSuccess = (u) => {
    setUser(u);
    setIsAuth(true);
    setView('dashboard');
  };

  // ── Permission check for a given view ───────────────────────────────────
  // Returns true if the current user is allowed to see this view.
  const userCan = (v) => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;

    // Superadmin-only views are blocked
    if (SUPERADMIN_ONLY_VIEWS.has(v)) return false;

    // Dashboard is always visible
    if (v === 'dashboard') return true;

    // Check permission map
    const requiredPerm = VIEW_PERM_MAP[v];
    if (!requiredPerm) return true; // no perm required → visible
    return (user.permissions ?? []).includes(requiredPerm);
  };

  // ── Safe setView: redirect to dashboard if user lacks permission ─────────
  const safeSetView = (v) => {
    if (!userCan(v)) {
      setView('dashboard');
      return;
    }
    setView(v);
  };

  const approvedBudget = useMemo(() =>
    db.budgetRequests
      .filter(b => b.month === month && b.status === 'approved')
      .reduce((s, b) => s + b.total, 0),
    [db.budgetRequests, month]
  );

  const totalSpent = useMemo(() =>
    db.expenses
      .filter(e => e.date.startsWith(month))
      .reduce((s, e) => s + e.amount, 0),
    [db.expenses, month]
  );

  const chartData = db.categories.map(cat => ({
    name: cat.name,
    budget: db.budgetRequests
      .filter(b => b.month === month && b.status === 'approved')
      .reduce((s, b) => {
        const f = b.allocations?.find(a => a.categoryId === cat.id);
        return s + (f?.amount || 0);
      }, 0),
    spent: db.expenses
      .filter(e => e.categoryId === cat.id && e.date.startsWith(month))
      .reduce((s, e) => s + e.amount, 0)
  }));

  const pendingCount = db.budgetRequests.filter(r => r.status === 'pending').length;

  if (!isAuth) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const isSuperAdmin = user?.role === 'superadmin';

  // ── Is the current view forbidden for this user? ─────────────────────────
  const isViewForbidden = !userCan(view);

  const ccProps = { db, setDb, logAction, user };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <GlobalStyles />

      <Sidebar
        view={view}
        setView={safeSetView}
        month={month}
        setMonth={setMonth}
        user={user}
        onLogout={handleLogout}
        pendingCount={pendingCount}
      />

      <main style={{ marginLeft: 260, flex: 1, padding: '40px 48px', minWidth: 0 }}>
        <AnimatePresence mode="wait">

          {/* ── Forbidden fallback ───────────────────────────────────────── */}
          {isViewForbidden && (
            <Forbidden key="forbidden" onBack={() => setView('dashboard')} />
          )}

          {/* ── Core Pages ──────────────────────────────────────────────── */}
          {!isViewForbidden && view === 'dashboard'      && <Dashboard       key="d"  chartData={chartData} approved={approvedBudget} spent={totalSpent} month={month} db={db} setView={safeSetView} />}
          {!isViewForbidden && view === 'add_expense'    && <AddExpense       key="ae" db={db} setDb={setDb} selectedMonth={month} logAction={logAction} />}
          {!isViewForbidden && view === 'salary_advance' && <SalaryAdvance    key="sa" db={db} setDb={setDb} logAction={logAction} />}
          {!isViewForbidden && view === 'budget_history' && <BudgetHistory    key="bh" db={db} setDb={setDb} logAction={logAction} setView={safeSetView} />}
          {!isViewForbidden && view === 'settings'       && <Settings         key="st" db={db} setDb={setDb} />}

          {/* ── Superadmin Only ─────────────────────────────────────────── */}
          {!isViewForbidden && view === 'approvals'      && isSuperAdmin && <Approvals        key="ap" db={db} setDb={setDb} logAction={logAction} />}
          {!isViewForbidden && view === 'budget_request' && isSuperAdmin && <BudgetRequest    key="br" db={db} setDb={setDb} logAction={logAction} user={user} />}
          {!isViewForbidden && view === 'reports'        && isSuperAdmin && <Reports          key="r"  db={db} selectedMonth={month} />}
          {!isViewForbidden && view === 'categories'     && isSuperAdmin && <CategoryManager  key="cm" db={db} setDb={setDb} logAction={logAction} />}
          {!isViewForbidden && view === 'activity'       && isSuperAdmin && <ActivityLog      key="al" db={db} />}
          {!isViewForbidden && view === 'manage_users'   && isSuperAdmin && <ManageUsers      key="mu" />}

          {/* ── Call Center ─────────────────────────────────────────────── */}
          {!isViewForbidden && view === 'call_center'     && <CallCenterHub   key="cch" setView={safeSetView} />}
          {!isViewForbidden && view === 'cc_new_call'     && <NewCall         key="cc1" {...ccProps} />}
          {!isViewForbidden && view === 'cc_follow_up'    && <FollowUp        key="cc2" {...ccProps} />}
          {!isViewForbidden && view === 'cc_transfer'     && <TransferRequest key="cc3" {...ccProps} />}
          {!isViewForbidden && view === 'cc_comments'     && <Comments        key="cc4" {...ccProps} />}
          {!isViewForbidden && view === 'cc_call_logs'    && <CallLogs        key="cc5" {...ccProps} />}
          {!isViewForbidden && view === 'cc_requirements' && <Requirements    key="cc6" {...ccProps} />}

          {/* ── Clients ─────────────────────────────────────────────────── */}
          {!isViewForbidden && view === 'clients'        && <ClientsHub    key="clh" setView={safeSetView} />}
          {!isViewForbidden && view === 'clients_manage' && isSuperAdmin && <ManageClients key="clm" {...ccProps} />}
          {!isViewForbidden && view === 'clients_import' && isSuperAdmin && <ImportClients key="cli" {...ccProps} />}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default ClearSuite;