import React from 'react';
import { Trash2 } from 'lucide-react';
import Page from '../components/Page';

const BudgetHistory = ({ db, setDb, logAction, setView }) => {
  const handleDelete = (id) => {
    if (window.confirm('Delete record?')) {
      setDb({ ...db, budgetRequests: db.budgetRequests.filter(r => r.id !== id) });
    }
  };

  return (
    <Page title="Budget Ledger" subtitle="Historical audit of allocation requests">
      <div className="card" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Period', 'Personnel', 'Status', 'Requested Total', 'Actions'].map((h, i) => (
                <th key={h} style={{
                  padding: '16px 24px',
                  textAlign: i >= 3 ? 'right' : i === 2 ? 'center' : 'left'
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {db.budgetRequests.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: '60px 24px',
                    textAlign: 'center',
                    color: 'var(--zinc-400)',
                    fontSize: 14
                  }}
                >
                  No budget requests found.
                </td>
              </tr>
            )}

            {db.budgetRequests.map(req => (
              <React.Fragment key={req.id}>

                {/* MAIN ROW */}
                <tr>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontWeight: 800, fontFamily: 'JetBrains Mono' }}>
                      {req.month}
                    </span>
                  </td>

                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'var(--surface-2)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12, fontWeight: 700
                      }}>
                        {(req.requester || 'U')[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{req.requester}</span>
                    </div>
                  </td>

                  <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                    <span className={
                      req.status === 'approved' ? 'badge-green' :
                      req.status === 'rejected' ? 'badge-red' :
                      'badge-gray'
                    }>
                      {req.status}
                    </span>
                  </td>

                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, fontFamily: 'JetBrains Mono' }}>
                      ৳{req.total.toLocaleString()}
                    </span>
                  </td>

                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button
                      className="btn-ghost"
                      style={{ padding: '6px' }}
                      onClick={() => handleDelete(req.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>

                {/* EXPANDED ALLOCATION ROW */}
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      padding: '0 24px 20px',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <div style={{
                      background: '#F8FAFC',
                      borderRadius: 12, padding: 20,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 12
                    }}>
                      {req.allocations.map(al => {
                        const spent = db.expenses
                          .filter(e =>
                            Number(e.categoryId) === Number(al.categoryId) &&
                            e.date.startsWith(req.month)
                          )
                          .reduce((s, x) => s + x.amount, 0);

                        return (
                          <div key={al.categoryId} className="card" style={{ padding: 16 }}>
                            <p style={{
                              fontSize: 11, fontWeight: 700,
                              color: 'var(--zinc-500)',
                              textTransform: 'uppercase', marginBottom: 8
                            }}>
                              {al.categoryName}
                            </p>

                            <div style={{
                              display: 'flex', justifyContent: 'space-between',
                              marginBottom: 4
                            }}>
                              <span style={{ fontSize: 12, color: 'var(--zinc-500)' }}>Phase</span>
                              <span style={{
                                fontSize: 13, fontWeight: 700,
                                fontFamily: 'JetBrains Mono'
                              }}>
                                ৳{al.amount.toLocaleString()}
                              </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 12, color: 'var(--zinc-500)' }}>Utilized</span>
                              <span style={{
                                fontSize: 13, fontWeight: 700,
                                fontFamily: 'JetBrains Mono',
                                color: al.amount - spent < 0 ? 'var(--red)' : 'var(--primary)'
                              }}>
                                ৳{(al.amount - spent).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>

              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
};

export default BudgetHistory;