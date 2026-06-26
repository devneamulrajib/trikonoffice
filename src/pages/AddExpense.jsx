import React, { useState, useMemo } from 'react';
import Page from '../components/Page';

const AddExpense = ({ db, setDb, selectedMonth, logAction }) => {
  const [form, setForm] = useState({
    categoryId: '',
    sub: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

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
      categoryName: activeCat.name
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
  };

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

        </div>
      </div>
    </Page>
  );
};

export default AddExpense;