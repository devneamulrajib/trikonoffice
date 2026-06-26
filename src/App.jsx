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
  expenses:       [],
  budgetRequests: [],
  salaryAdvances: [],
  members:        [],
  activityLog:    [],
  callLogs:        [],
  callQueue:       [],
  followUps:       [],
  transferRequests:[],
  ccComments:      [],
  requirements:    [],
  clients:         [],
};

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
        callQueue:        parsed.callQueue        ?? [],
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

  useEffect(() => {
    const s = localStorage.getItem('clear_session_v6');
    if (s) {
      setUser(JSON.parse(s));
      setIsAuth(true);
    }
  }, []);

  const logAction = (action, type, target) => {
    const entry = {
      id:        Date.now(),
      user:      user?.firstName || 'User',
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
    setIsAuth(false);
    setUser(null);
  };

  const handleLoginSuccess = (u) => {
    setUser(u);
    setIsAuth(true);
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

  const ccProps = { db, setDb, logAction, user };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <GlobalStyles />

      <Sidebar
        view={view}
        setView={setView}
        month={month}
        setMonth={setMonth}
        user={user}
        onLogout={handleLogout}
        pendingCount={pendingCount}
      />

      <main style={{ marginLeft: 260, flex: 1, padding: '40px 48px', minWidth: 0 }}>
        <AnimatePresence mode="wait">

          {/* ── Core Pages ────────────────────────────────────────────────── */}
          {view === 'dashboard'      && <Dashboard       key="d"  chartData={chartData} approved={approvedBudget} spent={totalSpent} month={month} db={db} setView={setView} />}
          {view === 'add_expense'    && <AddExpense       key="ae" db={db} setDb={setDb} selectedMonth={month} logAction={logAction} />}
          {view === 'budget_request' && <BudgetRequest    key="br" db={db} setDb={setDb} logAction={logAction} user={user} />}
          {view === 'budget_history' && <BudgetHistory    key="bh" db={db} setDb={setDb} logAction={logAction} setView={setView} />}
          {view === 'categories'     && <CategoryManager  key="cm" db={db} setDb={setDb} logAction={logAction} />}
          {view === 'activity'       && <ActivityLog      key="al" db={db} />}
          {view === 'reports'        && <Reports          key="r"  db={db} selectedMonth={month} />}
          {view === 'approvals'      && <Approvals        key="ap" db={db} setDb={setDb} logAction={logAction} />}
          {view === 'salary_advance' && <SalaryAdvance    key="sa" db={db} setDb={setDb} logAction={logAction} />}
          {view === 'settings'       && <Settings         key="st" db={db} setDb={setDb} />}

          {/* ── Call Center Hub + Sub-pages ───────────────────────────────── */}
          {view === 'call_center'      && <CallCenterHub   key="cch" setView={setView} />}
          {view === 'cc_new_call'      && <NewCall         key="cc1" {...ccProps} />}
          {view === 'cc_follow_up'     && <FollowUp        key="cc2" {...ccProps} />}
          {view === 'cc_transfer'      && <TransferRequest key="cc3" {...ccProps} />}
          {view === 'cc_comments'      && <Comments        key="cc4" {...ccProps} />}
          {view === 'cc_call_logs'     && <CallLogs        key="cc5" {...ccProps} />}
          {view === 'cc_requirements'  && <Requirements    key="cc6" {...ccProps} />}

          {/* ── Clients Hub + Sub-pages ───────────────────────────────────── */}
          {view === 'clients'          && <ClientsHub      key="clh" setView={setView} />}
          {view === 'clients_manage'   && <ManageClients   key="clm" {...ccProps} />}
          {view === 'clients_import'   && <ImportClients   key="cli" {...ccProps} />}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default ClearSuite;