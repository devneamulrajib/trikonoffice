import React from 'react';
import { Phone, Briefcase, MapPin, LandPlot, MessageCircle, User, Building } from 'lucide-react';

const C = {
  surface: '#FFFFFF', surfaceRaised: '#F8FAFC', surfaceSunken: '#F1F5F9',
  border: '#E2E8F0', text: '#0F172A', textMid: '#475569', textMuted: '#94A3B8',
  accentDark: '#D97706', accentLight: '#FEF3C7',
  r: { sm: 6, md: 8, lg: 12 },
  shadow: { sm: '0 1px 2px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.08)' },
};

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
 */
const CustomerProfile = ({ client, compact = false }) => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Section icon={User} title="Contact Information">
        <Field label="Full Name" value={client.name} />
        <Field label="Phone" value={client.phone} />
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
        <Field label="Status" value={client.status} />
        <Field label="Source" value={client.source} />
      </Section>

      <Section icon={MapPin} title="Property Requirements">
        <Field label="Property Type" value={client.propertyType} />
        <Field label="Preferred Location" value={client.location} />
        <Field label="Budget Range" value={budget} />
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