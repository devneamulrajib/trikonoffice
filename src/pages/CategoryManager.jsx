import React, { useState } from 'react';
import { Plus, Trash2, X, ChevronRight, ChevronDown, Pencil, Layers } from 'lucide-react';
import Page from '../components/Page';

// Each category cycles through this palette. Keep bg/border/text/dot in the
// same family so badges and icon chips always read as one coherent color.
const ACCENT_COLORS = [
  { bg: '#F1EBFE', border: '#E0D7FB', text: '#7C3AED', dot: '#8B5CF6' }, // violet
  { bg: '#E5F9F5', border: '#CFEFE7', text: '#0F9488', dot: '#14B8A6' }, // teal
  { bg: '#FDF1DC', border: '#FBE3BB', text: '#B4760F', dot: '#F59E0B' }, // amber
  { bg: '#FFE9EC', border: '#FCD3D9', text: '#BE3553', dot: '#FB7185' }, // rose
  { bg: '#E6F1FB', border: '#CBE3F7', text: '#1D6FB8', dot: '#3B82F6' }, // blue
  { bg: '#EAF3DE', border: '#D6E8C0', text: '#5B8A2C', dot: '#84CC16' }, // green
];

const colorFor = (idx) => ACCENT_COLORS[idx % ACCENT_COLORS.length];

const CategoryManager = ({ db, setDb, logAction }) => {
  const [newCat, setNewCat] = useState('');
  const [addingFocus, setAddingFocus] = useState(false);
  const [expandedId, setExpandedId] = useState(db.categories[0]?.id ?? null);

  const [modalCat, setModalCat] = useState(null); // category object currently open in modal, or null
  const [modalName, setModalName] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalSubs, setModalSubs] = useState([]); // working copy of subs while modal is open
  const [newSubName, setNewSubName] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');

  const toggleExpanded = (id) => setExpandedId(prev => (prev === id ? null : id));

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    const newItem = { id: Date.now(), name: newCat.trim(), description: '', subs: [] };
    setDb({ ...db, categories: [...db.categories, newItem] });
    logAction('Created', 'Sector', newCat.trim());
    setNewCat('');
    setExpandedId(newItem.id);
  };

  const handleDeleteCategory = (id, name) => {
    if (window.confirm(`Delete "${name}" and all its sub-items?`)) {
      const remaining = db.categories.filter(x => x.id !== id);
      setDb({ ...db, categories: remaining });
      logAction('Deleted', 'Sector', name);
      if (expandedId === id) setExpandedId(remaining[0]?.id ?? null);
    }
  };

  // ── Modal lifecycle ──
  const openModal = (cat) => {
    setModalCat(cat);
    setModalName(cat.name);
    setModalDesc(cat.description || '');
    setModalSubs(cat.subs.map(s => (typeof s === 'string' ? { name: s, description: '' } : s)));
    setNewSubName('');
    setNewSubDesc('');
  };

  const closeModal = () => setModalCat(null);

  const handleAddSubInModal = () => {
    if (!newSubName.trim()) return;
    setModalSubs(prev => [...prev, { name: newSubName.trim(), description: newSubDesc.trim() }]);
    setNewSubName('');
    setNewSubDesc('');
  };

  const handleRemoveSubInModal = (idx) => {
    setModalSubs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveModal = () => {
    if (!modalName.trim() || !modalCat) return;
    setDb({
      ...db,
      categories: db.categories.map(c =>
        c.id === modalCat.id
          ? { ...c, name: modalName.trim(), description: modalDesc.trim(), subs: modalSubs }
          : c
      ),
    });
    logAction('Updated', 'Sector', modalName.trim());
    closeModal();
  };

  const totalSubs = db.categories.reduce((a, c) => a + c.subs.length, 0);

  return (
    <Page title="Corporate Sectors" subtitle="Structure expenditure categories and items">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

        .cm-wrap {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          color: #1E1B33;
        }
        .cm-display { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }

        /* ── HEADER ── */
        .cm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
        }
        .cm-eyebrow {
          font-size: 11.5px; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: #A78BFA; margin: 0 0 5px;
        }
        .cm-title {
          font-size: 27px; font-weight: 700; letter-spacing: -0.02em;
          margin: 0; color: #1E1B33;
        }
        .cm-new-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: #7C3AED; color: #fff; border: none;
          border-radius: 11px; padding: 0 18px; height: 44px;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          box-shadow: 0 1px 2px rgba(124,58,237,0.15), 0 4px 10px rgba(124,58,237,0.18);
          transition: transform 0.15s, box-shadow 0.15s;
          font-family: 'Inter', sans-serif;
          flex-shrink: 0;
        }
        .cm-new-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(124,58,237,0.18), 0 6px 14px rgba(124,58,237,0.22); }
        .cm-new-btn:active { transform: translateY(0); }

        /* ── NEW CATEGORY INPUT ROW ── */
        .cm-new-row {
          display: flex; gap: 10px; margin-bottom: 22px;
        }
        .cm-new-input-wrap {
          flex: 1; display: flex; align-items: center;
          background: #fff; gap: 10px; padding: 0 16px;
          border-radius: 13px; border: 1.5px solid ${addingFocus ? '#7C3AED' : '#EFEAFC'};
          box-shadow: ${addingFocus ? '0 0 0 4px rgba(124,58,237,0.08)' : 'none'};
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cm-new-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: #C3BBE0; white-space: nowrap;
        }
        .cm-new-input {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 14px; font-weight: 500; color: #1E1B33;
          font-family: 'Inter', sans-serif; padding: 13px 0;
        }
        .cm-new-input::placeholder { color: #C3BBE0; font-weight: 400; }

        /* ── STAT STRIP ── */
        .cm-stats {
          display: flex; margin-bottom: 26px; padding: 18px 24px;
          background: linear-gradient(135deg, #FAF8FF 0%, #F6F3FE 100%);
          border-radius: 16px; border: 1px solid #EFEAFC;
        }
        .cm-stat { flex: 1; }
        .cm-stat-num {
          font-size: 24px; font-weight: 700; line-height: 1;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cm-stat-lbl { font-size: 11.5px; color: #9890B5; margin-top: 5px; font-weight: 500; }
        .cm-stat-sep { width: 1px; background: #EFEAFC; margin: 0 24px; }

        .cm-section-lbl {
          font-size: 11.5px; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; color: #B4ACD4; margin: 0 0 12px;
        }

        /* ── CATEGORY LIST ── */
        .cm-list { display: flex; flex-direction: column; gap: 11px; }
        .cm-empty {
          padding: 36px 20px; text-align: center; color: #C3BBE0;
          font-size: 13.5px; border: 1.5px dashed #EFEAFC; border-radius: 16px;
        }

        .cm-card {
          background: #fff; border: 1px solid #F0EDF7; border-radius: 16px;
          padding: 16px 18px;
          box-shadow: 0 1px 2px rgba(30,27,51,0.03), 0 1px 8px rgba(30,27,51,0.02);
        }
        .cm-card-row { display: flex; align-items: center; gap: 13px; cursor: pointer; }
        .cm-chip-btn {
          width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; padding: 0;
        }
        .cm-dot {
          width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
        }
        .cm-card-info { flex: 1; min-width: 0; }
        .cm-card-name {
          font-size: 14.5px; font-weight: 600; color: #1E1B33;
          font-family: 'Plus Jakarta Sans', sans-serif;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cm-card-desc { font-size: 12.5px; color: #A39CC2; margin-top: 1px; }
        .cm-badge {
          font-size: 11.5px; font-weight: 600; padding: 5px 12px;
          border-radius: 999px; flex-shrink: 0; white-space: nowrap;
        }
        .cm-icon-btn {
          background: #FAF9FC; border: none; cursor: pointer; color: #A39CC2;
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }
        .cm-icon-btn:hover { background: #F1EBFE; color: #7C3AED; }
        .cm-icon-btn.danger:hover { background: #FFE9EC; color: #BE3553; }

        .cm-subs-grid {
          display: flex; gap: 10px; margin-top: 16px; padding-left: 43px;
          flex-wrap: wrap;
        }
        .cm-sub-chip {
          background: #FAF8FF; border-radius: 12px; padding: 10px 14px;
          min-width: 140px; border: 1px solid;
        }
        .cm-sub-chip-name {
          font-size: 13px; font-weight: 600; color: #1E1B33;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cm-sub-chip-desc { font-size: 11.5px; color: #A39CC2; margin-top: 1px; }
        .cm-no-subs {
          margin-top: 16px; padding-left: 43px;
          font-size: 12.5px; color: #C3BBE0;
        }

        /* ── MODAL ── */
        .cm-modal-overlay {
          position: fixed; inset: 0; background: rgba(30,27,51,0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 24px;
        }
        .cm-modal {
          background: #fff; border-radius: 20px; padding: 26px 30px;
          width: 100%; max-width: 420px; max-height: 88vh; overflow-y: auto;
          box-shadow: 0 20px 50px rgba(30,27,51,0.18);
          font-family: 'Inter', sans-serif;
        }
        .cm-modal-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 4px;
        }
        .cm-modal-title {
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 19px;
          font-weight: 700; margin: 0; color: #1E1B33;
        }
        .cm-modal-sub { font-size: 13px; color: #A39CC2; margin: 0 0 20px; }
        .cm-modal-close {
          background: #FAF9FC; border: none; cursor: pointer; color: #A39CC2;
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .cm-modal-close:hover { background: #F1EBFE; color: #7C3AED; }

        .cm-label {
          font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; color: #A39CC2; display: block;
        }
        .cm-modal-input, .cm-modal-textarea {
          margin: 7px 0 16px; width: 100%; border: 1.5px solid #EFEAFC;
          border-radius: 11px; padding: 0 14px; font-size: 13.5px;
          font-family: 'Inter', sans-serif; font-weight: 500; color: #1E1B33;
          outline: none; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .cm-modal-input { height: 42px; }
        .cm-modal-textarea { padding: 10px 14px; resize: none; font-weight: 400; }
        .cm-modal-input:focus, .cm-modal-textarea:focus { border-color: #7C3AED; }

        .cm-subs-label-row { display: flex; align-items: center; gap: 8px; margin-bottom: 11px; }
        .cm-subs-label {
          font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; color: #7C3AED;
        }
        .cm-subs-count {
          background: #F1EBFE; color: #7C3AED; font-size: 11px; font-weight: 600;
          padding: 2px 9px; border-radius: 999px;
        }
        .cm-modal-sub-list { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
        .cm-modal-sub-item {
          display: flex; align-items: center; justify-content: space-between;
          background: #FAF8FF; border: 1px solid #F1EBFE; border-radius: 11px;
          padding: 10px 12px;
        }
        .cm-modal-sub-name {
          font-size: 13px; font-weight: 600; color: #1E1B33;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .cm-modal-sub-desc { font-size: 11.5px; color: #A39CC2; }
        .cm-modal-sub-remove {
          background: none; border: none; cursor: pointer; color: #C3BBE0;
          width: 24px; height: 24px; display: flex; align-items: center;
          justify-content: center; border-radius: 7px; flex-shrink: 0;
        }
        .cm-modal-sub-remove:hover { background: #FFE9EC; color: #BE3553; }
        .cm-modal-no-subs {
          padding: 16px; text-align: center; color: #C3BBE0; font-size: 12.5px;
          border: 1.5px dashed #EFEAFC; border-radius: 11px; margin-bottom: 16px;
        }

        .cm-add-sub-btn {
          width: 100%; background: #7C3AED; color: #fff; border: none;
          border-radius: 11px; height: 42px; font-size: 13.5px; font-weight: 600;
          cursor: pointer; margin-bottom: 12px;
          box-shadow: 0 1px 2px rgba(124,58,237,0.15), 0 4px 10px rgba(124,58,237,0.18);
          font-family: 'Inter', sans-serif;
          transition: transform 0.15s;
        }
        .cm-add-sub-btn:hover { transform: translateY(-1px); }

        .cm-modal-footer {
          display: flex; gap: 9px; justify-content: flex-end;
          border-top: 1px solid #F1EBFE; padding-top: 16px;
        }
        .cm-btn-cancel {
          background: #fff; border: 1.5px solid #EFEAFC; color: #7A7398;
          border-radius: 10px; padding: 0 17px; height: 40px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .cm-btn-cancel:hover { background: #FAF9FC; }
        .cm-btn-save {
          background: #7C3AED; color: #fff; border: none; border-radius: 10px;
          padding: 0 17px; height: 40px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'Inter', sans-serif;
          box-shadow: 0 1px 2px rgba(124,58,237,0.15), 0 4px 10px rgba(124,58,237,0.18);
        }
        .cm-btn-save:hover { transform: translateY(-1px); }

        @media (max-width: 640px) {
          .cm-header { flex-direction: column; align-items: flex-start; }
          .cm-stats { flex-wrap: wrap; gap: 16px; }
          .cm-stat-sep { display: none; }
          .cm-subs-grid, .cm-no-subs { padding-left: 0; }
        }
      `}</style>

      <div className="cm-wrap">

        {/* ── HEADER ── */}
        <div className="cm-header">
          <div>
            <p className="cm-eyebrow">Content architecture</p>
            <h1 className="cm-title cm-display">Category manager</h1>
          </div>
          <button className="cm-new-btn" onClick={() => document.getElementById('cm-new-cat-input')?.focus()}>
            <Plus size={16} strokeWidth={2.5} /> New category
          </button>
        </div>

        {/* ── NEW CATEGORY ROW ── */}
        <div className="cm-new-row">
          <div className="cm-new-input-wrap">
            <span className="cm-new-label">New category</span>
            <input
              id="cm-new-cat-input"
              className="cm-new-input"
              type="text"
              placeholder="e.g. Technology, HR, Operations..."
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              onFocus={() => setAddingFocus(true)}
              onBlur={() => setAddingFocus(false)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            />
          </div>
        </div>

        {/* ── STAT STRIP ── */}
        <div className="cm-stats">
          <div className="cm-stat">
            <div className="cm-stat-num cm-display" style={{ color: '#7C3AED' }}>
              {String(db.categories.length).padStart(2, '0')}
            </div>
            <div className="cm-stat-lbl">Categories</div>
          </div>
          <div className="cm-stat-sep" />
          <div className="cm-stat">
            <div className="cm-stat-num cm-display">{String(totalSubs).padStart(2, '0')}</div>
            <div className="cm-stat-lbl">Subcategories</div>
          </div>
        </div>

        <p className="cm-section-lbl">{db.categories.length} categories</p>

        {/* ── CATEGORY LIST ── */}
        {db.categories.length === 0 ? (
          <div className="cm-empty">No categories yet. Add one above to get started.</div>
        ) : (
          <div className="cm-list">
            {db.categories.map((cat, idx) => {
              const ac = colorFor(idx);
              const isOpen = cat.id === expandedId;
              return (
                <div key={cat.id} className="cm-card">
                  <div className="cm-card-row" onClick={() => toggleExpanded(cat.id)}>
                    <button
                      className="cm-chip-btn"
                      style={{ background: ac.bg }}
                      aria-label={isOpen ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
                      onClick={(e) => { e.stopPropagation(); toggleExpanded(cat.id); }}
                    >
                      {isOpen
                        ? <ChevronDown size={15} color={ac.text} />
                        : <ChevronRight size={15} color={ac.text} />}
                    </button>
                    <span className="cm-dot" style={{ background: ac.dot, boxShadow: `0 0 0 4px ${ac.bg}` }} />
                    <div className="cm-card-info">
                      <div className="cm-card-name">{cat.name}</div>
                      {cat.description && <div className="cm-card-desc">{cat.description}</div>}
                    </div>
                    <span className="cm-badge" style={{ background: ac.bg, color: ac.text }}>
                      {cat.subs.length} sub
                    </span>
                    <button
                      className="cm-icon-btn"
                      aria-label={`Edit ${cat.name}`}
                      onClick={(e) => { e.stopPropagation(); openModal(cat); }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="cm-icon-btn danger"
                      aria-label={`Delete ${cat.name}`}
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id, cat.name); }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {isOpen && (
                    cat.subs.length === 0 ? (
                      <div className="cm-no-subs">No sub-items yet — click edit to add some.</div>
                    ) : (
                      <div className="cm-subs-grid">
                        {cat.subs.map((s, i) => {
                          const sub = typeof s === 'string' ? { name: s, description: '' } : s;
                          return (
                            <div key={i} className="cm-sub-chip" style={{ borderColor: ac.border }}>
                              <div className="cm-sub-chip-name">{sub.name}</div>
                              {sub.description && <div className="cm-sub-chip-desc">{sub.description}</div>}
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {modalCat && (
        <div className="cm-modal-overlay" onClick={closeModal}>
          <div className="cm-modal" onClick={e => e.stopPropagation()}>
            <div className="cm-modal-head">
              <h2 className="cm-modal-title">Edit category</h2>
              <button className="cm-modal-close" aria-label="Close" onClick={closeModal}>
                <X size={16} />
              </button>
            </div>
            <p className="cm-modal-sub">Update the category details and its subcategories.</p>

            <label className="cm-label">Category name</label>
            <input
              className="cm-modal-input"
              value={modalName}
              onChange={e => setModalName(e.target.value)}
            />

            <label className="cm-label">Description</label>
            <textarea
              className="cm-modal-textarea"
              rows={2}
              value={modalDesc}
              onChange={e => setModalDesc(e.target.value)}
            />

            <div className="cm-subs-label-row">
              <span className="cm-subs-label">Subcategories</span>
              <span className="cm-subs-count">{modalSubs.length}</span>
            </div>

            {modalSubs.length === 0 ? (
              <div className="cm-modal-no-subs">No subcategories yet.</div>
            ) : (
              <div className="cm-modal-sub-list">
                {modalSubs.map((s, i) => (
                  <div key={i} className="cm-modal-sub-item">
                    <div>
                      <div className="cm-modal-sub-name">{s.name}</div>
                      {s.description && <div className="cm-modal-sub-desc">{s.description}</div>}
                    </div>
                    <button
                      className="cm-modal-sub-remove"
                      aria-label={`Remove ${s.name}`}
                      onClick={() => handleRemoveSubInModal(i)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="cm-label">Add subcategory</label>
            <input
              className="cm-modal-input"
              placeholder="Subcategory name"
              value={newSubName}
              onChange={e => setNewSubName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSubInModal()}
              style={{ marginBottom: 8 }}
            />
            <input
              className="cm-modal-input"
              placeholder="Description (optional)"
              value={newSubDesc}
              onChange={e => setNewSubDesc(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSubInModal()}
            />
            <button className="cm-add-sub-btn" onClick={handleAddSubInModal}>
              + Add subcategory
            </button>

            <div className="cm-modal-footer">
              <button className="cm-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="cm-btn-save" onClick={handleSaveModal}>Save changes</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

export default CategoryManager;