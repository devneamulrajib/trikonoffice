import React, { useState } from 'react';
import { Plus, Trash2, X, ChevronRight, Layers, Tag, ArrowRight } from 'lucide-react';
import Page from '../components/Page';

const ACCENT_COLORS = [
  { bg: '#EEF2FF', border: '#C7D2FE', text: '#4338CA', dot: '#6366F1' },
  { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', dot: '#22C55E' },
  { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C', dot: '#F97316' },
  { bg: '#FDF4FF', border: '#E9D5FF', text: '#7E22CE', dot: '#A855F7' },
  { bg: '#ECFEFF', border: '#A5F3FC', text: '#0E7490', dot: '#06B6D4' },
  { bg: '#FFF1F2', border: '#FECDD3', text: '#BE123C', dot: '#F43F5E' },
];

const CategoryManager = ({ db, setDb, logAction }) => {
  const [newCat, setNewCat]         = useState('');
  const [subVals, setSubVals]       = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [addingFocus, setAddingFocus] = useState(false);

  const selected = db.categories.find(c => c.id === selectedId) || db.categories[0] || null;
  const selectedColor = selected
    ? ACCENT_COLORS[db.categories.findIndex(c => c.id === selected.id) % ACCENT_COLORS.length]
    : ACCENT_COLORS[0];

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    const newItem = { id: Date.now(), name: newCat.trim(), subs: [] };
    setDb({ ...db, categories: [...db.categories, newItem] });
    logAction('Created', 'Sector', newCat.trim());
    setNewCat('');
    setSelectedId(newItem.id);
  };

  const handleDeleteCategory = (id, name) => {
    if (window.confirm(`Delete "${name}" and all its sub-items?`)) {
      const remaining = db.categories.filter(x => x.id !== id);
      setDb({ ...db, categories: remaining });
      logAction('Deleted', 'Sector', name);
      setSelectedId(remaining[0]?.id || null);
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

  const activeId = selected?.id;

  return (
    <Page title="Corporate Sectors" subtitle="Structure expenditure categories and items">
      <style>{`
        .cs-wrap {
          display: flex;
          flex-direction: column;
          gap: 0;
          height: calc(100vh - 140px);
          min-height: 500px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        /* ── TOP ACTION BAR ── */
        .cs-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 0 0 20px 0;
          border-bottom: 2px solid #F1F5F9;
          margin-bottom: 0;
          flex-shrink: 0;
        }
        .cs-topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        .cs-topbar-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }
        .cs-topbar-text h2 {
          font-size: 15px; font-weight: 700; color: #0F172A;
          margin: 0; letter-spacing: -0.01em;
        }
        .cs-topbar-text p {
          font-size: 12px; color: #94A3B8;
          margin: 2px 0 0; font-weight: 400;
        }
        .cs-count-pill {
          display: flex; align-items: center; gap: 16px;
          background: #F8FAFC; border: 1px solid #E2E8F0;
          border-radius: 10px; padding: 8px 16px;
          flex-shrink: 0;
        }
        .cs-count-item { text-align: center; }
        .cs-count-num { font-size: 18px; font-weight: 800; color: #0F172A; line-height: 1; }
        .cs-count-lbl { font-size: 10px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
        .cs-count-sep { width: 1px; height: 28px; background: #E2E8F0; }

        /* ── NEW SECTOR INPUT ── */
        .cs-new-row {
          display: flex; gap: 8px;
          padding: 16px 0;
          flex-shrink: 0;
          border-bottom: 1px solid #F1F5F9;
        }
        .cs-new-input-wrap {
          flex: 1; display: flex; align-items: center;
          background: #fff;
          border: 1.5px solid ${addingFocus ? '#6366F1' : '#E2E8F0'};
          border-radius: 10px;
          padding: 0 14px;
          gap: 10px;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: ${addingFocus ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none'};
        }
        .cs-new-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #CBD5E1; white-space: nowrap;
        }
        .cs-new-input {
          flex: 1; border: none; outline: none;
          font-size: 14px; font-weight: 500; color: #0F172A;
          background: transparent; font-family: inherit;
          padding: 12px 0;
        }
        .cs-new-input::placeholder { color: #CBD5E1; font-weight: 400; }
        .cs-create-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 0 20px; height: 44px;
          background: #0F172A; color: #fff;
          font-size: 13px; font-weight: 700;
          border: none; border-radius: 10px; cursor: pointer;
          letter-spacing: 0.01em; white-space: nowrap;
          transition: background 0.15s, transform 0.1s;
          font-family: inherit;
        }
        .cs-create-btn:hover { background: #1E293B; transform: translateY(-1px); }
        .cs-create-btn:active { transform: translateY(0); }

        /* ── MAIN SPLIT LAYOUT ── */
        .cs-body {
          display: flex; gap: 0;
          flex: 1; overflow: hidden;
        }

        /* ── LEFT: SECTOR LIST ── */
        .cs-left {
          width: 260px; flex-shrink: 0;
          border-right: 1px solid #F1F5F9;
          overflow-y: auto;
          padding: 12px 12px 12px 0;
        }
        .cs-left-heading {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #CBD5E1;
          padding: 4px 12px 10px; display: block;
        }
        .cs-sector-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
          margin-bottom: 2px;
        }
        .cs-sector-row:hover { background: #F8FAFC; }
        .cs-sector-row.active { background: #F1F5F9; }
        .cs-sector-dot {
          width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
          transition: transform 0.15s;
        }
        .cs-sector-row.active .cs-sector-dot { transform: scale(1.2); }
        .cs-sector-info { flex: 1; min-width: 0; }
        .cs-sector-name {
          font-size: 13.5px; font-weight: 600; color: #1E293B;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          display: block;
        }
        .cs-sector-row.active .cs-sector-name { color: #0F172A; }
        .cs-sector-meta {
          font-size: 11px; color: #94A3B8; font-weight: 400; margin-top: 1px;
        }
        .cs-sector-arrow {
          color: #CBD5E1; flex-shrink: 0;
          opacity: 0; transition: opacity 0.15s;
        }
        .cs-sector-row:hover .cs-sector-arrow,
        .cs-sector-row.active .cs-sector-arrow { opacity: 1; }
        .cs-sector-row.active .cs-sector-arrow { color: #6366F1; }

        .cs-empty-left {
          padding: 24px 12px; text-align: center;
          color: #CBD5E1; font-size: 12.5px; line-height: 1.6;
        }

        /* ── RIGHT: EDITOR PANEL ── */
        .cs-right {
          flex: 1; overflow-y: auto;
          padding: 20px 0 20px 28px;
          display: flex; flex-direction: column;
        }

        /* empty right state */
        .cs-right-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          color: #CBD5E1; text-align: center;
        }
        .cs-right-empty-icon {
          width: 64px; height: 64px; border-radius: 20px;
          background: #F8FAFC; border: 1.5px dashed #E2E8F0;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .cs-right-empty h3 { font-size: 15px; font-weight: 600; color: #94A3B8; margin: 0; }
        .cs-right-empty p  { font-size: 13px; color: #CBD5E1; margin: 4px 0 0; }

        /* editor header */
        .cs-editor-head {
          display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
          margin-bottom: 24px; flex-shrink: 0;
        }
        .cs-editor-badge {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 10px 16px;
          border-radius: 12px; border: 1.5px solid;
        }
        .cs-editor-badge-dot {
          width: 12px; height: 12px; border-radius: 50%;
          box-shadow: 0 0 0 3px;
        }
        .cs-editor-badge-name {
          font-size: 16px; font-weight: 800; letter-spacing: -0.02em;
        }
        .cs-del-sector-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px;
          background: #FFF1F2; border: 1.5px solid #FECDD3;
          border-radius: 9px; color: #BE123C;
          font-size: 12.5px; font-weight: 600;
          cursor: pointer; transition: background 0.15s; font-family: inherit;
        }
        .cs-del-sector-btn:hover { background: #FFE4E6; }

        /* sub items */
        .cs-sub-section-label {
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #94A3B8; margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .cs-sub-section-label::after {
          content: ''; flex: 1; height: 1px; background: #F1F5F9;
        }

        .cs-tags-grid {
          display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;
        }
        .cs-tag {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 10px 7px 14px;
          border-radius: 8px; border: 1.5px solid;
          font-size: 13px; font-weight: 600;
          transition: opacity 0.15s;
        }
        .cs-tag-x {
          display: flex; align-items: center; justify-content: center;
          width: 18px; height: 18px; border-radius: 4px;
          border: none; background: transparent;
          cursor: pointer; opacity: 0.5; transition: opacity 0.15s, background 0.15s;
          padding: 0;
        }
        .cs-tag-x:hover { opacity: 1; background: rgba(0,0,0,0.06); }

        .cs-no-subs {
          padding: 28px 24px; border: 1.5px dashed #E2E8F0;
          border-radius: 12px; text-align: center; margin-bottom: 20px;
          color: #94A3B8; font-size: 13px;
        }

        .cs-add-sub-row {
          display: flex; gap: 8px; align-items: center;
        }
        .cs-sub-input {
          flex: 1; height: 42px; padding: 0 14px;
          border: 1.5px solid #E2E8F0; border-radius: 10px;
          font-size: 13.5px; font-weight: 500; color: #0F172A;
          background: #F8FAFC; outline: none; font-family: inherit;
          transition: border-color 0.2s, background 0.2s;
        }
        .cs-sub-input:focus { border-color: #6366F1; background: #fff; }
        .cs-sub-input::placeholder { color: #CBD5E1; }
        .cs-add-sub-btn {
          height: 42px; padding: 0 20px;
          border: 1.5px solid; border-radius: 10px;
          font-size: 13px; font-weight: 700;
          cursor: pointer; white-space: nowrap; font-family: inherit;
          transition: opacity 0.15s, transform 0.1s;
        }
        .cs-add-sub-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .cs-add-sub-btn:active { transform: translateY(0); }

        @media (max-width: 700px) {
          .cs-body { flex-direction: column; }
          .cs-left { width: 100%; height: 180px; border-right: none; border-bottom: 1px solid #F1F5F9; padding: 8px; }
          .cs-right { padding: 16px 0 0; }
          .cs-wrap { height: auto; }
        }
      `}</style>

      <div className="cs-wrap">

        {/* ── TOP BAR ── */}
        <div className="cs-topbar">
          <div className="cs-topbar-left">
            <div className="cs-topbar-icon">
              <Layers size={20} color="#fff" strokeWidth={2} />
            </div>
            <div className="cs-topbar-text">
              <h2>Sector Management</h2>
              <p>Click a sector to manage its sub-items</p>
            </div>
          </div>
          <div className="cs-count-pill">
            <div className="cs-count-item">
              <div className="cs-count-num">{db.categories.length}</div>
              <div className="cs-count-lbl">Sectors</div>
            </div>
            <div className="cs-count-sep" />
            <div className="cs-count-item">
              <div className="cs-count-num">{db.categories.reduce((a, c) => a + c.subs.length, 0)}</div>
              <div className="cs-count-lbl">Sub-items</div>
            </div>
          </div>
        </div>

        {/* ── NEW SECTOR ROW ── */}
        <div className="cs-new-row">
          <div className="cs-new-input-wrap">
            <span className="cs-new-label">New Sector</span>
            <input
              className="cs-new-input"
              type="text"
              placeholder="e.g. Technology, HR, Operations..."
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              onFocus={() => setAddingFocus(true)}
              onBlur={() => setAddingFocus(false)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            />
          </div>
          <button className="cs-create-btn" onClick={handleAddCategory}>
            <Plus size={15} strokeWidth={2.5} /> Add Sector
          </button>
        </div>

        {/* ── SPLIT BODY ── */}
        <div className="cs-body">

          {/* LEFT — sector list */}
          <div className="cs-left">
            <span className="cs-left-heading">All Sectors</span>
            {db.categories.length === 0 ? (
              <div className="cs-empty-left">
                No sectors yet.<br />Add one above to get started.
              </div>
            ) : (
              db.categories.map((cat, idx) => {
                const ac = ACCENT_COLORS[idx % ACCENT_COLORS.length];
                const isActive = cat.id === activeId;
                return (
                  <div
                    key={cat.id}
                    className={`cs-sector-row${isActive ? ' active' : ''}`}
                    onClick={() => setSelectedId(cat.id)}
                  >
                    <div className="cs-sector-dot" style={{ background: ac.dot }} />
                    <div className="cs-sector-info">
                      <span className="cs-sector-name">{cat.name}</span>
                      <div className="cs-sector-meta">{cat.subs.length} sub-item{cat.subs.length !== 1 ? 's' : ''}</div>
                    </div>
                    <ChevronRight size={14} className="cs-sector-arrow" />
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT — editor */}
          <div className="cs-right">
            {!selected ? (
              <div className="cs-right-empty">
                <div className="cs-right-empty-icon">
                  <Tag size={28} color="#CBD5E1" />
                </div>
                <h3>Select a sector</h3>
                <p>Choose a sector from the list to manage its sub-items.</p>
              </div>
            ) : (
              <>
                {/* editor header */}
                <div className="cs-editor-head">
                  <div
                    className="cs-editor-badge"
                    style={{
                      background: selectedColor.bg,
                      borderColor: selectedColor.border,
                    }}
                  >
                    <div
                      className="cs-editor-badge-dot"
                      style={{
                        background: selectedColor.dot,
                        boxShadow: `0 0 0 3px ${selectedColor.bg}`,
                      }}
                    />
                    <span
                      className="cs-editor-badge-name"
                      style={{ color: selectedColor.text }}
                    >
                      {selected.name}
                    </span>
                  </div>
                  <button
                    className="cs-del-sector-btn"
                    onClick={() => handleDeleteCategory(selected.id, selected.name)}
                  >
                    <Trash2 size={13} />
                    Delete Sector
                  </button>
                </div>

                {/* sub items label */}
                <div className="cs-sub-section-label">
                  Sub-items · {selected.subs.length}
                </div>

                {/* tags */}
                {selected.subs.length === 0 ? (
                  <div className="cs-no-subs">
                    No sub-items yet — add one below.
                  </div>
                ) : (
                  <div className="cs-tags-grid">
                    {selected.subs.map((s, i) => (
                      <span
                        key={i}
                        className="cs-tag"
                        style={{
                          background: selectedColor.bg,
                          borderColor: selectedColor.border,
                          color: selectedColor.text,
                        }}
                      >
                        {s}
                        <button
                          className="cs-tag-x"
                          onClick={() => handleDeleteSub(selected.id, i)}
                          aria-label={`Remove ${s}`}
                        >
                          <X size={11} strokeWidth={2.5} color={selectedColor.text} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* add sub row */}
                <div className="cs-add-sub-row">
                  <input
                    className="cs-sub-input"
                    type="text"
                    placeholder={`Add sub-item to ${selected.name}...`}
                    value={subVals[selected.id] || ''}
                    onChange={e => setSubVals({ ...subVals, [selected.id]: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleAddSub(selected.id)}
                  />
                  <button
                    className="cs-add-sub-btn"
                    onClick={() => handleAddSub(selected.id)}
                    style={{
                      background: selectedColor.bg,
                      borderColor: selectedColor.border,
                      color: selectedColor.text,
                    }}
                  >
                    + Add Sub-item
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </Page>
  );
};

export default CategoryManager;