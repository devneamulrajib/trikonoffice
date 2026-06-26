import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

const PRIORITY_STYLE = {
  high:   { color: 'var(--danger)',  bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)'  },
  medium: { color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  low:    { color: 'var(--success)', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)'  },
};

const Badge = ({ value, map }) => {
  const s = map[value] || map['medium'];
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 600, padding: '2px 9px',
      borderRadius: 20, border: `1px solid ${s.border}`,
      background: s.bg, color: s.color, textTransform: 'capitalize',
    }}>
      {value}
    </span>
  );
};

const FollowUp = ({ db, setDb, logAction, user }) => {
  const followUps = db.followUps || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client: '', phone: '', subject: '', dueDate: '', priority: 'medium' });

  const inputStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 12px', fontSize: 13,
    color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  const handleAdd = () => {
    if (!form.client || !form.subject) return;
    const entry = { ...form, id: Date.now(), status: 'pending', createdBy: user?.firstName || 'User' };
    setDb(prev => ({ ...prev, followUps: [entry, ...(prev.followUps || [])] }));
    logAction('Added follow-up', 'Follow Up', form.client);
    setForm({ client: '', phone: '', subject: '', dueDate: '', priority: 'medium' });
    setShowForm(false);
  };

  const toggleDone = (id) => {
    setDb(prev => ({
      ...prev,
      followUps: prev.followUps.map(f =>
        f.id === id ? { ...f, status: f.status === 'done' ? 'pending' : 'done' } : f
      ),
    }));
  };

  const handleDelete = (id) => {
    setDb(prev => ({ ...prev, followUps: prev.followUps.filter(f => f.id !== id) }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Follow Up</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Track and manage pending client follow-ups.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: 9, padding: '9px 16px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={15} /> Add Follow-Up
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 22, marginBottom: 22,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>New Follow-Up</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <input value={form.client}  onChange={e => setForm({ ...form, client:  e.target.value })} placeholder="Client name"   style={inputStyle} />
            <input value={form.phone}   onChange={e => setForm({ ...form, phone:   e.target.value })} placeholder="Phone number"   style={inputStyle} />
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject"        style={inputStyle} />
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} />
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAdd} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {followUps.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '60px 0' }}>
            No follow-ups yet. Add one above.
          </div>
        )}
        {followUps.map(f => (
          <div key={f.id} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
            opacity: f.status === 'done' ? 0.5 : 1, transition: 'opacity 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <input type="checkbox" checked={f.status === 'done'} onChange={() => toggleDone(f.id)}
                style={{ marginTop: 3, cursor: 'pointer', accentColor: 'var(--primary)' }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, textDecoration: f.status === 'done' ? 'line-through' : 'none' }}>
                  {f.client}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{f.subject}</p>
                {f.phone && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{f.phone}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
              <Badge value={f.priority} map={PRIORITY_STYLE} />
              {f.dueDate && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Due: {f.dueDate}</span>}
              <button onClick={() => handleDelete(f.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FollowUp;