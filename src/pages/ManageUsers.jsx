import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Trash2, Users, ShieldCheck, X,
  ChevronDown, BarChart3, Clock, Eye, EyeOff,
} from 'lucide-react';

// ─── DATA ─────────────────────────────────────────────────────────────────────
const ALL_SECTIONS = [
  { key: 'add_expense',     label: 'Log Transaction',  group: 'Finance'           },
  { key: 'budget_history',  label: 'History Ledger',   group: 'Finance'           },
  { key: 'salary_advance',  label: 'Pay Advance',      group: 'Finance'           },
  { key: 'settings',        label: 'Settings',         group: 'System'            },
  { key: 'call_center',     label: 'Call Center',      group: 'Call Center'       },
  { key: 'cc_new_call',     label: 'New Call',         group: 'Call Center'       },
  { key: 'cc_follow_up',    label: 'Follow Up',        group: 'Call Center'       },
  { key: 'cc_transfer',     label: 'Transfer Request', group: 'Call Center'       },
  { key: 'cc_comments',     label: 'Comments',         group: 'Call Center'       },
  { key: 'cc_call_logs',    label: 'Call Logs',        group: 'Call Center'       },
  { key: 'cc_requirements', label: 'Requirements',     group: 'Call Center'       },
  { key: 'clients',         label: 'Clients (View)',   group: 'Client Management' },
  { key: 'clients_manage',  label: 'Manage Clients',   group: 'Client Management' },
  { key: 'clients_import',  label: 'Import Clients',   group: 'Client Management' },
];

const GROUPS = [...new Set(ALL_SECTIONS.map(s => s.group))];
const DEFAULT_PERMISSIONS = ALL_SECTIONS.map(s => s.key);

// ─── GROUP COLOR MAP ──────────────────────────────────────────────────────────
const GROUP_COLORS = {
  'Finance':           { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  'System':            { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  'Call Center':       { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  'Client Management': { bg: '#FDF4FF', text: '#7E22CE', border: '#E9D5FF' },
};

// ─── AVATAR ───────────────────────────────────────────────────────────────────
const AVATAR_PALETTE = ['#7C3AED', '#F97316', '#0EA5E9', '#16A34A', '#DB2777', '#0891B2'];
const colorForName = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
};
const initialsForName = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '?';

const formatSince = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt) ? null : dt.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

// ─── BACKGROUND DRAWING ───────────────────────────────────────────────────────
// Subtle geometric shapes — faint, purposeful, not decorative noise
const BackgroundArt = () => (
  <svg
    aria-hidden="true"
    style={{
      position: 'fixed', top: 0, right: 0,
      width: 480, height: 480,
      pointerEvents: 'none', zIndex: 0, opacity: 0.45,
    }}
    viewBox="0 0 480 480"
    fill="none"
  >
    {/* outer ring */}
    <circle cx="420" cy="60" r="160" stroke="#F9A825" strokeWidth="1" opacity="0.18" />
    {/* mid ring */}
    <circle cx="420" cy="60" r="100" stroke="#F9A825" strokeWidth="1" opacity="0.22" />
    {/* small filled dot */}
    <circle cx="420" cy="60" r="10" fill="#F9A825" opacity="0.18" />
    {/* diagonal cross-hair lines */}
    <line x1="370" y1="10" x2="470" y2="110" stroke="#F9A825" strokeWidth="1" opacity="0.12" />
    <line x1="470" y1="10" x2="370" y2="110" stroke="#F9A825" strokeWidth="1" opacity="0.12" />
    {/* grid dots bottom-right area */}
    {[0,1,2,3,4].map(row =>
      [0,1,2,3,4].map(col => (
        <circle
          key={`${row}-${col}`}
          cx={280 + col * 22}
          cy={300 + row * 22}
          r="1.5"
          fill="#111"
          opacity="0.07"
        />
      ))
    )}
    {/* arc segment */}
    <path
      d="M 80 440 A 120 120 0 0 1 200 320"
      stroke="#F9A825" strokeWidth="1.5" opacity="0.13" strokeLinecap="round"
    />
  </svg>
);

// ─── UNIQUE ICON: shield with a person inside (SVG, not lucide) ───────────────
const UserShieldIcon = ({ size = 20, color = '#111111' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L4 5v5c0 5.25 3.5 10.15 8 11.35C16.5 20.15 20 15.25 20 10V5L12 2z" />
    <circle cx="12" cy="10" r="2.5" />
    <path d="M7.5 17.5C8.5 15.5 10.1 14.5 12 14.5s3.5 1 4.5 3" />
  </svg>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent }) => (
  <div style={{
    flex: 1, minWidth: 130,
    background: '#FFFFFF',
    border: '1.5px solid #F3F4F6',
    borderRadius: 14,
    padding: '16px 20px',
    display: 'flex', alignItems: 'center', gap: 14,
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 10,
      background: accent ? accent + '18' : '#F9FAFB',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#111111', letterSpacing: '-0.02em' }}>
        {value}
      </div>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const ManageUsers = () => {
  const [users,      setUsers]      = useState([]);
  const [form,       setForm]       = useState({ name: '', email: '', password: '' });
  const [permissions,setPerms]      = useState(DEFAULT_PERMISSIONS);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [panelOpen,  setPanelOpen]  = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [showPw,     setShowPw]     = useState(false);

  const token   = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    try {
      const res  = await fetch('/api/users', { headers });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
  };
  useEffect(() => { fetchUsers(); }, []);

  const togglePerm = (key) =>
    setPerms(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const toggleGroup = (group) => {
    const gk = ALL_SECTIONS.filter(s => s.group === group).map(s => s.key);
    const allOn = gk.every(k => permissions.includes(k));
    setPerms(prev => allOn ? prev.filter(k => !gk.includes(k)) : [...new Set([...prev, ...gk])]);
  };

  const resetForm = () => {
    setForm({ name: '', email: '', password: '' });
    setPerms(DEFAULT_PERMISSIONS);
    setError(''); setSuccess('');
  };

  const handleTogglePanel = () => {
    if (panelOpen) { resetForm(); setPanelOpen(false); }
    else setPanelOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res  = await fetch('/api/users', { method: 'POST', headers, body: JSON.stringify({ ...form, permissions }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('User created successfully!');
      resetForm(); setPanelOpen(false); fetchUsers();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE', headers });
    fetchUsers();
  };

  // Derived stats
  const totalUsers       = users.length;
  const avgPerms         = totalUsers ? Math.round(users.reduce((s, u) => s + (u.permissions?.length || 0), 0) / totalUsers) : 0;
  const now              = new Date();
  const joinedThisMonth  = users.filter(u => { if (!u.createdAt) return false; const d = new Date(u.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;

  return (
    <div style={{ position: 'relative', fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      <BackgroundArt />

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Unique page icon */}
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: '#111111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}>
            <UserShieldIcon size={24} color="#F9A825" />
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111111', letterSpacing: '-0.025em', margin: 0, lineHeight: 1 }}>
              Manage Users
            </h1>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: '4px 0 0' }}>
              Control access and permissions for your team
            </p>
          </div>
        </div>

        {/* Add / Cancel button */}
        <button
          onClick={handleTogglePanel}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: panelOpen ? '#FFFFFF' : '#111111',
            color: panelOpen ? '#374151' : '#FFFFFF',
            border: panelOpen ? '1.5px solid #E5E7EB' : 'none',
            borderRadius: 10, padding: '0 20px', height: 44,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.15s',
            boxShadow: panelOpen ? 'none' : '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {panelOpen ? <><X size={15} /> Cancel</> : <><UserPlus size={15} /> Add User</>}
        </button>
      </div>

      {/* ── STAT CARDS ──────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard icon={<Users size={18} color="#111111" />}     label="Total Users"      value={totalUsers}      accent="#111111" />
        <StatCard icon={<BarChart3 size={18} color="#F9A825" />} label="Avg Permissions"  value={avgPerms}        accent="#F9A825" />
        <StatCard icon={<Clock size={18} color="#6366F1" />}     label="Joined This Month" value={joinedThisMonth} accent="#6366F1" />
      </div>

      {/* ── CREATE USER PANEL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'relative', zIndex: 2,
              background: '#111111',
              borderRadius: 18,
              padding: '28px 32px',
              marginBottom: 24,
              boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
              overflow: 'hidden',
            }}
          >
            {/* subtle yellow glow top-right */}
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 200, height: 200,
              background: 'radial-gradient(circle, rgba(249,168,37,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>New User</h2>
                <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Fill in details, then assign permissions below</p>
              </div>
              <button onClick={handleTogglePanel} style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', color: '#FFFFFF',
                width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={14} />
              </button>
            </div>

            {error   && <div style={{ background: 'rgba(220,38,38,0.15)', color: '#FCA5A5', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: 'rgba(22,163,74,0.15)',  color: '#86EFAC', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{success}</div>}

            <form onSubmit={handleCreate}>
              {/* Fields row */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Jane Smith' },
                  { label: 'Email',     key: 'email', type: 'email', placeholder: 'jane@work.com' },
                ].map(f => (
                  <div key={f.key} style={{ flex: 1, minWidth: 180 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 7 }}>
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      required
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      style={darkInputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(249,168,37,0.6)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                ))}

                {/* Password with toggle */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 7 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      style={{ ...darkInputStyle, paddingRight: 42 }}
                      onFocus={e => e.target.style.borderColor = 'rgba(249,168,37,0.6)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex',
                    }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <ShieldCheck size={15} color="#F9A825" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>Permissions</span>
                <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 2 }}>· Dashboard always accessible</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 24 }}>
                {GROUPS.map(group => {
                  const items  = ALL_SECTIONS.filter(s => s.group === group);
                  const allOn  = items.every(s => permissions.includes(s.key));
                  const someOn = items.some(s => permissions.includes(s.key));
                  const gc     = GROUP_COLORS[group] || { bg: '#F9FAFB', text: '#374151', border: '#E5E7EB' };

                  return (
                    <div key={group} style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12, padding: '14px 16px',
                    }}>
                      {/* Group header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <button type="button" onClick={() => toggleGroup(group)} style={{
                          width: 18, height: 18, borderRadius: 5,
                          border: `2px solid ${allOn || someOn ? '#F9A825' : 'rgba(255,255,255,0.2)'}`,
                          background: allOn ? '#F9A825' : 'transparent',
                          cursor: 'pointer', flexShrink: 0, padding: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {(allOn || someOn) && (
                            <div style={{ width: allOn ? 8 : 5, height: allOn ? 8 : 2, background: allOn ? '#111' : '#F9A825', borderRadius: 2 }} />
                          )}
                        </button>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {group}
                        </span>
                      </div>

                      {/* Permission chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, paddingLeft: 28 }}>
                        {items.map(item => {
                          const on = permissions.includes(item.key);
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => togglePerm(item.key)}
                              style={{
                                padding: '5px 12px', borderRadius: 20,
                                fontSize: 12, fontWeight: on ? 700 : 400,
                                border: `1.5px solid ${on ? '#F9A825' : 'rgba(255,255,255,0.15)'}`,
                                background: on ? '#F9A825' : 'transparent',
                                color: on ? '#111111' : '#9CA3AF',
                                cursor: 'pointer', transition: 'all 0.14s',
                              }}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: '#F9A825', color: '#111111',
                    border: 'none', borderRadius: 10,
                    padding: '0 24px', height: 44,
                    fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'transform 0.12s',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {loading
                    ? <><div style={{ width: 16, height: 16, border: '2px solid #111', borderTopColor: 'transparent', borderRadius: '50%', animation: 'mu-spin 0.6s linear infinite' }} /> Creating…</>
                    : <><UserPlus size={15} /> Create User</>
                  }
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── USERS LIST ───────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Users size={13} color="#9CA3AF" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            All users · {users.length}
          </span>
        </div>

        {users.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center',
            border: '1.5px dashed #E5E7EB', borderRadius: 14,
            color: '#9CA3AF', fontSize: 14,
          }}>
            No users yet — click "Add User" to create one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {users.map(u => {
              const avatarColor = colorForName(u.name);
              const perms       = Array.isArray(u.permissions) ? u.permissions : [];
              const userGroups  = [...new Set(perms.map(p => ALL_SECTIONS.find(s => s.key === p)?.group).filter(Boolean))];
              const isOpen      = expandedId === u.id;
              const since       = formatSince(u.createdAt);
              const permPct     = ALL_SECTIONS.length > 0 ? Math.round((perms.length / ALL_SECTIONS.length) * 100) : 0;

              return (
                <div
                  key={u.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #F3F4F6',
                    borderRadius: 14,
                    padding: '16px 20px',
                    transition: 'box-shadow 0.15s, border-color 0.15s',
                    boxShadow: isOpen ? '0 4px 16px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.03)',
                    borderColor: isOpen ? '#FDE68A' : '#F3F4F6',
                  }}
                >
                  {/* ── Row top ── */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

                    {/* Avatar */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      background: avatarColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', fontSize: 14, fontWeight: 800,
                      boxShadow: `0 2px 8px ${avatarColor}44`,
                    }}>
                      {initialsForName(u.name)}
                    </div>

                    {/* Name + email */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.email}
                      </div>
                    </div>

                    {/* Group badges */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', flex: '0 0 auto', maxWidth: 320 }}>
                      {userGroups.map(g => {
                        const gc = GROUP_COLORS[g] || {};
                        return (
                          <span key={g} style={{
                            fontSize: 11, fontWeight: 700,
                            padding: '3px 10px', borderRadius: 20,
                            background: gc.bg || '#F9FAFB',
                            color: gc.text || '#374151',
                            border: `1px solid ${gc.border || '#E5E7EB'}`,
                          }}>
                            {g}
                          </span>
                        );
                      })}
                    </div>

                    {/* Permission bar + since */}
                    <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 96 }}>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 5 }}>
                        {perms.length} / {ALL_SECTIONS.length} permissions
                      </div>
                      <div style={{ height: 4, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden', width: 96 }}>
                        <div style={{
                          height: '100%', width: `${permPct}%`,
                          background: permPct > 80 ? '#F9A825' : permPct > 40 ? '#6366F1' : '#10B981',
                          borderRadius: 99, transition: 'width 0.3s',
                        }} />
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedId(isOpen ? null : u.id)}
                      style={{
                        background: '#F9FAFB', border: '1px solid #F3F4F6',
                        borderRadius: 8, width: 32, height: 32,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
                      onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}
                    >
                      <ChevronDown
                        size={14}
                        color="#9CA3AF"
                        style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(u.id)}
                      aria-label={`Delete ${u.name}`}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#D1D5DB', flexShrink: 0, padding: 4,
                        display: 'flex', borderRadius: 6, transition: 'color 0.15s, background 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#D1D5DB'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* ── Expanded perm tags ── */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          marginTop: 16, paddingTop: 14,
                          borderTop: '1px solid #F3F4F6',
                          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
                        }}>
                          {since && (
                            <span style={{ fontSize: 11, color: '#9CA3AF', marginRight: 6 }}>
                              Since {since} ·
                            </span>
                          )}
                          {perms.length === 0 ? (
                            <span style={{ fontSize: 12, color: '#9CA3AF' }}>No permissions assigned</span>
                          ) : perms.map(p => {
                            const section = ALL_SECTIONS.find(s => s.key === p);
                            if (!section) return null;
                            const gc = GROUP_COLORS[section.group] || {};
                            return (
                              <span key={p} style={{
                                fontSize: 11, fontWeight: 600,
                                padding: '3px 10px', borderRadius: 20,
                                background: gc.bg || '#F9FAFB',
                                color: gc.text || '#374151',
                                border: `1px solid ${gc.border || '#E5E7EB'}`,
                              }}>
                                {section.label}
                              </span>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes mu-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const darkInputStyle = {
  width: '100%', height: 42, borderRadius: 9, padding: '0 14px',
  border: '1.5px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: '#FFFFFF', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

export default ManageUsers;