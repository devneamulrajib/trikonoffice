import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, PhoneCall, X, Plus, Search, ChevronLeft, ChevronRight, ChevronDown,
  Calendar, CalendarClock, Pencil, Trash2, MapPin, CheckCircle2, CheckCheck,
  XCircle, History, Send, ShieldCheck, AlertCircle, Users, ArrowRight,
  MessageCircle, Clock, Home, Building2, Navigation, RotateCcw, User,
} from 'lucide-react';

// ─── Design tokens (matches NewCall.jsx / FollowUp.jsx) ───────────────────────
const C = {
  surface:       '#FFFFFF',
  surfaceRaised: '#F8FAFC',
  surfaceSunken: '#F1F5F9',
  border:        '#E2E8F0',
  borderStrong:  '#CBD5E1',
  text:          '#0F172A',
  textMid:       '#475569',
  textMuted:     '#94A3B8',
  accent:        '#F59E0B',
  accentDark:    '#D97706',
  accentLight:   '#FEF3C7',
  accentBorder:  '#FCD34D',
  green:  '#10B981', greenBg: '#ECFDF5', greenBorder: '#6EE7B7',
  red:    '#EF4444', redBg:   '#FEF2F2', redBorder:   '#FCA5A5',
  blue:   '#3B82F6', blueBg:  '#EFF6FF', blueBorder:  '#BFDBFE',
  yellow: '#F59E0B', yellowBg:'#FFFBEB', yellowBorder:'#FDE68A',
  purple: '#8B5CF6', purpleBg:'#F5F3FF', purpleBorder:'#DDD6FE',
  slate:  '#64748B', slateBg: '#F8FAFC', slateBorder: '#E2E8F0',
  r: { xs: 4, sm: 6, md: 8, lg: 12, xl: 16, full: 9999 },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.08)',
    md: '0 4px 6px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.05)',
    lg: '0 20px 60px rgba(0,0,0,.2),0 8px 20px rgba(0,0,0,.1)',
    xl: '0 32px 80px rgba(0,0,0,.28)',
  },
};

const STATUS_CONFIG = {
  upcoming:    { label: 'Upcoming',    color: C.blue,   bg: C.blueBg   },
  completed:   { label: 'Completed',   color: C.green,  bg: C.greenBg  },
  missed:      { label: 'Missed',      color: C.red,    bg: C.redBg    },
  rescheduled: { label: 'Rescheduled', color: C.yellow, bg: C.yellowBg },
};

const OUTCOME_CONFIG = {
  'Very Interested': { color: C.green,  bg: C.greenBg  },
  'Interested':       { color: C.blue,   bg: C.blueBg   },
  'Neutral':          { color: C.slate,  bg: C.slateBg  },
  'Not Interested':   { color: C.red,    bg: C.redBg    },
};
const OUTCOME_OPTIONS = Object.keys(OUTCOME_CONFIG);

const PROPERTY_TYPES = ['Apartment','Villa','Plot/Land','Commercial','Office Space','Townhouse'];

const VIEW_TABS = [
  { key: 'all',      label: 'All' },
  { key: 'previous', label: 'Previous' },
  { key: 'today',    label: 'Today' },
  { key: 'upcoming',  label: 'Upcoming' },
];

const EMPTY_TAB_COPY = {
  all:      { title: 'No visits yet',       body: 'Schedule a site visit to get started.' },
  previous: { title: 'No previous visits',  body: 'Visits will show up here once their date has passed.' },
  today:    { title: 'No visits today',     body: "Nothing scheduled for today." },
  upcoming: { title: 'No upcoming visits',  body: 'Schedule a visit with a future date to see it here.' },
};

// ─── Notes helpers (multi-remark history, backward compatible with old `notes`/`outcomeNotes`) ─
const getNotes = (v) => {
  if (!v) return [];
  if (Array.isArray(v.remarks) && v.remarks.length) return v.remarks;
  const legacy = [];
  if (v.notes && v.notes.trim()) {
    legacy.push({ id: `${v.id || 'legacy'}-notes`, text: v.notes, createdAt: v.createdAt || new Date().toISOString(), createdBy: v.createdBy || v.agentName || 'Agent' });
  }
  if (v.outcomeNotes && v.outcomeNotes.trim()) {
    legacy.push({ id: `${v.id || 'legacy'}-outcome`, text: `Visit outcome: ${v.outcomeNotes}`, createdAt: v.completedAt || v.createdAt || new Date().toISOString(), createdBy: v.createdBy || v.agentName || 'Agent' });
  }
  return legacy;
};

const formatNoteTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const datePart = sameDay ? 'Today' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timePart = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${datePart} · ${timePart}`;
};

const hashStr = s => { let h = 0; for (let i = 0; i < (s || '').length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const AVATAR_PALETTE = [
  ['#DBEAFE','#1E40AF'],['#DCFCE7','#15803D'],['#FEF3C7','#92400E'],
  ['#FCE7F3','#9D174D'],['#E0E7FF','#3730A3'],['#FFEDD5','#9A3412'],
  ['#CCFBF1','#0F766E'],['#FAE8FF','#7E22CE'],
];

// ─── Primitives (shared visual language with NewCall.jsx / FollowUp.jsx) ─────
const Avatar = ({ name, size = 32 }) => {
  const initials = (name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';
  const [bg, fg] = AVATAR_PALETTE[hashStr(name) % AVATAR_PALETTE.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * .34, fontWeight: 700, letterSpacing: '-.01em' }}>
      {initials}
    </div>
  );
};

const Tag = ({ label, color, bg, border }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
    borderRadius: C.r.full, fontSize: 11, fontWeight: 600,
    background: bg || C.surfaceRaised, color: color || C.textMid,
    border: `1px solid ${border || C.border}`, letterSpacing: '.01em', whiteSpace: 'nowrap' }}>
    {label}
  </span>
);

const FieldLabel = ({ children, required }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: '.07em',
    textTransform: 'uppercase', marginBottom: 5, display: 'flex', gap: 3 }}>
    {children}{required && <span style={{ color: C.red }}>*</span>}
  </div>
);

const inputBase = {
  width: '100%', padding: '9px 12px', fontSize: 14,
  border: `1.5px solid ${C.border}`, borderRadius: C.r.md,
  color: C.text, background: C.surface, outline: 'none',
  boxSizing: 'border-box', lineHeight: 1.5,
  fontFamily: 'inherit', transition: 'border-color .12s,box-shadow .12s',
};
const onFocus = e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.accent}22`; };
const onBlur  = e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; };
const focusProps = { onFocus, onBlur };

const Input = ({ style, ...p }) => <input style={{ ...inputBase, ...style }} {...focusProps} {...p} />;
const Select = ({ children, style, ...p }) => (
  <div style={{ position: 'relative' }}>
    <select style={{ ...inputBase, paddingRight: 30, cursor: 'pointer', appearance: 'none', ...style }} {...focusProps} {...p}>
      {children}
    </select>
    <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
      color: C.textMuted, pointerEvents: 'none' }} />
  </div>
);
const Textarea = ({ style, ...p }) => (
  <textarea style={{ ...inputBase, resize: 'vertical', minHeight: 80, lineHeight: 1.6, ...style }} {...focusProps} {...p} />
);
const ROField = ({ value }) => (
  <div style={{ ...inputBase, background: C.surfaceSunken, color: C.textMid, cursor: 'default',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
    {value || '—'}
  </div>
);

const PrimaryBtn = ({ children, onClick, style, disabled, ...p }) => (
  <button onClick={onClick} disabled={disabled} style={{
    display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px',
    borderRadius: C.r.md, fontSize: 13.5, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', background: disabled ? C.border : `linear-gradient(135deg,${C.accentDark},${C.accent})`,
    color: disabled ? C.textMuted : '#fff',
    boxShadow: disabled ? 'none' : `0 2px 10px ${C.accent}44`,
    transition: 'opacity .15s,transform .12s', ...style,
  }}
    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.opacity = '.9'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
    {...p}
  >
    {children}
  </button>
);

const GhostBtn = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px',
    borderRadius: C.r.md, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
    border: `1.5px solid ${C.border}`, background: C.surface, color: C.textMid,
    transition: 'background .12s,border-color .12s', ...style,
  }}
    onMouseEnter={e => { e.currentTarget.style.background = C.surfaceRaised; e.currentTarget.style.borderColor = C.borderStrong; }}
    onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.border; }}
  >
    {children}
  </button>
);

const IconAction = ({ icon: Icon, onClick, title, variant = 'default', disabled }) => {
  const variants = {
    default: { bg: '#F1F5F9', color: '#475569' },
    danger:  { bg: '#FEF2F2', color: C.red },
    success: { bg: '#ECFDF5', color: C.green },
    primary: { bg: `linear-gradient(135deg,${C.accentDark},${C.accent})`, color: '#fff' },
    muted:   { bg: '#F1F5F9', color: '#CBD5E1' },
  };
  const v = variants[disabled ? 'muted' : variant];
  return (
    <button onClick={disabled ? undefined : onClick} title={title} disabled={disabled} style={{
      width: 32, height: 32, borderRadius: C.r.sm, border: 'none', flexShrink: 0,
      background: v.bg, color: v.color, cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: (variant === 'primary' && !disabled) ? `0 2px 8px ${C.accent}44` : 'none',
      transition: 'opacity .12s,transform .1s',
    }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.opacity = '.8'; e.currentTarget.style.transform = 'scale(1.07)'; } }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <Icon size={14} />
    </button>
  );
};

const Card = ({ children, style }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: C.r.lg, padding: 20, boxShadow: C.shadow.sm, ...style }}>
    {children}
  </div>
);

const CardHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: C.r.sm, background: C.accentLight,
        color: C.accentDark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} />
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
    {action}
  </div>
);

const Collapse = ({ title, icon: Icon, defaultOpen = false, summary, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: C.r.lg, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', background: open ? C.surfaceRaised : C.surface,
        border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .12s',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {Icon && <Icon size={14} style={{ color: C.textMuted, flexShrink: 0 }} />}
          <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{title}</span>
          {!open && summary && (
            <span style={{ fontSize: 12, color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary}</span>
          )}
        </span>
        <ChevronDown size={14} style={{ color: C.textMuted, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
      </button>
      {open && <div style={{ padding: 16, borderTop: `1px solid ${C.border}` }}>{children}</div>}
    </div>
  );
};

const Grid = ({ cols = '1fr 1fr', gap = 13, children, style }) => (
  <div style={{ display: 'grid', gridTemplateColumns: cols, gap, ...style }}>{children}</div>
);

const StatBox = ({ icon: Icon, label, value, color, bg, border, active, onClick, sublabel }) => {
  const [hov, setHov] = useState(false);
  const isClickable = Boolean(onClick);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => isClickable && setHov(true)}
      onMouseLeave={() => isClickable && setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
        padding: '13px 16px',
        background: active ? bg : hov ? bg : C.surface,
        border: `1.5px solid ${active ? color : hov ? border : C.border}`,
        borderRadius: C.r.lg,
        cursor: isClickable ? 'pointer' : 'default',
        textAlign: 'left', transition: 'all .15s',
        boxShadow: active ? `0 2px 12px ${color}22` : hov ? `0 1px 6px ${color}18` : C.shadow.sm,
        flex: 1, minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon && (
            <div style={{ width: 28, height: 28, borderRadius: C.r.sm, background: bg || C.surfaceRaised,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={13} color={color || C.textMuted} />
            </div>
          )}
          <span style={{ fontSize: 11, fontWeight: 700, color: active ? color : C.textMuted,
            textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>
            {label}
          </span>
        </div>
        {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: active ? color : C.text, lineHeight: 1, marginTop: 4 }}>
        {value}
      </div>
      {sublabel && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{sublabel}</div>}
    </button>
  );
};

const PageBtn = ({ active, disabled, onClick, children }) => (
  <button onClick={onClick} disabled={disabled} style={{
    minWidth: 32, height: 30, padding: '0 9px', borderRadius: C.r.sm,
    border: active ? 'none' : `1.5px solid ${C.border}`,
    background: active ? `linear-gradient(135deg,${C.accentDark},${C.accent})` : C.surface,
    color: active ? '#fff' : disabled ? C.textMuted : C.text,
    fontSize: 12.5, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? .5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
    boxShadow: active ? `0 2px 6px ${C.accent}44` : 'none', transition: 'all .13s',
  }}>{children}</button>
);

const DividerLabel = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 2px' }}>
    <div style={{ flex: 1, height: 1, background: C.border }} />
    <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>
      {children}
    </span>
    <div style={{ flex: 1, height: 1, background: C.border }} />
  </div>
);

const ViewTabs = ({ active, counts, onChange }) => (
  <div style={{ display: 'flex', gap: 4, borderBottom: `1.5px solid ${C.border}`, marginBottom: 16 }}>
    {VIEW_TABS.map(t => {
      const isActive = active === t.key;
      return (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            padding: '10px 2px 11px', marginRight: 26, background: 'none', border: 'none',
            borderBottom: `2.5px solid ${isActive ? C.accentDark : 'transparent'}`,
            color: isActive ? C.accentDark : C.textMid, fontWeight: 700, fontSize: 13.5,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          {t.label}
          <span style={{
            background: isActive ? C.accentLight : '#F1F5F9',
            color: isActive ? C.accentDark : C.textMuted,
            fontSize: 11.5, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
            minWidth: 18, textAlign: 'center',
          }}>{counts[t.key] ?? 0}</span>
        </button>
      );
    })}
  </div>
);

// ─── Visit Detail Modal (Info & Edit + Remark History) ───────────────────────
const VisitDetailModal = ({ visit, clients, onSaveMeta, onAddNote, onMarkDone, onMarkMissed, onReschedule, onClose }) => {
  const isEdit = Boolean(visit);

  const [meta, setMeta] = useState(() => isEdit
    ? {
        clientName: visit.clientName || '', clientPhone: visit.clientPhone || '',
        propertyType: visit.propertyType || '', location: visit.location || '',
        address: visit.address || '', scheduledDate: visit.scheduledDate || '',
        scheduledTime: visit.scheduledTime || '', status: visit.status || 'upcoming',
        outcome: visit.outcome || '',
      }
    : { clientName: '', clientPhone: '', propertyType: '', location: '', address: '',
        scheduledDate: '', scheduledTime: '', status: 'upcoming', outcome: '' }
  );

  const [clientSearch, setClientSearch] = useState(isEdit ? (visit.clientName || '') : '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [initialNote, setInitialNote] = useState('');

  const set = (k, v) => setMeta(p => ({ ...p, [k]: v }));

  const filtered = useMemo(() => {
    if (!clientSearch.trim()) return (clients || []).slice(0, 6);
    const q = clientSearch.toLowerCase();
    return (clients || []).filter(c =>
      (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q)
    ).slice(0, 6);
  }, [clients, clientSearch]);

  const notes = isEdit ? getNotes(visit) : [];
  const sc = STATUS_CONFIG[meta.status] || STATUS_CONFIG.upcoming;
  const oc = meta.outcome ? OUTCOME_CONFIG[meta.outcome] : null;
  const isCompleted = meta.status === 'completed';

  const handleSaveMeta = () => {
    if (!meta.clientName || !meta.scheduledDate) return;
    onSaveMeta(meta, initialNote);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onAddNote(visit.id, newNote.trim());
    setNewNote('');
  };

  const telLink = meta.clientPhone ? `tel:${meta.clientPhone}` : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 20 }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 20, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: .97 }} transition={{ duration: .2, ease: [.16, 1, .3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: C.surface, borderRadius: C.r.xl, width: '100%', maxWidth: 920,
          maxHeight: '92vh', overflowY: 'auto', boxShadow: C.shadow.xl }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', background: `linear-gradient(135deg,${C.accentDark},${C.accent})`,
          borderRadius: `${C.r.xl}px ${C.r.xl}px 0 0`, position: 'sticky', top: 0, zIndex: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={meta.clientName || 'New client'} size={42} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-.01em' }}>
                {isEdit ? meta.clientName : 'New Visit'}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 5 }}>
                {meta.clientPhone && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: C.r.full,
                    fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,.18)', color: 'rgba(255,255,255,.95)' }}>
                    {meta.clientPhone}
                  </span>
                )}
                {isEdit && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: C.r.full,
                    fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,.22)', color: '#fff' }}>
                    {sc.label}
                  </span>
                )}
                {isEdit && visit.followUpId && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: C.r.full,
                    fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,.18)', color: 'rgba(255,255,255,.95)' }}>
                    <PhoneCall size={10} /> From follow-up
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: C.r.sm, border: 'none',
            background: 'rgba(255,255,255,.15)', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {isEdit && telLink && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href={telLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px',
                borderRadius: C.r.md, fontSize: 13.5, fontWeight: 700, textDecoration: 'none',
                background: `linear-gradient(135deg,${C.accentDark},${C.accent})`,
                color: '#fff', boxShadow: `0 2px 10px ${C.accent}44` }}>
                <PhoneCall size={15} /> Call {meta.clientPhone}
              </a>
            </div>
          )}

          <Grid cols="1fr 1fr" gap={16}>
            {/* ── LEFT: Info & Edit ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card>
                <CardHeader icon={Pencil} title="Info & Edit" subtitle={isEdit ? 'Update visit details' : 'Set up this visit'} />

                {!isEdit && (
                  <div style={{ marginBottom: 14, position: 'relative' }}>
                    <FieldLabel required>Client</FieldLabel>
                    <input
                      value={clientSearch}
                      onChange={e => { setClientSearch(e.target.value); set('clientName', e.target.value); setShowDropdown(true); }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search or type client name…"
                      style={inputBase}
                    />
                    {showDropdown && filtered.length > 0 && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: C.r.md, boxShadow: C.shadow.md, marginTop: 4, overflow: 'hidden',
                      }}>
                        {filtered.map(c => (
                          <div key={c.id} onClick={() => {
                            setMeta(p => ({
                              ...p, clientName: c.name, clientPhone: c.phone || '',
                              propertyType: c.propertyType || p.propertyType,
                              location: c.location || p.location, address: c.address || p.address,
                            }));
                            setClientSearch(c.name);
                            setShowDropdown(false);
                          }} style={{
                            padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${C.border}`,
                            display: 'flex', alignItems: 'center', gap: 10,
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = C.surfaceRaised}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <Avatar name={c.name} size={28} />
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{c.name}</div>
                              <div style={{ fontSize: 12, color: C.textMuted }}>{c.phone}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {(clients || []).length === 0 && (
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>
                        No clients assigned to you yet — take a call from New Calls first, or type a name manually.
                      </div>
                    )}
                  </div>
                )}

                {!isEdit && (
                  <div style={{ marginBottom: 14 }}>
                    <FieldLabel>Phone</FieldLabel>
                    <Input value={meta.clientPhone} onChange={e => set('clientPhone', e.target.value)} placeholder="01XXXXXXXXX" />
                  </div>
                )}

                <Grid gap={12} style={{ marginBottom: 14 }}>
                  <div>
                    <FieldLabel required>Date</FieldLabel>
                    <Input type="date" value={meta.scheduledDate} onChange={e => set('scheduledDate', e.target.value)} />
                  </div>
                  <div>
                    <FieldLabel>Time</FieldLabel>
                    <Input type="time" value={meta.scheduledTime} onChange={e => set('scheduledTime', e.target.value)} />
                  </div>
                </Grid>

                <Grid gap={12} style={{ marginBottom: 14 }}>
                  <div>
                    <FieldLabel>Property type</FieldLabel>
                    <Select value={meta.propertyType} onChange={e => set('propertyType', e.target.value)}>
                      <option value="">— Not specified —</option>
                      {PROPERTY_TYPES.map(o => <option key={o}>{o}</option>)}
                    </Select>
                  </div>
                  <div>
                    <FieldLabel>Location</FieldLabel>
                    <Input value={meta.location} onChange={e => set('location', e.target.value)} placeholder="Gulshan, Dhaka" />
                  </div>
                </Grid>

                <div style={{ marginBottom: isEdit ? 14 : 0 }}>
                  <FieldLabel>Site address</FieldLabel>
                  <Input value={meta.address} onChange={e => set('address', e.target.value)} placeholder="Full site address" />
                </div>

                {isEdit && (
                  <Grid gap={12}>
                    <div>
                      <FieldLabel>Status</FieldLabel>
                      <Select value={meta.status} onChange={e => set('status', e.target.value)}>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="missed">Missed</option>
                        <option value="rescheduled">Rescheduled</option>
                      </Select>
                    </div>
                    <div>
                      <FieldLabel>Client reaction</FieldLabel>
                      <Select value={meta.outcome} onChange={e => set('outcome', e.target.value)} disabled={!isCompleted}
                        style={!isCompleted ? { opacity: .5, cursor: 'not-allowed' } : {}}>
                        <option value="">— Not specified —</option>
                        {OUTCOME_OPTIONS.map(o => <option key={o}>{o}</option>)}
                      </Select>
                    </div>
                  </Grid>
                )}
              </Card>

              {!isEdit && (
                <Card>
                  <CardHeader icon={MessageCircle} title="Initial note" subtitle="Optional — what to prep or discuss" />
                  <Textarea value={initialNote} onChange={e => setInitialNote(e.target.value)}
                    placeholder="What to show, client preferences, prep needed…" />
                </Card>
              )}

              {isEdit && (visit.location || visit.address || visit.source) && (
                <Collapse title="Visit context" icon={MapPin} summary={visit.location || ''}>
                  <Grid cols="1fr 1fr" gap={10}>
                    {visit.propertyType && <div><FieldLabel>Property</FieldLabel><ROField value={visit.propertyType} /></div>}
                    {visit.location && <div><FieldLabel>Location</FieldLabel><ROField value={visit.location} /></div>}
                    {visit.address && <div style={{ gridColumn: '1/-1' }}><FieldLabel>Address</FieldLabel><ROField value={visit.address} /></div>}
                    {oc && meta.outcome && <div><FieldLabel>Reaction</FieldLabel><Tag label={meta.outcome} color={oc.color} bg={oc.bg} border={`${oc.color}40`} /></div>}
                  </Grid>
                </Collapse>
              )}

              {isEdit && visit.status !== 'completed' && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <GhostBtn onClick={() => onMarkDone(visit.id)} style={{ color: C.green, borderColor: C.greenBorder, background: C.greenBg }}>
                    <CheckCircle2 size={14} /> Mark Completed
                  </GhostBtn>
                  <GhostBtn onClick={() => onMarkMissed(visit.id)} style={{ color: C.red, borderColor: C.redBorder, background: C.redBg }}>
                    <XCircle size={14} /> Missed
                  </GhostBtn>
                  <GhostBtn onClick={() => onReschedule(visit)} style={{ color: C.yellow, borderColor: C.yellowBorder, background: C.yellowBg }}>
                    <RotateCcw size={14} /> Reschedule
                  </GhostBtn>
                </div>
              )}
            </div>

            {/* ── RIGHT: Remark History ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card style={{ display: 'flex', flexDirection: 'column', minHeight: 420 }}>
                <CardHeader icon={History} title="Remark History" subtitle={isEdit ? `${notes.length} remark${notes.length === 1 ? '' : 's'}` : 'Available after creating'} />

                <div style={{ flex: 1, overflowY: 'auto', maxHeight: 300, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                  {!isEdit ? (
                    <div style={{ fontSize: 13.5, color: C.textMuted, padding: '20px 0', textAlign: 'center' }}>
                      Save this visit first, then remarks can be added here.
                    </div>
                  ) : notes.length === 0 ? (
                    <div style={{ fontSize: 13.5, color: C.textMuted, padding: '20px 0', textAlign: 'center' }}>
                      No remarks yet. Add the first one below.
                    </div>
                  ) : (
                    notes.slice().reverse().map((n, i) => (
                      <div key={n.id || i} style={{
                        background: C.surfaceRaised, border: `1px solid ${C.border}`,
                        borderRadius: C.r.md, padding: '10px 13px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.accentDark }}>{n.createdBy || 'Agent'}</span>
                          <span style={{ fontSize: 11.5, color: C.textMuted }}>{formatNoteTime(n.createdAt)}</span>
                        </div>
                        <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{n.text}</div>
                      </div>
                    ))
                  )}
                </div>

                {isEdit && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                    <FieldLabel>Add New Remark</FieldLabel>
                    <Textarea
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Type a new note here…"
                      style={{ minHeight: 70 }}
                    />
                    <PrimaryBtn onClick={handleAddNote} disabled={!newNote.trim()} style={{ alignSelf: 'flex-end' }}>
                      <Send size={13} /> Add Remark
                    </PrimaryBtn>
                  </div>
                )}
              </Card>
            </div>
          </Grid>
        </div>

        <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.border}`, background: C.surfaceRaised,
          borderRadius: `0 0 ${C.r.xl}px ${C.r.xl}px`, position: 'sticky', bottom: 0, zIndex: 10,
          display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <GhostBtn onClick={onClose}>Close</GhostBtn>
          <PrimaryBtn onClick={handleSaveMeta} disabled={!meta.clientName || !meta.scheduledDate}>
            {isEdit ? 'Save Changes' : 'Schedule Visit'} <ArrowRight size={14} />
          </PrimaryBtn>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Reschedule Modal ──────────────────────────────────────────────────────
const RescheduleModal = ({ visit, onSave, onClose }) => {
  const [date, setDate] = useState(visit.scheduledDate || '');
  const [time, setTime] = useState(visit.scheduledTime || '');
  const [reason, setReason] = useState('');

  const handleSave = () => { if (!date) return; onSave(date, time, reason); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(6px)',
        zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 14, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={e => e.stopPropagation()}
        style={{ background: C.surface, borderRadius: C.r.xl, width: '100%', maxWidth: 440, boxShadow: C.shadow.xl, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.text }}>Reschedule Visit</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textMuted }}>New date for <strong>{visit.clientName}</strong></p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}>
            <X size={15} color={C.textMid} />
          </button>
        </div>
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Grid gap={12}>
            <div><FieldLabel required>New date</FieldLabel><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
            <div><FieldLabel>Time</FieldLabel><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
          </Grid>
          <div><FieldLabel>Reason (optional)</FieldLabel><Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Why the visit is being moved…" style={{ minHeight: 64 }} /></div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <GhostBtn onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</GhostBtn>
            <PrimaryBtn onClick={handleSave} disabled={!date} style={{ flex: 2, justifyContent: 'center' }}>
              <RotateCcw size={14} /> Reschedule
            </PrimaryBtn>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────
const DeleteConfirmModal = ({ visit, onCancel, onConfirm }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: 20 }}
    onClick={onCancel}>
    <motion.div initial={{ opacity: 0, y: 14, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      onClick={e => e.stopPropagation()}
      style={{ background: C.surface, borderRadius: C.r.xl, width: '100%', maxWidth: 400, boxShadow: C.shadow.xl, overflow: 'hidden' }}>
      <div style={{ padding: '28px 24px 22px', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: C.redBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Trash2 size={22} color={C.red} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>Delete this visit?</div>
        <div style={{ fontSize: 13.5, color: C.textMid, lineHeight: 1.5 }}>
          The visit for <strong>{visit?.clientName}</strong> will be permanently deleted.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '14px 24px', borderTop: `1px solid ${C.border}`, background: C.surfaceRaised }}>
        <GhostBtn onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>Cancel</GhostBtn>
        <button onClick={onConfirm} style={{ flex: 1, padding: '9px 0', borderRadius: C.r.md,
          fontSize: 13.5, fontWeight: 700, border: 'none', background: C.red, color: '#fff', cursor: 'pointer' }}>
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────
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

  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy]             = useState('date_asc');
  const [viewTab, setViewTab]           = useState('all');
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);
  const [detailTarget, setDetailTarget] = useState(null); // null | 'new' | visit object
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const statusCounts = useMemo(() => {
    const c = { All: visits.length };
    ['upcoming','completed','missed','rescheduled'].forEach(s => { c[s] = visits.filter(v => v.status === s).length; });
    return c;
  }, [visits]);

  const filtered = useMemo(() => {
    let list = [...visits];
    if (viewTab === 'previous') list = list.filter(v => v.scheduledDate < today);
    else if (viewTab === 'today') list = list.filter(v => v.scheduledDate === today);
    else if (viewTab === 'upcoming') list = list.filter(v => v.scheduledDate > today);

    if (filterStatus !== 'All') list = list.filter(v => v.status === filterStatus);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        (v.clientName || '').toLowerCase().includes(q) ||
        (v.clientPhone || '').includes(q) ||
        (v.location || '').toLowerCase().includes(q) ||
        (v.propertyType || '').toLowerCase().includes(q) ||
        getNotes(v).some(n => (n.text || '').toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'date_asc')  return (a.scheduledDate || '').localeCompare(b.scheduledDate || '');
      if (sortBy === 'date_desc') return (b.scheduledDate || '').localeCompare(a.scheduledDate || '');
      if (sortBy === 'name')      return (a.clientName || '').localeCompare(b.clientName || '');
      return 0;
    });
    return list;
  }, [visits, viewTab, filterStatus, search, sortBy, today]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleTabChange = (key) => {
    setViewTab(key); setPage(1);
    if (key === 'previous') setSortBy('date_desc');
    else if (key === 'upcoming') setSortBy('date_asc');
  };

  const updateVisit = (id, patch) => {
    setDb(prev => ({ ...prev, visits: (prev.visits || []).map(v => v.id === id ? { ...v, ...patch } : v) }));
  };

  const handleMarkDone = (id) => {
    updateVisit(id, { status: 'completed', completedAt: new Date().toISOString() });
    logAction?.('Completed visit', 'visit', id);
    setDetailTarget(null);
  };

  const handleMarkMissed = (id) => {
    updateVisit(id, { status: 'missed' });
    logAction?.('Marked visit missed', 'visit', id);
    setDetailTarget(null);
  };

  const handleReschedule = (date, time, reason) => {
    const v = rescheduleTarget;
    const noteEntry = {
      id: `${Date.now()}`,
      text: reason ? `Rescheduled from ${v.scheduledDate}${v.scheduledTime ? ' ' + v.scheduledTime : ''} — ${reason}` : `Rescheduled from ${v.scheduledDate}${v.scheduledTime ? ' ' + v.scheduledTime : ''}`,
      createdAt: new Date().toISOString(), createdBy: myAgentName,
    };
    setDb(prev => ({
      ...prev,
      visits: (prev.visits || []).map(x => x.id === v.id
        ? { ...x, scheduledDate: date, scheduledTime: time, status: 'upcoming', remarks: [...getNotes(x), noteEntry] }
        : x
      ),
    }));
    logAction?.('Rescheduled visit', 'visit', v.clientName);
    setRescheduleTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDb(prev => ({ ...prev, visits: (prev.visits || []).filter(v => v.id !== deleteTarget.id) }));
    logAction?.('Deleted visit', 'visit', deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleSaveMeta = (meta, initialNoteText) => {
    if (detailTarget === 'new') {
      const remarks = initialNoteText && initialNoteText.trim()
        ? [{ id: `${Date.now()}-1`, text: initialNoteText.trim(), createdAt: new Date().toISOString(), createdBy: myAgentName }]
        : [];
      const entry = {
        ...meta, id: Date.now(), createdAt: new Date().toISOString(),
        agentId: myAgentId, agentName: myAgentName, createdBy: myAgentName,
        status: 'upcoming', source: 'manual', remarks,
      };
      setDb(prev => ({ ...prev, visits: [entry, ...(prev.visits || [])] }));
      logAction?.('Scheduled visit', 'visit', meta.clientName);
      setDetailTarget(null);
    } else {
      const wasCompleting = meta.status === 'completed' && detailTarget.status !== 'completed';
      updateVisit(detailTarget.id, { ...meta, ...(wasCompleting ? { completedAt: new Date().toISOString() } : {}) });
      logAction?.(wasCompleting ? 'Completed visit' : 'Edited visit', 'visit', meta.clientName);
      // keep the modal open so the remark history stays visible
    }
  };

  const handleAddNote = (id, text) => {
    setDb(prev => ({
      ...prev,
      visits: (prev.visits || []).map(v => {
        if (v.id !== id) return v;
        const existing = getNotes(v);
        const noteEntry = { id: `${Date.now()}`, text, createdAt: new Date().toISOString(), createdBy: myAgentName };
        return { ...v, remarks: [...existing, noteEntry] };
      }),
    }));
    logAction?.('Added remark to visit', 'visit', id);
  };

  // Always look up the live record so the modal's remark history stays in
  // sync as new notes get added while it's open.
  const liveDetailVisit = (detailTarget && detailTarget !== 'new')
    ? visits.find(v => v.id === detailTarget.id) || detailTarget
    : null;

  const emptyCopy = EMPTY_TAB_COPY[viewTab] || EMPTY_TAB_COPY.all;

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
    .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push('…'); acc.push(p); return acc; }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}
      style={{ fontFamily: '-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif', color: C.text }}>

      {typeof setView === 'function' && (
        <button onClick={() => setView('call_center')} style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
          padding: 0, marginBottom: 14, cursor: 'pointer', color: C.textMid, fontSize: 13.5, fontWeight: 600,
        }}>
          <ChevronLeft size={15} /> Call Center
        </button>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: C.r.sm,
              background: `linear-gradient(135deg,${C.accentDark},${C.accent})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={15} color="#fff" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-.02em' }}>Visits</h1>
            {isSuperAdmin && <Tag label="Super Admin — viewing all agents" color={C.purple} bg={C.purpleBg} border={C.purpleBorder} />}
          </div>
          <p style={{ fontSize: 13.5, color: C.textMuted, margin: 0 }}>
            {isSuperAdmin ? 'Track scheduled site visits across every agent.' : `${stats.upcoming} upcoming, ${stats.missed} missed / overdue`}
          </p>
        </div>
        <PrimaryBtn onClick={() => setDetailTarget('new')}>
          <Plus size={15} /> Schedule Visit
        </PrimaryBtn>
      </div>

      {/* Stat boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 10 }}>
        <StatBox icon={Users}       label="Total"     value={stats.total}     color={C.textMid} bg={C.surfaceRaised} border={C.border} />
        <StatBox icon={Calendar}    label="Today's"   value={stats.todays}    color={C.blue}    bg={C.blueBg}       border={C.blueBorder} />
        <StatBox icon={Clock}       label="Upcoming"  value={stats.upcoming}  color={C.yellow}  bg={C.yellowBg}     border={C.yellowBorder} />
        <StatBox icon={CheckCheck}  label="Completed" value={stats.completed} color={C.green}   bg={C.greenBg}      border={C.greenBorder} />
        <StatBox icon={AlertCircle} label="Missed"    value={stats.missed}    color={C.red}     bg={C.redBg}        border={C.redBorder} />
      </div>

      {/* Status filter chips */}
      <div style={{ marginBottom: 16 }}>
        <DividerLabel>Filter by status</DividerLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {['All','upcoming','completed','missed','rescheduled'].map(s => {
            const cfg = s === 'All' ? { color: C.accentDark, bg: C.accentLight } : STATUS_CONFIG[s];
            const active = filterStatus === s;
            const label = s === 'All' ? 'All Status' : STATUS_CONFIG[s].label;
            return (
              <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 15px',
                borderRadius: C.r.full, cursor: 'pointer', fontSize: 12.5, fontWeight: active ? 700 : 600,
                border: `1.5px solid ${active ? cfg.color : C.border}`,
                background: active ? cfg.bg : C.surface,
                color: active ? cfg.color : C.textMid,
                boxShadow: active ? `0 1px 6px ${cfg.color}33` : 'none', transition: 'all .13s',
              }}>
                {label}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 20, height: 18, borderRadius: C.r.full, padding: '0 6px',
                  fontSize: 11, fontWeight: 800,
                  background: active ? cfg.color : C.surfaceSunken,
                  color: active ? '#fff' : C.textMid,
                }}>
                  {statusCounts[s] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ViewTabs active={viewTab} counts={tabCounts} onChange={handleTabChange} />

      {/* Table card */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r.lg, overflow: 'hidden', boxShadow: C.shadow.md }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
          padding: '13px 18px', borderBottom: `1px solid ${C.border}`, background: C.surfaceRaised }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: C.textMid }}>
              Show
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                style={{ ...inputBase, width: 'auto', padding: '5px 9px', fontSize: 13, cursor: 'pointer', appearance: 'none' }}>
                {[10,25,50,100].map(n => <option key={n}>{n}</option>)}
              </select>
              entries
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ ...inputBase, width: 'auto', padding: '5px 9px', fontSize: 13, cursor: 'pointer', appearance: 'none' }}>
              <option value="date_asc">Date: Soonest</option>
              <option value="date_desc">Date: Latest</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 13px',
            background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: C.r.md }}>
            <Search size={13} style={{ color: C.textMuted, flexShrink: 0 }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, phone, location…"
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13.5, color: C.text, width: 210 }} />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.surfaceRaised }}>
                {[
                  { label: 'Client' }, { label: 'Phone' }, { label: 'Date & Time' },
                  { label: 'Property / Location' }, { label: 'Status' }, { label: 'Outcome' },
                  ...(isSuperAdmin ? [{ label: 'Agent' }] : []),
                  { label: 'Actions', align: 'center' },
                ].map(h => (
                  <th key={h.label} style={{ textAlign: h.align || 'left', padding: '10px 16px',
                    fontSize: 10.5, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase',
                    letterSpacing: '.07em', borderBottom: `1.5px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 8 : 7} style={{ padding: '72px 20px', textAlign: 'center', color: C.textMuted }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: C.surfaceRaised,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <MapPin size={24} style={{ opacity: .4 }} />
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: C.textMid, marginBottom: 6 }}>{emptyCopy.title}</div>
                    <div style={{ fontSize: 13, opacity: .7 }}>{emptyCopy.body}</div>
                  </td>
                </tr>
              ) : pageItems.map((v, i) => {
                const sc = STATUS_CONFIG[v.status] || STATUS_CONFIG.upcoming;
                const oc = v.outcome ? OUTCOME_CONFIG[v.outcome] : null;
                const overdue = v.status === 'upcoming' && v.scheduledDate < today;
                const notes = getNotes(v);
                const latest = notes.length ? notes[notes.length - 1] : null;

                return (
                  <tr key={v.id} style={{ background: overdue ? '#FFF7ED' : i % 2 ? C.surfaceRaised : 'transparent' }}>
                    <td style={{ padding: '11px 16px', borderBottom: `1px solid ${C.border}99`, maxWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={v.clientName} size={32} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {v.clientName}
                          </div>
                          {overdue && <div style={{ fontSize: 11, color: C.red, fontWeight: 700, marginTop: 1 }}>⚠ Overdue</div>}
                          {v.followUpId && !overdue && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>From follow-up</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: C.text, borderBottom: `1px solid ${C.border}99`, whiteSpace: 'nowrap' }}>
                      {v.clientPhone || <span style={{ color: C.textMuted }}>—</span>}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: overdue ? C.red : C.text, fontWeight: overdue ? 700 : 400, borderBottom: `1px solid ${C.border}99`, whiteSpace: 'nowrap' }}>
                      {v.scheduledDate}{v.scheduledTime ? ` · ${v.scheduledTime}` : ''}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12.5, color: C.textMid, borderBottom: `1px solid ${C.border}99`, maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {[v.propertyType, v.location].filter(Boolean).join(' · ') || <span style={{ color: C.textMuted }}>—</span>}
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: `1px solid ${C.border}99` }}>
                      <Tag label={sc.label} color={sc.color} bg={sc.bg} border={`${sc.color}40`} />
                    </td>
                    <td style={{ padding: '11px 16px', borderBottom: `1px solid ${C.border}99` }}>
                      {oc ? <Tag label={v.outcome} color={oc.color} bg={oc.bg} border={`${oc.color}40`} /> : <span style={{ color: C.textMuted, fontSize: 12.5 }}>—</span>}
                    </td>
                    {isSuperAdmin && (
                      <td style={{ padding: '11px 16px', borderBottom: `1px solid ${C.border}99` }}>
                        {v.agentName
                          ? <Tag label={v.agentName} color={C.blue} bg={C.blueBg} border={C.blueBorder} />
                          : <span style={{ fontSize: 11, color: C.textMuted, fontStyle: 'italic' }}>—</span>}
                      </td>
                    )}
                    <td style={{ padding: '11px 16px', textAlign: 'center', borderBottom: `1px solid ${C.border}99` }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        {v.status === 'upcoming' && (
                          <>
                            <IconAction icon={CheckCircle2} onClick={() => handleMarkDone(v.id)} title="Mark Completed" variant="success" />
                            <IconAction icon={XCircle}       onClick={() => handleMarkMissed(v.id)} title="Missed"        variant="danger" />
                          </>
                        )}
                        <IconAction icon={Pencil} onClick={() => setDetailTarget(v)} title="View / Manage" variant="primary" />
                        <IconAction icon={Trash2} onClick={() => setDeleteTarget(v)} title="Delete"        variant="danger" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
          padding: '11px 18px', borderTop: `1px solid ${C.border}`, background: C.surfaceRaised }}>
          <span style={{ fontSize: 12.5, color: C.textMuted }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <PageBtn disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft size={12} /> Prev</PageBtn>
            {pageNums.map((p, i) => p === '…'
              ? <span key={`d${i}`} style={{ padding: '0 4px', color: C.textMuted, fontSize: 12 }}>…</span>
              : <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
            )}
            <PageBtn disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next <ChevronRight size={12} /></PageBtn>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {detailTarget && (
          <VisitDetailModal
            key="detail"
            visit={liveDetailVisit}
            clients={clients}
            onSaveMeta={handleSaveMeta}
            onAddNote={handleAddNote}
            onMarkDone={handleMarkDone}
            onMarkMissed={handleMarkMissed}
            onReschedule={setRescheduleTarget}
            onClose={() => setDetailTarget(null)}
          />
        )}
        {rescheduleTarget && (
          <RescheduleModal key="resched" visit={rescheduleTarget} onSave={handleReschedule} onClose={() => setRescheduleTarget(null)} />
        )}
        {deleteTarget && (
          <DeleteConfirmModal key="del" visit={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Visit;