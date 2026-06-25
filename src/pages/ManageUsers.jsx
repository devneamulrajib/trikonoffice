import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Users, ShieldCheck } from 'lucide-react';

// ─── AVAILABLE SECTIONS A USER CAN BE GRANTED ACCESS TO ───────────────────────
const ALL_SECTIONS = [
  { key: 'add_expense',    label: 'Log Transaction',  group: 'Finance'           },
  { key: 'budget_history', label: 'History Ledger',   group: 'Finance'           },
  { key: 'salary_advance', label: 'Pay Advance',      group: 'Finance'           },
  { key: 'settings',       label: 'Settings',         group: 'System'            },
  { key: 'call_center',    label: 'Call Center',      group: 'Call Center'       },
  { key: 'cc_new_call',    label: 'New Call',         group: 'Call Center'       },
  { key: 'cc_follow_up',   label: 'Follow Up',        group: 'Call Center'       },
  { key: 'cc_transfer',    label: 'Transfer Request', group: 'Call Center'       },
  { key: 'cc_comments',    label: 'Comments',         group: 'Call Center'       },
  { key: 'cc_call_logs',   label: 'Call Logs',        group: 'Call Center'       },
  { key: 'cc_requirements',label: 'Requirements',     group: 'Call Center'       },
  { key: 'clients',        label: 'Clients (View)',   group: 'Client Management' },
];

// Group sections for display
const GROUPS = [...new Set(ALL_SECTIONS.map(s => s.group))];

const DEFAULT_PERMISSIONS = ALL_SECTIONS.map(s => s.key); // all on by default

const ManageUsers = () => {
  const [users, setUsers]       = useState([]);
  const [form, setForm]         = useState({ name: '', email: '', password: '' });
  const [permissions, setPerms] = useState(DEFAULT_PERMISSIONS);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

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
      setForm({ name: '', email: '', password: '' });
      setPerms(DEFAULT_PERMISSIONS);
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

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Manage Users</h1>

      {/* ── CREATE USER FORM ────────────────────────────────────────────── */}
      <div style={{
        background: '#FFF', borderRadius: 16, padding: 28,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 24
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserPlus size={18} /> Create New User
        </h2>

        {error   && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}
        {success && <div style={{ background: '#DCFCE7', color: '#16A34A', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{success}</div>}

        <form onSubmit={handleCreate}>
          {/* Basic fields */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            <input
              className="input-field"
              placeholder="Full Name"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ flex: 1, minWidth: 160 }}
            />
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ flex: 1, minWidth: 160 }}
            />
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ flex: 1, minWidth: 160 }}
            />
          </div>

          {/* Permissions */}
          <div style={{
            background: '#F8FAFC', borderRadius: 12,
            padding: 20, marginBottom: 20,
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <ShieldCheck size={16} color="#6366F1" />
              <span style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>Section Access</span>
              <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 4 }}>
                (Dashboard is always accessible)
              </span>
            </div>

            {GROUPS.map(group => {
              const groupItems = ALL_SECTIONS.filter(s => s.group === group);
              const allOn = groupItems.every(s => permissions.includes(s.key));
              const someOn = groupItems.some(s => permissions.includes(s.key));

              return (
                <div key={group} style={{ marginBottom: 16 }}>
                  {/* Group header with toggle all */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group)}
                      style={{
                        width: 16, height: 16, borderRadius: 4,
                        border: `2px solid ${allOn ? '#6366F1' : someOn ? '#6366F1' : '#CBD5E1'}`,
                        background: allOn ? '#6366F1' : someOn ? '#EEF2FF' : '#FFF',
                        cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, padding: 0,
                      }}
                    >
                      {(allOn || someOn) && (
                        <div style={{
                          width: allOn ? 8 : 6,
                          height: allOn ? 8 : 2,
                          background: allOn ? '#FFF' : '#6366F1',
                          borderRadius: 2
                        }} />
                      )}
                    </button>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {group}
                    </span>
                  </div>

                  {/* Individual items */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 24 }}>
                    {groupItems.map(item => {
                      const on = permissions.includes(item.key);
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => togglePerm(item.key)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 20,
                            border: `1.5px solid ${on ? '#6366F1' : '#E2E8F0'}`,
                            background: on ? '#EEF2FF' : '#FFF',
                            color: on ? '#4F46E5' : '#64748B',
                            fontSize: 12, fontWeight: on ? 600 : 400,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {on ? '✓ ' : ''}{item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      {/* ── USERS LIST ──────────────────────────────────────────────────── */}
      <div style={{ background: '#FFF', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={18} /> All Users
        </h2>
        {users.length === 0
          ? <p style={{ color: '#94A3B8', fontSize: 14 }}>No users yet.</p>
          : users.map(u => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              padding: '14px 0', borderBottom: '1px solid #F1F5F9', gap: 12
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</p>
                <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>{u.email}</p>
                {/* Show permissions if stored */}
                {u.permissions && Array.isArray(u.permissions) && u.permissions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {u.permissions.map(p => {
                      const section = ALL_SECTIONS.find(s => s.key === p);
                      return section ? (
                        <span key={p} style={{
                          background: '#EEF2FF', color: '#4F46E5',
                          fontSize: 10, fontWeight: 600,
                          padding: '2px 8px', borderRadius: 20
                        }}>
                          {section.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(u.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', flexShrink: 0 }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        }
      </div>
    </motion.div>
  );
};

export default ManageUsers;