import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, X, Trash2, Edit3, Phone, Mail, MapPin,
  Building2, Tag, DollarSign, ChevronDown, Users as UsersIcon,
  Briefcase, Home, Compass, LandPlot, ShieldCheck,
} from 'lucide-react';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const CLIENT_TYPES = ['Buyer', 'Seller', 'Tenant', 'Landlord', 'Investor'];
const PURPOSES = ['Invest', 'Living', 'Rent'];

const STATUS_STYLE = {
  Lead:        { bg: 'rgba(99,102,241,0.12)',  color: '#6366F1' },
  Contacted:   { bg: 'rgba(14,165,233,0.12)',  color: '#0EA5E9' },
  Negotiation: { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B' },
  Closed:      { bg: 'rgba(34,197,94,0.12)',   color: '#22C55E' },
  Lost:        { bg: 'rgba(244,63,94,0.12)',   color: '#F43F5E' },
};

const STATUS_OPTIONS = Object.keys(STATUS_STYLE);

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
  assignedAgentId:   null,
  assignedAgentName: null,
  assignedAt:        null,
});

// ─── BADGE ──────────────────────────────────────────────────────────────────
const Badge = ({ label, style }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    padding: '3px 10px', borderRadius: 999,
    fontSize: 11, fontWeight: 700,
    background: style?.bg || 'rgba(255,255,255,0.05)',
    color: style?.color || 'var(--text-muted)',
    whiteSpace: 'nowrap',
  }}>
    {label}
  </span>
);

// ─── BUDGET FORMAT ──────────────────────────────────────────────────────────
const formatBudget = (min, max) => {
  const fmt = v => {
    const n = Number(v);
    if (!n) return null;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
    return `${n}`;
  };
  const a = fmt(min);
  const b = fmt(max);
  if (!a && !b) return '—';
  if (a && b) return `${a} – ${b}`;
  return a || b;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const ManageClients = ({ db, setDb, logAction, user, saveClient, deleteClient }) => {
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'super_admin';

  const allClients = db.clients || [];

  // Scope: agents only see their assigned clients
  const clients = useMemo(() => {
    if (isSuperAdmin) return allClients;
    return allClients.filter(c => c.assignedAgentId === user?.id);
  }, [allClients, isSuperAdmin, user?.id]);

  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [agentFilter, setAgentFilter]   = useState('All');
  const [showModal, setShowModal]       = useState(false);
  const [editing, setEditing]           = useState(null);

  // Build agent list for Super Admin filter
  const agentOptions = useMemo(() => {
    if (!isSuperAdmin) return [];
    const map = {};
    allClients.forEach(c => {
      if (c.assignedAgentId && c.assignedAgentName) {
        map[c.assignedAgentId] = c.assignedAgentName;
      }
    });
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  }, [allClients, isSuperAdmin]);

  // Filtered list
  const filtered = useMemo(() => {
    const base = isSuperAdmin ? allClients : clients;
    return base.filter(c => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q ||
        c.name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        (isSuperAdmin && c.assignedAgentName?.toLowerCase().includes(q));
      const matchesType   = typeFilter === 'All' || c.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesAgent  =
        !isSuperAdmin ||
        agentFilter === 'All' ||
        (agentFilter === 'Unassigned' ? !c.assignedAgentId : c.assignedAgentId === agentFilter);
      return matchesSearch && matchesType && matchesStatus && matchesAgent;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [clients, allClients, isSuperAdmin, search, typeFilter, statusFilter, agentFilter]);

  // Stats scoped to agent's own clients
  const stats = useMemo(() => ({
    total:      clients.length,
    leads:      clients.filter(c => c.status === 'Lead').length,
    active:     clients.filter(c => ['Contacted', 'Negotiation'].includes(c.status)).length,
    closed:     clients.filter(c => c.status === 'Closed').length,
    unassigned: isSuperAdmin ? allClients.filter(c => !c.assignedAgentId).length : 0,
  }), [clients, allClients, isSuperAdmin]);

  const openAdd  = () => { setEditing(emptyClient()); setShowModal(true); };
  const openEdit = (c) => { setEditing({ ...emptyClient(), ...c }); setShowModal(true); };

  const handleSave = async () => {
    if (!editing.name?.trim()) return;
    const isExisting = allClients.some(c => c.id === editing.id);
    const saved = await saveClient(editing);
    logAction(isExisting ? 'Updated client' : 'Added client', 'client', saved.name);
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    const target = allClients.find(c => c.id === id);
    await deleteClient(id);
    if (target) logAction('Deleted client', 'client', target.name);
  };

  const cycleStatus = async (id) => {
    const c = allClients.find(x => x.id === id);
    if (!c) return;
    const idx  = STATUS_OPTIONS.indexOf(c.status);
    const next = STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length];
    await saveClient({ ...c, status: next });
  };

  const set = (key, val) => setEditing(prev => ({ ...prev, [key]: val }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
              {isSuperAdmin ? 'All Clients' : 'My Clients'}
            </h1>
            {isSuperAdmin && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 700, color: '#7c3aed',
                background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: 20, padding: '3px 10px',
              }}>
                <ShieldCheck size={12} /> Super Admin — all agents
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 0 }}>
            {isSuperAdmin
              ? 'Viewing and managing all clients across every agent.'
              : 'Manage your buyers, sellers, tenants, landlords and investors.'}
          </p>
        </div>

        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--primary)', color: '#FFF',
            border: 'none', borderRadius: 10,
            padding: '10px 18px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 14, marginBottom: 24
      }}>
        {[
          { label: isSuperAdmin ? 'Total Clients' : 'My Clients', value: stats.total,  color: '#6366F1' },
          { label: 'New Leads',    value: stats.leads,      color: '#0EA5E9' },
          { label: 'In Progress',  value: stats.active,     color: '#F59E0B' },
          { label: 'Closed Deals', value: stats.closed,     color: '#22C55E' },
          ...(isSuperAdmin ? [{ label: 'Unassigned', value: stats.unassigned, color: '#F43F5E' }] : []),
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--surface)', borderRadius: 14,
            padding: '16px 18px', border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTER BAR ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center'
      }}>
        <div style={{
          flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 14px'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={
              isSuperAdmin
                ? 'Search by name, phone, email, company, agent…'
                : 'Search by name, phone, email, company, or location…'
            }
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 13
            }}
          />
        </div>

        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
          <option value="All">All Types</option>
          {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {isSuperAdmin && (
          <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} style={selectStyle}>
            <option value="All">All Agents</option>
            <option value="Unassigned">Unassigned</option>
            {agentOptions.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── CLIENT LIST ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            color: 'var(--text-muted)', background: 'var(--surface)',
            borderRadius: 14, border: '1px solid var(--border)'
          }}>
            <UsersIcon size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: 14 }}>
              {clients.length === 0
                ? isSuperAdmin
                  ? 'No clients yet. Import or add clients to get started.'
                  : 'No clients assigned to you yet. Take a call from the New Call page to get started.'
                : 'No clients match your filters.'}
            </p>
          </div>
        )}

        {filtered.map(c => {
          const sStyle  = STATUS_STYLE[c.status] || {};
          const reqParts = [c.reqLand, c.reqFlat, c.reqFacing].filter(Boolean);
          const canEdit  = isSuperAdmin || c.assignedAgentId === user?.id;

          return (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '16px 18px'
            }}>
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(99,102,241,0.12)', color: '#6366F1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 16, flexShrink: 0
              }}>
                {(c.name || '?')[0].toUpperCase()}
              </div>

              {/* Main info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    {c.name}
                  </span>
                  <Badge label={c.type} style={{ bg: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }} />
                  {c.purpose && (
                    <Badge label={c.purpose} style={{ bg: 'rgba(99,102,241,0.08)', color: '#818CF8' }} />
                  )}
                  {/* Agent tag — Super Admin only */}
                  {isSuperAdmin && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 11, fontWeight: 600,
                      color: c.assignedAgentName ? '#7c3aed' : 'var(--text-muted)',
                      background: c.assignedAgentName ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${c.assignedAgentName ? 'rgba(124,58,237,0.2)' : 'var(--border)'}`,
                      padding: '2px 8px', borderRadius: 20,
                    }}>
                      <ShieldCheck size={10} />
                      {c.assignedAgentName || 'Unassigned'}
                    </span>
                  )}
                </div>

                <div style={{
                  display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap',
                  fontSize: 12, color: 'var(--text-muted)'
                }}>
                  {(c.profession || c.designation) && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Briefcase size={12} /> {[c.profession, c.designation].filter(Boolean).join(' · ')}
                    </span>
                  )}
                  {c.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={12} /> {c.phone}
                    </span>
                  )}
                  {c.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Mail size={12} /> {c.email}
                    </span>
                  )}
                  {c.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} /> {c.location}
                    </span>
                  )}
                </div>

                {reqParts.length > 0 && (
                  <div style={{
                    display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap',
                    fontSize: 11, color: 'var(--text-muted)'
                  }}>
                    {reqParts.map((r, i) => (
                      <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'rgba(255,255,255,0.04)', padding: '2px 8px',
                        borderRadius: 6
                      }}>
                        <LandPlot size={10} /> {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Property interest */}
              <div style={{
                minWidth: 130, textAlign: 'left', flexShrink: 0,
                display: 'flex', flexDirection: 'column', gap: 4
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                  <Building2 size={12} /> {c.propertyType}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                  <DollarSign size={12} /> {formatBudget(c.budgetMin, c.budgetMax)}
                </span>
              </div>

              {/* Status badge — clickable only if agent owns client */}
              <button
                onClick={() => canEdit && cycleStatus(c.id)}
                style={{
                  background: 'none', border: 'none',
                  cursor: canEdit ? 'pointer' : 'default',
                  padding: 0, flexShrink: 0,
                }}
                title={canEdit ? 'Click to change status' : 'You do not own this client'}
              >
                <Badge label={c.status} style={sStyle} />
              </button>

              {/* Actions — only for owner or Super Admin */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {canEdit ? (
                  <>
                    <button
                      onClick={() => openEdit(c)}
                      style={iconBtnStyle}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      style={iconBtnStyle}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <div style={{ width: 66 }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MODAL ──────────────────────────────────────────────────────── */}
      {showModal && editing && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 20
        }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 16,
            padding: 28, width: '100%', maxWidth: 600,
            maxHeight: '90vh', overflowY: 'auto',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                {allClients.some(c => c.id === editing.id) ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button onClick={() => setShowModal(false)} style={iconBtnStyle}>
                <X size={18} />
              </button>
            </div>

            <SectionLabel>Basic Info</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
              <Field label="Full Name *" full>
                <input value={editing.name} onChange={e => set('name', e.target.value)} style={inputStyle} placeholder="e.g. Mr. Ahmed Karim" />
              </Field>
              <Field label="Profession">
                <input value={editing.profession} onChange={e => set('profession', e.target.value)} style={inputStyle} placeholder="e.g. Doctor, Engineer" />
              </Field>
              <Field label="Designation">
                <input value={editing.designation} onChange={e => set('designation', e.target.value)} style={inputStyle} placeholder="e.g. Senior Manager" />
              </Field>
              <Field label="Company / Organization" full>
                <input value={editing.company} onChange={e => set('company', e.target.value)} style={inputStyle} placeholder="e.g. ABC Ltd." />
              </Field>
            </div>

            <SectionLabel>Contact Info</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
              <Field label="Phone">
                <input value={editing.phone} onChange={e => set('phone', e.target.value)} style={inputStyle} placeholder="01XXXXXXXXX" />
              </Field>
              <Field label="Alternative Number">
                <input value={editing.altPhone} onChange={e => set('altPhone', e.target.value)} style={inputStyle} placeholder="01XXXXXXXXX" />
              </Field>
              <Field label="Email" full>
                <input value={editing.email} onChange={e => set('email', e.target.value)} style={inputStyle} placeholder="email@example.com" />
              </Field>
            </div>

            <SectionLabel>Deal Info</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
              <Field label="Client Type">
                <select value={editing.type} onChange={e => set('type', e.target.value)} style={inputStyle}>
                  {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Purpose">
                <select value={editing.purpose} onChange={e => set('purpose', e.target.value)} style={inputStyle}>
                  <option value="">— Not specified —</option>
                  {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={editing.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Source">
                <select value={editing.source} onChange={e => set('source', e.target.value)} style={inputStyle}>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Property Type">
                <select value={editing.propertyType} onChange={e => set('propertyType', e.target.value)} style={inputStyle}>
                  {PROPERTY_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Preferred Location">
                <input value={editing.location} onChange={e => set('location', e.target.value)} style={inputStyle} placeholder="e.g. Gulshan, Dhaka" />
              </Field>
              <Field label="Budget Min (BDT)">
                <input type="number" value={editing.budgetMin} onChange={e => set('budgetMin', e.target.value)} style={inputStyle} placeholder="0" />
              </Field>
              <Field label="Budget Max (BDT)">
                <input type="number" value={editing.budgetMax} onChange={e => set('budgetMax', e.target.value)} style={inputStyle} placeholder="0" />
              </Field>
              <Field label="Address" full>
                <input value={editing.address} onChange={e => set('address', e.target.value)} style={inputStyle} placeholder="Full address" />
              </Field>
            </div>

            <SectionLabel>Requirements</SectionLabel>
            <div style={{
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 16, marginBottom: 22,
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14
            }}>
              <Field label={<><LandPlot size={12} /> Land Requirement</>}>
                <input value={editing.reqLand} onChange={e => set('reqLand', e.target.value)} style={inputStyle} placeholder="e.g. wants 5 katha land" />
              </Field>
              <Field label={<><Home size={12} /> Flat Requirement</>}>
                <input value={editing.reqFlat} onChange={e => set('reqFlat', e.target.value)} style={inputStyle} placeholder="e.g. wants 1500 sft flat" />
              </Field>
              <Field label={<><Compass size={12} /> Facing Preference</>} full>
                <input value={editing.reqFacing} onChange={e => set('reqFacing', e.target.value)} style={inputStyle} placeholder="e.g. South faced, Corner plot" />
              </Field>
            </div>

            <SectionLabel>Remarks</SectionLabel>
            <div style={{ marginBottom: 8 }}>
              <Field label="Notes / Remarks" full>
                <textarea
                  value={editing.notes}
                  onChange={e => set('notes', e.target.value)}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Additional notes about this client..."
                />
              </Field>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowModal(false)}
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
                disabled={!editing.name?.trim()}
                style={{
                  padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: 'var(--primary)', border: 'none', color: '#FFF',
                  cursor: editing.name?.trim() ? 'pointer' : 'not-allowed',
                  opacity: editing.name?.trim() ? 1 : 0.5
                }}
              >
                Save Client
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const selectStyle = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '10px 14px', fontSize: 13,
  color: 'var(--text)', cursor: 'pointer', outline: 'none'
};

const inputStyle = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '9px 12px', fontSize: 13,
  color: 'var(--text)', outline: 'none', boxSizing: 'border-box'
};

const iconBtnStyle = {
  width: 30, height: 30, borderRadius: 8,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)'
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

export default ManageClients;