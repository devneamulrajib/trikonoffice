import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightLeft, Tag } from 'lucide-react';
import Page from '../components/Page';

const BudgetRequest = ({ db, setDb, logAction, user }) => {
  const [editingId, setEditingId] = useState(null);
  const [targetMonth, setTargetMonth] = useState(new Date().toISOString().slice(0, 7));
  const [alloc, setAlloc] = useState([]);
  const catRefs = useRef({});

  useEffect(() => {
    if (!editingId) {
      setAlloc(db.categories.map(c => ({
        categoryId: c.id,
        categoryName: c.name,
        mode: 'category',
        amount: 0,
        subAllocations: c.subs.reduce((a, s) => ({ ...a, [s]: 0 }), {})
      })));
    } else {
      const req = db.budgetRequests.find(r => r.id === editingId);
      if (req) {
        setTargetMonth(req.month);
        setAlloc(req.allocations);
      }
    }
  }, [db.categories, editingId, db.budgetRequests]);

  const getStats = (catId, month) => {
    const approved = db.budgetRequests
      .filter(r => r.month === month && r.status === 'approved')
      .reduce((s, r) => s + (r.allocations.find(a => a.categoryId === catId)?.amount || 0), 0);

    const spent = db.expenses
      .filter(e => Number(e.categoryId) === Number(catId) && e.date.startsWith(month))
      .reduce((s, e) => s + e.amount, 0);

    const d = new Date(month + '-01');
    d.setMonth(d.getMonth() - 1);
    const prev = d.toISOString().slice(0, 7);

    const pA = db.budgetRequests
      .filter(r => r.month === prev && r.status === 'approved')
      .reduce((s, r) => s + (r.allocations.find(a => a.categoryId === catId)?.amount || 0), 0);

    const pS = db.expenses
      .filter(e => Number(e.categoryId) === Number(catId) && e.date.startsWith(prev))
      .reduce((s, e) => s + e.amount, 0);

    return {
      approved,
      remaining: approved - spent,
      forward: Math.max(0, pA - pS)
    };
  };

  const handleSubInput = (catId, subName, val) => {
    setAlloc(prev => prev.map(c => {
      if (c.categoryId !== catId) return c;
      const n = { ...c.subAllocations, [subName]: parseFloat(val) || 0 };
      return {
        ...c,
        subAllocations: n,
        amount: Object.values(n).reduce((s, v) => s + v, 0)
      };
    }));
  };

  const handleSubmit = () => {
    const total = alloc.reduce((s, a) => s + a.amount, 0);
    if (total <= 0 && !editingId) return alert('Allocation required.');

    const fAlloc = alloc.map(a => {
      const carry = getStats(a.categoryId, targetMonth).forward;
      if (carry > 0 && !editingId)
        logAction('Carry-Forward', 'System', `৳${carry} to ${a.categoryName}`);
      return { ...a, amount: a.amount + (editingId ? 0 : carry) };
    });

    const req = {
      id: editingId || Date.now(),
      month: targetMonth,
      total: fAlloc.reduce((s, x) => s + x.amount, 0),
      allocations: fAlloc,
      status: 'pending',
      date: new Date().toISOString(),
      requester: user?.firstName || 'User'
    };

    setDb({
      ...db,
      budgetRequests: editingId
        ? db.budgetRequests.map(r => r.id === editingId ? req : r)
        : [req, ...db.budgetRequests]
    });

    setEditingId(null);
    alert('Phase request submitted.');
  };

  return (
    <Page title="Phase Planning" subtitle="Allocate capital across corporate sectors">

      {/* CATEGORY SUMMARY CARDS */}
      <div style={{
        display: 'flex', gap: 16,
        overflowX: 'auto', marginBottom: 32,
        paddingBottom: 8
      }}>
        {alloc.map(cat => {
          const st = getStats(cat.categoryId, targetMonth);
          return (
            <div
              key={cat.categoryId}
              onClick={() => catRefs.current[cat.categoryId]?.scrollIntoView({
                behavior: 'smooth', block: 'center'
              })}
              className="card"
              style={{ minWidth: 200, padding: 20, cursor: 'pointer' }}
            >
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: 'var(--zinc-500)', textTransform: 'uppercase',
                marginBottom: 12
              }}>
                {cat.categoryName}
              </p>
              <p style={{
                fontSize: 18, fontWeight: 800,
                fontFamily: 'JetBrains Mono'
              }}>
                ৳{st.approved.toLocaleString()}
              </p>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: 12, paddingTop: 12,
                borderTop: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: 11, color: 'var(--zinc-500)' }}>Balance</span>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: st.remaining < 0 ? 'var(--red)' : 'var(--primary)',
                  fontFamily: 'JetBrains Mono'
                }}>
                  ৳{st.remaining.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ALLOCATION MATRIX */}
      <div className="card" style={{ padding: 40 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 32
        }}>
          <h2 style={{ fontWeight: 800, fontSize: 20 }}>Allocation Matrix</h2>
          <input
            type="month"
            value={targetMonth}
            onChange={e => setTargetMonth(e.target.value)}
            className="input-field"
            style={{ width: 180 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {alloc.map(a => {
            const { approved, remaining, forward } = getStats(a.categoryId, targetMonth);
            return (
              <div
                key={a.categoryId}
                ref={el => catRefs.current[a.categoryId] = el}
                style={{ border: '1px solid var(--border)', borderRadius: 12 }}
              >
                {/* ROW */}
                <div style={{
                  padding: 24, background: '#FFF',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1.2fr',
                  gap: 24, alignItems: 'center'
                }}>
                  {/* NAME */}
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 16 }}>{a.categoryName}</p>
                    {forward > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        marginTop: 4, color: 'var(--primary)',
                        fontSize: 12, fontWeight: 600
                      }}>
                        <ArrowRightLeft size={12} />
                        Carry-fwd: ৳{forward.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* CURRENT */}
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: 'var(--zinc-500)', marginBottom: 4 }}>Current</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                      ৳{approved.toLocaleString()}
                    </p>
                  </div>

                  {/* BALANCE */}
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: 'var(--zinc-500)', marginBottom: 4 }}>Balance</p>
                    <p style={{
                      fontFamily: 'JetBrains Mono', fontWeight: 700,
                      color: remaining < 0 ? 'var(--red)' : 'var(--primary)'
                    }}>
                      ৳{remaining.toLocaleString()}
                    </p>
                  </div>

                  {/* MODE TOGGLE */}
                  <div style={{
                    display: 'flex', gap: 4,
                    background: '#F8FAFC',
                    padding: 4, borderRadius: 8
                  }}>
                    {['category', 'detailed'].map(m => (
                      <button
                        key={m}
                        onClick={() => setAlloc(p => p.map(x =>
                          x.categoryId === a.categoryId ? { ...x, mode: m } : x
                        ))}
                        style={{
                          flex: 1, padding: '8px',
                          border: 'none', borderRadius: 6, cursor: 'pointer',
                          fontSize: 11, fontWeight: 700,
                          background: a.mode === m ? '#FFF' : 'transparent',
                          color: a.mode === m ? 'var(--zinc-900)' : 'var(--zinc-500)',
                          boxShadow: a.mode === m ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        {m === 'category' ? 'Global' : 'Items'}
                      </button>
                    ))}
                  </div>

                  {/* AMOUNT INPUT */}
                  <div style={{ textAlign: 'right' }}>
                    {a.mode === 'category' ? (
                      <input
                        type="number"
                        className="input-field"
                        value={a.amount || ''}
                        placeholder="0"
                        onChange={e => setAlloc(p => p.map(x =>
                          x.categoryId === a.categoryId
                            ? { ...x, amount: parseFloat(e.target.value) || 0 }
                            : x
                        ))}
                        style={{
                          textAlign: 'right', fontWeight: 800,
                          fontSize: 16, fontFamily: 'JetBrains Mono'
                        }}
                      />
                    ) : (
                      <div style={{ paddingRight: 12 }}>
                        <p style={{ fontSize: 11, color: 'var(--zinc-500)' }}>Sum</p>
                        <p style={{
                          fontFamily: 'JetBrains Mono',
                          fontSize: 18, fontWeight: 800
                        }}>
                          ৳{a.amount.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* DETAILED SUB-ITEMS */}
                {a.mode === 'detailed' && (
                  <div style={{
                    padding: 24, background: '#F8FAFC',
                    borderTop: '1px solid var(--border)',
                    borderRadius: '0 0 12px 12px'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 12
                    }}>
                      {Object.keys(a.subAllocations).map(sub => (
                        <div key={sub} className="card" style={{
                          display: 'flex', alignItems: 'center',
                          gap: 12, padding: 12
                        }}>
                          <Tag size={14} color="var(--primary)" />
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{sub}</span>
                          <input
                            type="number"
                            value={a.subAllocations[sub] || ''}
                            placeholder="0"
                            onChange={e => handleSubInput(a.categoryId, sub, e.target.value)}
                            style={{
                              width: 100, background: 'transparent',
                              border: '1px solid var(--border)',
                              borderRadius: 6, padding: '6px 8px',
                              textAlign: 'right', fontWeight: 700,
                              fontFamily: 'JetBrains Mono'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER TOTAL */}
        <div style={{
          marginTop: 40, paddingTop: 32,
          borderTop: '2px solid var(--border)',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{
              fontSize: 12, color: 'var(--zinc-500)',
              fontWeight: 700, textTransform: 'uppercase', marginBottom: 8
            }}>
              Total Request
            </p>
            <h2 style={{
              fontSize: 36, fontWeight: 800,
              color: 'var(--zinc-900)', fontFamily: 'JetBrains Mono'
            }}>
              ৳{alloc.reduce((s, a) => s + a.amount, 0).toLocaleString()}
            </h2>
          </div>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            style={{ padding: '16px 40px', fontSize: 16 }}
          >
            Submit for Approval
          </button>
        </div>
      </div>

    </Page>
  );
};

export default BudgetRequest;