import React from 'react';
import {
  Phone, Briefcase, MapPin, LandPlot, MessageCircle, User, Building,
  DollarSign, CheckCircle2, UserCheck, CalendarClock,
} from 'lucide-react';

const C = {
  surface: '#FFFFFF', surfaceRaised: '#F8FAFC', surfaceSunken: '#F1F5F9',
  border: '#E2E8F0', text: '#0F172A', textMid: '#475569', textMuted: '#94A3B8',
  accentDark: '#D97706', accentLight: '#FEF3C7',
  green: '#10B981', greenBg: '#ECFDF5', greenBorder: '#6EE7B7',
  red: '#EF4444', redBg: '#FEF2F2', redBorder: '#FCA5A5',
  blue: '#3B82F6', blueBg: '#EFF6FF', blueBorder: '#BFDBFE',
  yellow: '#F59E0B', yellowBg: '#FFFBEB', yellowBorder: '#FDE68A',
  purple: '#8B5CF6', purpleBg: '#F5F3FF', purpleBorder: '#DDD6FE',
  slate: '#64748B', slateBg: '#F8FAFC', slateBorder: '#E2E8F0',
  r: { sm: 6, md: 8, lg: 12 },
  shadow: { sm: '0 1px 2px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.08)' },
};

// Mirrors CLIENT_STATUS_STYLE in NewCall.jsx so the highlighted Status chip
// here always matches the pill color shown in the queue table.
const STATUS_STYLE = {
  Lead:        { color: C.blue,       bg: C.blueBg,   border: C.blueBorder   },
  Contacted:   { color: C.accentDark, bg: C.yellowBg, border: C.yellowBorder },
  Negotiation: { color: C.purple,     bg: C.purpleBg, border: C.purpleBorder },
  Closed:      { color: C.green,      bg: C.greenBg,  border: C.greenBorder  },
  Lost:        { color: C.red,        bg: C.redBg,    border: C.redBorder    },
};
const statusMeta = (s) => STATUS_STYLE[s] || { color: C.slate, bg: C.slateBg, border: C.slateBorder };

const FieldLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: '.07em',
    textTransform: 'uppercase', marginBottom: 5 }}>
    {children}
  </div>
);

const ROField = ({ value }) => (
  <div style={{ width: '100%', padding: '9px 12px', fontSize: 13.5, boxSizing: 'border-box',
    border: `1.5px solid ${C.border}`, borderRadius: C.r.md, background: C.surfaceSunken,
    color: value ? C.text : C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
    {value || '—'}
  </div>
);

const Field = ({ label, value }) => (
  <div><FieldLabel>{label}</FieldLabel><ROField value={value} /></div>
);

const Section = ({ icon: Icon, title, children }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r.lg,
    padding: 16, boxShadow: C.shadow.sm }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <div style={{ width: 26, height: 26, borderRadius: C.r.sm, background: C.accentLight,
        color: C.accentDark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={13} />
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{title}</span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
  </div>
);

// ─── Highlighted key-field chip ───────────────────────────────────────────
// Used for the 3 "important at a glance" fields: Phone, Status, Budget.
// Visually distinct from the regular read-only sections below — colored
// background + border + icon badge, rather than the plain gray ROField look.
const Highlight = ({ icon: Icon, label, value, color, bg, border, mono }) => (
  <div style={{ flex: 1, minWidth: 0, padding: '11px 13px', borderRadius: C.r.lg,
    background: bg, border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{ width: 30, height: 30, borderRadius: C.r.sm, background: C.surface,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={14} color={color} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color, textTransform: 'uppercase',
        letterSpacing: '.06em', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text,
        fontFamily: mono ? 'monospace' : 'inherit',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value || '—'}
      </div>
    </div>
  </div>
);

/**
 * CustomerProfile — single source-of-truth, read-only customer panel.
 *
 * IMPORTANT: always pass the LIVE client record — e.g.
 *   const liveClient = (db.clients || []).find(c => c.id === someClientId)
 * — never a point-in-time copy stored on a call log / follow-up / visit
 * record. That's what makes every module show identical, current data.
 *
 * Props:
 *  - client: the live client object (or null while unresolved)
 *  - compact: when true, hides the Remarks section (useful in tight layouts)
 *  - nextScheduledCall: optional date/string for the next scheduled call
 *    (e.g. from a Reschedule record). Falls back to client.nextScheduledCall
 *    if not passed. Shows "—" until Reschedule (item #5) is wired up.
 */
const CustomerProfile = ({ client, compact = false, nextScheduledCall }) => {
  if (!client) {
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.r.lg,
        padding: 28, textAlign: 'center', color: C.textMuted }}>
        <User size={22} style={{ opacity: .4, marginBottom: 8 }} />
        <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>No client record linked yet.</div>
      </div>
    );
  }

  const budget = (client.budgetMin || client.budgetMax)
    ? `${client.budgetMin || '0'} – ${client.budgetMax || '0'}`
    : '';

  const sMeta = statusMeta(client.status);
  const nextCall = nextScheduledCall || client.nextScheduledCall || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Highlighted key fields: Phone / Status / Budget ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Highlight icon={Phone} label="Phone" value={client.phone} mono
          color={C.blue} bg={C.blueBg} border={C.blueBorder} />
        <Highlight icon={CheckCircle2} label="Status" value={client.status}
          color={sMeta.color} bg={sMeta.bg} border={sMeta.border} />
        <Highlight icon={DollarSign} label="Budget Range" value={budget}
          color={C.green} bg={C.greenBg} border={C.greenBorder} />
      </div>

      <Section icon={User} title="Contact Information">
        <Field label="Full Name" value={client.name} />
        <Field label="Alternative Phone" value={client.altPhone} />
        <Field label="Email" value={client.email} />
      </Section>

      <Section icon={Briefcase} title="Professional Information">
        <Field label="Profession" value={client.profession} />
        <Field label="Designation" value={client.designation} />
        <Field label="Company" value={client.company} />
      </Section>

      <Section icon={Building} title="Customer Details">
        <Field label="Client Type" value={client.type} />
        <Field label="Purpose" value={client.purpose} />
        <Field label="Source" value={client.source} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FieldLabel>Assigned Agent</FieldLabel>
        </div>
        <div style={{ marginTop: -6 }}>
          {client.assignedAgentName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 12px',
              border: `1.5px solid ${C.blueBorder}`, borderRadius: C.r.md, background: C.blueBg }}>
              <UserCheck size={13} color={C.blue} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.blue,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {client.assignedAgentName}
              </span>
            </div>
          ) : (
            <ROField value={null} />
          )}
        </div>
        <Field label="Next Scheduled Call" value={nextCall} />
      </Section>

      <Section icon={MapPin} title="Property Requirements">
        <Field label="Property Type" value={client.propertyType} />
        <Field label="Preferred Location" value={client.location} />
        <Field label="Address" value={client.address} />
      </Section>

      <Section icon={LandPlot} title="Requirements">
        <Field label="Land Requirement" value={client.reqLand} />
        <Field label="Flat Requirement" value={client.reqFlat} />
        <Field label="Facing Preference" value={client.reqFacing} />
      </Section>

      {!compact && (
        <Section icon={MessageCircle} title="Remarks">
          <div style={{ fontSize: 13, color: client.notes ? C.text : C.textMuted, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {client.notes?.trim() || 'No remarks on file.'}
          </div>
        </Section>
      )}
    </div>
  );
};

export default CustomerProfile;