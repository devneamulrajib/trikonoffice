import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

const STATUS_STYLE = {
  pending:  { color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  approved: { color: 'var(--success)', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)'  },
  rejected: { color: 'var(--danger)',  bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)'  },
};

const Badge = ({ value }) => {
  const s = STATUS_STYLE[value] || STATUS_STYLE.pending;
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

const TransferRequest = ({ db, setDb, logAction, user }) => {
  const requests = db.transferRequests || [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client: '', from: '', to: '', reason: '' });

  const inputStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 12px', fontSize: 13,
    color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  const handleAdd = () => {
    if (!form.client || !form.from || !form.to) return;
    const entry = {
      ...form, id: Date.now(), status: 'pending',
      date: new Date().toLocaleDateString('en-US', { dateStyle: 'medium' }),
      submittedBy: user?.firstName || 'User',
    };
    setDb(prev => ({ ...prev, transferRequests: [entry, ...(prev.transferRequests || [])] }));
    logAction('Created transfer request', 'Transfer', form.client);
    setForm({ client: '', from: '', to: '', reason: '' });
    setShowForm(false);
  };

  const updateStatus = (id, status) => {
    setDb(prev => ({
      ...prev,
      transferRequests: prev.transferRequests.map(r => r.id === id ? { ...r, status } : r),
    }));
    logAction(`Transfer ${status}`, 'Transfer', id);
  };

  const handleDelete = (id) => {
    setDb(prev => ({ ...prev, transferRequests: prev.transferRequests.filter(r => r.id !== id) }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Transfer Requests</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Manage client branch transfer requests.</p>
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
          <Plus size={15} /> New Request
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 22, marginBottom: 22,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>New Transfer Request</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="Client name"               style={inputStyle} />
            <input value={form.from}   onChange={e => setForm({ ...form, from:   e.target.value })} placeholder="Transfer from (branch)"    style={inputStyle} />
            <input value={form.to}     onChange={e => setForm({ ...form, to:     e.target.value })} placeholder="Transfer to (branch)"      style={inputStyle} />
            <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason (optional)"         style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAdd} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Submit</button>
            <button onClick={() => setShowForm(false)} style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {requests.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '60px 0' }}>
            No transfer requests yet.
          </div>
        )}
        {requests.map(r => (
          <div key={r.id} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{r.client}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{r.from} → {r.to}</p>
              {r.reason && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.reason}</p>}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{r.date} · {r.submittedBy}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
              <Badge value={r.status} />
              {r.status === 'pending' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => updateStatus(r.id, 'approved')} style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
                    background: 'rgba(34,197,94,0.08)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.25)',
                    transition: 'opacity 0.15s',
                  }} onMouseEnter={e => e.currentTarget.style.opacity='0.7'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                    Approve
                  </button>
                  <button onClick={() => updateStatus(r.id, 'rejected')} style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
                    background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.25)',
                    transition: 'opacity 0.15s',
                  }} onMouseEnter={e => e.currentTarget.style.opacity='0.7'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                    Reject
                  </button>
                </div>
              )}
              <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
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

export default TransferRequest;