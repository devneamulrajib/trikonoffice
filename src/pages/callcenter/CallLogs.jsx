import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const TYPE_STYLE = {
  inbound:  { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)' },
  outbound: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.25)' },
  missed:   { color: 'var(--danger)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
};

const PRIORITY_STYLE = {
  high:   { color: 'var(--danger)',  bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)'  },
  medium: { color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  low:    { color: 'var(--success)', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)'  },
};

const Badge = ({ value, map }) => {
  const s = (map || {})[value] || {};
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
      border: `1px solid ${s.border || 'var(--border)'}`,
      background: s.bg || 'transparent', color: s.color || 'var(--text-muted)',
      textTransform: 'capitalize',
    }}>
      {value}
    </span>
  );
};

const durationLabel = (sec) => {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
};

const FILTERS = ['all', 'inbound', 'outbound', 'missed'];

const CallLogs = ({ db, setDb, logAction }) => {
  const logs = db.callLogs || [];
  const [search, setSearch]  = useState('');
  const [filter, setFilter]  = useState('all');

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = l.clientName?.toLowerCase().includes(q) || l.phone?.includes(q) || l.subject?.toLowerCase().includes(q);
    const matchType   = filter === 'all' || l.type === filter;
    return matchSearch && matchType;
  });

  const handleDelete = (id) => {
    setDb(prev => ({ ...prev, callLogs: prev.callLogs.filter(l => l.id !== id) }));
  };

  const thStyle = {
    textAlign: 'left', fontSize: 11, color: 'var(--text-muted)',
    fontWeight: 600, padding: '10px 14px',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border)',
  };

  const tdStyle = {
    padding: '12px 14px', fontSize: 13, color: 'var(--text)',
    borderBottom: '1px solid var(--border)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
    >
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Call Logs</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Full history of all logged calls. New calls appear here automatically.
        </p>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search client, phone or subject..."
          style={{
            flex: 1, minWidth: 220,
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '9px 14px', fontSize: 13,
            color: 'var(--text)', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`,
              background: filter === f ? 'var(--primary)' : 'var(--bg-input)',
              color: filter === f ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden',
      }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '60px 0' }}>
            No call logs yet. Log a call from <strong>New Call</strong>.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Client</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Subject</th>
                <th style={thStyle}>Priority</th>
                <th style={thStyle}>Agent</th>
                <th style={thStyle}>Date</th>
                <th style={{ ...thStyle, textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    No results match your search.
                  </td>
                </tr>
              ) : filtered.map(l => (
                <tr key={l.id} style={{ transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{l.clientName}</div>
                    {l.phone && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{l.phone}</div>}
                  </td>
                  <td style={tdStyle}><Badge value={l.type || 'outbound'} map={TYPE_STYLE} /></td>
                  <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{l.subject || '—'}</td>
                  <td style={tdStyle}><Badge value={l.priority || 'medium'} map={PRIORITY_STYLE} /></td>
                  <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{l.agent || '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 12 }}>{l.date}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button onClick={() => handleDelete(l.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
        {filtered.length} record{filtered.length !== 1 ? 's' : ''} shown
      </p>
    </motion.div>
  );
};

export default CallLogs;