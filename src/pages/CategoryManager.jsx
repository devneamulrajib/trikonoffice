import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import Page from '../components/Page';

const CategoryManager = ({ db, setDb, logAction }) => {
  const [newCat, setNewCat] = useState('');
  const [subVals, setSubVals] = useState({});

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    setDb({
      ...db,
      categories: [
        ...db.categories,
        { id: Date.now(), name: newCat.trim(), subs: [] }
      ]
    });
    logAction('Created', 'Sector', newCat.trim());
    setNewCat('');
  };

  const handleDeleteCategory = (id, name) => {
    if (window.confirm('Delete sector?')) {
      setDb({
        ...db,
        categories: db.categories.filter(x => x.id !== id)
      });
      logAction('Deleted', 'Sector', name);
    }
  };

  const handleAddSub = (catId) => {
    const val = subVals[catId];
    if (!val?.trim()) return;
    setDb({
      ...db,
      categories: db.categories.map(c =>
        c.id === catId
          ? { ...c, subs: [...c.subs, val.trim()] }
          : c
      )
    });
    setSubVals({ ...subVals, [catId]: '' });
  };

  const handleDeleteSub = (catId, subIndex) => {
    setDb({
      ...db,
      categories: db.categories.map(c =>
        c.id === catId
          ? { ...c, subs: c.subs.filter((_, j) => j !== subIndex) }
          : c
      )
    });
  };

  const handleKeyDown = (e, catId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSub(catId);
    }
  };

  return (
    <Page title="Corporate Sectors" subtitle="Structure expenditure categories and items">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ADD NEW SECTOR */}
        <div className="card" style={{ padding: 24, display: 'flex', gap: 16 }}>
          <input
            className="input-field"
            type="text"
            placeholder="New Sector Name (e.g. Technology)"
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
          />
          <button
            className="btn-primary"
            onClick={handleAddCategory}
            style={{ whiteSpace: 'nowrap' }}
          >
            <Plus size={18} /> Create Sector
          </button>
        </div>

        {/* EMPTY STATE */}
        {db.categories.length === 0 && (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <p style={{ color: 'var(--zinc-400)', fontSize: 14 }}>
              No sectors yet. Create one above to get started.
            </p>
          </div>
        )}

        {/* CATEGORY CARDS GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: 24
        }}>
          {db.categories.map(cat => (
            <div key={cat.id} className="card" style={{ padding: 24 }}>

              {/* CATEGORY HEADER */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 20
              }}>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 18 }}>{cat.name}</h3>
                  <p style={{ fontSize: 12, color: 'var(--zinc-400)', marginTop: 2 }}>
                    {cat.subs.length} sub-item{cat.subs.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  className="btn-danger"
                  style={{ padding: '6px' }}
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* SUB ITEMS */}
              {cat.subs.length > 0 && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap',
                  gap: 8, marginBottom: 20
                }}>
                  {cat.subs.map((s, i) => (
                    <span
                      key={i}
                      className="badge-gray"
                      style={{
                        display: 'inline-flex', alignItems: 'center',
                        gap: 8, padding: '6px 12px',
                        background: '#F8FAFC', fontSize: 13
                      }}
                    >
                      {s}
                      <X
                        size={14}
                        style={{ cursor: 'pointer', opacity: 0.5 }}
                        onClick={() => handleDeleteSub(cat.id, i)}
                      />
                    </span>
                  ))}
                </div>
              )}

              {/* ADD SUB ITEM */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Add sub-item..."
                  value={subVals[cat.id] || ''}
                  onChange={e => setSubVals({ ...subVals, [cat.id]: e.target.value })}
                  onKeyDown={e => handleKeyDown(e, cat.id)}
                />
                <button
                  className="btn-primary"
                  onClick={() => handleAddSub(cat.id)}
                >
                  Add
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </Page>
  );
};

export default CategoryManager;