import React, { useState, useMemo } from 'react';
import { Search, X, Pencil, Trash2 } from 'lucide-react';
import BrokerageForm, { CATEGORY_OPTIONS, STATUS_OPTIONS, STATUS_STYLE } from './BrokerageForm';

const ManageBrokerages = ({ db, setDb, logAction, setView }) => {
  const [search, setSearch]     = useState('');
  const [statusF, setStatusF]   = useState('all');
  const [catF, setCatF]         = useState('all');
  const [editing, setEditing]   = useState(null); // record being edited, or null

  const brokerages = db.brokerages || [];

  const filtered = useMemo(() => {
    return brokerages.filter((b) => {
      if (statusF !== 'all' && b.status !== statusF) return false;
      if (catF !== 'all' && b.category !== catF) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(`${b.location} ${b.blockName} ${b.plotSerial}`.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [brokerages, search, statusF, catF]);

  const handleUpdate = (data) => {
    setDb((prev) => ({
      ...prev,
      brokerages: prev.brokerages.map((b) =>
        b.id === editing.id ? { ...b, ...data, askingPrice: Number(data.askingPrice) || 0 } : b
      ),
    }));
    logAction(`Updated brokerage listing "${data.location}"`, 'brokerage', data.location);
    setEditing(null);
  };

  const handleDelete = (b) => {
    if (!window.confirm(`Delete listing "${b.location}"?`)) return;
    setDb((prev) => ({ ...prev, brokerages: prev.brokerages.filter((x) => x.id !== b.id) }));
    logAction(`Deleted brokerage listing "${b.location}"`, 'brokerage', b.location);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--zinc-900)' }}>All Brokerages</h1>
          <p style={{ color: 'var(--text-lt)', fontSize: 15, marginTop: 4 }}>{filtered.length} listing{filtered.length !== 1 && 's'}</p>
        </div>
        <button className="btn-primary" style={{ background: '#F9A825', color: '#111' }} onClick={() => setView('brokerages_add')}>
          + Add Brokerage
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ display: 'flex', gap: 12, padding: '14px 18px', marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 220px', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px' }}>
          <Search size={15} style={{ color: 'var(--text-lt)' }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search location, block, serial…"
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
              {['Location', 'Category', 'Block', 'Size', 'Facing', 'Price (BDT)', 'Status', ''].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td style={{ padding: '12px 16px' }}>{b.location}</td>
                <td style={{ padding: '12px 16px' }}>{b.category}</td>
                <td style={{ padding: '12px 16px' }}>{b.blockName || '—'}</td>
                <td style={{ padding: '12px 16px' }}>{b.plotSize || '—'}</td>
                <td style={{ padding: '12px 16px' }}>{b.facing || '—'}</td>
                <td style={{ padding: '12px 16px' }}>{Number(b.askingPrice).toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    ...STATUS_STYLE[b.status], padding: '2px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700,
                  }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: 6 }}>
                  <button className="btn-ghost" style={{ padding: 6 }} onClick={() => setEditing(b)}><Pencil size={14} /></button>
                  <button className="btn-danger" style={{ padding: 6 }} onClick={() => handleDelete(b)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: 'var(--text-lt)' }}>No listings found.</td></tr>
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
          <BrokerageForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} submitLabel="Save Changes" />
        </div>
      )}
    </div>
  );
};

export default ManageBrokerages;