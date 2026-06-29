import React, { useState } from 'react';
import { LogOut, Search, Users, ChevronRight, Settings, Menu } from 'lucide-react';
import NAVITEMS from '../constants/navItems';

// ─── SECTION COLOR PALETTE ────────────────────────────────────────────────────
// Each sidebar section gets its own accent. Active items glow with that color.
const SECTION_COLORS = {
  tasks:    { bg: '#EEF2FF', text: '#4F46E5', border: '#818CF8', dot: '#6366F1' }, // Indigo
  finance:  { bg: '#ECFDF5', text: '#059669', border: '#6EE7B7', dot: '#10B981' }, // Emerald
  system:   { bg: '#FFF7ED', text: '#C2410C', border: '#FCA5A5', dot: '#F97316' }, // Orange
  clients:  { bg: '#FDF4FF', text: '#7C3AED', border: '#D8B4FE', dot: '#9333EA' }, // Purple
  admin:    { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', dot: '#E11D48' }, // Rose
};

// Maps nav item IDs → section key
const ITEM_SECTION = {
  dashboard:    'tasks',
  add_expense:  'tasks',
  approvals:    'tasks',
  budget_request: 'finance',
  budget_history: 'finance',
  reports:      'finance',
  salary_advance: 'finance',
  categories:   'system',
  activity:     'system',
  settings:     'system',
  clients:      'clients',
  call_center:  'clients',
  manage_users: 'admin',
};

const canSee = (item, user) => {
  if (!item) return false;
  if (user?.role === 'superadmin') return true;
  if (item.roles === 'superadmin') return false;
  if (!item.permKey) return true;
  const perms = Array.isArray(user?.permissions) ? user.permissions : [];
  return perms.includes(item.permKey);
};

// ─── ANIMATED NAV BUTTON ──────────────────────────────────────────────────────
const NavBtn = ({ item, view, setView, pendingCount, sectionKey }) => {
  const isActive = view === item.id;
  const scheme   = SECTION_COLORS[sectionKey] || SECTION_COLORS.tasks;

  return (
    <button
      onClick={() => setView(item.id)}
      style={{
        width:         '100%',
        display:       'flex',
        alignItems:    'center',
        gap:           10,
        padding:       '9px 12px',
        borderRadius:  9,
        border:        isActive ? `1.5px solid ${scheme.border}` : '1.5px solid transparent',
        cursor:        'pointer',
        textAlign:     'left',
        fontSize:      13.5,
        fontWeight:    isActive ? 700 : 500,
        color:         isActive ? scheme.text : '#4B5563',
        background:    isActive ? scheme.bg : 'transparent',
        marginBottom:  2,
        transition:    'all 0.18s ease',
        boxShadow:     isActive ? `0 1px 6px ${scheme.dot}22` : 'none',
        position:      'relative',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background  = scheme.bg + 'AA';
          e.currentTarget.style.color       = scheme.text;
          e.currentTarget.style.borderColor = scheme.border + '66';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background  = 'transparent';
          e.currentTarget.style.color       = '#4B5563';
          e.currentTarget.style.borderColor = 'transparent';
        }
      }}
    >
      {/* Colored icon */}
      <span style={{
        display:     'flex',
        alignItems:  'center',
        color:       isActive ? scheme.dot : '#9CA3AF',
        flexShrink:  0,
        transition:  'color 0.18s ease, transform 0.18s ease',
        transform:   isActive ? 'scale(1.12)' : 'scale(1)',
      }}>
        {item.icon}
      </span>

      <span style={{ flex: 1, letterSpacing: '0.01em' }}>{item.label}</span>

      {/* Badge */}
      {item.badge && pendingCount > 0 && (
        <span style={{
          background:   '#FEE2E2',
          color:        '#DC2626',
          fontSize:     10.5,
          fontWeight:   700,
          padding:      '1px 7px',
          borderRadius: 20,
          lineHeight:   '18px',
        }}>
          {pendingCount}
        </span>
      )}

      {/* Active left-bar accent */}
      {isActive && (
        <span style={{
          position:    'absolute',
          left:        0,
          top:         '20%',
          bottom:      '20%',
          width:       3,
          borderRadius: 4,
          background:  scheme.dot,
        }} />
      )}
    </button>
  );
};

// ─── GROUP BUTTON ─────────────────────────────────────────────────────────────
const GroupBtn = ({ item, view, setView }) => {
  const isActive = view === item.id || item.children?.some(c => c.id === view);
  const scheme   = SECTION_COLORS.clients;

  return (
    <button
      onClick={() => setView(item.id)}
      style={{
        width:         '100%',
        display:       'flex',
        alignItems:    'center',
        gap:           10,
        padding:       '9px 12px',
        borderRadius:  9,
        border:        isActive ? `1.5px solid ${scheme.border}` : '1.5px solid transparent',
        cursor:        'pointer',
        textAlign:     'left',
        fontSize:      13.5,
        fontWeight:    isActive ? 700 : 500,
        color:         isActive ? scheme.text : '#4B5563',
        background:    isActive ? scheme.bg : 'transparent',
        marginBottom:  2,
        transition:    'all 0.18s ease',
        boxShadow:     isActive ? `0 1px 6px ${scheme.dot}22` : 'none',
        position:      'relative',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background  = scheme.bg + 'AA';
          e.currentTarget.style.color       = scheme.text;
          e.currentTarget.style.borderColor = scheme.border + '66';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background  = 'transparent';
          e.currentTarget.style.color       = '#4B5563';
          e.currentTarget.style.borderColor = 'transparent';
        }
      }}
    >
      <span style={{
        color:      isActive ? scheme.dot : '#9CA3AF',
        flexShrink: 0,
        transition: 'color 0.18s, transform 0.18s',
        transform:  isActive ? 'scale(1.12)' : 'scale(1)',
      }}>
        {item.icon}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
      <ChevronRight
        size={14}
        style={{
          color:      isActive ? scheme.dot : '#D1D5DB',
          transition: 'transform 0.18s',
          transform:  isActive ? 'rotate(90deg)' : 'rotate(0deg)',
        }}
      />
      {isActive && (
        <span style={{
          position:    'absolute',
          left:        0,
          top:         '20%',
          bottom:      '20%',
          width:       3,
          borderRadius: 4,
          background:  scheme.dot,
        }} />
      )}
    </button>
  );
};

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
const SectionLabel = ({ children, sectionKey }) => {
  const scheme = SECTION_COLORS[sectionKey] || {};
  return (
    <div style={{
      display:       'flex',
      alignItems:    'center',
      gap:           6,
      fontSize:      10.5,
      fontWeight:    800,
      color:         scheme.dot || '#9CA3AF',
      textTransform: 'uppercase',
      letterSpacing: '0.09em',
      padding:       '18px 12px 5px',
    }}>
      {/* Color dot */}
      <span style={{
        width:        5,
        height:       5,
        borderRadius: '50%',
        background:   scheme.dot || '#D1D5DB',
        flexShrink:   0,
      }} />
      {children}
    </div>
  );
};

// ─── MAIN SIDEBAR ─────────────────────────────────────────────────────────────
const Sidebar = ({ view, setView, month, setMonth, user, onLogout, pendingCount }) => {
  const [search, setSearch] = useState('');

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
  const showClientMgmt = visibleGroupIds.has('clients') || visibleGroupIds.has('call_center');

  const filter = (id) => {
    if (!search) return true;
    const item = NAVITEMS.find(i => i.id === id);
    return item?.label?.toLowerCase().includes(search.toLowerCase());
  };

  // Determine active section for sidebar background accent strip
  const activeSection = ITEM_SECTION[view] || 'tasks';
  const activeScheme  = SECTION_COLORS[activeSection];

  return (
    <aside style={{
      width:          260,
      position:       'fixed',
      top: 0, left: 0, bottom: 0,
      background:     '#FFFFFF',
      borderRight:    '1px solid #F3F4F6',
      display:        'flex',
      flexDirection:  'column',
      zIndex:         100,
      transition:     'box-shadow 0.3s',
      boxShadow:      '2px 0 16px rgba(0,0,0,0.04)',
    }}>

      {/* ── TOP ACCENT BAR (changes color with section) ─── */}
      <div style={{
        height:     3,
        background: `linear-gradient(90deg, ${activeScheme.dot}, ${activeScheme.border})`,
        transition: 'background 0.4s ease',
        borderRadius: '0 0 4px 4px',
      }} />

      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={{
        padding:        '20px 20px 14px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Branded logo pill */}
          <div style={{
            width:          32,
            height:         32,
            borderRadius:   9,
            background:     `linear-gradient(135deg, ${activeScheme.dot}, ${activeScheme.border})`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            transition:     'background 0.4s ease',
            boxShadow:      `0 2px 8px ${activeScheme.dot}44`,
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 13, letterSpacing: '-0.03em' }}>T</span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>
            Trikon
          </span>
        </div>
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4,
          borderRadius: 6,
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* ── SEARCH ─────────────────────────────────────── */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          8,
          background:   '#F9FAFB',
          border:       '1.5px solid #F3F4F6',
          borderRadius: 8,
          padding:      '7px 12px',
          transition:   'border-color 0.15s, box-shadow 0.15s',
        }}
          onFocus={() => {}}
        >
          <Search size={13} style={{ color: '#9CA3AF', flexShrink: 0 }} />
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

      {/* ── FISCAL MONTH ──────────────────────────────── */}
      <div style={{ padding: '0 16px 8px' }}>
        <div style={{
          padding:      '8px 12px',
          background:   'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
          border:       '1.5px solid #FDE68A',
          borderRadius: 9,
          boxShadow:    '0 1px 4px rgba(245,158,11,0.10)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
            📅 Fiscal Month
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

      {/* ── NAV ───────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>

        {showCore && <SectionLabel sectionKey="tasks">Tasks</SectionLabel>}
        {NAVITEMS
          .filter(i => ['dashboard', 'add_expense', 'approvals'].includes(i.id) && canSee(i, user) && filter(i.id))
          .map(item => (
            <NavBtn key={item.id} item={item} view={view} setView={setView}
              pendingCount={pendingCount} sectionKey="tasks" />
          ))
        }

        {showFinance && <SectionLabel sectionKey="finance">Finance</SectionLabel>}
        {NAVITEMS
          .filter(i => ['budget_request', 'budget_history', 'reports', 'salary_advance'].includes(i.id) && canSee(i, user) && filter(i.id))
          .map(item => (
            <NavBtn key={item.id} item={item} view={view} setView={setView}
              pendingCount={pendingCount} sectionKey="finance" />
          ))
        }

        {showSystem && <SectionLabel sectionKey="system">System</SectionLabel>}
        {NAVITEMS
          .filter(i => ['categories', 'activity', 'settings'].includes(i.id) && canSee(i, user) && filter(i.id))
          .map(item => (
            <NavBtn key={item.id} item={item} view={view} setView={setView}
              pendingCount={pendingCount} sectionKey="system" />
          ))
        }

        {showClientMgmt && <SectionLabel sectionKey="clients">Client Management</SectionLabel>}
        {NAVITEMS
          .filter(i => i.type === 'group' && canSee(i, user))
          .map(item => (
            <GroupBtn key={item.id} item={item} view={view} setView={setView} />
          ))
        }

        {user?.role === 'superadmin' && (
          <>
            <SectionLabel sectionKey="admin">Admin</SectionLabel>
            <button
              onClick={() => setView('manage_users')}
              style={{
                width:         '100%',
                display:       'flex',
                alignItems:    'center',
                gap:           10,
                padding:       '9px 12px',
                borderRadius:  9,
                border:        view === 'manage_users'
                  ? `1.5px solid ${SECTION_COLORS.admin.border}`
                  : '1.5px solid transparent',
                cursor:        'pointer',
                textAlign:     'left',
                fontSize:      13.5,
                fontWeight:    view === 'manage_users' ? 700 : 500,
                color:         view === 'manage_users' ? SECTION_COLORS.admin.text : '#4B5563',
                background:    view === 'manage_users' ? SECTION_COLORS.admin.bg : 'transparent',
                marginBottom:  2,
                transition:    'all 0.18s ease',
                position:      'relative',
              }}
              onMouseEnter={e => {
                if (view !== 'manage_users') {
                  e.currentTarget.style.background = SECTION_COLORS.admin.bg + 'AA';
                  e.currentTarget.style.color      = SECTION_COLORS.admin.text;
                }
              }}
              onMouseLeave={e => {
                if (view !== 'manage_users') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color      = '#4B5563';
                }
              }}
            >
              <Users size={16} style={{ color: view === 'manage_users' ? SECTION_COLORS.admin.dot : '#9CA3AF' }} />
              <span style={{ flex: 1 }}>Manage Users</span>
              {view === 'manage_users' && (
                <span style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: 4, background: SECTION_COLORS.admin.dot,
                }} />
              )}
            </button>
          </>
        )}
      </nav>

      {/* ── FOOTER ───────────────────────────────────── */}
      <div style={{ padding: '12px 12px', borderTop: '1px solid #F3F4F6' }}>
        <button
          onClick={() => setView('settings')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            textAlign: 'left', fontSize: 13.5, color: '#6B7280', background: 'transparent',
            marginBottom: 2, transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = SECTION_COLORS.system.bg;
            e.currentTarget.style.color      = SECTION_COLORS.system.text;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color      = '#6B7280';
          }}
        >
          <Settings size={15} style={{ color: '#9CA3AF' }} />
          <span>Settings</span>
        </button>

        <button
          onClick={onLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            textAlign: 'left', fontSize: 13.5, color: '#6B7280', background: 'transparent',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#FFF1F2';
            e.currentTarget.style.color      = '#BE123C';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color      = '#6B7280';
          }}
        >
          <LogOut size={15} style={{ color: '#9CA3AF' }} />
          <span>Sign out</span>
        </button>

        {/* User chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px 2px', marginTop: 8, borderTop: '1px solid #F3F4F6',
        }}>
          <div style={{
            width:          34,
            height:         34,
            borderRadius:   '50%',
            background:     `linear-gradient(135deg, ${activeScheme.dot}, ${activeScheme.border})`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontWeight:     800,
            color:          '#fff',
            fontSize:       13,
            flexShrink:     0,
            boxShadow:      `0 2px 8px ${activeScheme.dot}44`,
            transition:     'background 0.4s ease',
          }}>
            {(user?.name || user?.firstName || 'U')[0].toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: '#111',
              whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden',
            }}>
              {user?.name || user?.firstName || 'User'}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>
              {user?.role === 'superadmin' ? 'Super Admin' : 'User'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;