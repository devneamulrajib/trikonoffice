import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, X, Trash2, Edit3, Phone, Mail, MapPin,
  Building2, DollarSign, ChevronDown, Users as UsersIcon,
  Briefcase, Home, Compass, LandPlot, ShieldCheck, Hash,
  Flag, CalendarClock, CalendarCheck2, Building, User, MessageSquare,
  AlertCircle,
} from 'lucide-react';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const CLIENT_TYPES = ['Buyer', 'Seller', 'Tenant', 'Landlord', 'Investor'];
const PURPOSES = ['Invest', 'Living', 'Rent'];

// Pipeline stages — replaces the old Lead/Contacted/Negotiation/Closed/Lost set.
const STATUS_STYLE = {
  'New Lead':          { bg: 'rgba(99,102,241,0.12)',  color: '#6366F1' },
  'Follow Up':         { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B' },
  'Visit':             { bg: 'rgba(14,165,233,0.12)',  color: '#0EA5E9' },
  'Booking Completed': { bg: 'rgba(34,197,94,0.12)',   color: '#22C55E' },
  'Junk Lead':         { bg: 'rgba(244,63,94,0.12)',   color: '#F43F5E' },
};
const STATUS_OPTIONS = Object.keys(STATUS_STYLE);

const PRIORITY_STYLE = {
  High:   { bg: 'rgba(244,63,94,0.12)',  color: '#F43F5E' },
  Medium: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  Low:    { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E' },
};
const PRIORITY_OPTIONS = Object.keys(PRIORITY_STYLE);

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
  status: 'New Lead',
  priority: 'Medium',
  projectInterest: '',
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

// Default accordion open/closed state whenever the modal is (re)opened.
// Basic Info starts open since Full Name is the only required field.
const defaultOpenSections = () => ({
  basic: true,
  contact: false,
  deal: false,
  requirements: false,
  remarks: false,
});

// ─── HELPERS ────────────────────────────────────────────────────────────────
const norm = (s) => (s || '').toString().trim().toLowerCase();

const leadIdLabel = (id) => `CL-${String(id).slice(-6).padStart(6, '0')}`;

const formatDateShort = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
};

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

// ─── ACCORDION SECTION (Edit/Add Client modal) ─────────────────────────────
// Same collapse/expand visual language as NewCall.jsx's Collapse component —
// header row with icon + title + optional summary-when-closed, chevron that
// rotates, content only rendered while open. `error` puts a red border/label
// on the header so an invalid required field is easy to spot even collapsed.
const AccordionSection = ({ title, icon: Icon, summary, open, onToggle, error, children }) => (
  <div style={{
    border: `1.5px solid ${error ? '#F43F5E' : 'var(--border)'}`,
    borderRadius: 12, overflow: 'hidden', marginBottom: 14,
    transition: 'border-color .15s',
  }}>
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', background: open ? 'var(--bg)' : 'var(--surface)',
        border: 'none', cursor: 'pointer', textAlign: 'left', gap: 10,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          background: error ? 'rgba(244,63,94,0.12)' : 'rgba(99,102,241,0.12)',
          color: error ? '#F43F5E' : 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={13} />
        </span>
        <span style={{
          fontSize: 12.5, fontWeight: 800, color: 'var(--text)',
          textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
        }}>
          {title}
        </span>
        {!open && summary && (
          <span style={{
            fontSize: 12, color: 'var(--text-muted)', fontWeight: 500,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {summary}
          </span>
        )}
        {error && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#F43F5E', flexShrink: 0 }}>
            <AlertCircle size={12} /> Required
          </span>
        )}
      </span>
      <ChevronDown size={14} style={{
        color: 'var(--text-muted)', flexShrink: 0,
        transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s',
      }} />
    </button>
    {open && (
      <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
        {children}
      </div>
    )}
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const ManageClients = ({ db, setDb, logAction, user, saveClient, deleteClient }) => {
  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'super_admin';

  const allClients   = db.clients   || [];
  const allFollowUps = db.followUps || [];

  // Scope: agents only see their assigned clients
  const clients = useMemo(() => {
    if (isSuperAdmin) return allClients;
    return allClients.filter(c => c.assignedAgentId === user?.id);
  }, [allClients, isSuperAdmin, user?.id]);

  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [agentFilter, setAgentFilter]   = useState('All');
  const [showModal, setShowModal]       = useState(false);
  const [editing, setEditing]           = useState(null);

  // Accordion open/closed state + "tried to save with missing fields" flag
  // for the Edit/Add Client modal.
  const [openSections, setOpenSections] = useState(defaultOpenSections());
  const [attempted, setAttempted]       = useState(false);
  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

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

  // Map each client -> { last: dueDate|null, next: dueDate|null } from FollowUp.jsx records,
  // matched by phone (preferred) or name.
  const followupInfo = useMemo(() => {
    const map = {};
    allClients.forEach(c => {
      const phoneKey = norm(c.phone);
      const nameKey  = norm(c.name);
      const matches = allFollowUps.filter(f => {
        const fPhone = norm(f.clientPhone);
        const fName  = norm(f.clientName);
        if (phoneKey && fPhone) return fPhone === phoneKey;
        return nameKey && fName === nameKey;
      });
      const completed = matches
        .filter(f => f.status === 'completed')
        .sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
      const pending = matches
        .filter(f => f.status === 'pending')
        .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
      map[c.id] = {
        last: completed[0]?.dueDate || null,
        next: pending[0]?.dueDate || null,
      };
    });
    return map;
  }, [allClients, allFollowUps]);

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
        c.projectInterest?.toLowerCase().includes(q) ||
        leadIdLabel(c.id).toLowerCase().includes(q) ||
        (isSuperAdmin && c.assignedAgentName?.toLowerCase().includes(q));
      const matchesType     = typeFilter === 'All' || c.type === typeFilter;
      const matchesStatus   = statusFilter === 'All' || c.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;
      const matchesAgent  =
        !isSuperAdmin ||
        agentFilter === 'All' ||
        (agentFilter === 'Unassigned' ? !c.assignedAgentId : c.assignedAgentId === agentFilter);
      return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesAgent;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [clients, allClients, isSuperAdmin, search, typeFilter, statusFilter, priorityFilter, agentFilter]);

  // Stats scoped to agent's own clients (or everyone for Super Admin)
  const statsBase = isSuperAdmin ? allClients : clients;
  const stats = useMemo(() => ({
    total:             statsBase.length,
    newLead:           statsBase.filter(c => c.status === 'New Lead').length,
    followUp:          statsBase.filter(c => c.status === 'Follow Up').length,
    visit:             statsBase.filter(c => c.status === 'Visit').length,
    bookingCompleted:  statsBase.filter(c => c.status === 'Booking Completed').length,
    junkLead:          statsBase.filter(c => c.status === 'Junk Lead').length,
  }), [statsBase]);

  const openAdd  = () => {
    setEditing(emptyClient());
    setOpenSections(defaultOpenSections());
    setAttempted(false);
    setShowModal(true);
  };
  const openEdit = (c) => {
    setEditing({ ...emptyClient(), ...c });
    setOpenSections(defaultOpenSections());
    setAttempted(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editing.name?.trim()) {
      setAttempted(true);
      setOpenSections(prev => ({ ...prev, basic: true }));
      return;
    }
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

  const statBoxes = [
    { key: 'All',                label: isSuperAdmin ? 'Total Clients' : 'My Clients', value: stats.total,            color: '#334155' },
    { key: 'New Lead',           label: 'New Lead',           value: stats.newLead,          color: '#6366F1' },
    { key: 'Follow Up',          label: 'Follow Up',          value: stats.followUp,         color: '#F59E0B' },
    { key: 'Visit',              label: 'Visit',              value: stats.visit,            color: '#0EA5E9' },
    { key: 'Booking Completed',  label: 'Booking Completed',  value: stats.bookingCompleted, color: '#22C55E' },
    { key: 'Junk Lead',          label: 'Junk Lead',          value: stats.junkLead,          color: '#F43F5E' },
  ];

  // ── Accordion summaries (shown when a section is collapsed) ─────────────
  const basicSummary = editing
    ? [editing.name || 'No name yet', editing.profession].filter(Boolean).join(' · ')
    : '';
  const contactSummary = editing
    ? ([editing.phone, editing.email].filter(Boolean).join(' · ') || 'No contact info yet')
    : '';
  const dealSummary = editing
    ? [editing.type, editing.status, editing.priority].filter(Boolean).join(' · ')
    : '';
  const requirementsSummary = editing
    ? ([editing.reqLand, editing.reqFlat, editing.reqFacing].filter(Boolean).join(' · ') || 'No requirements set')
    : '';
  const remarksSummary = editing
    ? (editing.notes?.trim()
        ? (editing.notes.trim().length > 48 ? `${editing.notes.trim().slice(0, 48)}…` : editing.notes.trim())
        : 'No remarks')
    : '';

  const nameError = attempted && !editing?.name?.trim();

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

      {/* ── STAT CARDS (click to filter by status) ─────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 14, marginBottom: 24
      }}>
        {statBoxes.map(s => {
          const active = statusFilter === s.key;
          return (
            <button
              key={s.label}
              onClick={() => setStatusFilter(prev => prev === s.key ? 'All' : s.key)}
              style={{
                textAlign: 'left', cursor: 'pointer',
                background: 'var(--surface)', borderRadius: 14,
                padding: '16px 18px',
                border: `1.5px solid ${active ? s.color : 'var(--border)'}`,
                boxShadow: active ? `0 2px 10px ${s.color}33` : 'none',
                transition: 'all .13s',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>
                {s.value}
              </div>
            </button>
          );
        })}
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
                ? 'Search by lead ID, name, phone, email, project, agent…'
                : 'Search by lead ID, name, phone, email, or project…'
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

        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={selectStyle}>
          <option value="All">All Priorities</option>
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
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

      {/* ── CLIENT TABLE ───────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden'
      }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            color: 'var(--text-muted)',
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
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {[
                    'Lead ID', 'Client Name', 'Mobile', 'Project Interest',
                    'Status', 'Agent', 'Priority', 'Last Followup', 'Next Followup', 'Actions'
                  ].map(h => (
                    <th key={h} style={{
                      textAlign: h === 'Actions' ? 'center' : 'left',
                      padding: '10px 14px', fontSize: 10.5, fontWeight: 700,
                      color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: '0.05em', borderBottom: '1px solid var(--border)',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const sStyle  = STATUS_STYLE[c.status] || {};
                  const pStyle  = PRIORITY_STYLE[c.priority] || {};
                  const canEdit = isSuperAdmin || c.assignedAgentId === user?.id;
                  const fu      = followupInfo[c.id] || {};
                  const lastF   = formatDateShort(fu.last);
                  const nextF   = formatDateShort(fu.next);

                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Hash size={11} /> {leadIdLabel(c.id)}
                        </span>
                      </td>

                      <td style={{ padding: '11px 14px', minWidth: 160 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 10,
                            background: 'rgba(99,102,241,0.12)', color: '#6366F1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: 13, flexShrink: 0
                          }}>
                            {(c.name || '?')[0].toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {c.name}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.type}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '11px 14px', fontSize: 12.5, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                        {c.phone
                          ? <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={11} /> {c.phone}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>

                      <td style={{ padding: '11px 14px', fontSize: 12.5, color: 'var(--text)', maxWidth: 160 }}>
                        {c.projectInterest
                          ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.projectInterest}>
                              <Building size={11} style={{ flexShrink: 0 }} /> {c.projectInterest}
                            </span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>

                      <td style={{ padding: '11px 14px' }}>
                        <button
                          onClick={() => canEdit && cycleStatus(c.id)}
                          style={{
                            background: 'none', border: 'none',
                            cursor: canEdit ? 'pointer' : 'default', padding: 0,
                          }}
                          title={canEdit ? 'Click to advance status' : 'You do not own this client'}
                        >
                          <Badge label={c.status} style={sStyle} />
                        </button>
                      </td>

                      <td style={{ padding: '11px 14px', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {c.assignedAgentName
                          ? <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 11, fontWeight: 600, color: '#7c3aed',
                              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
                              padding: '2px 8px', borderRadius: 20,
                            }}>
                              <ShieldCheck size={10} /> {c.assignedAgentName}
                            </span>
                          : <span style={{ color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic' }}>Unassigned</span>}
                      </td>

                      <td style={{ padding: '11px 14px' }}>
                        <Badge label={c.priority || 'Medium'} style={pStyle} />
                      </td>

                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {lastF
                          ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalendarCheck2 size={11} /> {lastF}</span>
                          : '—'}
                      </td>

                      <td style={{ padding: '11px 14px', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {nextF
                          ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text)' }}><CalendarClock size={11} /> {nextF}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>

                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL (Add / Edit Client — accordion sections) ──────────────── */}
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

            <AccordionSection
              title="Basic Info"
              icon={User}
              summary={basicSummary}
              open={openSections.basic}
              onToggle={() => toggleSection('basic')}
              error={nameError}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Full Name *" full>
                  <input
                    value={editing.name}
                    onChange={e => set('name', e.target.value)}
                    style={nameError ? { ...inputStyle, ...errorInputStyle } : inputStyle}
                    placeholder="e.g. Mr. Ahmed Karim"
                  />
                  {nameError && (
                    <div style={{ fontSize: 11, color: '#F43F5E', marginTop: 4 }}>Name is required</div>
                  )}
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
            </AccordionSection>

            <AccordionSection
              title="Contact Info"
              icon={Phone}
              summary={contactSummary}
              open={openSections.contact}
              onToggle={() => toggleSection('contact')}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
            </AccordionSection>

            <AccordionSection
              title="Deal Info"
              icon={Building2}
              summary={dealSummary}
              open={openSections.deal}
              onToggle={() => toggleSection('deal')}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
                <Field label="Priority">
                  <select value={editing.priority} onChange={e => set('priority', e.target.value)} style={inputStyle}>
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Project Interest" full>
                  <input value={editing.projectInterest} onChange={e => set('projectInterest', e.target.value)} style={inputStyle} placeholder="e.g. Sunset Residency, Block C" />
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
            </AccordionSection>

            <AccordionSection
              title="Requirements"
              icon={LandPlot}
              summary={requirementsSummary}
              open={openSections.requirements}
              onToggle={() => toggleSection('requirements')}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
            </AccordionSection>

            <AccordionSection
              title="Remarks"
              icon={MessageSquare}
              summary={remarksSummary}
              open={openSections.remarks}
              onToggle={() => toggleSection('remarks')}
            >
              <Field label="Notes / Remarks" full>
                <textarea
                  value={editing.notes}
                  onChange={e => set('notes', e.target.value)}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Additional notes about this client..."
                />
              </Field>
            </AccordionSection>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
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
                style={{
                  padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: 'var(--primary)', border: 'none', color: '#FFF',
                  cursor: 'pointer',
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

const errorInputStyle = {
  borderColor: '#F43F5E',
  boxShadow: '0 0 0 3px rgba(244,63,94,0.15)',
};

const iconBtnStyle = {
  width: 30, height: 30, borderRadius: 8,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)'
};

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