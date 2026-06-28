import React from 'react';
import { LogOut, Zap, Users } from 'lucide-react';
import NAVITEMS from '../constants/navItems';

// ─── PERMISSION CHECK ─────────────────────────────────────────────────────────
// Returns true if the logged-in user should see this nav item.
//
// Rules:
//  1. superadmin sees everything.
//  2. Items with roles: 'superadmin' are hidden from regular users.
//  3. Items with roles: 'all' and NO permKey are always visible (e.g. Dashboard).
//  4. Items with roles: 'all' AND a permKey are visible only if that key is in
//     the user's permissions array.
const canSee = (item, user) => {
  if (!item) return false;
  if (user?.role === 'superadmin') return true;
  if (item.roles === 'superadmin') return false;

  // 'all' items without a permKey → always visible
  if (!item.permKey) return true;

  // 'all' items with a permKey → check user.permissions
  const perms = user?.permissions ?? [];
  return perms.includes(item.permKey);
};

const Sidebar = ({ view, setView, month, setMonth, user, onLogout, pendingCount }) => {
  return (
    <aside style={{
      width: 260,
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      background: 'var(--zinc-900)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>

      {/* ── LOGO ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--primary)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={18} color="#FFF" />
          </div>
          <span style={{
            color: '#FFF', fontWeight: 800,
            fontSize: 18, letterSpacing: '-0.02em'
          }}>
            Quite Clear
          </span>
        </div>
      </div>

      {/* ── MONTH PICKER ─────────────────────────────────────────────────── */}
      <div style={{ padding: '0 16px 24px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 12,
          padding: 12
        }}>
          <label style={{
            fontSize: 10, color: '#64748B',
            fontWeight: 700, textTransform: 'uppercase',
            marginBottom: 8, display: 'block'
          }}>
            Fiscal Month
          </label>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            style={{
              width: '100%', background: 'transparent',
              border: 'none', color: '#FFF',
              fontWeight: 600, outline: 'none',
              fontSize: 14, cursor: 'pointer'
            }}
          />
        </div>
      </div>

      {/* ── NAV LINKS ────────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}>

        {/* ── CORE section header (always shown) ── */}
        <div style={{
          fontSize: 10, fontWeight: 700,
          color: '#475569', textTransform: 'uppercase',
          padding: '8px 12px 8px', letterSpacing: '0.05em'
        }}>
          Core
        </div>

        {NAVITEMS.map((item, idx) => {

          /* ── DIVIDER / SECTION HEADER ── */
          if (item.type === 'divider') {
            // Only show the divider if at least one child in next items is visible
            return (
              <div key={`divider-${idx}`} style={{
                fontSize: 10, fontWeight: 700,
                color: '#475569', textTransform: 'uppercase',
                padding: '24px 12px 8px', letterSpacing: '0.05em'
              }}>
                {item.section}
              </div>
            );
          }

          /* ── GROUP (Call Center, Clients) ── */
          if (item.type === 'group') {
            // Hide the whole group if user can't see it
            if (!canSee(item, user)) return null;

            const isActive = view === item.id || item.children?.some(c => c.id === view);
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`nav-link${isActive ? ' active' : ''}`}
                style={{ marginBottom: 4 }}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            );
          }

          /* ── REGULAR NAV ITEM ── */
          if (!canSee(item, user)) return null;

          // Section headers based on index position
          const sectionHeader = (() => {
            if (idx === 3) return 'Finance';
            if (idx === 7) return 'System';
            return null;
          })();

          return (
            <React.Fragment key={item.id}>
              {sectionHeader && (
                <div style={{
                  fontSize: 10, fontWeight: 700,
                  color: '#475569', textTransform: 'uppercase',
                  padding: '24px 12px 8px', letterSpacing: '0.05em'
                }}>
                  {sectionHeader}
                </div>
              )}
              <button
                onClick={() => setView(item.id)}
                className={`nav-link${view === item.id ? ' active' : ''}`}
                style={{ marginBottom: 4 }}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span style={{
                    background: '#F43F5E', color: '#FFF',
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 6px', borderRadius: 6
                  }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}

        {/* ── SUPER ADMIN ONLY: Manage Users ───────────────────────────── */}
        {user?.role === 'superadmin' && (
          <>
            <div style={{
              fontSize: 10, fontWeight: 700,
              color: '#475569', textTransform: 'uppercase',
              padding: '24px 12px 8px', letterSpacing: '0.05em'
            }}>
              Admin
            </div>
            <button
              onClick={() => setView('manage_users')}
              className={`nav-link${view === 'manage_users' ? ' active' : ''}`}
              style={{ marginBottom: 4 }}
            >
              <Users size={16} />
              <span style={{ flex: 1 }}>Manage Users</span>
            </button>
          </>
        )}
      </nav>

      {/* ── USER PROFILE ─────────────────────────────────────────────────── */}
      <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#FFF', fontSize: 14
          }}>
            {(user?.name || user?.firstName || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              color: '#FFF', fontSize: 14, fontWeight: 600,
              whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'
            }}>
              {user?.name || user?.firstName || 'User'}
            </div>
            <div style={{ color: '#64748B', fontSize: 11 }}>
              {user?.role === 'superadmin' ? 'Super Admin' : 'User'}
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = '#F43F5E'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;