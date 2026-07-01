import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, Phone, PhoneIncoming, PhoneOutgoing, ShieldCheck, Filter } from 'lucide-react';

// ─── Type Styles ─────────────────────────────────────────────────────────────
const TYPE_STYLE = {
  inbound: {
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
    icon: <PhoneIncoming size={13} />,
    label: 'Inbound',
  },
  outbound: {
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.25)',
    icon: <PhoneOutgoing size={13} />,
    label: 'Outbound',
  },
};

const STATUS_STYLE = {
  completed: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', label: 'Completed' },
  'follow-up': { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', label: 'Follow-up' },
  dropped: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', label: 'Dropped' },
  closed: { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.25)', label: 'Closed' },
};

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ style, icon, label }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    color: style.color, background: style.bg, border: `1px solid ${style.border}`,
  }}>
    {icon} {label}
  </span>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ filtered }) => (
  <div style={{
    textAlign: 'center', padding: '60px 24px',
    color: 'var(--zinc-400)',
  }}>
    <Phone size={40} style={{ opacity: 0.25, marginBottom: 12 }} />
    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
      {filtered ? 'No matching logs' : 'No call logs yet'}
    </div>
    <div style={{ fontSize: 13 }}>
      {filtered ? 'Try adjusting your search or filter.' : 'Logs will appear here after calls are completed.'}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CallLogs = ({ db, setDb, logAction, user }) => {
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'super_admin';

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Scope: agents see only their logs, super admin sees all ──────────────
  const allLogs = db.ccCallLogs || [];

  const scopedLogs = useMemo(() => {
    if (isSuperAdmin) return allLogs;
    return allLogs.filter(log => log.agentId === user?.id);
  }, [allLogs, isSuperAdmin, user?.id]);

  // ── Filter by search + type + status ────────────────────────────────────
  const filteredLogs = useMemo(() => {
    return scopedLogs.filter(log => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (log.clientName || '').toLowerCase().includes(q) ||
        (log.phone || '').toLowerCase().includes(q) ||
        (log.notes || '').toLowerCase().includes(q) ||
        (log.agentName || '').toLowerCase().includes(q);
      const matchType = typeFilter === 'all' || log.type === typeFilter;
      const matchStatus = statusFilter === 'all' || log.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [scopedLogs, search, typeFilter, statusFilter]);

  // ── Delete log ───────────────────────────────────────────────────────────
  const deleteLog = (id) => {
    setDb(prev => ({
      ...prev,
      ccCallLogs: (prev.ccCallLogs || []).filter(l => l.id !== id),
    }));
    logAction?.('Deleted call log', { id });
  };

  // ── Stat counts ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: scopedLogs.length,
    inbound: scopedLogs.filter(l => l.type === 'inbound').length,
    outbound: scopedLogs.filter(l => l.type === 'outbound').length,
    followUp: scopedLogs.filter(l => l.status === 'follow-up').length,
  }), [scopedLogs]);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--zinc-900)', margin: 0 }}>
            Call Logs
          </h1>
          {isSuperAdmin && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600, color: '#7c3aed',
              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 20, padding: '3px 10px',
            }}>
              <ShieldCheck size={12} /> Super Admin — all agents
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--zinc-500)', margin: 0 }}>
          {isSuperAdmin
            ? 'Viewing all call logs across every agent.'
            : 'Showing your call history only.'}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 28,
      }}>
        {[
          { label: 'Total Calls', value: stats.total, color: '#7c3aed' },
          { label: 'Inbound', value: stats.inbound, color: '#3b82f6' },
          { label: 'Outbound', value: stats.outbound, color: '#8b5cf6' },
          { label: 'Follow-ups', value: stats.followUp, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--zinc-500)', marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--zinc-400)',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isSuperAdmin ? 'Search by client, phone, agent…' : 'Search by client or phone…'}
            style={{
              width: '100%', paddingLeft: 36, paddingRight: 12,
              height: 38, borderRadius: 10,
              border: '1px solid var(--border)',
              fontSize: 13, color: 'var(--zinc-800)',
              background: '#fff', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{
            height: 38, padding: '0 12px', borderRadius: 10,
            border: '1px solid var(--border)', fontSize: 13,
            color: 'var(--zinc-700)', background: '#fff', cursor: 'pointer',
          }}
        >
          <option value="all">All Types</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            height: 38, padding: '0 12px', borderRadius: 10,
            border: '1px solid var(--border)', fontSize: 13,
            color: 'var(--zinc-700)', background: '#fff', cursor: 'pointer',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="follow-up">Follow-up</option>
          <option value="dropped">Dropped</option>
          <option value="closed">Closed</option>
        </select>

        <span style={{ fontSize: 12, color: 'var(--zinc-400)', marginLeft: 'auto' }}>
          {filteredLogs.length} result{filteredLogs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {filteredLogs.length === 0 ? (
          <EmptyState filtered={search || typeFilter !== 'all' || statusFilter !== 'all'} />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--zinc-50)', borderBottom: '1px solid var(--border)' }}>
                {[
                  'Client', 'Phone', 'Type', 'Status', 'Duration', 'Notes', 'Date',
                  ...(isSuperAdmin ? ['Agent'] : []),
                  '',
                ].map(h => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700,
                    color: 'var(--zinc-500)', letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredLogs.map((log, i) => {
                  const typeS = TYPE_STYLE[log.type] || TYPE_STYLE.outbound;
                  const statusS = STATUS_STYLE[log.status] || STATUS_STYLE.completed;
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18, delay: i * 0.03 }}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--zinc-50)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Client */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--zinc-900)' }}>
                          {log.clientName || '—'}
                        </div>
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontSize: 13, color: 'var(--zinc-600)', fontFamily: 'monospace' }}>
                          {log.phone || '—'}
                        </span>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '13px 16px' }}>
                        <Badge style={typeS} icon={typeS.icon} label={typeS.label} />
                      </td>

                      {/* Status */}
                      <td style={{ padding: '13px 16px' }}>
                        <Badge style={statusS} label={statusS.label} />
                      </td>

                      {/* Duration */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontSize: 13, color: 'var(--zinc-600)' }}>
                          {log.duration ? `${log.duration} min` : '—'}
                        </span>
                      </td>

                      {/* Notes */}
                      <td style={{ padding: '13px 16px', maxWidth: 220 }}>
                        <span style={{
                          fontSize: 12, color: 'var(--zinc-500)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {log.notes || '—'}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontSize: 12, color: 'var(--zinc-400)' }}>
                          {log.date
                            ? new Date(log.date).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </td>

                      {/* Agent column — Super Admin only */}
                      {isSuperAdmin && (
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{
                            fontSize: 12, fontWeight: 600,
                            color: log.agentName ? '#7c3aed' : 'var(--zinc-400)',
                          }}>
                            {log.agentName || 'Unknown'}
                          </span>
                        </td>
                      )}

                      {/* Delete */}
                      <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                        {(isSuperAdmin || log.agentId === user?.id) && (
                          <button
                            onClick={() => deleteLog(log.id)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--zinc-300)', padding: 6, borderRadius: 8,
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.color = '#ef4444';
                              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.color = 'var(--zinc-300)';
                              e.currentTarget.style.background = 'none';
                            }}
                            title="Delete log"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CallLogs;