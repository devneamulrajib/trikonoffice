import React, { useState, useEffect } from 'react';
import { LogOut, Search, Users, ChevronRight, ChevronDown, Settings, X } from 'lucide-react';
import NAVITEMS from '../constants/navItems';

// ─── PERMISSION CHECK ──────────────────────────────────────────────────────────
const canSee = (item, user) => {
  if (!item) return false;
  if (user?.role === 'superadmin') return true;
  if (item.roles === 'superadmin') return false;
  if (item.hideFor?.includes(user?.role)) return false;
  if (!item.permKey) return true;
  const perms = Array.isArray(user?.permissions) ? user.permissions : [];
  return perms.includes(item.permKey);
};

// ─── NAV BUTTON ───────────────────────────────────────────────────────────────
const NavBtn = ({ item, view, setView, pendingCount, indented = false }) => {
  const isActive = view === item.id;
  return (
    <button
      onClick={() => setView(item.id)}
      style={{
        width:        '100%',
        display:      'flex',
        alignItems:   'center',
        gap:          10,
        padding:      indented ? '8px 12px 8px 36px' : '9px 12px',
        borderRadius: 8,
        border:       'none',
        cursor:       'pointer',
        textAlign:    'left',
        fontSize:     indented ? 13 : 14,
        fontWeight:   isActive ? 700 : 400,
        color:        isActive ? '#111111' : '#4B5563',
        background:   isActive ? '#F3F4F6' : 'transparent',
        marginBottom: 2,
        transition:   'background 0.15s, color 0.15s',
        position:     'relative',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F9FAFB'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{
        display:    'flex',
        alignItems: 'center',
        color:      isActive ? '#111111' : '#9CA3AF',
        flexShrink: 0,
      }}>
        {item.icon}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge && pendingCount > 0 && (
        <span style={{
          background:   '#FEE2E2',
          color:        '#DC2626',
          fontSize:     11,
          fontWeight:   700,
          padding:      '1px 7px',
          borderRadius: 20,
          lineHeight:   '18px',
        }}>
          {pendingCount}
        </span>
      )}
    </button>
  );
};

// ─── GROUP BUTTON (clients / brokerages — navigates to hub page) ──────────────
const GroupBtn = ({ item, view, setView }) => {
  const isActive = view === item.id || item.children?.some(c => c.id === view);
  return (
    <button
      onClick={() => setView(item.id)}
      style={{
        width:        '100%',
        display:      'flex',
        alignItems:   'center',
        gap:          10,
        padding:      '9px 12px',
        borderRadius: 8,
        border:       'none',
        cursor:       'pointer',
        textAlign:    'left',
        fontSize:     14,
        fontWeight:   isActive ? 700 : 400,
        color:        isActive ? '#111111' : '#4B5563',
        background:   isActive ? '#F3F4F6' : 'transparent',
        marginBottom: 2,
        transition:   'background 0.15s',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F9FAFB'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ color: isActive ? '#111111' : '#9CA3AF', flexShrink: 0 }}>
        {item.icon}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
      <ChevronRight size={14} style={{ color: '#D1D5DB' }} />
    </button>
  );
};

// ─── EXPANDABLE GROUP (My Center — expands sub-items inline in sidebar) ───────
const ExpandableGroup = ({ item, view, setView, user }) => {
  const hasActiveChild = item.children?.some(c => c.id === view);
  const isGroupActive  = view === item.id || hasActiveChild;

  const [open, setOpen] = useState(isGroupActive);

  // Auto-open when a child route is active (e.g. direct navigation)
  useEffect(() => {
    if (hasActiveChild) setOpen(true);
  }, [hasActiveChild]);

  const handleClick = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      // Navigate to the default child on expand
      const defaultId = item.defaultChild || item.children?.[0]?.id;
      if (defaultId) setView(defaultId);
    }
  };

  const visibleChildren = (item.children || []).filter(c => canSee(c, user));

  return (
    <div>
      {/* My Center row */}
      <button
        onClick={handleClick}
        style={{
          width:        '100%',
          display:      'flex',
          alignItems:   'center',
          gap:          10,
          padding:      '9px 12px',
          borderRadius: 8,
          border:       'none',
          cursor:       'pointer',
          textAlign:    'left',
          fontSize:     14,
          fontWeight:   isGroupActive ? 700 : 400,
          color:        isGroupActive ? '#111111' : '#4B5563',
          background:   isGroupActive ? '#F3F4F6' : 'transparent',
          marginBottom: 2,
          transition:   'background 0.15s',
        }}
        onMouseEnter={e => { if (!isGroupActive) e.currentTarget.style.background = '#F9FAFB'; }}
        onMouseLeave={e => { if (!isGroupActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ color: isGroupActive ? '#111111' : '#9CA3AF', flexShrink: 0 }}>
          {item.icon}
        </span>
        <span style={{ flex: 1 }}>{item.label}</span>
        {open
          ? <ChevronDown  size={14} style={{ color: '#9CA3AF' }} />
          : <ChevronRight size={14} style={{ color: '#D1D5DB' }} />
        }
      </button>

      {/* Sub-items */}
      {open && visibleChildren.length > 0 && (
        <div style={{
          borderLeft:   '2px solid #F3F4F6',
          marginLeft:   22,
          marginBottom: 2,
        }}>
          {visibleChildren.map(child => (
            <NavBtn
              key={child.id}
              item={child}
              view={view}
              setView={setView}
              indented
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div style={{
    fontSize:      11,
    fontWeight:    700,
    color:         '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    padding:       '20px 12px 6px',
  }}>
    {children}
  </div>
);

// ─── MAIN SIDEBAR ─────────────────────────────────────────────────────────────
// `mobileOpen` / `onClose` are controlled by the parent (App.jsx). On desktop
// (viewport wider than the --sidebar-breakpoint set in GlobalStyles) the
// sidebar is always visible regardless of these props — the CSS only applies
// the slide-in/out transform below that breakpoint.
const Sidebar = ({ view, setView, month, setMonth, user, onLogout, pendingCount, mobileOpen = false, onClose }) => {
  const [search, setSearch] = useState('');

  // Wrap setView so that picking a nav item on mobile also closes the drawer.
  // On desktop this is a no-op extra call since onClose only affects mobile CSS.
  const handleSetView = (id) => {
    setView(id);
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      onClose?.();
    }
  };

  const visibleIds = new Set(
    NAVITEMS
      .filter(item => item.type !== 'divider' && item.type !== 'group' && canSee(item, user))
      .map(item => item.id)
  );
  const visibleGroupIds = new Set(
    NAVITEMS
      .filter(item => item.type === 'group' && canSee(item, user))
      .map(item => item.id)
  );

  const showCore       = visibleIds.has('dashboard') || visibleIds.has('add_expense') || visibleIds.has('approvals');
  const showFinance    = visibleIds.has('budget_request') || visibleIds.has('budget_history') || visibleIds.has('reports') || visibleIds.has('salary_advance');
  const showSystem     = visibleIds.has('categories') || visibleIds.has('activity') || visibleIds.has('settings');
  const showClientMgmt =
    visibleGroupIds.has('clients') ||
    visibleIds.has('clients_manage') ||
    visibleGroupIds.has('call_center') ||
    visibleIds.has('cc_transfer') ||
    visibleIds.has('cc_call_logs');
  const showBrokerage =
    visibleGroupIds.has('brokerages') ||
    visibleIds.has('brokerages_manage');

  const canManageUsers = user?.role === 'superadmin' || user?.role === 'admin';

  const filter = (id) => {
    if (!search) return true;
    const item = NAVITEMS.find(i => i.id === id);
    return item?.label?.toLowerCase().includes(search.toLowerCase());
  };

  return (
    <>
      {/* ── MOBILE OVERLAY ─────────────────────────────────────────
          Only rendered/visible below the mobile breakpoint (see
          .sidebar-overlay rules in GlobalStyles). Tapping it closes
          the drawer, same as a tap-outside-to-dismiss pattern. */}
      <div
        className={`sidebar-overlay${mobileOpen ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`app-sidebar${mobileOpen ? ' open' : ''}`} style={{
        width:         260,
        position:      'fixed',
        top: 0, left: 0, bottom: 0,
        background:    '#FFFFFF',
        borderRight:   '1px solid #F3F4F6',
        display:       'flex',
        flexDirection: 'column',
        zIndex:        100,
      }}>

        {/* ── MENU HEADER ──────────────────────────────────────────── */}
        <div style={{
          padding:        '28px 20px 16px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#111111' }}>
            Menu
          </span>
          {/* Close button — only shown on mobile via .mobile-close-btn CSS rule */}
          <button
            className="mobile-close-btn"
            onClick={onClose}
            aria-label="Close menu"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, display: 'none', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={20} style={{ color: '#6B7280' }} />
          </button>
        </div>

        {/* ── SEARCH ───────────────────────────────────────────────── */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{
            display:      'flex',
            alignItems:   'center',
            gap:          8,
            background:   '#F9FAFB',
            border:       '1.5px solid #F3F4F6',
            borderRadius: 8,
            padding:      '8px 12px',
          }}>
            <Search size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none', background: 'transparent',
                outline: 'none', fontSize: 13, color: '#374151', width: '100%',
              }}
            />
          </div>
        </div>

        {/* ── FISCAL MONTH ─────────────────────────────────────────── */}
        <div style={{ padding: '0 16px 8px' }}>
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '8px 12px',
            background:     '#FFFBEB',
            border:         '1.5px solid #FDE68A',
            borderRadius:   8,
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                Fiscal Month
              </div>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                style={{
                  border: 'none', background: 'transparent',
                  color: '#111111', fontWeight: 700,
                  outline: 'none', fontSize: 13, cursor: 'pointer', padding: 0,
                }}
              />
            </div>
          </div>
        </div>

        {/* ── NAV LINKS ────────────────────────────────────────────── */}
        <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>

          {showCore && <SectionLabel>Tasks</SectionLabel>}
          {NAVITEMS
            .filter(i => ['dashboard', 'add_expense', 'approvals'].includes(i.id) && canSee(i, user) && filter(i.id))
            .map(item => (
              <NavBtn key={item.id} item={item} view={view} setView={handleSetView} pendingCount={pendingCount} />
            ))
          }

          {showFinance && <SectionLabel>Finance</SectionLabel>}
          {NAVITEMS
            .filter(i => ['budget_request', 'budget_history', 'reports', 'salary_advance'].includes(i.id) && canSee(i, user) && filter(i.id))
            .map(item => (
              <NavBtn key={item.id} item={item} view={view} setView={handleSetView} pendingCount={pendingCount} />
            ))
          }

          {showSystem && <SectionLabel>System</SectionLabel>}
          {NAVITEMS
            .filter(i => ['categories', 'activity', 'settings'].includes(i.id) && canSee(i, user) && filter(i.id))
            .map(item => (
              <NavBtn key={item.id} item={item} view={view} setView={handleSetView} pendingCount={pendingCount} />
            ))
          }

          {/* ── CLIENT MANAGEMENT ─────────────────────────────────── */}
          {showClientMgmt && <SectionLabel>Client Management</SectionLabel>}
          {NAVITEMS
            .filter(i => ['clients', 'clients_manage', 'call_center', 'cc_transfer', 'cc_call_logs'].includes(i.id) && canSee(i, user))
            .map(item => {
              if (item.type === 'group') {
                // My Center → expands inline with sub-items
                if (item.id === 'call_center') {
                  return (
                    <ExpandableGroup
                      key={item.id}
                      item={item}
                      view={view}
                      setView={handleSetView}
                      user={user}
                    />
                  );
                }
                // Add Client → navigates to hub as before
                return <GroupBtn key={item.id} item={item} view={view} setView={handleSetView} />;
              }
              // cc_transfer, cc_call_logs, clients_manage → plain nav buttons
              return (
                <NavBtn key={item.id} item={item} view={view} setView={handleSetView} pendingCount={pendingCount} />
              );
            })
          }

          {/* ── BROKERAGE ─────────────────────────────────────────── */}
          {showBrokerage && <SectionLabel>Brokerage</SectionLabel>}
          {NAVITEMS
            .filter(i => ['brokerages', 'brokerages_manage'].includes(i.id) && canSee(i, user))
            .map(item => {
              if (item.type === 'group') {
                // Add Brokerage → navigates to hub, same pattern as "Add Client"
                return <GroupBtn key={item.id} item={item} view={view} setView={handleSetView} />;
              }
              // brokerages_manage → plain nav button
              return (
                <NavBtn key={item.id} item={item} view={view} setView={handleSetView} pendingCount={pendingCount} />
              );
            })
          }

          {/* ── ADMIN ─────────────────────────────────────────────── */}
          {canManageUsers && (
            <>
              <SectionLabel>Admin</SectionLabel>
              <button
                onClick={() => handleSetView('manage_users')}
                style={{
                  width:        '100%',
                  display:      'flex',
                  alignItems:   'center',
                  gap:          10,
                  padding:      '9px 12px',
                  borderRadius: 8,
                  border:       'none',
                  cursor:       'pointer',
                  textAlign:    'left',
                  fontSize:     14,
                  fontWeight:   view === 'manage_users' ? 700 : 400,
                  color:        view === 'manage_users' ? '#111111' : '#4B5563',
                  background:   view === 'manage_users' ? '#F3F4F6' : 'transparent',
                  marginBottom: 2,
                }}
              >
                <Users size={16} style={{ color: '#9CA3AF' }} />
                <span style={{ flex: 1 }}>Manage Users</span>
              </button>
            </>
          )}
        </nav>

        {/* ── FOOTER: Settings + Sign out ───────────────────────────── */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #F3F4F6' }}>
          <button
            onClick={() => handleSetView('settings')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              textAlign: 'left', fontSize: 14, color: '#6B7280',
              background: 'transparent', marginBottom: 2,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Settings size={16} style={{ color: '#9CA3AF' }} />
            <span>Settings</span>
          </button>

          <button
            onClick={onLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              textAlign: 'left', fontSize: 14, color: '#6B7280', background: 'transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FFF1F2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={16} style={{ color: '#9CA3AF' }} />
            <span>Sign out</span>
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px 2px', marginTop: 8,
            borderTop: '1px solid #F3F4F6',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#F9A825', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#111111', fontSize: 13, flexShrink: 0,
            }}>
              {(user?.name || user?.firstName || 'U')[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: '#111111',
                whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden',
              }}>
                {user?.name || user?.firstName || 'User'}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                {user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : user?.role === 'call_center' ? 'Call Center' : 'User'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;