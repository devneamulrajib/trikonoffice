import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, color = 'currentColor', fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  mapPin:   "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 13a3 3 0 100-6 3 3 0 000 6z",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  clock:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6L6 18M6 6l12 12",
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:    "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2",
  plus:     "M12 5v14M5 12h14",
  search:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  chevron:  "M6 9l6 6 6-6",
  chevronLeft: "M15 18l-6-6 6-6",
  done:     "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  shield:   "M12 2L4 5v5c0 5.25 3.5 10.15 8 11.35C16.5 20.15 20 15.25 20 10V5L12 2z",
  phoneCall:"M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
};

// ─── Tokens (matches FollowUp.jsx) ────────────────────────────────────────────
const T = {
  bg:        '#F8FAFC',
  surface:   '#FFFFFF',
  border:    '#E2E8F0',
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

const STATUS_CONFIG = {
  upcoming:    { label: 'Upcoming',    color: T.info,    bg: '#EFF6FF' },
  completed:   { label: 'Completed',   color: T.success, bg: '#ECFDF5' },
  missed:      { label: 'Missed',      color: T.danger,  bg: '#FEF2F2' },
  rescheduled: { label: 'Rescheduled', color: T.warning, bg: '#FFFBEB' },
};

const OUTCOME_OPTIONS = ['Very Interested', 'Interested', 'Neutral', 'Not Interested'];

const VIEW_TABS = [
  { key: 'all',      label: 'All' },
  { key: 'previous', label: 'Previous' },
  { key: 'today',    label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
];

const EMPTY_TAB_COPY = {
  all:      { title: 'No visits yet',        body: 'Schedule a site visit for a client to get started.' },
  previous: { title: 'No past visits',       body: 'Visits will show up here once their date has passed.' },
  today:    { title: 'No visits today',      body: "Nothing scheduled for today." },
  upcoming: { title: 'No upcoming visits',   body: 'Schedule a visit with a future date to see it here.' },
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

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
const VisitModal = ({ initial, clients, onSave, onClose }) => {
  const [form, setForm] = useState(initial || {
    clientName: '', clientPhone: '', propertyType: '', location: '', address: '',
    scheduledDate: '', scheduledTime: '', notes: '', status: 'upcoming',
    outcome: '', outcomeNotes: '',
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
    if (!form.clientName || !form.scheduledDate) return;
    onSave(form);
  };

  const isCompleted = form.status === 'completed';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: T.surface, borderRadius: 16, width: '100%', maxWidth: 540,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
        }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.text }}>
              {initial ? 'Edit Visit' : 'Schedule Visit'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: T.textMuted }}>
              {initial ? 'Update the details for this visit.' : 'Book a site visit for a client.'}
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
                      setForm(p => ({
                        ...p, clientName: c.name, clientPhone: c.phone || '',
                        propertyType: c.propertyType || p.propertyType,
                        location: c.location || p.location, address: c.address || p.address,
                      }));
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
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Date *</div>
              <Input type="date" value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Time</div>
              <Input type="time" value={form.scheduledTime} onChange={e => set('scheduledTime', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Property Type</div>
              <Input value={form.propertyType} onChange={e => set('propertyType', e.target.value)} placeholder="Apartment, Villa…" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Location</div>
              <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Gulshan, Dhaka" />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Site Address</div>
            <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full site address" />
          </div>

          {initial && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Status</div>
              <Select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="upcoming">📅 Upcoming</option>
                <option value="completed">✅ Completed</option>
                <option value="missed">❌ Missed</option>
                <option value="rescheduled">🔄 Rescheduled</option>
              </Select>
            </div>
          )}

          {isCompleted && (
            <>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Client Reaction</div>
                <Select value={form.outcome} onChange={e => set('outcome', e.target.value)}>
                  <option value="">— Not specified —</option>
                  {OUTCOME_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </Select>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Visit Outcome Notes</div>
                <Textarea value={form.outcomeNotes} onChange={e => set('outcomeNotes', e.target.value)} placeholder="What happened on-site, next steps…" />
              </div>
            </>
          )}

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMid, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Notes</div>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="What to show, client preferences, prep needed…" />
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px 0', border: `1.5px solid ${T.border}`,
              borderRadius: T.radiusSm, background: T.surface, color: T.textMid,
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={handleSave} disabled={!form.clientName || !form.scheduledDate} style={{
              flex: 2, padding: '11px 0', border: 'none',
              borderRadius: T.radiusSm,
              background: (!form.clientName || !form.scheduledDate) ? '#CBD5E1' : T.primary,
              color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: (!form.clientName || !form.scheduledDate) ? 'not-allowed' : 'pointer',
            }}>
              {initial ? 'Save Changes' : 'Schedule Visit'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Visit Card ───────────────────────────────────────────────────────────────
const VisitCard = ({ v, onEdit, onDelete, onMarkDone, onMarkMissed, showAgent }) => {
  const [expanded, setExpanded] = useState(false);
  const sc = STATUS_CONFIG[v.status] || STATUS_CONFIG.upcoming;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = v.status === 'upcoming' && v.scheduledDate < today;

  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: T.surface, border: `1.5px solid ${overdue ? '#FCA5A5' : T.border}`,
        borderRadius: T.radius, overflow: 'hidden',
        boxShadow: overdue ? '0 0 0 3px #FEE2E2' : 'none',
      }}>
      <div style={{ height: 3, background: T.info, width: '100%' }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: `${T.info}15`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 15, fontWeight: 800, color: T.info,
            }}>
              {(v.clientName || '?')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {v.clientName}
              </div>
              <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>
                {v.clientPhone || 'No phone'}
                {v.agentName && <span style={{ marginLeft: 8, color: T.textMuted }}>· {v.agentName}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {showAgent && v.agentName && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: T.purple, background: '#F5F3FF',
                border: `1px solid ${T.purple}30`, borderRadius: 999, padding: '3px 9px',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Icon d={ICONS.shield} size={10} color={T.purple} /> {v.agentName}
              </span>
            )}
            <Badge config={sc} />
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon d={ICONS.calendar} size={14} color={overdue ? T.danger : T.textMuted} />
            <span style={{ fontSize: 13, fontWeight: 600, color: overdue ? T.danger : T.textMid }}>
              {overdue ? '⚠ Overdue · ' : ''}{v.scheduledDate}
            </span>
          </div>
          {v.scheduledTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon d={ICONS.clock} size={14} color={T.textMuted} />
              <span style={{ fontSize: 13, color: T.textMid }}>{v.scheduledTime}</span>
            </div>
          )}
          {v.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon d={ICONS.mapPin} size={14} color={T.textMuted} />
              <span style={{ fontSize: 13, color: T.textMid }}>{v.location}</span>
            </div>
          )}
          {v.propertyType && (
            <span style={{ fontSize: 11.5, color: T.textMuted }}>· {v.propertyType}</span>
          )}
        </div>

        {v.notes && (
          <div style={{
            marginTop: 10, padding: '10px 12px', background: '#F8FAFC',
            borderRadius: T.radiusSm, fontSize: 13.5, color: T.textMid, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{v.notes}</div>
        )}
        {v.notes && v.notes.length > 80 && (
          <button onClick={() => setExpanded(e => !e)} style={{
            marginTop: 4, background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12.5, color: T.primary, fontWeight: 600, padding: '2px 0',
          }}>{expanded ? 'Show less' : 'Show more'}</button>
        )}

        {v.status === 'completed' && (v.outcome || v.outcomeNotes) && (
          <div style={{
            marginTop: 10, padding: '10px 12px', background: '#ECFDF5',
            border: `1px solid ${T.success}30`, borderRadius: T.radiusSm,
          }}>
            {v.outcome && (
              <div style={{ fontSize: 12.5, fontWeight: 700, color: T.success, marginBottom: v.outcomeNotes ? 4 : 0 }}>
                {v.outcome}
              </div>
            )}
            {v.outcomeNotes && <div style={{ fontSize: 13, color: T.textMid }}>{v.outcomeNotes}</div>}
          </div>
        )}

        {v.followUpId && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon d={ICONS.phoneCall} size={12} color={T.textMuted} />
            <span style={{ fontSize: 11.5, color: T.textMuted }}>Scheduled from a follow-up</span>
          </div>
        )}

        {v.status === 'upcoming' && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => onMarkDone(v.id)} style={{
              padding: '8px 16px', background: '#ECFDF5', color: T.success,
              border: `1.5px solid ${T.success}40`, borderRadius: T.radiusSm,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon d={ICONS.done} size={13} color={T.success} /> Mark Completed
            </button>
            <button onClick={() => onMarkMissed(v.id)} style={{
              padding: '8px 16px', background: '#FEF2F2', color: T.danger,
              border: `1.5px solid ${T.danger}40`, borderRadius: T.radiusSm,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon d={ICONS.x} size={13} color={T.danger} /> Missed
            </button>
            <button onClick={() => onEdit(v)} style={{
              padding: '8px 16px', background: '#EFF6FF', color: T.info,
              border: `1.5px solid ${T.info}40`, borderRadius: T.radiusSm,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon d={ICONS.edit} size={13} color={T.info} /> Edit
            </button>
            <button onClick={() => onDelete(v.id)} style={{
              padding: '8px 16px', background: '#FEF2F2', color: T.danger,
              border: `1.5px solid ${T.danger}30`, borderRadius: T.radiusSm,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon d={ICONS.trash} size={13} color={T.danger} />
            </button>
          </div>
        )}

        {v.status !== 'upcoming' && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <button onClick={() => onEdit(v)} style={{
              padding: '7px 14px', background: '#F1F5F9', color: T.textMid,
              border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
              fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Icon d={ICONS.edit} size={13} color={T.textMid} /> Edit
            </button>
            <button onClick={() => onDelete(v.id)} style={{
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
const Visit = ({ db, setDb, logAction, user, setView }) => {
  const allVisits  = db?.visits  || [];
  const allClients = db?.clients || [];

  const isSuperAdmin = user?.role === 'superadmin';
  const myAgentId    = user?.id;
  const myAgentName  = user?.name || 'Agent';

  const visits = useMemo(() => {
    if (isSuperAdmin) return allVisits;
    return allVisits.filter(v => v.agentId === myAgentId);
  }, [allVisits, isSuperAdmin, myAgentId]);

  const clients = useMemo(() => {
    if (isSuperAdmin) return allClients;
    return allClients.filter(c => c.assignedAgentId === myAgentId);
  }, [allClients, isSuperAdmin, myAgentId]);

  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy]         = useState('date_asc');
  const [viewTab, setViewTab]       = useState('all');
  const [modal, setModal]           = useState(null); // null | { mode: 'add'|'edit', data? }

  const today = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => ({
    total:     visits.length,
    todays:    visits.filter(v => v.scheduledDate === today).length,
    upcoming:  visits.filter(v => v.status === 'upcoming' && v.scheduledDate >= today).length,
    completed: visits.filter(v => v.status === 'completed').length,
    missed:    visits.filter(v => v.status === 'missed' || (v.status === 'upcoming' && v.scheduledDate < today)).length,
  }), [visits, today]);

  const tabCounts = useMemo(() => ({
    all:      visits.length,
    previous: visits.filter(v => v.scheduledDate < today).length,
    today:    visits.filter(v => v.scheduledDate === today).length,
    upcoming: visits.filter(v => v.scheduledDate > today).length,
  }), [visits, today]);

  const visible = useMemo(() => {
    let list = [...visits];
    if (viewTab === 'previous') list = list.filter(v => v.scheduledDate < today);
    else if (viewTab === 'today') list = list.filter(v => v.scheduledDate === today);
    else if (viewTab === 'upcoming') list = list.filter(v => v.scheduledDate > today);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        (v.clientName || '').toLowerCase().includes(q) ||
        (v.clientPhone || '').includes(q) ||
        (v.location || '').toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') list = list.filter(v => v.status === filterStatus);

    list.sort((a, b) => {
      if (sortBy === 'date_asc')  return (a.scheduledDate || '').localeCompare(b.scheduledDate || '');
      if (sortBy === 'date_desc') return (b.scheduledDate || '').localeCompare(a.scheduledDate || '');
      if (sortBy === 'name')      return (a.clientName || '').localeCompare(b.clientName || '');
      return 0;
    });
    return list;
  }, [visits, search, filterStatus, sortBy, viewTab, today]);

  const handleTabChange = (key) => {
    setViewTab(key);
    if (key === 'previous') setSortBy('date_desc');
    else if (key === 'upcoming') setSortBy('date_asc');
  };

  const updateVisit = (id, patch) => {
    setDb(prev => ({
      ...prev,
      visits: (prev.visits || []).map(v => v.id === id ? { ...v, ...patch } : v),
    }));
  };

  const handleMarkDone = (id) => {
    setModal({ mode: 'edit', data: { ...visits.find(v => v.id === id), status: 'completed' } });
  };
  const handleMarkMissed = (id) => {
    updateVisit(id, { status: 'missed' });
    logAction?.('Marked visit missed', 'visit', id);
  };
  const handleDelete = (id) => {
    if (!window.confirm('Delete this visit?')) return;
    setDb(prev => ({ ...prev, visits: (prev.visits || []).filter(v => v.id !== id) }));
    logAction?.('Deleted visit', 'visit', id);
  };

  const handleSave = (form) => {
    if (modal.mode === 'add') {
      const entry = {
        ...form, id: Date.now(), createdAt: new Date().toISOString(),
        agentId: myAgentId, agentName: myAgentName, createdBy: myAgentName,
        status: 'upcoming', source: 'manual',
      };
      setDb(prev => ({ ...prev, visits: [entry, ...(prev.visits || [])] }));
      logAction?.('Scheduled visit', 'visit', form.clientName);
    } else {
      const wasCompleting = form.status === 'completed' && modal.data.status !== 'completed';
      updateVisit(modal.data.id, { ...form, ...(wasCompleting ? { completedAt: new Date().toISOString() } : {}) });
      logAction?.(wasCompleting ? 'Completed visit' : 'Edited visit', 'visit', form.clientName);
    }
    setModal(null);
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
            <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: 0 }}>Visits</h1>
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
              ? 'Track scheduled site visits across every agent.'
              : 'Track and manage your scheduled site visits.'}
          </p>
        </div>
        <button onClick={() => setModal({ mode: 'add' })} style={{
          padding: '11px 22px', background: T.primary, color: '#fff',
          border: 'none', borderRadius: T.radiusSm, fontWeight: 700, fontSize: 14,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Icon d={ICONS.plus} size={16} color="#fff" /> Schedule Visit
        </button>
      </div>

      {/* Top bar / stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total" value={stats.total} color={T.text} />
        <StatCard label="Today's" value={stats.todays} color={T.info} bg="#EFF6FF" />
        <StatCard label="Upcoming" value={stats.upcoming} color={T.warning} bg="#FFFBEB" />
        <StatCard label="Completed" value={stats.completed} color={T.success} bg="#ECFDF5" />
        <StatCard label="Missed / Overdue" value={stats.missed} color={T.danger} bg="#FEF2F2" />
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
            placeholder="Search by name, phone, location…"
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
          {['all','upcoming','completed','missed','rescheduled'].map(s => (
            <Pill key={s} active={filterStatus === s} color={T.primary}
              onClick={() => setFilterStatus(s)}>
              {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Pill>
          ))}
        </div>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          padding: '9px 12px', border: `1.5px solid ${T.border}`,
          borderRadius: T.radiusSm, fontSize: 13.5, color: T.textMid,
          background: T.bg, outline: 'none', appearance: 'none', cursor: 'pointer',
        }}>
          <option value="date_asc">Date: Soonest</option>
          <option value="date_desc">Date: Latest</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: T.text, margin: '0 0 8px' }}>
            {visits.length === 0 || tabCounts[viewTab] === 0 ? emptyCopy.title : 'No results match your filters'}
          </h3>
          <p style={{ color: T.textMuted, fontSize: 14, margin: '0 0 20px' }}>
            {visits.length === 0 || tabCounts[viewTab] === 0 ? emptyCopy.body : 'Try adjusting your search or filter.'}
          </p>
          {visits.length === 0 && (
            <button onClick={() => setModal({ mode: 'add' })} style={{
              padding: '10px 24px', background: T.primary, color: '#fff',
              border: 'none', borderRadius: T.radiusSm, fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>Schedule First Visit</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {visible.map(v => (
              <VisitCard
                key={v.id} v={v}
                showAgent={isSuperAdmin}
                onEdit={data => setModal({ mode: 'edit', data })}
                onDelete={handleDelete}
                onMarkDone={handleMarkDone}
                onMarkMissed={handleMarkMissed}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <VisitModal
            initial={modal.data}
            clients={clients}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Visit;