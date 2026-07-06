import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, color = 'currentColor', fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  phone:    "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6L6 18M6 6l12 12",
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:    "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2",
  plus:     "M12 5v14M5 12h14",
  filter:   "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  search:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  clock:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  notes:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  chevron:  "M6 9l6 6 6-6",
  chevronLeft: "M15 18l-6-6 6-6",
  refresh:  "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  alert:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  done:     "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  phoneCall:"M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  shield:   "M12 2L4 5v5c0 5.25 3.5 10.15 8 11.35C16.5 20.15 20 15.25 20 10V5L12 2z",
  mapPin:   "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 13a3 3 0 100-6 3 3 0 000 6z",
};

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  bg:        '#F8FAFC',
  surface:   '#FFFFFF',
  border:    '#E2E8F0',
  borderFocus: '#6366F1',
  primary:   '#6366F1',
  text:      '#0F172A',
  textMid:   '#475569',
  textMuted: '#94A3B8',
  success:   '#10B981',
  warning:   '#F59E0B',
  danger:    '#EF4444',
  info:      '#3B82F6',
  purple:    '#8B5CF6',
  radius:    12,
  radiusSm:  8,
};

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: T.danger,   bg: '#FEF2F2', dot: '🔴' },
  medium: { label: 'Medium', color: T.warning,  bg: '#FFFBEB', dot: '🟡' },
  low:    { label: 'Low',    color: T.success,  bg: '#ECFDF5', dot: '🟢' },
};

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: T.warning,  bg: '#FFFBEB' },
  completed: { label: 'Completed', color: T.success,  bg: '#ECFDF5' },
  missed:    { label: 'Missed',    color: T.danger,   bg: '#FEF2F2' },
  rescheduled:{ label: 'Rescheduled', color: T.info,  bg: '#EFF6FF' },
};

const LEAD_STATUS_CONFIG = {
  'Interested':     { color: T.success,  bg: '#ECFDF5' },
  'Not Interested': { color: T.textMuted,bg: '#F8FAFC' },
  'Followup':       { color: '#8B5CF6',  bg: '#F5F3FF' },
  'Dropped':        { color: T.danger,   bg: '#FEF2F2' },
};

const VIEW_TABS = [
  { key: 'all',      label: 'All' },
  { key: 'previous', label: 'Previous' },
  { key: 'today',    label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
];

const EMPTY_TAB_COPY = {
  all:      { title: 'No follow-ups yet',        body: 'Add a follow-up to keep track of your client callbacks.' },
  previous: { title: 'No previous follow-ups',   body: 'Follow-ups will show up here once their due date has passed.' },
  today:    { title: 'Nothing due today',        body: "You're all caught up for today." },
  upcoming: { title: 'No upcoming follow-ups',   body: 'Add a follow-up with a future due date to see it here.' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Badge = ({ config }) => (
  <span style={{
    padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
    color: config.color, background: config.bg, display: 'inline-flex', alignItems: 'center', gap: 4,
  }}>{config.label}</span>
);

const Pill = ({ children, active, color, onClick }) => (
  <button onClick={onClick} style={{
    padding: '7px 16px', border: `1.5px solid ${active ? color : T.border}`,
    borderRadius: 999, fontSize: 13, fontWeight: 600,
    background: active ? `${color}12` : T.surface,
    color: active ? color : T.textMid, cursor: 'pointer', transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  }}>{children}</button>
);

const Input = ({ style, ...props }) => (
  <input {...props} style={{
    width: '100%', padding: '10px 13px',
    border: `1.5px solid ${T.border}`, borderRadius: T.radiusSm,
    fontSize: 14, color: T.text, background: T.surface,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', ...style,
  }} />
);

const Select = ({ children, style, ...props }) => (
  <select {...props} style={{
    width: '100%', padding: '10px 13px',
    border: `1.5px solid ${T.border}`, borderRadius: T.radiusSm,
    fontSize: 14, color: T.text, background: T.surface,
    outline: 'none', boxSizing: 'border-box', appearance: 'none',
    cursor: 'pointer', fontFamily: 'inherit', ...style,
  }}>{children}</select>
);

const Textarea = ({ style, ...props }) => (
  <textarea {...props} style={{
    width: '100%', padding: '10px 13px',
    border: `1.5px solid ${T.border}`, borderRadius: T.radiusSm,
    fontSize: 14, color: T.text, background: T.surface,
    outline: 'none', boxSizing: 'border-box', resize: 'vertical',
    minHeight: 80, fontFamily: 'inherit', ...style,
  }} />
);

const StatCard = ({ label, value, color, bg }) => (
  <div style={{
    flex: 1, padding: '16px 20px', background: bg || T.surface,
    border: `1px solid ${T.border}`, borderRadius: T.radius, textAlign: 'center',
  }}>
    <div style={{ fontSize: 26, fontWeight: 800, color: color || T.text }}>{value}</div>
    <div style={{ fontSize: 12.5, color: T.textMuted, marginTop: 3, fontWeight: 500 }}>{label}</div>
  </div>
);

const ViewTabs = ({ active, counts, onChange }) => (
  <div style={{ display: 'flex', gap: 4, borderBottom: `1.5px solid ${T.border}`, marginBottom: 20 }}>
    {VIEW_TABS.map(t => {
      const isActive = active === t.key;
      return (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            padding: '10px 2px 11px', marginRight: 28, background: 'none', border: 'none',
            borderBottom: `2.5px solid ${isActive ? T.primary : 'transparent'}`,
            color: isActive ? T.primary : T.textMid, fontWeight: 700, fontSize: 14,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          {t.label}
          <span style={{
            background: isActive ? `${T.primary}15` : '#F1F5F9',
            color: isActive ? T.primary : T.textMuted,
            fontSize: 12, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
            minWidth: 18, textAlign: 'center',
          }}>{counts[t.key] ?? 0}</span>
        </button>
      );
    })}
  </div>
);

// ─── Add / Edit Modal (follow-up) ─────────────────────────────────────────────
const FollowUpModal = ({ initial, clients, onSave, onClose }) => {
  const [form, setForm] = useState(initial || {
    clientName: '', clientPhone: '', dueDate: '', priority: 'medium',
    note: '', status: 'pending',
  });
  const [clientSearch, setClientSearch] = useState(initial?.clientName || '');
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = useMemo(() => {
    if (!clientSearch.trim()) return (clients || []).slice(0, 6);
    const q = clientSearch.toLowerCase();
    return (clients || []).filter(c =>
      (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q)
    ).slice(0, 6);
  }, [clients, clientSearch]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.clientName || !form.dueDate) return;
    onSave(form);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: T.surface, borderRadius: 16, width: '100%', maxWidth: 520,
          boxShadow: '0 24px 80px rgba(0,0,0,0.15)', overflow: 'hidden',
        }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.text }}>
              {initial ? 'Edit Follow-up' : 'Add Follow-up'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: T.textMuted }}>
              {initial ? 'Update the details for this follow-up.' : 'Schedule a follow-up for a client.'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}>
            <Icon d={ICONS.x} size={16} color={T.textMid} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Client *</div>
            <div style={{ position: 'relative' }}>
              <input
                value={clientSearch}
                onChange={e => { setClientSearch(e.target.value); set('clientName', e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search or type client name…"
                style={{
                  width: '100%', padding: '10px 13px',
                  border: `1.5px solid ${T.border}`, borderRadius: T.radiusSm,
                  fontSize: 14, color: T.text, background: T.surface,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
              {showDropdown && filtered.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: T.radiusSm, boxShadow: '0 8px 24px rgba(0,0,0,0.09)',
                  marginTop: 4, overflow: 'hidden',
                }}>
                  {filtered.map(c => (
                    <div key={c.id} onClick={() => {
                      setForm(p => ({ ...p, clientName: c.name, clientPhone: c.phone || '' }));
                      setClientSearch(c.name);
                      setShowDropdown(false);
                    }} style={{
                      padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${T.border}`,
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: `${T.primary}15`, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 12, fontWeight: 700, color: T.primary,
                      }}>{c.name[0]}</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: T.textMuted }}>{c.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {(clients || []).length === 0 && (
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6 }}>
                No clients assigned to you yet — take a call from New Calls first, or type a name manually.
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Phone</div>
            <Input value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} placeholder="01XXXXXXXXX" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Due Date *</div>
              <Input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Priority</div>
              <Select value={form.priority} onChange={e => set('priority', e.target.value)}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </Select>
            </div>
          </div>

          {initial && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Status</div>
              <Select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="pending">⏳ Pending</option>
                <option value="completed">✅ Completed</option>
                <option value="missed">❌ Missed</option>
                <option value="rescheduled">🔄 Rescheduled</option>
              </Select>
            </div>
          )}

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Note</div>
            <Textarea value={form.note} onChange={e => set('note', e.target.value)} placeholder="What to discuss, key points to cover, client preferences…" />
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px 0', border: `1.5px solid ${T.border}`,
              borderRadius: T.radiusSm, background: T.surface, color: T.textMid,
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={handleSave} disabled={!form.clientName || !form.dueDate} style={{
              flex: 2, padding: '11px 0', border: 'none',
              borderRadius: T.radiusSm,
              background: (!form.clientName || !form.dueDate) ? '#CBD5E1' : T.primary,
              color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: (!form.clientName || !form.dueDate) ? 'not-allowed' : 'pointer',
            }}>
              {initial ? 'Save Changes' : 'Add Follow-up'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Schedule Visit Modal (NEW) ────────────────────────────────────────────────
// Compact modal reachable straight from a follow-up card. Pre-fills the client
// snapshot from the follow-up so the agent doesn't retype anything.
const ScheduleVisitModal = ({ fu, onSave, onClose }) => {
  const [form, setForm] = useState({
    scheduledDate: '', scheduledTime: '',
    location: fu.location || '', address: fu.address || '',
    propertyType: fu.propertyType || '', notes: '',
  });
  const [alsoComplete, setAlsoComplete] = useState(fu.status === 'pending');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.scheduledDate) return;
    onSave(form, alsoComplete);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: T.surface, borderRadius: 16, width: '100%', maxWidth: 460,
          boxShadow: '0 24px 80px rgba(0,0,0,0.15)', overflow: 'hidden',
        }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.text }}>Schedule Visit</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: T.textMuted }}>
              Book a site visit for <strong>{fu.clientName}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}>
            <Icon d={ICONS.x} size={16} color={T.textMid} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Date *</div>
              <Input type="date" value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Time</div>
              <Input type="time" value={form.scheduledTime} onChange={e => set('scheduledTime', e.target.value)} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Site Address</div>
            <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full site address" />
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Notes</div>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="What to show, client preferences…" style={{ minHeight: 64 }} />
          </div>

          {fu.status === 'pending' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.textMid, cursor: 'pointer' }}>
              <input type="checkbox" checked={alsoComplete} onChange={e => setAlsoComplete(e.target.checked)} />
              Also mark this follow-up as completed
            </label>
          )}

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px 0', border: `1.5px solid ${T.border}`,
              borderRadius: T.radiusSm, background: T.surface, color: T.textMid,
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={handleSave} disabled={!form.scheduledDate} style={{
              flex: 2, padding: '11px 0', border: 'none',
              borderRadius: T.radiusSm,
              background: !form.scheduledDate ? '#CBD5E1' : T.primary,
              color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: !form.scheduledDate ? 'not-allowed' : 'pointer',
            }}>
              Schedule Visit
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Call context block ────────────────────────────────────────────────────────
const CallContext = ({ fu, expanded, onToggle }) => {
  const hasCallInfo = fu.callOutcome || fu.callNote || fu.offer || fu.leadStatus;
  const hasClientInfo = fu.email || fu.company || fu.address || fu.location || fu.budgetMin || fu.budgetMax || fu.propertyType || fu.source;

  if (!hasCallInfo && !hasClientInfo) return null;

  const leadCfg = LEAD_STATUS_CONFIG[fu.leadStatus];

  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={onToggle} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        cursor: 'pointer', padding: '4px 0', fontSize: 12.5, fontWeight: 700, color: T.primary,
      }}>
        <Icon d={ICONS.phoneCall} size={13} color={T.primary} />
        {expanded ? 'Hide call details' : 'Show call details'}
        <span style={{ display: 'inline-flex', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
          <Icon d={ICONS.chevron} size={12} color={T.primary} />
        </span>
      </button>

      {expanded && (
        <div style={{
          marginTop: 8, padding: '12px 14px', background: '#F8FAFC',
          border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {(fu.callOutcome || fu.callMethod || fu.leadStatus || fu.offer) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {fu.callOutcome && (
                <span style={{ fontSize: 12, fontWeight: 600, color: T.textMid, background: '#fff',
                  border: `1px solid ${T.border}`, borderRadius: 999, padding: '3px 10px' }}>
                  📞 {fu.callOutcome}
                </span>
              )}
              {fu.callMethod && (
                <span style={{ fontSize: 12, fontWeight: 600, color: T.textMid, background: '#fff',
                  border: `1px solid ${T.border}`, borderRadius: 999, padding: '3px 10px' }}>
                  via {fu.callMethod}
                </span>
              )}
              {fu.leadStatus && leadCfg && (
                <span style={{ fontSize: 12, fontWeight: 700, color: leadCfg.color, background: leadCfg.bg,
                  border: `1px solid ${leadCfg.color}40`, borderRadius: 999, padding: '3px 10px' }}>
                  {fu.leadStatus}
                </span>
              )}
              {fu.offer && (
                <span style={{ fontSize: 12, fontWeight: 600, color: '#92400E', background: '#FFFBEB',
                  border: `1px solid #FDE68A`, borderRadius: 999, padding: '3px 10px' }}>
                  🎁 {fu.offer}
                </span>
              )}
            </div>
          )}

          {fu.callNote && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                Note from call
              </div>
              <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.5 }}>{fu.callNote}</div>
            </div>
          )}

          {hasClientInfo && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>
                Client details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                {fu.propertyType && <div style={{ fontSize: 13, color: T.textMid }}>Property: <span style={{ color: T.text, fontWeight: 600 }}>{fu.propertyType}</span></div>}
                {fu.source && <div style={{ fontSize: 13, color: T.textMid }}>Source: <span style={{ color: T.text, fontWeight: 600 }}>{fu.source}</span></div>}
                {fu.email && <div style={{ fontSize: 13, color: T.textMid }}>Email: <span style={{ color: T.text, fontWeight: 600 }}>{fu.email}</span></div>}
                {fu.company && <div style={{ fontSize: 13, color: T.textMid }}>Company: <span style={{ color: T.text, fontWeight: 600 }}>{fu.company}</span></div>}
                {(fu.budgetMin || fu.budgetMax) && <div style={{ fontSize: 13, color: T.textMid }}>Budget: <span style={{ color: T.text, fontWeight: 600 }}>{fu.budgetMin || '0'} – {fu.budgetMax || '0'}</span></div>}
                {fu.location && <div style={{ fontSize: 13, color: T.textMid }}>Location: <span style={{ color: T.text, fontWeight: 600 }}>{fu.location}</span></div>}
                {fu.address && <div style={{ fontSize: 13, color: T.textMid, gridColumn: '1/-1' }}>Address: <span style={{ color: T.text, fontWeight: 600 }}>{fu.address}</span></div>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Follow-up Card ───────────────────────────────────────────────────────────
const FUCard = ({ fu, onEdit, onDelete, onMarkDone, onMarkMissed, onScheduleVisit, showAgent }) => {
  const [expanded, setExpanded] = useState(false);
  const [callExpanded, setCallExpanded] = useState(false);
  const pc = PRIORITY_CONFIG[fu.priority] || PRIORITY_CONFIG.medium;
  const sc = STATUS_CONFIG[fu.status] || STATUS_CONFIG.pending;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = fu.status === 'pending' && fu.dueDate < today;
  const isSiteVisitType = fu.followupType === 'Site Visit';

  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: T.surface, border: `1.5px solid ${overdue ? '#FCA5A5' : T.border}`,
        borderRadius: T.radius, overflow: 'hidden',
        boxShadow: overdue ? '0 0 0 3px #FEE2E2' : 'none',
      }}>

      <div style={{ height: 3, background: pc.color, width: '100%' }} />

      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: `${T.primary}15`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 15, fontWeight: 800, color: T.primary,
            }}>
              {(fu.clientName || '?')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fu.clientName}
              </div>
              <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>
                {fu.clientPhone || 'No phone'}
                {fu.agentName && <span style={{ marginLeft: 8, color: T.textMuted }}>· {fu.agentName}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {showAgent && fu.agentName && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: T.purple, background: '#F5F3FF',
                border: `1px solid ${T.purple}30`, borderRadius: 999, padding: '3px 9px',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Icon d={ICONS.shield} size={10} color={T.purple} /> {fu.agentName}
              </span>
            )}
            <Badge config={sc} />
            <Badge config={pc} />
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Icon d={ICONS.calendar} size={14} color={overdue ? T.danger : T.textMuted} />
          <span style={{ fontSize: 13, fontWeight: 600, color: overdue ? T.danger : T.textMid }}>
            {overdue ? '⚠ Overdue · ' : ''}Due {fu.dueDate}
          </span>
          {fu.followupType && (
            <span style={{ fontSize: 11.5, color: T.textMuted, marginLeft: 4 }}>· {fu.followupType}</span>
          )}
          {isSiteVisitType && !fu.visitScheduled && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: T.info, background: '#EFF6FF',
              border: `1px solid ${T.info}30`, borderRadius: 999, padding: '2px 9px', marginLeft: 4,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <Icon d={ICONS.mapPin} size={10} color={T.info} /> Site visit requested
            </span>
          )}
        </div>

        {fu.note && (
          <div style={{
            marginTop: 10, padding: '10px 12px', background: '#F8FAFC',
            borderRadius: T.radiusSm, fontSize: 13.5, color: T.textMid, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{fu.note}</div>
        )}
        {fu.note && fu.note.length > 80 && (
          <button onClick={() => setExpanded(v => !v)} style={{
            marginTop: 4, background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12.5, color: T.primary, fontWeight: 600, padding: '2px 0',
          }}>{expanded ? 'Show less' : 'Show more'}</button>
        )}

        <CallContext fu={fu} expanded={callExpanded} onToggle={() => setCallExpanded(v => !v)} />

        {fu.status === 'pending' && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => onMarkDone(fu.id)} style={{
              padding: '8px 16px', background: '#ECFDF5', color: T.success,
              border: `1.5px solid ${T.success}40`, borderRadius: T.radiusSm,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon d={ICONS.done} size={13} color={T.success} /> Mark Done
            </button>
            <button onClick={() => onMarkMissed(fu.id)} style={{
              padding: '8px 16px', background: '#FEF2F2', color: T.danger,
              border: `1.5px solid ${T.danger}40`, borderRadius: T.radiusSm,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon d={ICONS.x} size={13} color={T.danger} /> Missed
            </button>
            <button onClick={() => onScheduleVisit(fu)} style={{
              padding: '8px 16px', background: '#EFF6FF', color: T.info,
              border: `1.5px solid ${T.info}40`, borderRadius: T.radiusSm,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon d={ICONS.mapPin} size={13} color={T.info} /> Schedule Visit
            </button>
            <button onClick={() => onEdit(fu)} style={{
              padding: '8px 16px', background: '#F1F5F9', color: T.textMid,
              border: `1.5px solid ${T.border}`, borderRadius: T.radiusSm,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon d={ICONS.edit} size={13} color={T.textMid} /> Edit
            </button>
            <button onClick={() => onDelete(fu.id)} style={{
              padding: '8px 16px', background: '#FEF2F2', color: T.danger,
              border: `1.5px solid ${T.danger}30`, borderRadius: T.radiusSm,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon d={ICONS.trash} size={13} color={T.danger} />
            </button>
          </div>
        )}

        {fu.status !== 'pending' && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => onScheduleVisit(fu)} style={{
              padding: '7px 14px', background: '#EFF6FF', color: T.info,
              border: `1px solid ${T.info}30`, borderRadius: T.radiusSm,
              fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Icon d={ICONS.mapPin} size={13} color={T.info} /> Schedule Visit
            </button>
            <button onClick={() => onEdit(fu)} style={{
              padding: '7px 14px', background: '#F1F5F9', color: T.textMid,
              border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
              fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Icon d={ICONS.edit} size={13} color={T.textMid} /> Edit
            </button>
            <button onClick={() => onDelete(fu.id)} style={{
              padding: '7px 14px', background: '#FEF2F2', color: T.danger,
              border: `1px solid ${T.danger}30`, borderRadius: T.radiusSm,
              fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Icon d={ICONS.trash} size={13} color={T.danger} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const FollowUp = ({ db, setDb, logAction, user, setView }) => {
  const allFollowUps = db?.followUps || [];
  const allClients   = db?.clients   || [];

  const isSuperAdmin = user?.role === 'superadmin';
  const myAgentId    = user?.id;
  const myAgentName  = user?.name || 'Agent';

  const followUps = useMemo(() => {
    if (isSuperAdmin) return allFollowUps;
    return allFollowUps.filter(f => f.agentId === myAgentId);
  }, [allFollowUps, isSuperAdmin, myAgentId]);

  const clients = useMemo(() => {
    if (isSuperAdmin) return allClients;
    return allClients.filter(c => c.assignedAgentId === myAgentId);
  }, [allClients, isSuperAdmin, myAgentId]);

  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy]       = useState('due_asc');
  const [viewTab, setViewTab]     = useState('all');
  const [modal, setModal]         = useState(null); // null | { mode: 'add'|'edit', data? }
  const [visitModalFor, setVisitModalFor] = useState(null); // NEW: follow-up currently scheduling a visit for

  const today = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => ({
    total:     followUps.length,
    pending:   followUps.filter(f => f.status === 'pending').length,
    overdue:   followUps.filter(f => f.status === 'pending' && f.dueDate < today).length,
    dueToday:  followUps.filter(f => f.status === 'pending' && f.dueDate === today).length,
    completed: followUps.filter(f => f.status === 'completed').length,
  }), [followUps, today]);

  const tabCounts = useMemo(() => ({
    all:      followUps.length,
    previous: followUps.filter(f => f.dueDate < today).length,
    today:    followUps.filter(f => f.dueDate === today).length,
    upcoming: followUps.filter(f => f.dueDate > today).length,
  }), [followUps, today]);

  const visible = useMemo(() => {
    let list = [...followUps];

    if (viewTab === 'previous') list = list.filter(f => f.dueDate < today);
    else if (viewTab === 'today') list = list.filter(f => f.dueDate === today);
    else if (viewTab === 'upcoming') list = list.filter(f => f.dueDate > today);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        (f.clientName || '').toLowerCase().includes(q) ||
        (f.clientPhone || '').includes(q) ||
        (f.note || '').toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') list = list.filter(f => f.status === filterStatus);
    if (filterPriority !== 'all') list = list.filter(f => f.priority === filterPriority);

    list.sort((a, b) => {
      if (sortBy === 'due_asc')  return (a.dueDate || '').localeCompare(b.dueDate || '');
      if (sortBy === 'due_desc') return (b.dueDate || '').localeCompare(a.dueDate || '');
      if (sortBy === 'name')     return (a.clientName || '').localeCompare(b.clientName || '');
      if (sortBy === 'priority') {
        const o = { high: 0, medium: 1, low: 2 };
        return (o[a.priority] ?? 1) - (o[b.priority] ?? 1);
      }
      return 0;
    });
    return list;
  }, [followUps, search, filterStatus, filterPriority, sortBy, viewTab, today]);

  const handleTabChange = (key) => {
    setViewTab(key);
    if (key === 'previous') setSortBy('due_desc');
    else if (key === 'upcoming') setSortBy('due_asc');
  };

  const updateFU = (id, patch) => {
    setDb(prev => ({
      ...prev,
      followUps: (prev.followUps || []).map(f => f.id === id ? { ...f, ...patch } : f),
    }));
  };

  const handleMarkDone = (id) => {
    updateFU(id, { status: 'completed', completedAt: new Date().toISOString() });
    logAction?.('Completed follow-up', 'followup', id);
  };

  const handleMarkMissed = (id) => {
    updateFU(id, { status: 'missed' });
    logAction?.('Marked follow-up missed', 'followup', id);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this follow-up?')) return;
    setDb(prev => ({
      ...prev,
      followUps: (prev.followUps || []).filter(f => f.id !== id),
    }));
    logAction?.('Deleted follow-up', 'followup', id);
  };

  const handleSave = (form) => {
    if (modal.mode === 'add') {
      const entry = {
        ...form,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        agentId: myAgentId,
        agentName: myAgentName,
        createdBy: myAgentName,
        status: 'pending',
      };
      setDb(prev => ({ ...prev, followUps: [entry, ...(prev.followUps || [])] }));
      logAction?.('Added follow-up', 'followup', form.clientName);
    } else {
      updateFU(modal.data.id, form);
      logAction?.('Edited follow-up', 'followup', form.clientName);
    }
    setModal(null);
  };

  // NEW: create a visit from a follow-up card, carrying over the client snapshot
  const handleScheduleVisit = (visitForm, alsoComplete) => {
    const fu = visitModalFor;
    const entry = {
      clientName: fu.clientName,
      clientPhone: fu.clientPhone,
      propertyType: visitForm.propertyType || fu.propertyType || '',
      location: visitForm.location || fu.location || '',
      address: visitForm.address || fu.address || '',
      scheduledDate: visitForm.scheduledDate,
      scheduledTime: visitForm.scheduledTime,
      notes: visitForm.notes,
      status: 'upcoming',
      id: Date.now(),
      createdAt: new Date().toISOString(),
      agentId: myAgentId,
      agentName: myAgentName,
      createdBy: myAgentName,
      source: 'followup',
      followUpId: fu.id,
    };
    setDb(prev => ({
      ...prev,
      visits: [entry, ...(prev.visits || [])],
      followUps: (prev.followUps || []).map(f => f.id === fu.id
        ? { ...f, visitScheduled: true, ...(alsoComplete ? { status: 'completed', completedAt: new Date().toISOString() } : {}) }
        : f
      ),
    }));
    logAction?.('Scheduled visit from follow-up', 'visit', fu.clientName);
    setVisitModalFor(null);
  };

  const emptyCopy = EMPTY_TAB_COPY[viewTab] || EMPTY_TAB_COPY.all;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {typeof setView === 'function' && (
        <button onClick={() => setView('call_center')} style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
          padding: 0, marginBottom: 14, cursor: 'pointer', color: T.textMid,
          fontSize: 13.5, fontWeight: 600,
        }}>
          <Icon d={ICONS.chevronLeft} size={15} color={T.textMid} /> Call Center
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: 0 }}>Follow-ups</h1>
            {isSuperAdmin && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: T.purple, background: '#F5F3FF',
                border: `1px solid ${T.purple}30`, borderRadius: 999, padding: '3px 10px',
              }}>
                Super Admin — viewing all agents
              </span>
            )}
          </div>
          <p style={{ color: T.textMuted, fontSize: 14.5, margin: '5px 0 0' }}>
            {isSuperAdmin
              ? 'Track pending follow-ups across every agent.'
              : 'Track and manage your pending client follow-ups. Stay on top of every lead.'}
          </p>
        </div>
        <button onClick={() => setModal({ mode: 'add' })} style={{
          padding: '11px 22px', background: T.primary, color: '#fff',
          border: 'none', borderRadius: T.radiusSm, fontWeight: 700, fontSize: 14,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Icon d={ICONS.plus} size={16} color="#fff" /> Add Follow-up
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total" value={stats.total} color={T.text} />
        <StatCard label="Pending" value={stats.pending} color={T.warning} bg="#FFFBEB" />
        <StatCard label="Overdue" value={stats.overdue} color={T.danger} bg="#FEF2F2" />
        <StatCard label="Due Today" value={stats.dueToday} color={T.info} bg="#EFF6FF" />
        <StatCard label="Completed" value={stats.completed} color={T.success} bg="#ECFDF5" />
      </div>

      <ViewTabs active={viewTab} counts={tabCounts} onChange={handleTabChange} />

      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: T.radius, padding: '14px 18px', marginBottom: 20,
        display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, note…"
            style={{
              width: '100%', padding: '9px 12px 9px 34px',
              border: `1.5px solid ${T.border}`, borderRadius: T.radiusSm,
              fontSize: 14, color: T.text, background: T.bg,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <Icon d={ICONS.search} size={15} color={T.textMuted} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['all','pending','completed','missed','rescheduled'].map(s => (
            <Pill key={s} active={filterStatus === s} color={T.primary}
              onClick={() => setFilterStatus(s)}>
              {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Pill>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['all','high','medium','low'].map(p => (
            <Pill key={p}
              active={filterPriority === p}
              color={p === 'all' ? T.primary : (PRIORITY_CONFIG[p]?.color || T.primary)}
              onClick={() => setFilterPriority(p)}>
              {p === 'all' ? 'All Priority' : `${PRIORITY_CONFIG[p]?.dot} ${PRIORITY_CONFIG[p]?.label}`}
            </Pill>
          ))}
        </div>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          padding: '9px 12px', border: `1.5px solid ${T.border}`,
          borderRadius: T.radiusSm, fontSize: 13.5, color: T.textMid,
          background: T.bg, outline: 'none', appearance: 'none', cursor: 'pointer',
        }}>
          <option value="due_asc">Due: Soonest</option>
          <option value="due_desc">Due: Latest</option>
          <option value="priority">Priority</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: T.text, margin: '0 0 8px' }}>
            {followUps.length === 0
              ? emptyCopy.title
              : tabCounts[viewTab] === 0
                ? emptyCopy.title
                : 'No results match your filters'}
          </h3>
          <p style={{ color: T.textMuted, fontSize: 14, margin: '0 0 20px' }}>
            {followUps.length === 0
              ? emptyCopy.body
              : tabCounts[viewTab] === 0
                ? emptyCopy.body
                : 'Try adjusting your search or filter.'}
          </p>
          {followUps.length === 0 && (
            <button onClick={() => setModal({ mode: 'add' })} style={{
              padding: '10px 24px', background: T.primary, color: '#fff',
              border: 'none', borderRadius: T.radiusSm, fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>Add First Follow-up</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {visible.map(fu => (
              <FUCard
                key={fu.id} fu={fu}
                showAgent={isSuperAdmin}
                onEdit={data => setModal({ mode: 'edit', data })}
                onDelete={handleDelete}
                onMarkDone={handleMarkDone}
                onMarkMissed={handleMarkMissed}
                onScheduleVisit={setVisitModalFor}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <FollowUpModal
            initial={modal.data}
            clients={clients}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visitModalFor && (
          <ScheduleVisitModal
            fu={visitModalFor}
            onSave={handleScheduleVisit}
            onClose={() => setVisitModalFor(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default FollowUp;