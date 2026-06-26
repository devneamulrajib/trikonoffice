import React, { useState } from 'react';
import Page from '../components/Page';

const SalaryAdvance = ({ db, setDb, logAction }) => {
  const [form, setForm] = useState({
    name: '',
    amt: '',
    reason: '',
    department: ''
  });

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.amt) return alert('Required fields missing.');

    const newEntry = {
      id: Date.now(),
      name: form.name,
      department: form.department,
      amount: parseFloat(form.amt),
      reason: form.reason,
      status: 'pending',
      date: new Date().toISOString()
    };

    setDb({ ...db, salaryAdvances: [newEntry, ...db.salaryAdvances] });
    logAction('Submitted', 'Salary Advance', form.name);
    setForm({ name: '', amt: '', reason: '', department: '' });
    alert('Request logged.');
  };

  const handleStatusChange = (id, status) => {
    setDb({
      ...db,
      salaryAdvances: db.salaryAdvances.map(a =>
        a.id === id ? { ...a, status } : a
      )
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this advance request?')) {
      setDb({
        ...db,
        salaryAdvances: db.salaryAdvances.filter(a => a.id !== id)
      });
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'approved') return { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' };
    if (status === 'rejected') return { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' };
    return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
  };

  return (
    <Page title="Payroll Advance" subtitle="Submit or track employee salary advances">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

        {/* FORM */}
        <div className="card" style={{ padding: 40 }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 24 }}>
            New Advance Request
          </h3>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div>
              <label style={{
                fontSize: 12, fontWeight: 600,
                display: 'block', marginBottom: 8,
                color: 'var(--zinc-500)'
              }}>
                Employee Name
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="John Doe"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label style={{
                fontSize: 12, fontWeight: 600,
                display: 'block', marginBottom: 8,
                color: 'var(--zinc-500)'
              }}>
                Department
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. Operations"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              />
            </div>

            <div>
              <label style={{
                fontSize: 12, fontWeight: 600,
                display: 'block', marginBottom: 8,
                color: 'var(--zinc-500)'
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
                  placeholder="0.00"
                  required
                  value={form.amt}
                  onChange={e => setForm({ ...form, amt: e.target.value })}
                  style={{
                    paddingLeft: 40, fontSize: 20,
                    fontWeight: 800, fontFamily: 'JetBrains Mono'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                fontSize: 12, fontWeight: 600,
                display: 'block', marginBottom: 8,
                color: 'var(--zinc-500)'
              }}>
                Justification
              </label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Reason for advance request..."
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: 14, justifyContent: 'center' }}
            >
              Submit Request
            </button>
          </form>
        </div>

        {/* REQUESTS LIST */}
        <div className="card" style={{ padding: 40 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 24
          }}>
            <h3 style={{ fontWeight: 800, fontSize: 18 }}>Active Requests</h3>
            <span style={{
              background: '#F1F5F9', color: 'var(--zinc-500)',
              padding: '4px 12px', borderRadius: 99,
              fontSize: 12, fontWeight: 700
            }}>
              {db.salaryAdvances.length} total
            </span>
          </div>

          {/* EMPTY STATE */}
          {db.salaryAdvances.length === 0 && (
            <div style={{
              padding: '60px 0', textAlign: 'center',
              color: 'var(--zinc-400)', fontSize: 14
            }}>
              No advance requests yet.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {db.salaryAdvances.map(a => {
              const st = getStatusStyle(a.status);
              return (
                <div key={a.id} className="card" style={{
                  padding: 20, background: '#F8FAFC'
                }}>

                  {/* TOP ROW */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'var(--zinc-900)', color: '#FFF',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800, fontSize: 14, flexShrink: 0
                      }}>
                        {a.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 15 }}>{a.name}</p>
                        {a.department && (
                          <p style={{ fontSize: 12, color: 'var(--zinc-500)', marginTop: 2 }}>
                            {a.department}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* STATUS BADGE */}
                    <span style={{
                      background: st.bg, color: st.color,
                      border: `1px solid ${st.border}`,
                      padding: '3px 10px', borderRadius: 99,
                      fontSize: 11, fontWeight: 700
                    }}>
                      {a.status}
                    </span>
                  </div>

                  {/* AMOUNT */}
                  <div style={{
                    fontSize: 22, fontWeight: 800,
                    fontFamily: 'JetBrains Mono',
                    marginBottom: 8
                  }}>
                    ৳{a.amount.toLocaleString()}
                  </div>

                  {/* REASON */}
                  {a.reason && (
                    <p style={{
                      fontSize: 13, color: 'var(--zinc-500)',
                      fontStyle: 'italic', marginBottom: 12
                    }}>
                      "{a.reason}"
                    </p>
                  )}

                  {/* DATE */}
                  <p style={{
                    fontSize: 11, color: 'var(--zinc-400)', marginBottom: 16
                  }}>
                    {new Date(a.date).toLocaleString()}
                  </p>

                  {/* ACTION BUTTONS */}
                  {a.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn-primary"
                        onClick={() => handleStatusChange(a.id, 'approved')}
                        style={{
                          flex: 1, justifyContent: 'center',
                          background: 'var(--primary)', fontSize: 13,
                          padding: '8px 16px'
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleStatusChange(a.id, 'rejected')}
                        style={{ flex: 1, fontSize: 13, padding: '8px 16px' }}
                      >
                        Decline
                      </button>
                      <button
                        className="btn-ghost"
                        onClick={() => handleDelete(a.id)}
                        style={{ padding: '8px 12px' }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {a.status !== 'pending' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn-ghost"
                        onClick={() => handleDelete(a.id)}
                        style={{ fontSize: 12, padding: '6px 12px' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </Page>
  );
};

export default SalaryAdvance;