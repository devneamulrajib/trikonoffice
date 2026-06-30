import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, Mail, Building2, LandPlot, Home, Compass, UserPlus, ArrowLeft
} from 'lucide-react';
import Page from '../../components/Page';

// ─── CONSTANTS (mirrors ManageClients.jsx) ──────────────────────────────────
const CLIENT_TYPES = ['Buyer', 'Seller', 'Tenant', 'Landlord', 'Investor'];
const PURPOSES = ['Invest', 'Living', 'Rent'];
const STATUS_OPTIONS = ['Lead', 'Contacted', 'Negotiation', 'Closed', 'Lost'];
const SOURCES = ['Referral', 'Walk-in', 'Website', 'Facebook', 'Call Center', 'Agent Network', 'Other'];
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot/Land', 'Commercial', 'Office Space', 'Townhouse'];

const emptyClient = () => ({
  id: Date.now(),
  name: '',
  profession: '',
  designation: '',
  company: '',
  phone: '',
  altPhone: '',
  email: '',
  type: 'Buyer',
  purpose: '',
  status: 'Lead',
  source: 'Referral',
  propertyType: 'Apartment',
  budgetMin: '',
  budgetMax: '',
  location: '',
  address: '',
  reqLand: '',
  reqFlat: '',
  reqFacing: '',
  notes: '',
  createdAt: new Date().toISOString(),
});

// ─── SHARED STYLES (matches ManageClients.jsx) ───────────────────────────────
const inputStyle = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '9px 12px', fontSize: 13,
  color: 'var(--text)', outline: 'none', boxSizing: 'border-box'
};

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 12, fontWeight: 800, color: 'var(--primary)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6
  }}>
    {children}
  </div>
);

const Field = ({ label, children, full }) => (
  <div style={{ gridColumn: full ? '1 / -1' : 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{
      fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.04em',
      display: 'flex', alignItems: 'center', gap: 5
    }}>
      {label}
    </label>
    {children}
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const AddClient = ({ db, setDb, logAction, setView }) => {
  const [client, setClient] = useState(emptyClient());
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setClient(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (!client.name?.trim()) return;

    setDb(prev => ({
      ...prev,
      clients: [client, ...(prev.clients || [])],
    }));

    logAction('Added client', 'client', client.name);

    setSaved(true);
    setClient(emptyClient());
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Page title="Add Client" subtitle="Create a single client record">
        {/* ── BACK LINK ────────────────────────────────────────────────── */}
        <button
          onClick={() => setView('clients')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 13, fontWeight: 600,
            marginBottom: 20, padding: 0,
          }}
        >
          <ArrowLeft size={14} /> Back to Clients
        </button>

        <div style={{
          background: 'var(--surface)', borderRadius: 16,
          padding: 28, border: '1px solid var(--border)', maxWidth: 760
        }}>
          {saved && (
            <div style={{
              background: 'rgba(34,197,94,0.1)', color: '#22C55E',
              borderRadius: 10, padding: '10px 14px', fontSize: 13,
              fontWeight: 700, marginBottom: 20,
            }}>
              ✓ Client added successfully
            </div>
          )}

          {/* ── Basic Info ─────────────────────────────────────────── */}
          <SectionLabel><UserPlus size={12} /> Basic Info</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
            <Field label="Full Name *" full>
              <input value={client.name} onChange={e => set('name', e.target.value)} style={inputStyle} placeholder="e.g. Mr. Ahmed Karim" />
            </Field>

            <Field label="Profession">
              <input value={client.profession} onChange={e => set('profession', e.target.value)} style={inputStyle} placeholder="e.g. Doctor, Engineer" />
            </Field>

            <Field label="Designation">
              <input value={client.designation} onChange={e => set('designation', e.target.value)} style={inputStyle} placeholder="e.g. Senior Manager" />
            </Field>

            <Field label="Company / Organization" full>
              <input value={client.company} onChange={e => set('company', e.target.value)} style={inputStyle} placeholder="e.g. ABC Ltd." />
            </Field>
          </div>

          {/* ── Contact Info ───────────────────────────────────────── */}
          <SectionLabel><Phone size={12} /> Contact Info</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
            <Field label="Phone">
              <input value={client.phone} onChange={e => set('phone', e.target.value)} style={inputStyle} placeholder="01XXXXXXXXX" />
            </Field>

            <Field label="Alternative Number">
              <input value={client.altPhone} onChange={e => set('altPhone', e.target.value)} style={inputStyle} placeholder="01XXXXXXXXX" />
            </Field>

            <Field label="Email" full>
              <input value={client.email} onChange={e => set('email', e.target.value)} style={inputStyle} placeholder="email@example.com" />
            </Field>
          </div>

          {/* ── Deal Info ──────────────────────────────────────────── */}
          <SectionLabel><Building2 size={12} /> Deal Info</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
            <Field label="Client Type">
              <select value={client.type} onChange={e => set('type', e.target.value)} style={inputStyle}>
                {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            <Field label="Purpose">
              <select value={client.purpose} onChange={e => set('purpose', e.target.value)} style={inputStyle}>
                <option value="">— Not specified —</option>
                {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>

            <Field label="Status">
              <select value={client.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            <Field label="Source">
              <select value={client.source} onChange={e => set('source', e.target.value)} style={inputStyle}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            <Field label="Property Type">
              <select value={client.propertyType} onChange={e => set('propertyType', e.target.value)} style={inputStyle}>
                {PROPERTY_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>

            <Field label="Preferred Location">
              <input value={client.location} onChange={e => set('location', e.target.value)} style={inputStyle} placeholder="e.g. Gulshan, Dhaka" />
            </Field>

            <Field label="Budget Min (BDT)">
              <input type="number" value={client.budgetMin} onChange={e => set('budgetMin', e.target.value)} style={inputStyle} placeholder="0" />
            </Field>

            <Field label="Budget Max (BDT)">
              <input type="number" value={client.budgetMax} onChange={e => set('budgetMax', e.target.value)} style={inputStyle} placeholder="0" />
            </Field>

            <Field label="Address" full>
              <input value={client.address} onChange={e => set('address', e.target.value)} style={inputStyle} placeholder="Full address" />
            </Field>
          </div>

          {/* ── Requirements ───────────────────────────────────────── */}
          <SectionLabel><LandPlot size={12} /> Requirements</SectionLabel>
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 16, marginBottom: 22,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14
          }}>
            <Field label={<><LandPlot size={12} /> Land Requirement</>}>
              <input value={client.reqLand} onChange={e => set('reqLand', e.target.value)} style={inputStyle} placeholder="e.g. wants 5 katha land" />
            </Field>

            <Field label={<><Home size={12} /> Flat Requirement</>}>
              <input value={client.reqFlat} onChange={e => set('reqFlat', e.target.value)} style={inputStyle} placeholder="e.g. wants 1500 sft flat" />
            </Field>

            <Field label={<><Compass size={12} /> Facing Preference</>} full>
              <input value={client.reqFacing} onChange={e => set('reqFacing', e.target.value)} style={inputStyle} placeholder="e.g. South faced, Corner plot" />
            </Field>
          </div>

          {/* ── Remarks ────────────────────────────────────────────── */}
          <SectionLabel><Mail size={12} /> Remarks</SectionLabel>
          <div style={{ marginBottom: 8 }}>
            <Field label="Notes / Remarks" full>
              <textarea
                value={client.notes}
                onChange={e => set('notes', e.target.value)}
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="Additional notes about this client..."
              />
            </Field>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button
              onClick={() => setView('clients')}
              style={{
                padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: 'none', border: '1px solid var(--border)',
                color: 'var(--text-muted)', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!client.name?.trim()}
              style={{
                padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: 'var(--primary)', border: 'none', color: '#FFF',
                cursor: client.name?.trim() ? 'pointer' : 'not-allowed',
                opacity: client.name?.trim() ? 1 : 0.5
              }}
            >
              Save Client
            </button>
          </div>
        </div>
      </Page>
    </motion.div>
  );
};

export default AddClient;