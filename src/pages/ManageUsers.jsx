import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Users } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users', { headers });
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('User created successfully!');
      setForm({ name: '', email: '', password: '' });
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

      {/* CREATE USER FORM */}
      <div style={{
        background: '#FFF', borderRadius: 16, padding: 24,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 24
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserPlus size={18} /> Create New User
        </h2>

        {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}
        {success && <div style={{ background: '#DCFCE7', color: '#16A34A', padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{success}</div>}

        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      {/* USERS LIST */}
      <div style={{ background: '#FFF', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={18} /> All Users
        </h2>
        {users.length === 0
          ? <p style={{ color: '#94A3B8', fontSize: 14 }}>No users yet.</p>
          : users.map(u => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 0', borderBottom: '1px solid #F1F5F9'
            }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</p>
                <p style={{ fontSize: 12, color: '#94A3B8' }}>{u.email}</p>
              </div>
              <button
                onClick={() => handleDelete(u.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
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