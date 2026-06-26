import React from 'react';
import { CheckCircle2, Clock, Printer, FileSpreadsheet, Layers } from 'lucide-react';
import Page from '../components/Page';

const Approvals = ({ db, setDb, logAction }) => {

  const handle = (id, status, name) => {
    setDb({
      ...db,
      budgetRequests: db.budgetRequests.map(r =>
        r.id === id ? { ...r, status } : r
      )
    });
    logAction(status.toUpperCase(), 'Authorization', name);
  };

  const downloadCSV = (req) => {
    let csv = 'Sector,Mode,Sub,Amount\n';
    req.allocations.forEach(a => {
      if (a.mode === 'category') {
        csv += `"${a.categoryName}",Global,N/A,"${a.amount}"\n`;
      } else {
        Object.entries(a.subAllocations).forEach(([s, v]) => {
          if (v > 0) csv += `"${a.categoryName}",Detailed,"${s}","${v}"\n`;
        });
      }
    });
    const b = new Blob([csv], { type: 'text/csv' });
    const u = URL.createObjectURL(b);
    const l = document.createElement('a');
    l.href = u;
    l.download = `Budget_${req.month}.csv`;
    l.click();
  };

  const pending = db.budgetRequests.filter(r => r.status === 'pending');

  return (
    <Page
      title="Authorizations"
      subtitle={`${pending.length} phase requests awaiting approval`}
    >

      {/* EMPTY STATE */}
      {pending.length === 0 && (
        <div className="card" style={{ padding: 80, textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64,
            background: '#D1FAE5', color: '#10B981',
            borderRadius: 99,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <CheckCircle2 size={32} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
            All Systems Clear
          </h3>
          <p style={{ color: 'var(--zinc-500)' }}>
            There are no pending budget authorizations.
          </p>
        </div>
      )}

      {/* PENDING REQUESTS */}
      {pending.map(r => (
        <div key={r.id} className="card" style={{ marginBottom: 32, overflow: 'hidden' }}>

          {/* CARD HEADER */}
          <div style={{
            padding: 32, background: '#F8FAFC',
            borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--zinc-900)', color: '#FFF',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800, fontSize: 20
              }}>
                {(r.requester || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 18 }}>{r.requester}</p>
                <p style={{
                  fontSize: 13, color: 'var(--zinc-500)',
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <Clock size={14} />
                  {new Date(r.date).toLocaleString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{
                background: '#FFF', border: '1px solid var(--border)',
                padding: '10px 20px', borderRadius: 8,
                fontWeight: 800, fontSize: 14,
                fontFamily: 'JetBrains Mono'
              }}>
                {r.month}
              </span>
              <button className="btn-ghost" onClick={() => window.print()}>
                <Printer size={16} /> Print
              </button>
              <button className="btn-ghost" onClick={() => downloadCSV(r)}>
                <FileSpreadsheet size={16} /> Export
              </button>
            </div>
          </div>

          {/* CARD BODY */}
          <div style={{ padding: 32 }}>

            {/* ALLOCATIONS LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {r.allocations.filter(a => a.amount > 0).map(a => (
                <div key={a.categoryId} className="card" style={{ overflow: 'hidden' }}>

                  {/* ALLOCATION ROW */}
                  <div style={{
                    padding: '16px 24px',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', background: '#FFF'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Layers size={16} color="var(--primary)" />
                      <span style={{ fontWeight: 700 }}>{a.categoryName}</span>
                      <span className="badge-gray" style={{ fontSize: 10 }}>{a.mode}</span>
                    </div>
                    <span style={{ fontWeight: 800, fontFamily: 'JetBrains Mono' }}>
                      ৳{a.amount.toLocaleString()}
                    </span>
                  </div>

                  {/* SUB ALLOCATIONS */}
                  {a.mode === 'detailed' && (
                    <div style={{
                      padding: '16px 24px',
                      background: '#F8FAFC',
                      borderTop: '1px solid var(--border)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 8
                    }}>
                      {Object.entries(a.subAllocations).map(([sub, val]) => (
                        <div key={sub} style={{
                          background: '#FFF', padding: '10px 14px',
                          borderRadius: 8, border: '1px solid var(--border)',
                          display: 'flex', justifyContent: 'space-between'
                        }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{sub}</span>
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            fontFamily: 'JetBrains Mono'
                          }}>
                            ৳{val.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* APPROVE / DECLINE FOOTER */}
            <div style={{
              background: 'var(--zinc-900)',
              borderRadius: 16, padding: 32,
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', color: '#FFF'
            }}>
              <div>
                <p style={{
                  fontSize: 12, fontWeight: 700,
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase', marginBottom: 8
                }}>
                  Total Authorization Amount
                </p>
                <h2 style={{
                  fontSize: 36, fontWeight: 800,
                  fontFamily: 'JetBrains Mono'
                }}>
                  ৳{r.total.toLocaleString()}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  onClick={() => handle(r.id, 'rejected', r.month)}
                  className="btn-danger"
                  style={{ border: 'none', padding: '14px 32px' }}
                >
                  Decline
                </button>
                <button
                  onClick={() => handle(r.id, 'approved', r.month)}
                  className="btn-primary"
                  style={{ background: 'var(--primary)', padding: '14px 32px' }}
                >
                  Authorise Request
                </button>
              </div>
            </div>

          </div>
        </div>
      ))}

    </Page>
  );
};

export default Approvals;