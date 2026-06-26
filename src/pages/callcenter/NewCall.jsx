import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, X, Plus, Search, ChevronLeft, ChevronRight, ChevronDown,
  MessageCircle, PhoneCall, Users, User, Calendar, Pencil, Trash2,
  Briefcase, MapPin, CheckCircle2, Filter, Gift,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — all colours come from CSS vars so dark-mode works for free
// ─────────────────────────────────────────────────────────────────────────────
const t = {
  radius: { sm: 6, md: 8, lg: 12, xl: 16, full: 999 },
  shadow: {
    sm: '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05)',
    md: '0 4px 12px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.06)',
    lg: '0 20px 48px rgba(0,0,0,.18), 0 8px 16px rgba(0,0,0,.08)',
  },
  space: { xs: 6, sm: 10, md: 14, lg: 20, xl: 28 },
};

const sourcePalette = {
  Facebook: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  WhatsApp: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Walk-in': { bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
  Referral: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  Website: { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' },
};

const statusPalette = {
  New: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  Contacted: { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  Interested: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  'Not Interested': { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' },
  Converted: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  Dropped: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const AVATAR_COLORS = [
  { bg: '#dbeafe', color: '#1e40af' },
  { bg: '#dcfce7', color: '#15803d' },
  { bg: '#fef3c7', color: '#b45309' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#e0e7ff', color: '#4338ca' },
  { bg: '#ffedd5', color: '#c2410c' },
  { bg: '#ccfbf1', color: '#0f766e' },
];

const hashStr = s => {
  let h = 0;
  for (let i = 0; i < (s || '').length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

// ─────────────────────────────────────────────────────────────────────────────
// Reusable styled primitives
// ─────────────────────────────────────────────────────────────────────────────
const base = {
  width: '100%',
  background: 'var(--bg-input, #f8fafc)',
  border: '1.5px solid var(--border, #e2e8f0)',
  borderRadius: t.radius.md,
  padding: '9px 12px',
  fontSize: 13.5,
  color: 'var(--text, #0f172a)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  lineHeight: 1.4,
};

const fieldFocus = {
  onFocus: e => {
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
  },
  onBlur: e => {
    e.target.style.borderColor = 'var(--border, #e2e8f0)';
    e.target.style.boxShadow = 'none';
  },
};

const Label = ({ children, required }) => (
  <label style={{
    display: 'block',
    fontSize: 11.5,
    fontWeight: 600,
    color: 'var(--text-muted, #64748b)',
    marginBottom: 5,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  }}>
    {children}
    {required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
  </label>
);

const Input = ({ ...props }) => (
  <input style={base} {...fieldFocus} {...props} />
);

const Sel = ({ value, onChange, children }) => (
  <div style={{ position: 'relative' }}>
    <select
      value={value}
      onChange={onChange}
      style={{ ...base, paddingRight: 32, cursor: 'pointer', appearance: 'none' }}
      {...fieldFocus}
    >
      {children}
    </select>
    <svg
      style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none', color: 'var(--text-muted, #94a3b8)',
      }}
      width="12" height="12" viewBox="0 0 12 12" fill="none"
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const ROField = ({ value }) => (
  <div style={{
    ...base,
    background: 'var(--bg-muted, #f1f5f9)',
    color: 'var(--text-muted, #475569)',
    cursor: 'default',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }}>
    {value || '—'}
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', userSelect: 'none' }}>
    {label && <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>{label}</span>}
    <span style={{
      position: 'relative', width: 36, height: 20, borderRadius: 999, flexShrink: 0,
      background: checked ? '#3b82f6' : 'var(--border, #cbd5e1)',
      transition: 'background 0.18s',
    }}>
      <input
        type="checkbox" checked={checked} onChange={onChange}
        style={{ position: 'absolute', inset: 0, opacity: 0, margin: 0, cursor: 'pointer' }}
      />
      <span style={{
        position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16,
        borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        transition: 'left 0.18s',
      }} />
    </span>
  </label>
);

const Avatar = ({ name, size = 34 }) => {
  const initials = (name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';
  const pal = AVATAR_COLORS[hashStr(name) % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: pal.bg, color: pal.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700,
    }}>
      {initials}
    </div>
  );
};

const Badge = ({ label, palette }) => {
  const pal = palette[label] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 999,
      fontSize: 11.5, fontWeight: 600,
      background: pal.bg, color: pal.color,
      border: `1px solid ${pal.border}`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
};
const SourceBadge = ({ source }) => <Badge label={source} palette={sourcePalette} />;
const StatusBadge = ({ status }) => <Badge label={status} palette={statusPalette} />;

const Pill = ({ children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 999,
    fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.18)', color: '#fff',
    whiteSpace: 'nowrap',
  }}>
    {children}
  </span>
);

const iconBtnStyle = (bg, color, shadowColor) => ({
  width: 30, height: 30, borderRadius: t.radius.sm,
  border: 'none', background: bg, color,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: shadowColor ? `0 1px 4px ${shadowColor}` : 'none',
  transition: 'opacity 0.15s, transform 0.1s',
});

const iconBtnHover = {
  onMouseEnter: e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.08)'; },
  onMouseLeave: e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; },
};

const actionBtnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: t.radius.md,
  fontSize: 13.5, fontWeight: 600, textDecoration: 'none', cursor: 'pointer', border: 'none',
  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: '#fff',
  boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
};

const actionBtnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: t.radius.md,
  fontSize: 13.5, fontWeight: 600, textDecoration: 'none', cursor: 'pointer',
  background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0',
};

// ─────────────────────────────────────────────────────────────────────────────
// Section building blocks — shared by every modal so the whole app feels
// like one coherent system instead of several differently-organised forms
// ─────────────────────────────────────────────────────────────────────────────
const SectionCard = ({ children, style = {} }) => (
  <div style={{
    border: '1.5px solid var(--border, #e2e8f0)',
    borderRadius: t.radius.md,
    padding: 18,
    background: 'var(--bg-card, #fff)',
    ...style,
  }}>
    {children}
  </div>
);

const SectionHeader = ({ icon, title, description, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: t.radius.sm, flexShrink: 0,
        background: '#eff6ff', color: '#2563eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #1e293b)', margin: 0 }}>{title}</p>
        {description && <p style={{ fontSize: 11.5, color: 'var(--text-muted, #94a3b8)', margin: '2px 0 0' }}>{description}</p>}
      </div>
    </div>
    {action}
  </div>
);

const CollapsibleSection = ({ title, icon, defaultOpen = false, summary, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      border: '1.5px solid var(--border, #e2e8f0)',
      borderRadius: t.radius.md,
      overflow: 'hidden',
      background: 'var(--bg-card, #fff)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', textAlign: 'left',
          background: open ? 'var(--bg-muted, #f8fafc)' : 'transparent',
          border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
          {icon && <span style={{ color: 'var(--text-muted, #64748b)', display: 'flex', flexShrink: 0 }}>{icon}</span>}
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #0f172a)', flexShrink: 0 }}>{title}</span>
          {!open && summary && (
            <span style={{
              fontSize: 12, color: 'var(--text-muted, #94a3b8)', fontWeight: 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {summary}
            </span>
          )}
        </span>
        <ChevronDown
          size={15}
          style={{
            color: 'var(--text-muted, #94a3b8)', flexShrink: 0,
            transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>
      {open && (
        <div style={{ padding: 16, borderTop: '1px solid var(--border, #e2e8f0)' }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Add / Edit Client Modal — same modal handles both flows
// ─────────────────────────────────────────────────────────────────────────────
const ClientFormModal = ({ onClose, onSave, user, client }) => {
  const isEdit = Boolean(client);

  const [form, setForm] = useState({
    name: client?.name || '',
    mobile: client?.mobile || '',
    email: client?.email || '',
    dob: client?.dob || '',
    project: client?.project || '',
    source: client?.source || 'Facebook',
    creator: client?.creator || user?.firstName || 'Admin',
    cr: client?.cr || 'CR or SR',
    address: client?.address || '',
    profession: client?.profession || 'Unknown',
    area: client?.area || 'Ababor',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: false }));
  };

  const handleSubmit = () => {
    const e = {};
    if (!form.name) e.name = true;
    if (!form.mobile) e.mobile = true;
    if (Object.keys(e).length) { setErrors(e); return; }

    if (isEdit) {
      onSave({ ...client, ...form });
    } else {
      onSave({
        id: Date.now(),
        ...form,
        createdAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        timestamp: new Date().toISOString(),
      });
    }
    onClose();
  };

  const errStyle = { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.12)' };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1100, padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card, #ffffff)',
          borderRadius: t.radius.xl,
          width: '100%', maxWidth: 680,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: t.shadow.lg,
          border: '1px solid var(--border, #e2e8f0)',
        }}
      >
        {/* ── Modal Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          borderRadius: `${t.radius.xl}px ${t.radius.xl}px 0 0`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: t.radius.md,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isEdit ? <Pencil size={16} color="#fff" /> : <Users size={17} color="#fff" />}
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                {isEdit ? 'Edit Client' : 'Add New Client'}
              </h2>
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                {isEdit ? 'Update the client details below' : 'Fill in the client details below'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none', background: 'rgba(255,255,255,0.15)',
              color: '#fff', cursor: 'pointer',
              width: 30, height: 30, borderRadius: t.radius.sm,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Form Body — grouped into clearly labelled cards ── */}
        <div style={{ padding: '22px 24px' }}>
          <SectionCard>
            <SectionHeader icon={<Briefcase size={15} />} title="Project Details" description="Where this lead came from" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <Label>Project</Label>
                <Input value={form.project} onChange={e => set('project', e.target.value)} placeholder="Project name" />
              </div>
              <div>
                <Label>Source</Label>
                <Sel value={form.source} onChange={e => set('source', e.target.value)}>
                  <option>Facebook</option>
                  <option>WhatsApp</option>
                  <option>Walk-in</option>
                  <option>Referral</option>
                  <option>Website</option>
                  <option>Other</option>
                </Sel>
              </div>
              <div>
                <Label>Creator</Label>
                <Input value={form.creator} onChange={e => set('creator', e.target.value)} />
              </div>
              <div>
                <Label>CR</Label>
                <Sel value={form.cr} onChange={e => set('cr', e.target.value)}>
                  <option>CR or SR</option>
                  <option>CR</option>
                  <option>SR</option>
                </Sel>
              </div>
            </div>
          </SectionCard>

          <div style={{ height: 14 }} />

          <SectionCard>
            <SectionHeader icon={<User size={15} />} title="Contact Details" description="Name and mobile are required" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <Label required>Name</Label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Full name"
                  style={{ ...base, ...(errors.name ? errStyle : {}) }}
                  {...fieldFocus}
                />
                {errors.name && <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>Required</p>}
              </div>
              <div>
                <Label required>Mobile</Label>
                <input
                  value={form.mobile}
                  onChange={e => set('mobile', e.target.value)}
                  placeholder="880..."
                  style={{ ...base, ...(errors.mobile ? errStyle : {}) }}
                  {...fieldFocus}
                />
                {errors.mobile && <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>Required</p>}
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
              </div>
              <div>
                <Label>Date</Label>
                <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)}
                  style={base} {...fieldFocus} />
              </div>
            </div>
          </SectionCard>

          <div style={{ height: 14 }} />

          <SectionCard>
            <SectionHeader icon={<MapPin size={15} />} title="Additional Details" />
            <div style={{ marginBottom: 14 }}>
              <Label>Address</Label>
              <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <Label>Profession</Label>
                <Sel value={form.profession} onChange={e => set('profession', e.target.value)}>
                  <option>Unknown</option>
                  <option>Business</option>
                  <option>Service</option>
                  <option>Student</option>
                  <option>Other</option>
                </Sel>
              </div>
              <div>
                <Label>Area</Label>
                <Sel value={form.area} onChange={e => set('area', e.target.value)}>
                  <option>Ababor</option>
                  <option>Dhaka</option>
                  <option>Chittagong</option>
                  <option>Sylhet</option>
                  <option>Other</option>
                </Sel>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Modal Footer ── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10,
          padding: '16px 24px',
          borderTop: '1px solid var(--border, #e2e8f0)',
          background: 'var(--bg-muted, #f8fafc)',
          borderRadius: `0 0 ${t.radius.xl}px ${t.radius.xl}px`,
        }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: t.radius.md, fontSize: 13.5, fontWeight: 600,
            border: '1.5px solid var(--border, #e2e8f0)',
            background: 'var(--bg-card, #fff)',
            color: 'var(--text, #374151)', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input, #f1f5f9)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card, #fff)'}
          >
            Cancel
          </button>
          <button onClick={handleSubmit} style={{
            padding: '9px 22px', borderRadius: t.radius.md, fontSize: 13.5, fontWeight: 600,
            border: 'none',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: '#fff', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
            transition: 'opacity 0.15s, transform 0.1s',
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {isEdit ? 'Save Changes' : 'Add Client'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete confirmation modal
// ─────────────────────────────────────────────────────────────────────────────
const DeleteConfirmModal = ({ client, onCancel, onConfirm }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15,23,42,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1200, padding: 20,
    }}
    onClick={onCancel}
  >
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      onClick={e => e.stopPropagation()}
      style={{
        background: 'var(--bg-card, #ffffff)',
        borderRadius: t.radius.xl,
        width: '100%', maxWidth: 420,
        boxShadow: t.shadow.lg,
        border: '1px solid var(--border, #e2e8f0)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '26px 24px 20px', textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
        }}>
          <Trash2 size={22} color="#ef4444" />
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #0f172a)', margin: '0 0 6px' }}>
          Delete this client?
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #64748b)', margin: 0 }}>
          <strong>{client?.name}</strong> will be permanently removed from the call queue. This can't be undone.
        </p>
      </div>
      <div style={{
        display: 'flex', gap: 10, padding: '16px 24px',
        borderTop: '1px solid var(--border, #e2e8f0)',
        background: 'var(--bg-muted, #f8fafc)',
      }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '9px 0', borderRadius: t.radius.md, fontSize: 13.5, fontWeight: 600,
          border: '1.5px solid var(--border, #e2e8f0)',
          background: 'var(--bg-card, #fff)',
          color: 'var(--text, #374151)', cursor: 'pointer',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input, #f1f5f9)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card, #fff)'}
        >
          Cancel
        </button>
        <button onClick={onConfirm} style={{
          flex: 1, padding: '9px 0', borderRadius: t.radius.md, fontSize: 13.5, fontWeight: 600,
          border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
          transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Take Call Modal — redesigned as one organised, scrollable flow instead of
// tabs (most of the old tabs were dead ends with no real content behind them,
// which was the biggest source of clutter/confusion).
// ─────────────────────────────────────────────────────────────────────────────
const TakeCallModal = ({ lead, onChange, onClose, onSubmit, user }) => {
  const [followupEnabled, setFollowupEnabled] = useState(Boolean(lead.followupDate));

  const toggleFollowup = () => {
    const next = !followupEnabled;
    setFollowupEnabled(next);
    if (!next) onChange('followupDate', '');
  };

  const telLink = lead.mobile ? `tel:${lead.mobile}` : null;
  const waLink = lead.mobile ? `https://wa.me/${String(lead.mobile).replace(/[^0-9]/g, '')}` : null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card, #ffffff)',
          borderRadius: t.radius.xl,
          width: '100%', maxWidth: 720,
          maxHeight: '92vh', overflowY: 'auto',
          boxShadow: t.shadow.lg,
          border: '1px solid var(--border, #e2e8f0)',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          borderRadius: `${t.radius.xl}px ${t.radius.xl}px 0 0`,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={lead.name} size={38} />
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>
                {lead.name}
              </h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {lead.project && <Pill>{lead.project}</Pill>}
                {lead.source && <Pill>{lead.source}</Pill>}
                <Pill>{lead.creator || 'Admin'}</Pill>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff',
              cursor: 'pointer', width: 30, height: 30, borderRadius: t.radius.sm, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>

          {/* ── Quick contact actions ── */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            {telLink && (
              <a href={telLink} style={actionBtnPrimary}>
                <PhoneCall size={15} /> Call {lead.mobile}
              </a>
            )}
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" style={actionBtnSecondary}>
                <MessageCircle size={15} /> WhatsApp
              </a>
            )}
          </div>

          {/* ── Locked client record — collapsed by default to cut clutter ── */}
          <CollapsibleSection
            title="Client details"
            icon={<User size={14} />}
            summary={`${lead.mobile || 'no mobile'} · ${lead.email || 'no email'}`}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {[
                { label: 'Mobile', value: lead.mobile },
                { label: 'Email', value: lead.email },
                { label: 'DOB', value: lead.dob },
                { label: 'Address', value: lead.address },
                { label: 'Profession', value: lead.profession || 'Unknown' },
                { label: 'Area', value: lead.area || 'Ababor' },
                { label: 'Creator', value: lead.creator || 'Admin' },
                { label: 'CR', value: lead.cr || 'CR or SR' },
                { label: 'Created At', value: lead.createdAt },
              ].map(f => (
                <div key={f.label}>
                  <Label>{f.label}</Label>
                  <ROField value={f.value} />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <div style={{ height: 16 }} />

          {/* ── Call Outcome ── */}
          <SectionCard>
            <SectionHeader icon={<PhoneCall size={15} />} title="Call Outcome" description="What happened on this call" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <Label>Status</Label>
                <Sel value={lead.coStatus || 'Busy'} onChange={e => onChange('coStatus', e.target.value)}>
                  <option>Busy</option>
                  <option>Answered</option>
                  <option>No Answer</option>
                  <option>Switched Off</option>
                  <option>Wrong Number</option>
                </Sel>
              </div>
              <div>
                <Label>Method</Label>
                <Sel value={lead.coMethod || 'Call'} onChange={e => onChange('coMethod', e.target.value)}>
                  <option>Call</option>
                  <option>WhatsApp</option>
                  <option>SMS</option>
                  <option>Email</option>
                </Sel>
              </div>
            </div>
            <Label>Notes</Label>
            <textarea
              value={lead.coComment || ''}
              onChange={e => onChange('coComment', e.target.value)}
              rows={3}
              placeholder="Notes from this call..."
              style={{ ...base, resize: 'vertical', lineHeight: 1.5 }}
              {...fieldFocus}
            />
          </SectionCard>

          <div style={{ height: 14 }} />

          {/* ── Offer Discussed ── */}
          <SectionCard>
            <SectionHeader
              icon={<Gift size={15} />}
              title="Offer Discussed"
              description={`Project: ${lead.project || '—'}`}
            />
            <Label>Offers</Label>
            <Sel value={lead.offers || ''} onChange={e => onChange('offers', e.target.value)}>
              <option value="">None selected</option>
              <option value="discount">Projects</option>
              <option value="installment">Land/Flat Plan</option>
              <option value="free_visit">Free Site Visit</option>
            </Sel>
          </SectionCard>

          <div style={{ height: 14 }} />

          {/* ── Schedule Follow-up — collapses away when not needed ── */}
          <SectionCard>
            <SectionHeader
              icon={<Calendar size={15} />}
              title="Schedule Follow-up"
              description="Moves this lead to the Follow Up list when you submit"
              action={<Toggle checked={followupEnabled} onChange={toggleFollowup} />}
            />
            {followupEnabled ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <Label>Followup Date</Label>
                    <input
                      type="date"
                      value={lead.followupDate || ''}
                      onChange={e => onChange('followupDate', e.target.value)}
                      style={base} {...fieldFocus}
                    />
                  </div>
                  <div>
                    <Label>Followup Type</Label>
                    <Sel value={lead.followupType || 'Regular'} onChange={e => onChange('followupType', e.target.value)}>
                      <option>Regular</option>
                      <option>Priority</option>
                      <option>Site Visit</option>
                    </Sel>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Label>Followup Caller</Label>
                  <Sel value={lead.followupCaller || user?.firstName || 'Admin 2'} onChange={e => onChange('followupCaller', e.target.value)}>
                    <option>{user?.firstName || 'Admin 2'}</option>
                    <option>Admin 1</option>
                    <option>Agent 1</option>
                  </Sel>
                </div>
                <Label>Followup Note</Label>
                <textarea
                  value={lead.followupNote || ''}
                  onChange={e => onChange('followupNote', e.target.value)}
                  rows={2}
                  placeholder="Add a note for the followup..."
                  style={{ ...base, resize: 'vertical', lineHeight: 1.5 }}
                  {...fieldFocus}
                />
              </>
            ) : (
              <p style={{ fontSize: 12.5, color: 'var(--text-muted, #94a3b8)', margin: 0, fontStyle: 'italic' }}>
                No follow-up scheduled. Turn this on to set a date and keep this lead on your radar.
              </p>
            )}
          </SectionCard>

          <div style={{ height: 14 }} />

          {/* ── Lead Status ── */}
          <SectionCard>
            <SectionHeader icon={<CheckCircle2 size={15} />} title="Lead Status" />
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
              <div>
                <Label>Status</Label>
                <Sel value={lead.status || 'New'} onChange={e => onChange('status', e.target.value)}>
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Interested</option>
                  <option>Not Interested</option>
                  <option>Converted</option>
                  <option>Dropped</option>
                </Sel>
              </div>
              <div>
                <Label>Conversion %</Label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number" min="0" max="100"
                    value={lead.percentage ?? 0}
                    onChange={e => onChange('percentage', Number(e.target.value))}
                    style={{ ...base, paddingRight: 32 }}
                    {...fieldFocus}
                  />
                  <span style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 13, color: 'var(--text-muted, #94a3b8)', pointerEvents: 'none',
                  }}>%</span>
                </div>
              </div>
            </div>
            <div style={{
              marginTop: 12, height: 6, borderRadius: 99,
              background: 'var(--bg-muted, #e2e8f0)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, lead.percentage || 0))}%`,
                background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                borderRadius: 99, transition: 'width 0.3s',
              }} />
            </div>
          </SectionCard>

          <div style={{ height: 14 }} />

          {/* ── Future capabilities, kept out of the way until they're built ── */}
          <CollapsibleSection
            title="More options"
            icon={<Filter size={14} />}
            summary="Visit scheduling, requirements — coming soon"
          >
            <p style={{ fontSize: 12.5, color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
              Visit scheduling and requirement tracking for this lead aren't available yet.
            </p>
          </CollapsibleSection>
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10,
          padding: '16px 24px',
          borderTop: '1px solid var(--border, #e2e8f0)',
          background: 'var(--bg-muted, #f8fafc)',
          borderRadius: `0 0 ${t.radius.xl}px ${t.radius.xl}px`,
          position: 'sticky', bottom: 0, zIndex: 10,
        }}>
          <button onClick={onClose} style={{
            padding: '9px 20px', borderRadius: t.radius.md, fontSize: 13.5, fontWeight: 600,
            border: '1.5px solid var(--border, #e2e8f0)',
            background: 'var(--bg-card, #fff)',
            color: 'var(--text, #374151)', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input, #f1f5f9)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card, #fff)'}
          >
            Close
          </button>
          <button
            onClick={onSubmit}
            style={{
              padding: '9px 22px', borderRadius: t.radius.md, fontSize: 13.5, fontWeight: 600,
              border: 'none',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: '#fff', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
              transition: 'opacity 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {followupEnabled ? 'Log Call & Schedule Follow-up' : 'Log Call'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Pagination button
// ─────────────────────────────────────────────────────────────────────────────
const PageBtn = ({ active, disabled, onClick, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      minWidth: 34, height: 32, padding: '0 10px',
      borderRadius: t.radius.sm,
      border: active ? 'none' : '1.5px solid var(--border, #e2e8f0)',
      background: active
        ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
        : 'var(--bg-card, #fff)',
      color: active ? '#fff' : disabled ? 'var(--text-muted, #cbd5e1)' : 'var(--text, #374151)',
      fontSize: 12.5, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
      boxShadow: active ? '0 2px 6px rgba(59,130,246,0.3)' : 'none',
      transition: 'all 0.15s',
    }}
  >
    {children}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// Overview stat card
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color }) => (
  <div style={{
    flex: '1 1 130px', minWidth: 130,
    background: 'var(--bg-card, #fff)', border: '1.5px solid var(--border, #e2e8f0)',
    borderRadius: t.radius.lg, padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: 4,
    borderLeft: color ? `3px solid ${color}` : undefined,
  }}>
    <span style={{
      fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #94a3b8)',
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {label}
    </span>
    <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #0f172a)' }}>{value}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main NewCall component
// ─────────────────────────────────────────────────────────────────────────────
const NewCall = ({ db, setDb, logAction, user }) => {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeLead, setActiveLead] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const queue = db?.callQueue || [];

  const stats = useMemo(() => {
    const bySource = queue.reduce((acc, item) => {
      const s = item.source || 'Other';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    return { total: queue.length, bySource };
  }, [queue]);

  const filtered = useMemo(() => {
    let list = queue;
    if (sourceFilter !== 'All') list = list.filter(item => item.source === sourceFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(item =>
        item.name?.toLowerCase().includes(q) ||
        item.mobile?.toLowerCase().includes(q) ||
        String(item.id).includes(q) ||
        item.project?.toLowerCase().includes(q) ||
        item.source?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [queue, search, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openTakeCall = lead => setActiveLead({
    ...lead,
    coComment: '', coStatus: 'Busy', coMethod: 'Call',
    followupDate: '', followupType: 'Regular',
    followupCaller: user?.firstName || 'Admin 2',
    followupNote: '', status: 'New', percentage: 0,
  });
  const closeTakeCall = () => setActiveLead(null);
  const updateActiveLead = (field, value) =>
    setActiveLead(prev => ({ ...prev, [field]: value }));

  // Maps the in-call "Followup Type" to the priority levels used on the Follow Up page
  const followupPriorityMap = { Priority: 'high', 'Site Visit': 'medium', Regular: 'low' };

  const submitTakeCall = () => {
    if (!activeLead) return;

    const entry = {
      id: Date.now(),
      clientName: activeLead.name,
      phone: activeLead.mobile,
      email: activeLead.email || '',
      subject: `${activeLead.project || ''} — Lead follow-up`.trim(),
      priority: 'medium',
      notes: activeLead.coComment || '',
      agent: user?.firstName || 'Unknown',
      type: 'inbound', duration: 0,
      date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      timestamp: new Date().toISOString(),
      project: activeLead.project,
      source: activeLead.source,
      status: activeLead.status,
    };

    // A follow-up date being set means this call should graduate into the Follow Up list
    const hasFollowup = Boolean(activeLead.followupDate);

    setDb(prev => {
      const next = {
        ...prev,
        callLogs: [entry, ...(prev.callLogs || [])],
        callQueue: (prev.callQueue || []).filter(item => item.id !== activeLead.id),
      };

      if (hasFollowup) {
        const followUpEntry = {
          id: Date.now() + 1,
          client: activeLead.name,
          phone: activeLead.mobile,
          subject: activeLead.followupNote?.trim()
            || `${activeLead.project || 'Lead'} follow-up (${activeLead.followupType || 'Regular'})`,
          dueDate: activeLead.followupDate,
          priority: followupPriorityMap[activeLead.followupType] || 'medium',
          status: 'pending',
          createdBy: activeLead.followupCaller || user?.firstName || 'Admin',
        };
        next.followUps = [followUpEntry, ...(prev.followUps || [])];
      }

      return next;
    });

    logAction?.(
      hasFollowup ? 'Took call & scheduled follow-up' : 'Took call from queue',
      'Call',
      activeLead.name
    );
    closeTakeCall();
  };

  const handleAddClient = newClient => {
    setDb(prev => ({ ...prev, callQueue: [newClient, ...(prev.callQueue || [])] }));
    logAction?.('Added new client', 'Client', newClient.name);
  };

  const handleEditClient = updatedClient => {
    setDb(prev => ({
      ...prev,
      callQueue: (prev.callQueue || []).map(c => c.id === updatedClient.id ? updatedClient : c),
    }));
    logAction?.('Updated client', 'Client', updatedClient.name);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDb(prev => ({
      ...prev,
      callQueue: (prev.callQueue || []).filter(c => c.id !== deleteTarget.id),
    }));
    logAction?.('Deleted client', 'Client', deleteTarget.name);
    setDeleteTarget(null);
  };

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
    >
      {/* ── Page Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 18, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #0f172a)', margin: '0 0 4px' }}>
            New Calls
          </h1>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: 13.5, margin: 0 }}>
            Manage and take calls from the queue
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 20px', borderRadius: t.radius.md,
            fontSize: 13.5, fontWeight: 600, border: 'none',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: '#fff', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
            transition: 'opacity 0.15s, transform 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Plus size={16} />
          Add New Client
        </button>
      </div>

      {/* ── Overview stats — colours match the source badges below for a single, consistent system ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <StatCard label="Total Leads" value={stats.total} color="#3b82f6" />
        {Object.entries(sourcePalette).map(([src, pal]) => (
          <StatCard key={src} label={src} value={stats.bySource[src] || 0} color={pal.color} />
        ))}
      </div>

      {/* ── Table Card ── */}
      <div style={{
        background: 'var(--bg-card, #fff)',
        border: '1.5px solid var(--border, #e2e8f0)',
        borderRadius: t.radius.lg,
        overflow: 'hidden',
        boxShadow: t.shadow.sm,
      }}>
        {/* Controls bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
          padding: '14px 18px',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          background: 'var(--bg-muted, #f8fafc)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-muted, #64748b)' }}>
              Show
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                style={{
                  background: 'var(--bg-card, #fff)',
                  border: '1.5px solid var(--border, #e2e8f0)',
                  borderRadius: t.radius.sm,
                  padding: '5px 10px', fontSize: 13,
                  color: 'var(--text, #374151)',
                  cursor: 'pointer', outline: 'none',
                  fontWeight: 500,
                }}
              >
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              entries
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-muted, #64748b)' }}>
              <Filter size={14} style={{ flexShrink: 0 }} />
              <select
                value={sourceFilter}
                onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
                style={{
                  background: 'var(--bg-card, #fff)',
                  border: '1.5px solid var(--border, #e2e8f0)',
                  borderRadius: t.radius.sm,
                  padding: '5px 10px', fontSize: 13,
                  color: 'var(--text, #374151)',
                  cursor: 'pointer', outline: 'none',
                  fontWeight: 500,
                }}
              >
                <option value="All">All sources</option>
                {Object.keys(sourcePalette).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-card, #fff)',
            border: '1.5px solid var(--border, #e2e8f0)',
            borderRadius: t.radius.md,
            padding: '7px 12px',
          }}>
            <Search size={14} style={{ color: 'var(--text-muted, #94a3b8)', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, mobile, project..."
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontSize: 13.5, color: 'var(--text, #374151)',
                width: 220,
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-muted, #f8fafc)' }}>
                {['Client', 'Mobile', 'Project', 'Source', 'CR', 'Created At', 'Actions'].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i === 6 ? 'center' : 'left',
                    padding: '11px 16px',
                    fontSize: 11.5, fontWeight: 700,
                    color: 'var(--text-muted, #64748b)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    borderBottom: '1.5px solid var(--border, #e2e8f0)',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{
                    padding: '56px 20px',
                    textAlign: 'center',
                    color: 'var(--text-muted, #94a3b8)',
                  }}>
                    <Users size={32} style={{ opacity: 0.3, marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
                    <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 6px' }}>No client records found</p>
                    <p style={{ fontSize: 13, margin: 0, opacity: 0.7 }}>
                      {queue.length === 0
                        ? 'Click "Add New Client" to get started.'
                        : 'Try a different search term or source filter.'}
                    </p>
                  </td>
                </tr>
              ) : pageItems.map((item, i) => (
                <tr
                  key={item.id}
                  onMouseEnter={() => setHoveredRow(item.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    background: hoveredRow === item.id
                      ? 'var(--primary-soft, rgba(59,130,246,0.04))'
                      : i % 2 !== 0 ? 'var(--bg-muted, #f8fafc)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  {/* Client (avatar + name + id) */}
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border, #f1f5f9)', maxWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={item.name} size={30} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 13.5, fontWeight: 600, color: 'var(--text, #1e293b)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted, #94a3b8)' }}>#{item.id}</div>
                      </div>
                    </div>
                  </td>
                  {/* Mobile */}
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text, #374151)', borderBottom: '1px solid var(--border, #f1f5f9)', whiteSpace: 'nowrap' }}>
                    {item.mobile}
                  </td>
                  {/* Project */}
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text, #374151)', borderBottom: '1px solid var(--border, #f1f5f9)' }}>
                    {item.project || <span style={{ color: 'var(--text-muted, #94a3b8)' }}>—</span>}
                  </td>
                  {/* Source */}
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border, #f1f5f9)' }}>
                    {item.source ? <SourceBadge source={item.source} /> : <span style={{ color: 'var(--text-muted, #94a3b8)' }}>—</span>}
                  </td>
                  {/* CR */}
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text, #374151)', borderBottom: '1px solid var(--border, #f1f5f9)' }}>
                    {item.cr || 'CR or SR'}
                  </td>
                  {/* Created At */}
                  <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--text-muted, #64748b)', borderBottom: '1px solid var(--border, #f1f5f9)', whiteSpace: 'nowrap' }}>
                    {item.createdAt}
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid var(--border, #f1f5f9)' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        onClick={() => openTakeCall(item)}
                        title="Take this call"
                        style={iconBtnStyle('linear-gradient(135deg, #1e40af, #3b82f6)', '#fff', 'rgba(59,130,246,0.4)')}
                        {...iconBtnHover}
                      >
                        <Phone size={14} />
                      </button>
                      <button
                        onClick={() => setEditingClient(item)}
                        title="Edit client"
                        style={iconBtnStyle('#f1f5f9', '#475569')}
                        {...iconBtnHover}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        title="Delete client"
                        style={iconBtnStyle('#fef2f2', '#ef4444')}
                        {...iconBtnHover}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
          padding: '12px 18px',
          borderTop: '1px solid var(--border, #e2e8f0)',
          background: 'var(--bg-muted, #f8fafc)',
        }}>
          <span style={{ fontSize: 12.5, color: 'var(--text-muted, #64748b)' }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
            {filtered.length !== queue.length ? ` (filtered from ${queue.length})` : ''}
          </span>

          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <PageBtn disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              <ChevronLeft size={13} /> Previous
            </PageBtn>

            {pageNums.map((p, idx) =>
              p === '...' ? (
                <span key={`d${idx}`} style={{ color: 'var(--text-muted)', fontSize: 12, padding: '0 2px' }}>…</span>
              ) : (
                <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>
                  {p}
                </PageBtn>
              )
            )}

            <PageBtn disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              Next <ChevronRight size={13} />
            </PageBtn>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showAddModal && (
          <ClientFormModal
            key="add-modal"
            onClose={() => setShowAddModal(false)}
            onSave={handleAddClient}
            user={user}
          />
        )}
        {editingClient && (
          <ClientFormModal
            key="edit-modal"
            client={editingClient}
            onClose={() => setEditingClient(null)}
            onSave={handleEditClient}
            user={user}
          />
        )}
        {deleteTarget && (
          <DeleteConfirmModal
            key="delete-modal"
            client={deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        )}
        {activeLead && (
          <TakeCallModal
            key="take-call-modal"
            lead={activeLead}
            onChange={updateActiveLead}
            onClose={closeTakeCall}
            onSubmit={submitTakeCall}
            user={user}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NewCall;