import React, { useState } from 'react';
import { Plus, Trash2, X, Tag, FolderOpen, ChevronRight } from 'lucide-react';
import Page from '../components/Page';

const CategoryManager = ({ db, setDb, logAction }) => {
  const [newCat, setNewCat] = useState('');
  const [subVals, setSubVals] = useState({});
  const [focusedCard, setFocusedCard] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
      setDb({ ...db, categories: db.categories.filter(x => x.id !== id) });
      logAction('Deleted', 'Sector', name);
    }
  };

  const handleAddSub = (catId) => {
    const val = subVals[catId];
    if (!val?.trim()) return;
    setDb({
      ...db,
      categories: db.categories.map(c =>
        c.id === catId ? { ...c, subs: [...c.subs, val.trim()] } : c
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
    if (e.key === 'Enter') { e.preventDefault(); handleAddSub(catId); }
  };

  const totalSubs = db.categories.reduce((acc, c) => acc + c.subs.length, 0);

  return (
    <Page title="Corporate Sectors" subtitle="Structure expenditure categories and items">
      <style>{`
        .cm-hero-bar {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border-radius: 16px;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .cm-stats {
          display: flex;
          gap: 32px;
        }
        .cm-stat {
          text-align: center;
        }
        .cm-stat-num {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }
        .cm-stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 4px;
        }
        .cm-stat-divider {
          width: 1px;
          background: rgba(255,255,255,0.1);
          align-self: stretch;
        }
        .cm-add-bar {
          display: flex;
          gap: 12px;
          background: var(--white, #fff);
          border: 1.5px solid var(--zinc-200, #e4e4e7);
          border-radius: 14px;
          padding: 18px 20px;
          align-items: center;
          margin-bottom: 28px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cm-add-bar:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .cm-add-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cm-add-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
          font-weight: 500;
          background: transparent;
          color: var(--zinc-900, #18181b);
        }
        .cm-add-input::placeholder { color: var(--zinc-400, #a1a1aa); font-weight: 400; }
        .cm-create-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 18px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.15s, transform 0.15s;
        }
        .cm-create-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .cm-create-btn:active { transform: translateY(0); }
        .cm-empty {
          text-align: center;
          padding: 72px 24px;
          background: var(--white, #fff);
          border: 1.5px dashed var(--zinc-200, #e4e4e7);
          border-radius: 16px;
        }
        .cm-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: #f4f4f5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .cm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 20px;
        }
        .cm-card {
          background: var(--white, #fff);
          border: 1.5px solid var(--zinc-100, #f4f4f5);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cm-card:hover {
          border-color: var(--zinc-200, #e4e4e7);
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
        }
        .cm-card-header {
          padding: 20px 20px 16px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid #f4f4f5;
        }
        .cm-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 18px;
        }
        .cm-card-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--zinc-900, #18181b);
          line-height: 1.3;
        }
        .cm-card-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--zinc-400, #a1a1aa);
          margin-top: 3px;
          font-weight: 500;
        }
        .cm-del-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1.5px solid #fee2e2;
          background: #fff5f5;
          color: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s;
        }
        .cm-del-btn:hover { background: #fee2e2; border-color: #fca5a5; }
        .cm-subs-area {
          padding: 16px 20px;
        }
        .cm-subs-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 14px;
        }
        .cm-sub-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px 5px 12px;
          background: #f8faff;
          border: 1px solid #e0e7ff;
          border-radius: 20px;
          font-size: 12.5px;
          font-weight: 500;
          color: #4338ca;
          transition: background 0.15s;
        }
        .cm-sub-tag:hover { background: #eef2ff; }
        .cm-sub-x {
          cursor: pointer;
          color: #a5b4fc;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .cm-sub-x:hover { color: #6366f1; }
        .cm-sub-input-row {
          display: flex;
          gap: 8px;
        }
        .cm-sub-input {
          flex: 1;
          height: 36px;
          padding: 0 12px;
          border: 1.5px solid var(--zinc-200, #e4e4e7);
          border-radius: 9px;
          font-size: 13px;
          color: var(--zinc-800, #27272a);
          background: #fafafa;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .cm-sub-input:focus {
          border-color: #6366f1;
          background: #fff;
        }
        .cm-sub-input::placeholder { color: var(--zinc-400, #a1a1aa); }
        .cm-add-sub-btn {
          height: 36px;
          padding: 0 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: #6366f1;
          background: #eef2ff;
          border: 1.5px solid #e0e7ff;
          border-radius: 9px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }
        .cm-add-sub-btn:hover { background: #e0e7ff; color: #4338ca; }
        .cm-card-colors {
          --c0: linear-gradient(135deg,#dbeafe,#bfdbfe); --t0: #2563eb;
          --c1: linear-gradient(135deg,#d1fae5,#a7f3d0); --t1: #059669;
          --c2: linear-gradient(135deg,#fce7f3,#fbcfe8); --t2: #db2777;
          --c3: linear-gradient(135deg,#fef3c7,#fde68a); --t3: #d97706;
          --c4: linear-gradient(135deg,#ede9fe,#ddd6fe); --t4: #7c3aed;
          --c5: linear-gradient(135deg,#ffedd5,#fed7aa); --t5: #ea580c;
        }
      `}</style>

      {/* HERO STATS BAR */}
      <div className="cm-hero-bar">
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Overview</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Corporate Sectors</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Manage expenditure categories and sub-items</div>
        </div>
        <div className="cm-stats">
          <div className="cm-stat">
            <div className="cm-stat-num">{db.categories.length}</div>
            <div className="cm-stat-label">Sectors</div>
          </div>
          <div className="cm-stat-divider" />
          <div className="cm-stat">
            <div className="cm-stat-num">{totalSubs}</div>
            <div className="cm-stat-label">Sub-items</div>
          </div>
        </div>
      </div>

      {/* ADD NEW SECTOR BAR */}
      <div className="cm-add-bar">
        <div className="cm-add-icon">
          <Plus size={17} color="#fff" strokeWidth={2.5} />
        </div>
        <input
          className="cm-add-input"
          type="text"
          placeholder="New sector name (e.g. Technology, Operations, Finance...)"
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
        />
        <button className="cm-create-btn" onClick={handleAddCategory}>
          <Plus size={14} strokeWidth={2.5} />
          Create Sector
        </button>
      </div>

      {/* EMPTY STATE */}
      {db.categories.length === 0 && (
        <div className="cm-empty">
          <div className="cm-empty-icon">
            <FolderOpen size={26} color="#a1a1aa" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--zinc-700, #3f3f46)', marginBottom: 6 }}>
            No sectors yet
          </div>
          <div style={{ fontSize: 13, color: 'var(--zinc-400, #a1a1aa)' }}>
            Create your first sector above to start organising expenditures.
          </div>
        </div>
      )}

      {/* CARDS GRID */}
      <div className="cm-grid cm-card-colors">
        {db.categories.map((cat, idx) => {
          const ci = idx % 6;
          const bgVar = `var(--c${ci})`;
          const colorVar = `var(--t${ci})`;

          return (
            <div key={cat.id} className="cm-card">

              {/* HEADER */}
              <div className="cm-card-header">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                  <div
                    className="cm-card-icon"
                    style={{ background: bgVar }}
                  >
                    <Tag size={17} color={colorVar} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="cm-card-title">{cat.name}</div>
                    <div className="cm-card-meta">
                      <ChevronRight size={11} />
                      {cat.subs.length} sub-item{cat.subs.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <button
                  className="cm-del-btn"
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  title="Delete sector"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* SUB ITEMS + INPUT */}
              <div className="cm-subs-area">
                {cat.subs.length > 0 && (
                  <div className="cm-subs-wrap">
                    {cat.subs.map((s, i) => (
                      <span key={i} className="cm-sub-tag">
                        {s}
                        <span
                          className="cm-sub-x"
                          onClick={() => handleDeleteSub(cat.id, i)}
                          role="button"
                          aria-label={`Remove ${s}`}
                        >
                          <X size={11} strokeWidth={2.5} />
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="cm-sub-input-row">
                  <input
                    className="cm-sub-input"
                    type="text"
                    placeholder="Add sub-item..."
                    value={subVals[cat.id] || ''}
                    onChange={e => setSubVals({ ...subVals, [cat.id]: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, cat.id)}
                  />
                  <button
                    className="cm-add-sub-btn"
                    onClick={() => handleAddSub(cat.id)}
                  >
                    + Add
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </Page>
  );
};

export default CategoryManager;