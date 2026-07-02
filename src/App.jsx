import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import AddClient       from './pages/clients/AddClient';
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

// ─── VIEW → PERMISSION MAP ────────────────────────────────────────────────────
// Every view except 'dashboard' and 'manage_users' is gated purely by permKey
// now (superadmin always passes via userCan, see below). This must stay in
// sync with the permKeys used in constants/navItems.jsx and ManageUsers.jsx.
const VIEW_PERM_MAP = {
  add_expense:      'add_expense',
  approvals:        'approvals',
  budget_request:   'budget_request',
  budget_history:   'budget_history',
  reports:          'reports',
  salary_advance:   'salary_advance',
  categories:       'categories',
  activity:         'activity',
  settings:         'settings',
  call_center:      'call_center',
  cc_new_call:      'cc_new_call',
  cc_follow_up:     'cc_follow_up',
  cc_transfer:      'cc_transfer',
  cc_comments:      'cc_comments',
  cc_call_logs:     'cc_call_logs',
  cc_requirements:  'cc_requirements',
  clients:          'clients',
  clients_manage:   'clients_manage',
  clients_add:      'clients_add',
  clients_import:   'clients_import',
};

// ─── DATA SYNC CONFIG ─────────────────────────────────────────────────────────
const LOCAL_CACHE_KEY  = 'clear_db_v6';
const SYNC_DEBOUNCE_MS = 600;
const CLIENTS_POLL_MS  = 8000;

// ─── ROLE / LANDING HELPERS ───────────────────────────────────────────────────
// Call center users never see the finance Dashboard — they land straight on
// "New Call" instead, both right after login/signup and on session restore.
const defaultViewFor = (u) => (u?.role === 'call_center' ? 'cc_new_call' : 'dashboard');

// ─── ACCESS GUARD ─────────────────────────────────────────────────────────────
const Forbidden = ({ onBack }) => (
  <div style={{
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    minHeight:      '60vh',
    gap:            16,
    textAlign:      'center',
  }}>
    <div style={{ fontSize: 48 }}>🔒</div>
    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111111' }}>Access Restricted</h2>
    <p style={{ color: '#9CA3AF', fontSize: 14 }}>You don't have permission to view this page.</p>
    <button
      onClick={onBack}
      style={{
        marginTop:    8,
        padding:      '10px 24px',
        background:   '#F9A825',
        color:        '#111111',
        border:       'none',
        borderRadius: 10,
        fontWeight:   700,
        fontSize:     14,
        cursor:       'pointer',
      }}
    >
      Go Home
    </button>
  </div>
);

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{
    minHeight:      '100vh',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexDirection:  'column',
    gap:            14,
    background:     '#F9FAFB',
  }}>
    <GlobalStyles />
    <div style={{
      width:           36,
      height:          36,
      borderRadius:    '50%',
      border:          '3px solid #F3F4F6',
      borderTopColor:  '#F9A825',
      animation:       'spin 0.8s linear infinite',
    }} />
    <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    <p style={{ color: '#9CA3AF', fontSize: 13 }}>Loading your workspace…</p>
  </div>
);

// ─── SYNC STATUS PILL ─────────────────────────────────────────────────────────
const SyncStatus = ({ status }) => {
  if (status === 'synced') return null;

  const config = {
    loading: { bg: '#EEF2FF', color: '#6366F1', text: 'Loading shared data…' },
    saving:  { bg: '#FFFBEB', color: '#B45309', text: 'Saving…' },
    error:   { bg: '#FEE2E2', color: '#DC2626', text: 'Offline — changes saved locally only' },
  }[status];

  if (!config) return null;

  return (
    <div style={{
      position:   'fixed',
      bottom:     18,
      right:      18,
      zIndex:     999,
      background: config.bg,
      color:      config.color,
      padding:    '8px 16px',
      borderRadius: 999,
      fontSize:   12.5,
      fontWeight: 600,
      boxShadow:  '0 2px 10px rgba(0,0,0,0.08)',
      display:    'flex',
      alignItems: 'center',
      gap:        8,
    }}>
      <span style={{
        width:      7,
        height:     7,
        borderRadius: '50%',
        background: config.color,
        flexShrink: 0,
      }} />
      {config.text}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const ClearSuite = () => {
  const [view,       setView]      = useState('dashboard');
  const [isAuth,     setIsAuth]    = useState(false);
  const [user,       setUser]      = useState(null);
  const [month,      setMonth]     = useState(new Date().toISOString().slice(0, 7));
  const [syncStatus, setSyncStatus]= useState('loading');
  const [dbLoaded,   setDbLoaded]  = useState(false);
  const [db,         setDbState]   = useState(DEFAULT_DB);

  const dbRef        = useRef(db);
  dbRef.current      = db;
  const syncTimerRef = useRef(null);
  const tokenRef     = useRef(null);

  // ── Authenticated fetch ──────────────────────────────────────────────────
  const authedFetch = useCallback((url, options = {}) => {
    const token = tokenRef.current || localStorage.getItem('token');
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  }, []);

  // ── Debounced server sync ────────────────────────────────────────────────
  // NOTE: `clients` is deliberately stripped out of this payload — clients
  // now live in their own DB table (see /api/clients routes) so that taking
  // a call can be an atomic, race-free operation. Only everything else
  // (expenses, budgets, call logs, follow-ups, etc.) still goes through the
  // single JSON blob.
  const syncToServer = useCallback(() => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        setSyncStatus('saving');
        const { clients, ...payload } = dbRef.current;
        const res = await authedFetch('/api/data', {
          method: 'PUT',
          body:   JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Save failed');
        setSyncStatus('synced');
      } catch (err) {
        console.error('Sync to server failed, kept locally only:', err);
        setSyncStatus('error');
      }
    }, SYNC_DEBOUNCE_MS);
  }, [authedFetch]);

  // ── setDb wrapper ────────────────────────────────────────────────────────
  const setDb = useCallback((update) => {
    setDbState(prev => {
      const next = typeof update === 'function' ? update(prev) : update;
      try {
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('Local cache write failed:', err);
      }
      return next;
    });
    syncToServer();
  }, [syncToServer]);

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const s = localStorage.getItem('clear_session_v6');
    const t = localStorage.getItem('token');
    if (s && t) {
      const restoredUser = JSON.parse(s);
      tokenRef.current = t;
      setUser(restoredUser);
      setIsAuth(true);
      setView(defaultViewFor(restoredUser));
    }
  }, []);

  // ── Load shared db once authenticated ───────────────────────────────────
  useEffect(() => {
    if (!isAuth) return;
    let cancelled = false;

    const loadData = async () => {
      setSyncStatus('loading');

      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (!cancelled) setDbState({ ...DEFAULT_DB, ...parsed });
        } catch { /* ignore corrupt cache */ }
      }

      try {
        const res = await authedFetch('/api/data');
        if (!res.ok) throw new Error('Load failed');
        const serverDb = await res.json();
        if (cancelled) return;

        const merged = { ...DEFAULT_DB, ...serverDb };
        setDbState(merged);
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(merged));
        setSyncStatus('synced');
      } catch (err) {
        console.error('Failed to load shared data, using local cache:', err);
        if (!cancelled) setSyncStatus('error');
      } finally {
        if (!cancelled) setDbLoaded(true);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [isAuth, authedFetch]);

  // ══════════════════════════════════════════════════════════════════════
  // ── CLIENTS: separate from the blob, polled, atomic claim ─────────────
  // ══════════════════════════════════════════════════════════════════════

  const fetchClients = useCallback(async () => {
    try {
      const res = await authedFetch('/api/clients');
      if (!res.ok) return;
      const clients = await res.json();
      setDbState(prev => ({ ...prev, clients }));
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  }, [authedFetch]);

  // Poll so agents see each other's claims without needing to reload the
  // page. This does NOT create races on its own — the actual claim below
  // is atomic at the database level regardless of how stale the UI looks.
  useEffect(() => {
    if (!isAuth || !dbLoaded) return;
    fetchClients();
    const interval = setInterval(fetchClients, CLIENTS_POLL_MS);
    return () => clearInterval(interval);
  }, [isAuth, dbLoaded, fetchClients]);

  // The core fix: atomically claim a client. Returns { ok:false, assignedAgentName }
  // if someone else already has it — the UI should show that, not open the
  // call modal.
  const claimClient = useCallback(async (id) => {
    const res = await authedFetch(`/api/clients/${id}/claim`, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) {
      fetchClients(); // refresh so the UI reflects who actually has it
      return { ok: false, ...data };
    }
    setDbState(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === id ? data : c),
    }));
    return { ok: true, client: data };
  }, [authedFetch, fetchClients]);

  const saveClient = useCallback(async (client) => {
    const isExisting = (dbRef.current.clients || []).some(c => c.id === client.id);
    const res = await authedFetch(
      isExisting ? `/api/clients/${client.id}` : '/api/clients',
      { method: isExisting ? 'PUT' : 'POST', body: JSON.stringify(client) }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Save failed');
    setDbState(prev => ({
      ...prev,
      clients: isExisting
        ? prev.clients.map(c => c.id === client.id ? data : c)
        : [data, ...prev.clients],
    }));
    return data;
  }, [authedFetch]);

  const deleteClient = useCallback(async (id) => {
    const res = await authedFetch(`/api/clients/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    setDbState(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== id) }));
  }, [authedFetch]);

  const bulkImportClients = useCallback(async (clients) => {
    const res = await authedFetch('/api/clients/bulk', {
      method: 'POST',
      body:   JSON.stringify({ clients }),
    });
    if (!res.ok) throw new Error('Import failed');
    await fetchClients();
  }, [authedFetch, fetchClients]);

  const logCallOnClient = useCallback(async (id, { status, calledAt }) => {
    const res = await authedFetch(`/api/clients/${id}/log-call`, {
      method: 'PATCH',
      body:   JSON.stringify({ status, calledAt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Log call failed');
    setDbState(prev => ({ ...prev, clients: prev.clients.map(c => c.id === id ? data : c) }));
    return data;
  }, [authedFetch]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const logAction = (action, type, target) => {
    const entry = {
      id:        Date.now(),
      user:      user?.name || user?.firstName || 'User',
      action, type, target,
      timestamp: new Date().toISOString(),
    };
    setDb(prev => ({
      ...prev,
      activityLog: [entry, ...(prev.activityLog || [])].slice(0, 100),
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('clear_session_v6');
    localStorage.removeItem('token');
    tokenRef.current = null;
    setIsAuth(false);
    setUser(null);
    setDbLoaded(false);
    setDbState(DEFAULT_DB);
    setView('dashboard');
  };

  const handleLoginSuccess = (u) => {
    const t = localStorage.getItem('token');
    tokenRef.current = t;
    setUser(u);
    setIsAuth(true);
    setView(defaultViewFor(u));
  };

  // ── Permission helpers ───────────────────────────────────────────────────
  const userCan = (v) => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;

    // Manage Users: superadmin (above) or admin only — never permission-based.
    if (v === 'manage_users') return user.role === 'admin';

    // Dashboard is the default home for everyone EXCEPT call center users,
    // who land on "New Call" instead and never see the finance dashboard.
    if (v === 'dashboard') return user.role !== 'call_center';

    const requiredPerm = VIEW_PERM_MAP[v];
    if (!requiredPerm) return true;
    return (user.permissions ?? []).includes(requiredPerm);
  };

  const safeSetView = (v) => {
    setView(userCan(v) ? v : defaultViewFor(user));
  };

  // ── Derived data ─────────────────────────────────────────────────────────
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
    name:   cat.name,
    budget: db.budgetRequests
      .filter(b => b.month === month && b.status === 'approved')
      .reduce((s, b) => {
        const f = b.allocations?.find(a => a.categoryId === cat.id);
        return s + (f?.amount || 0);
      }, 0),
    spent: db.expenses
      .filter(e => e.categoryId === cat.id && e.date.startsWith(month))
      .reduce((s, e) => s + e.amount, 0),
  }));

  const pendingCount = db.budgetRequests.filter(r => r.status === 'pending').length;

  // ── Render guards ────────────────────────────────────────────────────────
  if (!isAuth) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (!dbLoaded) {
    return <LoadingScreen />;
  }

  const isViewForbidden  = !userCan(view);
  const ccProps          = {
    db, setDb, logAction, user, setView: safeSetView,
    claimClient, saveClient, deleteClient, bulkImportClients, logCallOnClient,
  };

  return (
    <div style={{
      minHeight:  '100vh',
      display:    'flex',
      background: '#F9FAFB',
    }}>
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

      <main style={{
        marginLeft: 260,
        flex:       1,
        padding:    '44px 52px',
        minWidth:   0,
        background: '#F9FAFB',
        minHeight:  '100vh',
      }}>
        <AnimatePresence mode="wait">

          {/* ── Forbidden ───────────────────────────────────────────────── */}
          {isViewForbidden && (
            <Forbidden key="forbidden" onBack={() => safeSetView(defaultViewFor(user))} />
          )}

          {/* ── Core Pages ──────────────────────────────────────────────── */}
          {!isViewForbidden && view === 'dashboard'      && <Dashboard       key="d"  chartData={chartData} approved={approvedBudget} spent={totalSpent} month={month} db={db} setView={safeSetView} />}
          {!isViewForbidden && view === 'add_expense'    && <AddExpense       key="ae" db={db} setDb={setDb} selectedMonth={month} logAction={logAction} />}
          {!isViewForbidden && view === 'salary_advance' && <SalaryAdvance    key="sa" db={db} setDb={setDb} logAction={logAction} />}
          {!isViewForbidden && view === 'budget_history' && <BudgetHistory    key="bh" db={db} setDb={setDb} logAction={logAction} setView={safeSetView} />}
          {!isViewForbidden && view === 'settings'       && <Settings         key="st" db={db} setDb={setDb} />}

          {/* ── Permission-gated (formerly superadmin-only) ─────────────── */}
          {!isViewForbidden && view === 'approvals'      && <Approvals        key="ap" db={db} setDb={setDb} logAction={logAction} />}
          {!isViewForbidden && view === 'budget_request' && <BudgetRequest    key="br" db={db} setDb={setDb} logAction={logAction} user={user} />}
          {!isViewForbidden && view === 'reports'        && <Reports          key="r"  db={db} selectedMonth={month} />}
          {!isViewForbidden && view === 'categories'     && <CategoryManager  key="cm" db={db} setDb={setDb} logAction={logAction} />}
          {!isViewForbidden && view === 'activity'       && <ActivityLog      key="al" db={db} />}

          {/* ── Admin / Superadmin only ──────────────────────────────────── */}
          {!isViewForbidden && view === 'manage_users'   && <ManageUsers      key="mu" />}

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
          {!isViewForbidden && view === 'clients_manage' && <ManageClients key="clm" {...ccProps} />}
          {!isViewForbidden && view === 'clients_add'    && <AddClient     key="cla" {...ccProps} />}
          {!isViewForbidden && view === 'clients_import' && <ImportClients key="cli" {...ccProps} />}

        </AnimatePresence>
      </main>

      <SyncStatus status={syncStatus} />
    </div>
  );
};

export default ClearSuite;