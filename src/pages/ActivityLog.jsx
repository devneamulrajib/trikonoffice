import React, { useState } from 'react';
import {
  ArrowUpRight, ShieldCheck, Layers,
  RefreshCw, CreditCard, Clock, Search
} from 'lucide-react';
import Page from '../components/Page';

// ─── ACTIVITY TYPE STYLES ─────────────────────────────────────────────────────
const ACTIVITY_COLORS = {
  'Expense': {
    bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444',
    icon: <ArrowUpRight size={16} color="#EF4444" />
  },
  'Authorization': {
    bg: '#ECFDF5', border: '#D1FAE5', dot: '#10B981',
    icon: <ShieldCheck size={16} color="#10B981" />
  },
  'Sector': {
    bg: '#F1F5F9', border: '#E2E8F0', dot: '#64748B',
    icon: <Layers size={16} color="#64748B" />
  },
  'System': {
    bg: '#F0F9FF', border: '#E0F2FE', dot: '#0EA5E9',
    icon: <RefreshCw size={16} color="#0EA5E9" />
  },
  'Salary Advance': {
    bg: '#FFFBEB', border: '#FEF3C7', dot: '#F59E0B',
    icon: <CreditCard size={16} color="#F59E0B" />
  },
};

const ActivityLog = ({ db }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const logs = db.activityLog || [];
  const types = ['All', ...Array.from(new Set(logs.map(l => l.type)))];

  const filtered = logs.filter(l =>
    (filter === 'All' || l.type === filter) &&
    (search === '' || [l.user, l.action, l.type, l.target]
      .some(v => v?.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <Page title="Audit Trail" subtitle="Chronological history of system events">

      {/* SEARCH + FILTER BAR */}
      <div className="card" style={{
        padding: 16, marginBottom: 24,
        display: 'flex', gap: 16, alignItems: 'center'
      }}>
        <Search size={20} color="#94A3B8" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search personnel, events, or targets..."
          style={{
            flex: 1, border: 'none', outline: 'none',
            fontSize: 15, fontWeight: 500,
            background: 'transparent'
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: '6px 14px', borderRadius: 8,
                border: 'none', cursor: 'pointer',
                background: filter === t ? 'var(--zinc-900)' : 'transparent',
                color: filter === t ? '#FFF' : 'var(--zinc-500)',
                fontWeight: 600, fontSize: 12,
                transition: 'all 0.2s'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <p style={{ color: 'var(--zinc-400)', fontSize: 14 }}>
            {logs.length === 0
              ? 'No activity recorded yet.'
              : 'No results match your search or filter.'}
          </p>
        </div>
      )}

      {/* LOG LIST */}
      {filtered.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {filtered.map((log, idx) => {
            const style = ACTIVITY_COLORS[log.type] || ACTIVITY_COLORS['System'];
            return (
              <div
                key={log.id}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: 20, padding: '16px 24px',
                  borderBottom: idx < filtered.length - 1
                    ? '1px solid var(--border)'
                    : 'none',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* ICON */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {style.icon}
                </div>

                {/* CONTENT */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{log.user}</span>
                    <span style={{ fontSize: 14, color: 'var(--zinc-500)' }}>{log.action}</span>
                    <span style={{
                      fontWeight: 700, fontSize: 14,
                      fontFamily: 'JetBrains Mono'
                    }}>
                      {log.target}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: 6, fontSize: 11,
                    color: 'var(--zinc-400)', marginTop: 4
                  }}>
                    <Clock size={12} />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>

                {/* TYPE BADGE */}
                <span
                  className="badge-gray"
                  style={{
                    background: style.bg,
                    color: style.dot,
                    border: `1px solid ${style.border}`,
                    flexShrink: 0
                  }}
                >
                  {log.type}
                </span>

              </div>
            );
          })}
        </div>
      )}

    </Page>
  );
};

export default ActivityLog;