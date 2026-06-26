import React, { useState } from 'react';
import { Printer, Search } from 'lucide-react';
import Page from '../components/Page';

const Reports = ({ db, selectedMonth }) => {
  const [filterCat, setFilterCat] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [search, setSearch] = useState('');

  const rawData = db.expenses.filter(e => e.date.startsWith(selectedMonth));

  const filtered = rawData
    .filter(e => (!filterCat || e.categoryId === parseInt(filterCat)))
    .filter(e =>
      !search ||
      [e.categoryName, e.sub, e.note, e.date]
        .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date-desc')   return new Date(b.date) - new Date(a.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      return 0;
    });

  const total  = filtered.reduce((s, e) => s + e.amount, 0);
  const avgTxn = filtered.length ? Math.round(total / filtered.length) : 0;

  const handlePrint = () => {
    const printContent = `
      <div style="font-family: sans-serif; padding: 40px; color: #0F172A;">

        <div style="display: flex; justify-content: space-between;
          border-bottom: 2px solid #0F172A; padding-bottom: 20px; margin-bottom: 40px;">
          <div>
            <h1 style="margin: 0; font-size: 24px;">Audit Report</h1>
            <p style="margin: 5px 0; color: #64748B;">Period: ${selectedMonth}</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #10B981;">Quite Clear</h2>
            <p style="margin: 5px 0;">Generated: ${new Date().toLocaleString()}</p>
          </div>
        </div>

        <div style="margin-bottom: 40px; display: grid;
          grid-template-columns: repeat(3, 1fr); gap: 20px;">
          <div style="padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
            <b>Total Spend</b><br/>
            <span style="font-size: 24px; font-weight: 800;">
              ৳${total.toLocaleString()}
            </span>
          </div>
          <div style="padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
            <b>Transaction Count</b><br/>
            <span style="font-size: 24px; font-weight: 800;">
              ${filtered.length}
            </span>
          </div>
          <div style="padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
            <b>Avg Txn Value</b><br/>
            <span style="font-size: 24px; font-weight: 800;">
              ৳${avgTxn.toLocaleString()}
            </span>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #F8FAFC;">
              <th style="padding: 12px; text-align: left;
                border-bottom: 2px solid #E2E8F0;">Date</th>
              <th style="padding: 12px; text-align: left;
                border-bottom: 2px solid #E2E8F0;">Category</th>
              <th style="padding: 12px; text-align: left;
                border-bottom: 2px solid #E2E8F0;">Note</th>
              <th style="padding: 12px; text-align: right;
                border-bottom: 2px solid #E2E8F0;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(e => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #E2E8F0;">
                  ${e.date}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #E2E8F0;">
                  ${e.categoryName}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #E2E8F0;">
                  ${e.note || '-'}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #E2E8F0;
                  text-align: right; font-weight: bold;">
                  ৳${e.amount.toLocaleString()}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

      </div>
    `;
    const win = window.open('', '_blank');
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  return (
    <Page
      title="Audit Reports"
      subtitle="Detailed analytics of logged transactions"
      action={
        <button className="btn-primary" onClick={handlePrint}>
          <Printer size={16} /> Export PDF
        </button>
      }
    >

      {/* SUMMARY STAT CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24, marginBottom: 24
      }}>
        <div className="card" style={{ padding: 24 }}>
          <p style={{
            fontSize: 11, fontWeight: 700,
            color: 'var(--zinc-500)', textTransform: 'uppercase',
            letterSpacing: '0.05em', marginBottom: 8
          }}>
            Total Spend
          </p>
          <h3 style={{
            fontSize: 28, fontWeight: 800,
            fontFamily: 'JetBrains Mono',
            color: 'var(--zinc-900)'
          }}>
            ৳{total.toLocaleString()}
          </h3>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <p style={{
            fontSize: 11, fontWeight: 700,
            color: 'var(--zinc-500)', textTransform: 'uppercase',
            letterSpacing: '0.05em', marginBottom: 8
          }}>
            Transactions
          </p>
          <h3 style={{
            fontSize: 28, fontWeight: 800,
            fontFamily: 'JetBrains Mono',
            color: 'var(--zinc-900)'
          }}>
            {filtered.length}
          </h3>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <p style={{
            fontSize: 11, fontWeight: 700,
            color: 'var(--zinc-500)', textTransform: 'uppercase',
            letterSpacing: '0.05em', marginBottom: 8
          }}>
            Avg Transaction
          </p>
          <h3 style={{
            fontSize: 28, fontWeight: 800,
            fontFamily: 'JetBrains Mono',
            color: 'var(--zinc-900)'
          }}>
            ৳{avgTxn.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="card" style={{
        padding: 20, marginBottom: 24,
        display: 'flex', flexWrap: 'wrap',
        gap: 16, alignItems: 'center'
      }}>
        <Search size={18} color="#94A3B8" />
        <input
          className="input-field"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Search note, category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input-field"
          style={{ width: 180 }}
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="">All Sectors</option>
          {db.categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="input-field"
          style={{ width: 180 }}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="date-desc">Recent First</option>
          <option value="amount-desc">Highest Value</option>
        </select>
      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <p style={{ color: 'var(--zinc-400)', fontSize: 14 }}>
            No transactions found for the selected period or filters.
          </p>
        </div>
      )}

      {/* TRANSACTIONS TABLE */}
      {filtered.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Sector / Item</th>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>Memo</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(e => (
                <tr
                  key={e.id}
                  onMouseEnter={el => el.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={el => el.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.15s' }}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13 }}>
                      {e.date}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 700 }}>{e.categoryName}</div>
                    <div style={{ fontSize: 12, color: 'var(--zinc-500)', marginTop: 2 }}>
                      {e.sub || 'General'}
                    </div>
                  </td>
                  <td style={{
                    padding: '16px 24px',
                    color: 'var(--zinc-500)',
                    fontSize: 13, fontStyle: 'italic'
                  }}>
                    {e.note || '—'}
                  </td>
                  <td style={{
                    padding: '16px 24px', textAlign: 'right',
                    fontWeight: 800, fontFamily: 'JetBrains Mono'
                  }}>
                    ৳{e.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr style={{ background: 'var(--zinc-900)', color: '#FFF' }}>
                <td colSpan="3" style={{ padding: '20px 24px', fontWeight: 800 }}>
                  Total Period Expenditure
                </td>
                <td style={{
                  padding: '20px 24px', textAlign: 'right',
                  fontWeight: 800, fontSize: 18,
                  fontFamily: 'JetBrains Mono'
                }}>
                  ৳{total.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

    </Page>
  );
};

export default Reports;