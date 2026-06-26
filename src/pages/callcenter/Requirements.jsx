import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

const PRIORITY_STYLE = {
  high:   { color: 'var(--danger)',  bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)'  },
  medium: { color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  low:    { color: 'var(--success)', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)'  },
};

const STATUS_STYLE = {
  'open':        { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)' },
  'in-progress': { color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  'resolved':    { color: 'var(--success)', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)' },
};

const STATUS_CYCLE = { open: 'in-progress', 'in-progress': 'resolved', resolved: 'open' };

const Badge = ({ value, map, onClick }) => {
  const s = (map || {})[value] || {};
  return (
    <span
      onClick={onClick}
      style={{
        fontSize: 10.5, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
        border: `1px solid ${s.border || 'var(--border)'}`,
        background: s.bg || 'transparent', color: s.color || 'var(--text-muted)',
        textTransform: 'capitalize', cursor: onClick ? 'pointer' : 'default',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.opacity = '0.7'; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.opacity = '1'; }}
      title={onClick ? 'Click to cycle status' : undefined}
    >
      {value}
    </span>
  );
};

const Requirements = ({ db, setDb, logAction, user }) => {
  const requirements = db.requirements || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client: '', title: '', description: '', priority: 'medium' });

  const inputStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 12px', fontSize: 13,
    color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const handleAdd = () => {
    if (!form.client || !form.title) return;
    const entry = {
      ...form, id: Date.now(), status: 'open',
      date: new Date().toLocaleDateString('en-US', { dateStyle: 'medium' }),
      createdBy: user?.firstName || 'User',
    };
    setDb(prev => ({ ...prev, requirements: [entry, ...(prev.requirements || [])] }));
    logAction('Added requirement', 'Requirement', form.title);
    setForm({ client: '', title: '', description: '', priority: 'medium' });
    setShowForm(false);
  };

  const cycleStatus = (id) => {
    setDb(prev => ({
      ...prev,
      requirements: prev.requirements.map(r =>
        r.id === id ? { ...r, status: STATUS_CYCLE[r.status] || 'open' } : r
      ),
    }));
  };

  const handleDelete = (id) => {
    setDb(prev => ({ ...prev, requirements: prev.requirements.filter(r => r.id !== id) }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Requirements</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Client service requirements and requests. Click status badge to cycle it.
          </p>
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
          <Plus size={15} /> Add Requirement
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 22, marginBottom: 22,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>New Requirement</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="Client name"         style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <input value={form.title}  onChange={e => setForm({ ...form, title:  e.target.value })} placeholder="Requirement title"   style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optional)" rows={2}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer', width: 'auto' }}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAdd} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save</button>
            <button onClick={() => setShowForm(false)} style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {requirements.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '60px 0' }}>
            No requirements yet. Add one above.
          </div>
        )}
        {requirements.map(r => (
          <div key={r.id} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{r.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Client: {r.client}</p>
              {r.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{r.description}</p>}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{r.date} · {r.createdBy}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
              <Badge value={r.priority} map={PRIORITY_STYLE} />
              <Badge value={r.status}   map={STATUS_STYLE}   onClick={() => cycleStatus(r.id)} />
              <button onClick={() => handleDelete(r.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
              }}
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

export default Requirements;