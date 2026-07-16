import React, { useState, useMemo } from 'react';
import { Search, X, Pencil, Trash2 } from 'lucide-react';
import PropertyForm, { CATEGORY_OPTIONS, STATUS_OPTIONS, STATUS_STYLE } from './PropertyForm';

const ManageProperties = ({ db, setDb, logAction, setView }) => {
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('all');
  const [catF, setCatF]       = useState('all');
  const [editing, setEditing] = useState(null);

  const properties = db.properties || [];

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (statusF !== 'all' && p.status !== statusF) return false;
      if (catF !== 'all' && p.category !== catF) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${p.location} ${p.blockName || ''} ${p.plotSerial || ''} ${p.ownerName || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [properties, search, statusF, catF]);

  const handleUpdate = (data) => {
    setDb((prev) => ({
      ...prev,
      properties: prev.properties.map((p) =>
        p.id === editing.id ? { ...p, ...data, purchasePrice: Number(data.purchasePrice) || 0 } : p
      ),
    }));
    logAction(`Updated property "${data.location}"`, 'property', data.location);
    setEditing(null);
  };

  const handleDelete = (p) => {
    if (!window.confirm(`Delete property "${p.location}"?`)) return;
    setDb((prev) => ({ ...prev, properties: prev.properties.filter((x) => x.id !== p.id) }));
    logAction(`Deleted property "${p.location}"`, 'property', p.location);
  };

  const details = (p) => {
    if (p.category === 'Land / Plot') {
      return [p.blockName && `Block ${p.blockName}`, p.plotSize].filter(Boolean).join(' · ') || '—';
    }
    if (p.category === 'Flat / Apartment') {
      return [p.areaSft && `${p.areaSft} sft`, p.bedrooms && `${p.bedrooms} bed`].filter(Boolean).join(' · ') || '—';
    }
    return '—';
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--zinc-900)' }}>All Properties</h1>
          <p style={{ color: 'var(--text-lt)', fontSize: 15, marginTop: 4 }}>{filtered.length} record{filtered.length !== 1 && 's'}</p>
        </div>
        <button className="btn-primary" style={{ background: '#F9A825', color: '#111' }} onClick={() => setView('properties_add')}>
          + Add Property
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ display: 'flex', gap: 12, padding: '14px 18px', marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 220px', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px' }}>
          <Search size={15} style={{ color: 'var(--text-lt)' }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search location, block, serial, owner…"
            style={{ border: 'none', outline: 'none', fontSize: 13.5, width: '100%' }}
          />
          {search && <X size={14} style={{ cursor: 'pointer', color: 'var(--text-lt)' }} onClick={() => setSearch('')} />}
        </div>
        <select className="input-field" style={{ width: 'auto' }} value={catF} onChange={(e) => setCatF(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-field" style={{ width: 'auto' }} value={statusF} onChange={(e) => setStatusF(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card table-scroll" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              {['Location', 'Category', 'Details', 'Owner', 'Purchase Price (BDT)', 'Status', ''].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: '12px 16px' }}>{p.location}</td>
                <td style={{ padding: '12px 16px' }}>{p.category}</td>
                <td style={{ padding: '12px 16px' }}>{details(p)}</td>
                <td style={{ padding: '12px 16px' }}>{p.ownerName || '—'}</td>
                <td style={{ padding: '12px 16px' }}>{Number(p.purchasePrice).toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    ...STATUS_STYLE[p.status], padding: '2px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700,
                  }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: 6 }}>
                  <button className="btn-ghost" style={{ padding: 6 }} onClick={() => setEditing(p)}><Pencil size={14} /></button>
                  <button className="btn-danger" style={{ padding: 6 }} onClick={() => handleDelete(p)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--text-lt)' }}>No properties found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 200,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 16px',
        }}>
          <PropertyForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} submitLabel="Save Changes" />
        </div>
      )}
    </div>
  );
};

export default ManageProperties;