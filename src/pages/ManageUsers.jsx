import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Users, ShieldCheck, X, ChevronDown, BarChart3, Clock } from 'lucide-react';

// ─── AVAILABLE SECTIONS A USER CAN BE GRANTED ACCESS TO ───────────────────────
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

// Group sections for display
const GROUPS = [...new Set(ALL_SECTIONS.map(s => s.group))];

const DEFAULT_PERMISSIONS = ALL_SECTIONS.map(s => s.key); // all on by default

// Stable color-by-name for avatars, so the same name always gets the same color
const AVATAR_PALETTE = ['#7C3AED', '#F97316', '#0EA5E9', '#16A34A', '#DB2777', '#0891B2'];
const colorForName = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
};
const initialsForName = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '?';

const formatSince = (dateLike) => {
  if (!dateLike) return null;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

const ManageUsers = () => {
  const [users, setUsers]         = useState([]);
  const [form, setForm]           = useState({ name: '', email: '', password: '' });
  const [permissions, setPerms]   = useState(DEFAULT_PERMISSIONS);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { headers });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const togglePerm = (key) => {
    setPerms(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleGroup = (group) => {
    const groupKeys = ALL_SECTIONS.filter(s => s.group === group).map(s => s.key);
    const allOn = groupKeys.every(k => permissions.includes(k));
    if (allOn) {
      setPerms(prev => prev.filter(k => !groupKeys.includes(k)));
    } else {
      setPerms(prev => [...new Set([...prev, ...groupKeys])]);
    }
  };

  const resetForm = () => {
    setForm({ name: '', email: '', password: '' });
    setPerms(DEFAULT_PERMISSIONS);
    setError('');
    setSuccess('');
  };

  const handleTogglePanel = () => {
    if (panelOpen) {
      resetForm();
      setPanelOpen(false);
    } else {
      setPanelOpen(true);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...form, permissions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('User created successfully!');
      resetForm();
      setPanelOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE', headers });
    fetchUsers();
  };

  // ── Derived stats ──
  const totalUsers = users.length;
  const avgPermissions = totalUsers
    ? Math.round(users.reduce((sum, u) => sum + (Array.isArray(u.permissions) ? u.permissions.length : 0), 0) / totalUsers)
    : 0;
  const now = new Date();
  const joinedThisMonth = users.filter(u => {
    if (!u.createdAt) return false;
    const d = new Date(u.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="mu-wrap">
      <style>{`
        .mu-wrap {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }
        .mu-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: #94A3B8; margin: 0 0 6px;
        }
        .mu-header-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; margin-bottom: 20px;
        }
        .mu-title { font-size: 24px; font-weight: 700; margin: 0; color: #0F172A; }
        .mu-add-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #0F172A; color: #fff; border: none;
          border-radius: 10px; padding: 0 18px; height: 42px;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          transition: background 0.15s, transform 0.1s; flex-shrink: 0;
        }
        .mu-add-btn:hover { background: #1E293B; transform: translateY(-1px); }
        .mu-add-btn.cancel { background: #fff; color: #475569; border: 1.5px solid #E2E8F0; }
        .mu-add-btn.cancel:hover { background: #F8FAFC; }

        .mu-stats-row { display: flex; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }
        .mu-stat-card {
          flex: 1; min-width: 140px; background: #fff; border: 1px solid #E2E8F0;
          border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 12px;
        }
        .mu-stat-icon {
          width: 36px; height: 36px; border-radius: 9px; background: #F8FAFC;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mu-stat-lbl { font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.04em; }
        .mu-stat-num { font-size: 19px; font-weight: 700; color: #0F172A; margin-top: 1px; }

        .mu-panel {
          background: #0F172A; color: #fff; border-radius: 16px;
          padding: 22px 26px; margin-bottom: 24px; overflow: hidden;
        }
        .mu-panel-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 18px; }
        .mu-panel-title { font-size: 16px; font-weight: 600; margin: 0; }
        .mu-panel-sub { font-size: 12.5px; color: #94A3B8; margin: 3px 0 0; }
        .mu-panel-close {
          background: rgba(255,255,255,0.08); border: none; color: #fff;
          width: 28px; height: 28px; border-radius: 8px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mu-panel-close:hover { background: rgba(255,255,255,0.15); }

        .mu-field-label {
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.07em;
          text-transform: uppercase; color: #94A3B8; display: block; margin-bottom: 6px;
        }
        .mu-field-row { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 22px; }
        .mu-field { flex: 1; min-width: 180px; }
        .mu-dark-input {
          width: 100%; height: 42px; border-radius: 9px; padding: 0 14px;
          border: 1.5px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06);
          color: #fff; font-size: 13.5px; outline: none; box-sizing: border-box;
          font-family: inherit; transition: border-color 0.15s, background 0.15s;
        }
        .mu-dark-input::placeholder { color: #64748B; }
        .mu-dark-input:focus { border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.09); }

        .mu-alert {
          padding: 9px 13px; border-radius: 9px; margin-bottom: 16px; font-size: 13px;
        }
        .mu-alert.error { background: rgba(220,38,38,0.15); color: #FCA5A5; }
        .mu-alert.success { background: rgba(22,163,74,0.18); color: #86EFAC; }

        .mu-perm-head { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
        .mu-perm-head-lbl { font-weight: 600; font-size: 14px; }
        .mu-perm-head-hint { font-size: 12px; color: #64748B; margin-left: 2px; }

        .mu-groups-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 14px; margin-bottom: 22px;
        }
        .mu-group-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 14px 16px;
        }
        .mu-group-head { display: flex; align-items: center; gap: 9px; margin-bottom: 10px; }
        .mu-group-check {
          width: 16px; height: 16px; border-radius: 4px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0;
        }
        .mu-group-name {
          font-size: 11px; font-weight: 700; color: #94A3B8;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .mu-chip-row { display: flex; flex-wrap: wrap; gap: 7px; padding-left: 25px; }
        .mu-chip {
          padding: 5px 12px; border-radius: 20px; font-size: 12px;
          cursor: pointer; transition: all 0.15s ease; border: 1.5px solid;
        }

        .mu-submit-row { display: flex; justify-content: flex-end; }
        .mu-submit-btn {
          background: #fff; color: #0F172A; border: none; border-radius: 10px;
          padding: 0 22px; height: 42px; font-size: 13.5px; font-weight: 700;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
        }
        .mu-submit-btn:disabled { opacity: 0.6; cursor: default; }
        .mu-submit-btn:not(:disabled):hover { transform: translateY(-1px); }

        .mu-section-lbl {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: #94A3B8; margin: 0 0 14px;
          display: flex; align-items: center; gap: 8px;
        }

        .mu-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
        }
        .mu-empty {
          padding: 36px 20px; text-align: center; color: #94A3B8; font-size: 13.5px;
          border: 1.5px dashed #E2E8F0; border-radius: 14px;
        }

        .mu-card {
          background: #fff; border: 1px solid #E2E8F0; border-radius: 14px;
          padding: 16px; transition: box-shadow 0.15s, transform 0.15s;
        }
        .mu-card:hover { box-shadow: 0 6px 16px rgba(15,23,42,0.08); transform: translateY(-1px); }
        .mu-card-top { display: flex; align-items: flex-start; gap: 12px; }
        .mu-avatar {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 13px; font-weight: 700;
        }
        .mu-card-info { flex: 1; min-width: 0; }
        .mu-card-name {
          font-size: 14px; font-weight: 700; color: #0F172A; margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .mu-card-email {
          font-size: 12px; color: #94A3B8; margin: 1px 0 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .mu-card-del {
          background: none; border: none; cursor: pointer; color: #CBD5E1;
          flex-shrink: 0; padding: 2px; display: flex; transition: color 0.15s;
        }
        .mu-card-del:hover { color: #EF4444; }

        .mu-group-badges { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 12px; }
        .mu-group-badge {
          font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 20px;
        }

        .mu-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 13px; padding-top: 11px; border-top: 1px solid #F1F5F9;
          cursor: pointer; user-select: none;
        }
        .mu-card-footer-text { font-size: 11.5px; color: #94A3B8; font-weight: 500; }
        .mu-card-footer-chevron { color: #CBD5E1; flex-shrink: 0; transition: transform 0.2s; }
        .mu-card-footer-chevron.open { transform: rotate(180deg); }

        .mu-full-perms { display: flex; flex-wrap: wrap; gap: 5px; padding-top: 11px; overflow: hidden; }
        .mu-full-perm-tag {
          font-size: 10.5px; font-weight: 600; padding: 3px 9px; border-radius: 20px;
          background: #F8FAFC; color: #475569; border: 1px solid #E2E8F0;
        }
      `}</style>

      <div className="mu-header-row">
        <div>
          <p className="mu-eyebrow">Admin · User management</p>
          <h1 className="mu-title">Manage Users</h1>
        </div>
        <button className={`mu-add-btn${panelOpen ? ' cancel' : ''}`} onClick={handleTogglePanel}>
          {panelOpen ? <><X size={15} /> Cancel</> : <><UserPlus size={15} /> Add User</>}
        </button>
      </div>

      {/* ── STATS ROW ── */}
      <div className="mu-stats-row">
        <div className="mu-stat-card">
          <div className="mu-stat-icon"><Users size={16} color="#0F172A" /></div>
          <div>
            <div className="mu-stat-lbl">Total Users</div>
            <div className="mu-stat-num">{totalUsers}</div>
          </div>
        </div>
        <div className="mu-stat-card">
          <div className="mu-stat-icon"><BarChart3 size={16} color="#0F172A" /></div>
          <div>
            <div className="mu-stat-lbl">Avg Permissions</div>
            <div className="mu-stat-num">{avgPermissions}</div>
          </div>
        </div>
        <div className="mu-stat-card">
          <div className="mu-stat-icon"><Clock size={16} color="#0F172A" /></div>
          <div>
            <div className="mu-stat-lbl">This Month</div>
            <div className="mu-stat-num">{joinedThisMonth}</div>
          </div>
        </div>
      </div>

      {/* ── INLINE CREATE-USER PANEL ── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            className="mu-panel"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mu-panel-head">
              <div>
                <h2 className="mu-panel-title">New User</h2>
                <p className="mu-panel-sub">Fill details and select permissions below</p>
              </div>
              <button className="mu-panel-close" aria-label="Close panel" onClick={handleTogglePanel}>
                <X size={15} />
              </button>
            </div>

            {error && <div className="mu-alert error">{error}</div>}
            {success && <div className="mu-alert success">{success}</div>}

            <form onSubmit={handleCreate}>
              <div className="mu-field-row">
                <div className="mu-field">
                  <span className="mu-field-label">Full Name</span>
                  <input
                    className="mu-dark-input"
                    placeholder="e.g. Jane Smith"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="mu-field">
                  <span className="mu-field-label">Email</span>
                  <input
                    className="mu-dark-input"
                    type="email"
                    placeholder="jane@work.com"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="mu-field">
                  <span className="mu-field-label">Password</span>
                  <input
                    className="mu-dark-input"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="mu-perm-head">
                <ShieldCheck size={16} />
                <span className="mu-perm-head-lbl">Section Permissions</span>
                <span className="mu-perm-head-hint">(Dashboard is always accessible)</span>
              </div>

              <div className="mu-groups-grid">
                {GROUPS.map(group => {
                  const groupItems = ALL_SECTIONS.filter(s => s.group === group);
                  const allOn = groupItems.every(s => permissions.includes(s.key));
                  const someOn = groupItems.some(s => permissions.includes(s.key));

                  return (
                    <div key={group} className="mu-group-card">
                      <div className="mu-group-head">
                        <button
                          type="button"
                          className="mu-group-check"
                          onClick={() => toggleGroup(group)}
                          style={{
                            border: `2px solid ${allOn || someOn ? '#fff' : 'rgba(255,255,255,0.25)'}`,
                            background: allOn ? '#fff' : 'transparent',
                          }}
                        >
                          {(allOn || someOn) && (
                            <div style={{
                              width: allOn ? 8 : 6,
                              height: allOn ? 8 : 2,
                              background: allOn ? '#0F172A' : '#fff',
                              borderRadius: 2,
                            }} />
                          )}
                        </button>
                        <span className="mu-group-name">{group}</span>
                      </div>
                      <div className="mu-chip-row">
                        {groupItems.map(item => {
                          const on = permissions.includes(item.key);
                          return (
                            <button
                              key={item.key}
                              type="button"
                              className="mu-chip"
                              onClick={() => togglePerm(item.key)}
                              style={{
                                borderColor: on ? '#fff' : 'rgba(255,255,255,0.18)',
                                background: on ? '#fff' : 'transparent',
                                color: on ? '#0F172A' : '#94A3B8',
                                fontWeight: on ? 600 : 400,
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

              <div className="mu-submit-row">
                <button type="submit" className="mu-submit-btn" disabled={loading}>
                  {loading ? 'Creating...' : <><UserPlus size={15} /> Create User</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── USERS GRID ── */}
      <p className="mu-section-lbl"><Users size={13} /> All users</p>

      {users.length === 0 ? (
        <div className="mu-empty">No users yet — click "Add User" to create one.</div>
      ) : (
        <div className="mu-grid">
          {users.map(u => {
            const avatarColor = colorForName(u.name);
            const perms = Array.isArray(u.permissions) ? u.permissions : [];
            const userGroups = [...new Set(
              perms.map(p => ALL_SECTIONS.find(s => s.key === p)?.group).filter(Boolean)
            )];
            const isOpen = expandedId === u.id;
            const since = formatSince(u.createdAt);

            return (
              <div key={u.id} className="mu-card">
                <div className="mu-card-top">
                  <div className="mu-avatar" style={{ background: avatarColor }}>
                    {initialsForName(u.name)}
                  </div>
                  <div className="mu-card-info">
                    <p className="mu-card-name">{u.name}</p>
                    <p className="mu-card-email">{u.email}</p>
                  </div>
                  <button
                    className="mu-card-del"
                    aria-label={`Delete ${u.name}`}
                    onClick={() => handleDelete(u.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {userGroups.length > 0 && (
                  <div className="mu-group-badges">
                    {userGroups.map(g => (
                      <span
                        key={g}
                        className="mu-group-badge"
                        style={{ background: `${avatarColor}1A`, color: avatarColor }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className="mu-card-footer"
                  onClick={() => setExpandedId(isOpen ? null : u.id)}
                >
                  <span className="mu-card-footer-text">
                    {perms.length} permission{perms.length !== 1 ? 's' : ''}{since ? ` · Since ${since}` : ''}
                  </span>
                  <ChevronDown size={14} className={`mu-card-footer-chevron${isOpen ? ' open' : ''}`} />
                </div>

                <AnimatePresence>
                  {isOpen && perms.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="mu-full-perms">
                        {perms.map(p => {
                          const section = ALL_SECTIONS.find(s => s.key === p);
                          return section ? (
                            <span key={p} className="mu-full-perm-tag">{section.label}</span>
                          ) : null;
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
  );
};

export default ManageUsers;