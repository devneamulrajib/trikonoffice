import React, { useState } from 'react';
import { Plus, Trash2, X, Layers, Hash, Sparkles, ChevronRight } from 'lucide-react';
import Page from '../components/Page';

/* ─── palette & accent cycle ─────────────────────────────────────── */
const ACCENTS = [
  { glow: '#06b6d4', light: '#cffafe', text: '#0891b2', soft: 'rgba(6,182,212,0.12)'  },
  { glow: '#a78bfa', light: '#ede9fe', text: '#7c3aed', soft: 'rgba(167,139,250,0.12)' },
  { glow: '#34d399', light: '#d1fae5', text: '#059669', soft: 'rgba(52,211,153,0.12)'  },
  { glow: '#f472b6', light: '#fce7f3', text: '#db2777', soft: 'rgba(244,114,182,0.12)' },
  { glow: '#fbbf24', light: '#fef3c7', text: '#d97706', soft: 'rgba(251,191,36,0.12)'  },
  { glow: '#60a5fa', light: '#dbeafe', text: '#2563eb', soft: 'rgba(96,165,250,0.12)'  },
];

const CategoryManager = ({ db, setDb, logAction }) => {
  const [newCat, setNewCat]     = useState('');
  const [subVals, setSubVals]   = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);
  const [inputFocus, setInputFocus]   = useState(false);

  const totalSubs = db.categories.reduce((a, c) => a + c.subs.length, 0);

  /* ─── handlers (unchanged logic) ─── */
  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    setDb({ ...db, categories: [...db.categories, { id: Date.now(), name: newCat.trim(), subs: [] }] });
    logAction('Created', 'Sector', newCat.trim());
    setNewCat('');
  };
  const handleDeleteCategory = (id, name) => {
    if (window.confirm('Delete this sector and all its sub-items?')) {
      setDb({ ...db, categories: db.categories.filter(x => x.id !== id) });
      logAction('Deleted', 'Sector', name);
    }
  };
  const handleAddSub = (catId) => {
    const val = subVals[catId];
    if (!val?.trim()) return;
    setDb({ ...db, categories: db.categories.map(c => c.id === catId ? { ...c, subs: [...c.subs, val.trim()] } : c) });
    setSubVals({ ...subVals, [catId]: '' });
  };
  const handleDeleteSub = (catId, subIndex) => {
    setDb({ ...db, categories: db.categories.map(c => c.id === catId ? { ...c, subs: c.subs.filter((_, j) => j !== subIndex) } : c) });
  };

  return (
    <Page title="Corporate Sectors" subtitle="Structure expenditure categories and items">

      {/* ══════════════ GLOBAL STYLES ══════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .cm-root {
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          background: #080c14;
          padding: 32px;
          position: relative;
          overflow: hidden;
        }

        /* ambient background glow */
        .cm-root::before {
          content: '';
          position: fixed;
          top: -200px; left: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .cm-root::after {
          content: '';
          position: fixed;
          bottom: -150px; right: -150px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .cm-inner { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }

        /* ─── TOP HEADER ─── */
        .cm-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 36px;
          gap: 24px;
        }
        .cm-header-left {}
        .cm-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6366f1;
          margin-bottom: 10px;
        }
        .cm-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #6366f1;
          box-shadow: 0 0 8px #6366f1;
          animation: cm-pulse 2s infinite;
        }
        @keyframes cm-pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.8); }
        }
        .cm-page-title {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #f8fafc;
          line-height: 1;
        }
        .cm-page-title span {
          background: linear-gradient(90deg, #6366f1, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cm-page-sub {
          font-size: 13.5px;
          color: #475569;
          margin-top: 8px;
          font-weight: 400;
        }

        /* ─── STAT CHIPS ─── */
        .cm-stats {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .cm-stat-chip {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding: 12px 20px;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 12px;
        }
        .cm-stat-num {
          font-size: 24px;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .cm-stat-label {
          font-size: 11px;
          color: #475569;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 3px;
        }

        /* ─── ADD BAR ─── */
        .cm-add-wrap {
          margin-bottom: 36px;
        }
        .cm-add-bar {
          display: flex;
          align-items: center;
          gap: 0;
          background: #0f172a;
          border: 1px solid ${inputFocus ? '#6366f1' : '#1e293b'};
          border-radius: 14px;
          padding: 6px 6px 6px 20px;
          transition: border-color 0.2s;
          box-shadow: ${inputFocus ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none'};
        }
        .cm-add-icon-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }
        .cm-add-prefix {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #334155;
          white-space: nowrap;
        }
        .cm-add-slash {
          color: #1e293b;
          font-size: 20px;
          font-weight: 200;
          margin: 0 10px;
          user-select: none;
        }
        .cm-add-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 15px;
          font-weight: 500;
          color: #f1f5f9;
          font-family: inherit;
          caret-color: #6366f1;
        }
        .cm-add-input::placeholder { color: #334155; }
        .cm-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
        }
        .cm-add-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(99,102,241,0.5);
        }
        .cm-add-btn:active { transform: translateY(0); }

        /* ─── EMPTY STATE ─── */
        .cm-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          border: 1px dashed #1e293b;
          border-radius: 20px;
          text-align: center;
        }
        .cm-empty-ring {
          width: 72px; height: 72px;
          border-radius: 50%;
          border: 2px dashed #1e293b;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          position: relative;
        }
        .cm-empty-title { font-size: 16px; font-weight: 700; color: #475569; margin-bottom: 6px; }
        .cm-empty-sub   { font-size: 13px; color: #334155; }

        /* ─── GRID ─── */
        .cm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 16px;
        }

        /* ─── CARD ─── */
        .cm-card {
          background: #0c1220;
          border: 1px solid #1a2540;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
          cursor: default;
        }
        .cm-card:hover {
          transform: translateY(-2px);
        }
        .cm-card-accent-bar {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          border-radius: 3px 0 0 3px;
          transition: opacity 0.25s;
        }

        .cm-card-head {
          padding: 20px 20px 16px 24px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }
        .cm-card-icon-wrap {
          width: 42px; height: 42px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .cm-card-icon-wrap::before {
          content: '';
          position: absolute; inset: 0;
          opacity: 0.15;
        }
        .cm-title-block { flex: 1; min-width: 0; }
        .cm-card-name {
          font-size: 15px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.01em;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cm-card-count {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 500;
          color: #475569;
          margin-top: 4px;
        }
        .cm-del-btn {
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          background: transparent;
          border: 1px solid #1e293b;
          border-radius: 8px;
          color: #475569;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .cm-del-btn:hover {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.3);
          color: #ef4444;
        }

        .cm-divider {
          height: 1px;
          background: #111827;
          margin: 0 20px;
        }

        /* ─── TAGS AREA ─── */
        .cm-body { padding: 16px 20px 18px 24px; }
        .cm-tags-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 14px;
        }
        .cm-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 10px 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.01em;
          border: 1px solid;
          transition: opacity 0.15s;
        }
        .cm-tag-x {
          display: flex;
          align-items: center;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.15s;
          border: none;
          background: transparent;
          padding: 0;
        }
        .cm-tag-x:hover { opacity: 1; }

        /* ─── SUB INPUT ─── */
        .cm-sub-row {
          display: flex;
          gap: 8px;
        }
        .cm-sub-input {
          flex: 1;
          height: 36px;
          padding: 0 12px;
          background: #080c14;
          border: 1px solid #1e293b;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          color: #cbd5e1;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          caret-color: #6366f1;
        }
        .cm-sub-input:focus { border-color: #334155; }
        .cm-sub-input::placeholder { color: #1e293b; }
        .cm-sub-add {
          height: 36px;
          padding: 0 14px;
          background: #111827;
          border: 1px solid #1e293b;
          border-radius: 9px;
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .cm-sub-add:hover {
          background: #1e293b;
          border-color: #334155;
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 680px) {
          .cm-root { padding: 16px; }
          .cm-header { flex-direction: column; align-items: flex-start; }
          .cm-stats { width: 100%; }
          .cm-stat-chip { flex: 1; align-items: center; }
          .cm-page-title { font-size: 24px; }
          .cm-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="cm-root">
        <div className="cm-inner">

          {/* ── HEADER ── */}
          <div className="cm-header">
            <div className="cm-header-left">
              <div className="cm-eyebrow">
                <span className="cm-eyebrow-dot" />
                Expense Structure
              </div>
              <div className="cm-page-title">
                Corporate <span>Sectors</span>
              </div>
              <div className="cm-page-sub">
                Define and organise your expenditure categories and their sub-items.
              </div>
            </div>
            <div className="cm-stats">
              <div className="cm-stat-chip">
                <div className="cm-stat-num">{db.categories.length}</div>
                <div className="cm-stat-label">Sectors</div>
              </div>
              <div className="cm-stat-chip">
                <div className="cm-stat-num">{totalSubs}</div>
                <div className="cm-stat-label">Sub-items</div>
              </div>
            </div>
          </div>

          {/* ── ADD BAR ── */}
          <div className="cm-add-wrap">
            <div className="cm-add-bar">
              <div className="cm-add-icon-wrap">
                <span className="cm-add-prefix">New Sector</span>
                <span className="cm-add-slash">/</span>
                <input
                  className="cm-add-input"
                  type="text"
                  placeholder="e.g. Technology, Operations, Finance..."
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onFocus={() => setInputFocus(true)}
                  onBlur={() => setInputFocus(false)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                />
              </div>
              <button className="cm-add-btn" onClick={handleAddCategory}>
                <Plus size={15} strokeWidth={2.5} />
                Create
              </button>
            </div>
          </div>

          {/* ── EMPTY ── */}
          {db.categories.length === 0 && (
            <div className="cm-empty">
              <div className="cm-empty-ring">
                <Layers size={28} color="#334155" />
              </div>
              <div className="cm-empty-title">No sectors defined yet</div>
              <div className="cm-empty-sub">Create your first sector above to start organising expenditures.</div>
            </div>
          )}

          {/* ── GRID ── */}
          <div className="cm-grid">
            {db.categories.map((cat, idx) => {
              const ac = ACCENTS[idx % ACCENTS.length];
              const isHov = hoveredCard === cat.id;

              return (
                <div
                  key={cat.id}
                  className="cm-card"
                  style={{
                    borderColor: isHov ? ac.glow + '40' : '#1a2540',
                    boxShadow: isHov ? `0 8px 40px ${ac.glow}20, 0 0 0 1px ${ac.glow}30` : 'none',
                  }}
                  onMouseEnter={() => setHoveredCard(cat.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* accent bar */}
                  <div
                    className="cm-card-accent-bar"
                    style={{
                      background: `linear-gradient(180deg, ${ac.glow}, transparent)`,
                      opacity: isHov ? 1 : 0.5,
                      boxShadow: isHov ? `0 0 12px ${ac.glow}` : 'none',
                    }}
                  />

                  {/* card head */}
                  <div className="cm-card-head">
                    <div
                      className="cm-card-icon-wrap"
                      style={{ background: ac.soft }}
                    >
                      <Hash size={18} color={ac.glow} strokeWidth={2} />
                    </div>
                    <div className="cm-title-block">
                      <div className="cm-card-name">{cat.name}</div>
                      <div className="cm-card-count" style={{ color: ac.glow + 'aa' }}>
                        <ChevronRight size={11} />
                        {cat.subs.length} sub-item{cat.subs.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <button
                      className="cm-del-btn"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      title="Delete sector"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="cm-divider" />

                  {/* body */}
                  <div className="cm-body">
                    {cat.subs.length > 0 && (
                      <div className="cm-tags-wrap">
                        {cat.subs.map((s, i) => (
                          <span
                            key={i}
                            className="cm-tag"
                            style={{
                              background: ac.soft,
                              color: ac.glow,
                              borderColor: ac.glow + '30',
                            }}
                          >
                            {s}
                            <button
                              className="cm-tag-x"
                              onClick={() => handleDeleteSub(cat.id, i)}
                              aria-label={`Remove ${s}`}
                              style={{ color: ac.glow }}
                            >
                              <X size={11} strokeWidth={2.5} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="cm-sub-row">
                      <input
                        className="cm-sub-input"
                        type="text"
                        placeholder="Add sub-item..."
                        value={subVals[cat.id] || ''}
                        onChange={e => setSubVals({ ...subVals, [cat.id]: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleAddSub(cat.id)}
                      />
                      <button
                        className="cm-sub-add"
                        onClick={() => handleAddSub(cat.id)}
                        style={{ color: ac.glow, borderColor: ac.glow + '30' }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </Page>
  );
};

export default CategoryManager;