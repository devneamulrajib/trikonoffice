import React, { useState, useMemo, useRef } from 'react';
import Page from '../components/Page';

const AddExpense = ({ db, setDb, selectedMonth, logAction }) => {
  const [form, setForm] = useState({
    categoryId: '',
    sub: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });
  const [attachment, setAttachment] = useState(null); // { name, type, size, data }
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const activeCat = db.categories.find(c => c.id === parseInt(form.categoryId));

  const stats = useMemo(() => {
    if (!form.categoryId) return { approved: 0, remaining: 0, spent: 0 };

    const approved = db.budgetRequests
      .filter(r => r.month === selectedMonth && r.status === 'approved')
      .reduce((sum, r) => {
        const c = r.allocations.find(a => a.categoryId === parseInt(form.categoryId));
        if (c) {
          return sum + (form.sub && c.subAllocations?.[form.sub]
            ? c.subAllocations[form.sub]
            : c.amount);
        }
        return sum;
      }, 0);

    const alreadySpent = db.expenses
      .filter(e =>
        Number(e.categoryId) === Number(form.categoryId) &&
        (form.sub ? e.sub === form.sub : true) &&
        e.date.startsWith(selectedMonth)
      )
      .reduce((s, e) => s + e.amount, 0);

    const typingAmount = parseFloat(form.amount) || 0;
    const totalSpentProjected = alreadySpent + typingAmount;

    return {
      approved,
      spent: totalSpentProjected,
      remaining: approved - totalSpentProjected
    };
  }, [db.expenses, db.budgetRequests, form.categoryId, form.sub, selectedMonth, form.amount]);

  const handleSave = e => {
    e.preventDefault();
    if (!form.categoryId || !form.amount) return alert('Required fields missing.');

    const newEntry = {
      ...form,
      id: Date.now(),
      categoryId: parseInt(form.categoryId),
      amount: parseFloat(form.amount),
      categoryName: activeCat.name,
      attachment: attachment || null
    };

    setDb({ ...db, expenses: [newEntry, ...db.expenses] });
    logAction('Logged', 'Expense', `৳${form.amount} – ${activeCat.name}`);
    setForm({
      categoryId: '',
      sub: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
    setAttachment(null);
  };

  const processFile = (file) => {
    if (!file) return;

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      return alert('Only images (JPG, PNG, GIF, WEBP) and PDF files are allowed.');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return alert('File size must be under 5MB.');
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachment({
        name: file.name,
        type: file.type,
        size: file.size,
        data: ev.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = attachment && attachment.type.startsWith('image/');

  const pct = stats.approved > 0 ? (stats.spent / stats.approved) * 100 : 0;

  return (
    <Page title="Log Transaction" subtitle="Commit an expenditure to the general ledger">
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: 32, maxWidth: 1100
      }}>

        {/* FORM */}
        <div className="card" style={{ padding: 40 }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{
                  display: 'block', fontSize: 12,
                  fontWeight: 600, color: 'var(--zinc-500)', marginBottom: 8
                }}>
                  Sector
                </label>
                <select
                  className="input-field"
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value, sub: '' })}
                >
                  <option value="">Select sector...</option>
                  {db.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: 12,
                  fontWeight: 600, color: 'var(--zinc-500)', marginBottom: 8
                }}>
                  Sub-item
                </label>
                <select
                  className="input-field"
                  value={form.sub}
                  onChange={e => setForm({ ...form, sub: e.target.value })}
                >
                  <option value="">General Expenditure</option>
                  {activeCat?.subs.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: 12,
                fontWeight: 600, color: 'var(--zinc-500)', marginBottom: 8
              }}>
                Date
              </label>
              <input
                className="input-field"
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: 12,
                fontWeight: 600, color: 'var(--zinc-500)', marginBottom: 8
              }}>
                Amount (BDT)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 16,
                  top: '50%', transform: 'translateY(-50%)',
                  fontWeight: 800, color: '#94A3B8', fontSize: 18
                }}>
                  ৳
                </span>
                <input
                  className="input-field"
                  type="number"
                  required
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  style={{
                    paddingLeft: 40, fontSize: 24,
                    fontWeight: 800, height: 64,
                    fontFamily: 'JetBrains Mono'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: 12,
                fontWeight: 600, color: 'var(--zinc-500)', marginBottom: 8
              }}>
                Memo / Note
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="Explain the expense..."
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
              />
            </div>

            {/* ── ATTACHMENT ── */}
            <div>
              <label style={{
                display: 'block', fontSize: 12,
                fontWeight: 600, color: 'var(--zinc-500)', marginBottom: 8
              }}>
                Attachment <span style={{ fontWeight: 400, color: 'var(--zinc-400)' }}>(Cash memo, invoice, PDF – max 5 MB)</span>
              </label>

              {!attachment ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--primary)' : '#CBD5E1'}`,
                    borderRadius: 12,
                    padding: '28px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragOver ? 'rgba(99,102,241,0.04)' : '#FAFAFA',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* upload icon */}
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                    stroke={dragOver ? 'var(--primary)' : '#94A3B8'}
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ margin: '0 auto 10px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p style={{ fontSize: 13, fontWeight: 600, color: dragOver ? 'var(--primary)' : '#475569', marginBottom: 4 }}>
                    {dragOver ? 'Drop to attach' : 'Drag & drop or click to upload'}
                  </p>
                  <p style={{ fontSize: 11, color: '#94A3B8' }}>JPG, PNG, GIF, WEBP, PDF</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div style={{
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#FAFAFA'
                }}>
                  {/* image preview */}
                  {isImage && (
                    <div style={{
                      width: '100%', maxHeight: 180,
                      overflow: 'hidden', borderBottom: '1px solid #E2E8F0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#F1F5F9'
                    }}>
                      <img
                        src={attachment.data}
                        alt="preview"
                        style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain' }}
                      />
                    </div>
                  )}

                  {/* PDF icon row */}
                  {!isImage && (
                    <div style={{
                      padding: '16px 20px',
                      display: 'flex', alignItems: 'center', gap: 14,
                      borderBottom: '1px solid #E2E8F0'
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 8,
                        background: '#FEE2E2', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                          stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>PDF Document</p>
                        <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Ready to attach</p>
                      </div>
                    </div>
                  )}

                  {/* file info + remove */}
                  <div style={{
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 12
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: 12, fontWeight: 600, color: '#334155',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {attachment.name}
                      </p>
                      <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                        {formatSize(attachment.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      style={{
                        flexShrink: 0,
                        background: '#FEE2E2', border: 'none',
                        borderRadius: 8, padding: '6px 12px',
                        fontSize: 11, fontWeight: 700,
                        color: '#B91C1C', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* ── END ATTACHMENT ── */}

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '16px', justifyContent: 'center', fontSize: 16 }}
            >
              Log Expenditure
            </button>
          </form>
        </div>

        {/* SIDEBAR STATS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* REMAINING BALANCE */}
          <div className="card" style={{
            padding: 24,
            background: stats.remaining < 0 ? '#FEF2F2' : '#F0FDF4',
            borderColor: stats.remaining < 0 ? '#FECACA' : '#DCFCE7'
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700,
              color: stats.remaining < 0 ? '#991B1B' : '#166534',
              textTransform: 'uppercase', marginBottom: 8
            }}>
              Remaining Balance
            </p>
            <h3 style={{
              fontSize: 28, fontWeight: 800,
              color: stats.remaining < 0 ? '#B91C1C' : '#065F46',
              fontFamily: 'JetBrains Mono'
            }}>
              ৳{stats.remaining.toLocaleString()}
            </h3>
          </div>

          {/* BUDGET ANALYSIS */}
          <div className="card" style={{ padding: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Budget Analysis</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--zinc-500)' }}>Approved</span>
                <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                  ৳{stats.approved.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--zinc-500)' }}>Spent + Current</span>
                <span style={{ fontWeight: 700, color: 'var(--red)', fontFamily: 'JetBrains Mono' }}>
                  ৳{stats.spent.toLocaleString()}
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={{
                  height: 8, background: '#F1F5F9',
                  borderRadius: 99, overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(pct, 100)}%`,
                    background: pct > 100 ? 'var(--red)' : 'var(--primary)',
                    borderRadius: 99
                  }} />
                </div>
                <p style={{
                  fontSize: 11, fontWeight: 600,
                  color: 'var(--zinc-500)', marginTop: 8,
                  textAlign: 'right'
                }}>
                  {pct.toFixed(1)}% utilized
                </p>
              </div>
            </div>
          </div>

          {/* ATTACHMENT HINT */}
          <div className="card" style={{ padding: 20, background: '#F8FAFC' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>
              Supported Attachments
            </p>
            {[
              { icon: '🧾', label: 'Cash Memos' },
              { icon: '📄', label: 'PDF Invoices' },
              { icon: '🖼️', label: 'Photo receipts' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span style={{ fontSize: 12, color: '#475569' }}>{label}</span>
              </div>
            ))}
            <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 10 }}>
              Files are stored with the transaction record and can be viewed from the expense history.
            </p>
          </div>

        </div>
      </div>
    </Page>
  );
};

export default AddExpense;