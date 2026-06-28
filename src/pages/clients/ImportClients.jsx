import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, FileText, Check, AlertTriangle, X, ClipboardPaste,
  Download, ArrowRight
} from 'lucide-react';

// ─── EXPECTED COLUMNS ─────────────────────────────────────────────────────────
// name (required), Profession, Designation, Company/Org, phone, Alternative Number,
// email, type, Purpose, status, source, propertyType, budgetMin, budgetMax,
// location, address, Requirments/Land, Requirements/Flat, Requirments/Facing, Remarks
const REQUIRED_FIELDS = ['name'];
const TEMPLATE_HEADERS = [
  'name', 'Profession', 'Designation', 'Company/Org', 'phone', 'Alternative Number',
  'email', 'type', 'Purpose', 'status', 'source', 'propertyType', 'budgetMin', 'budgetMax',
  'location', 'address', 'Requirments/Land', 'Requirements/Flat', 'Requirments/Facing', 'Remarks'
];

const VALID_TYPES   = ['Buyer', 'Seller', 'Tenant', 'Landlord', 'Investor'];
const VALID_STATUS  = ['Lead', 'Contacted', 'Negotiation', 'Closed', 'Lost'];
const VALID_PURPOSE = ['Invest', 'Living', 'Rent'];

// ─── CSV PARSER (handles quoted fields, commas inside quotes) ────────────────
const parseCSV = (text) => {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') { field += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { field += char; }
    } else {
      if (char === '"') inQuotes = true;
      else if (char === ',') { row.push(field); field = ''; }
      else if (char === '\r') { /* skip */ }
      else if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += char;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
};

// ─── BUILD CLIENT OBJECTS FROM PARSED ROWS ───────────────────────────────────
const buildClients = (rows) => {
  if (rows.length === 0) return { clients: [], errors: ['File is empty.'] };

  const header = rows[0].map(h => h.trim().toLowerCase());
  const dataRows = rows.slice(1);

  const colIndex = (name) => header.indexOf(name.toLowerCase());
  const nameIdx = colIndex('name');

  if (nameIdx === -1) {
    return { clients: [], errors: ['Missing required "name" column in header row.'] };
  }

  const clients = [];
  const errors = [];

  dataRows.forEach((row, i) => {
    const lineNum = i + 2; // header is line 1
    const get = (col) => {
      const idx = colIndex(col);
      return idx !== -1 ? (row[idx] || '').trim() : '';
    };

    const name = get('name');
    if (!name) {
      errors.push(`Row ${lineNum}: missing name — skipped.`);
      return;
    }

    let type = get('type');
    if (type && !VALID_TYPES.includes(type)) {
      const match = VALID_TYPES.find(t => t.toLowerCase() === type.toLowerCase());
      type = match || 'Buyer';
    }
    if (!type) type = 'Buyer';

    let status = get('status');
    if (status && !VALID_STATUS.includes(status)) {
      const match = VALID_STATUS.find(s => s.toLowerCase() === status.toLowerCase());
      status = match || 'Lead';
    }
    if (!status) status = 'Lead';

    let purpose = get('purpose');
    if (purpose && !VALID_PURPOSE.includes(purpose)) {
      const match = VALID_PURPOSE.find(p => p.toLowerCase() === purpose.toLowerCase());
      purpose = match || '';
    }

    clients.push({
      id: Date.now() + i,
      name,
      profession: get('profession'),
      designation: get('designation'),
      company: get('company/org'),
      phone: get('phone'),
      altPhone: get('alternative number'),
      email: get('email'),
      type,
      purpose,
      status,
      source: get('source') || 'Other',
      propertyType: get('propertytype') || 'Apartment',
      budgetMin: get('budgetmin'),
      budgetMax: get('budgetmax'),
      location: get('location'),
      address: get('address'),
      reqLand: get('requirments/land'),
      reqFlat: get('requirements/flat'),
      reqFacing: get('requirments/facing'),
      notes: get('remarks') || get('notes'),
      createdAt: new Date().toISOString(),
    });
  });

  return { clients, errors };
};

// ─── DOWNLOAD TEMPLATE ────────────────────────────────────────────────────────
const downloadTemplate = () => {
  const sample = [
    TEMPLATE_HEADERS.join(','),
    'Mr. Ahmed Karim,Doctor,,,01711000000,,ahmed@example.com,Buyer,Invest,Lead,Referral,Apartment,5000000,8000000,Gulshan,"House 12, Road 5, Gulshan 1",wants 5 katha land,wants 1500 sft flat,South faced,Looking for 3-bed apartment',
    'Ms. Farah Hossain,Advisor,,,01911222333,,farah@example.com,Seller,Living,Contacted,Website,Villa,,,,,,wants 2000 sft flat,Corner plot,Wants to sell within 2 months'
  ].join('\n');

  const blob = new Blob([sample], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clients_import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ImportClients = ({ db, setDb, logAction, user }) => {
  const [mode, setMode] = useState('file'); // 'file' | 'paste'
  const [pasteText, setPasteText] = useState('');
  const [preview, setPreview] = useState(null); // { clients, errors }
  const [fileName, setFileName] = useState('');
  const [imported, setImported] = useState(false);
  const fileInputRef = useRef(null);

  // ── FILE UPLOAD ──────────────────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setImported(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = parseCSV(text);
      setPreview(buildClients(rows));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // ── PASTE ────────────────────────────────────────────────────────────────
  const handlePasteProcess = () => {
    setImported(false);
    const rows = parseCSV(pasteText);
    setPreview(buildClients(rows));
  };

  // ── COMMIT TO DB ─────────────────────────────────────────────────────────
  const handleImport = () => {
    if (!preview || preview.clients.length === 0) return;

    setDb(prev => ({
      ...prev,
      clients: [...preview.clients, ...(prev.clients || [])]
    }));

    logAction('Imported clients', 'client', `${preview.clients.length} record(s)`);
    setImported(true);
  };

  const reset = () => {
    setPreview(null);
    setPasteText('');
    setFileName('');
    setImported(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          Import Clients
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Bulk-add clients via CSV file upload or by pasting data directly
        </p>
      </div>

      {/* ── TEMPLATE DOWNLOAD ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 12, padding: '14px 18px', marginBottom: 24, flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={18} color="#6366F1" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
              Need the right format?
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Download a sample CSV with all supported columns
            </div>
          </div>
        </div>
        <button onClick={downloadTemplate} style={secondaryBtnStyle}>
          <Download size={14} /> Download Template
        </button>
      </div>

      {/* ── MODE TOGGLE ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <button
          onClick={() => { setMode('file'); reset(); }}
          style={tabStyle(mode === 'file')}
        >
          <Upload size={14} /> Upload CSV File
        </button>
        <button
          onClick={() => { setMode('paste'); reset(); }}
          style={tabStyle(mode === 'paste')}
        >
          <ClipboardPaste size={14} /> Paste Data
        </button>
      </div>

      {/* ── FILE UPLOAD ────────────────────────────────────────────────── */}
      {mode === 'file' && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border)', borderRadius: 14,
            padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
            background: 'var(--surface)', marginBottom: 20
          }}
        >
          <Upload size={28} color="var(--text-muted)" style={{ marginBottom: 10 }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            {fileName || 'Click to upload or drag & drop your CSV file'}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            .csv files only
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={e => handleFile(e.target.files?.[0])}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* ── PASTE AREA ─────────────────────────────────────────────────── */}
      {mode === 'paste' && (
        <div style={{ marginBottom: 20 }}>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder={`Paste CSV or tab-separated data here, e.g.:\nname,phone,email,type,status\nMr. Ahmed Karim,01711000000,ahmed@example.com,Buyer,Lead`}
            style={{
              width: '100%', minHeight: 160, background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 12,
              padding: 14, fontSize: 13, color: 'var(--text)',
              outline: 'none', resize: 'vertical', fontFamily: 'monospace',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              onClick={handlePasteProcess}
              disabled={!pasteText.trim()}
              style={{
                ...primaryBtnStyle,
                opacity: pasteText.trim() ? 1 : 0.5,
                cursor: pasteText.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Process Data <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── PREVIEW ────────────────────────────────────────────────────── */}
      {preview && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {preview.clients.length > 0
                ? <Check size={18} color="#22C55E" />
                : <AlertTriangle size={18} color="#F43F5E" />}
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                {preview.clients.length} client{preview.clients.length !== 1 ? 's' : ''} ready to import
              </span>
            </div>
            <button onClick={reset} style={{ ...secondaryBtnStyle, padding: '6px 12px' }}>
              <X size={14} /> Clear
            </button>
          </div>

          {/* Errors / warnings */}
          {preview.errors.length > 0 && (
            <div style={{
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 14,
              fontSize: 12, color: '#F43F5E', maxHeight: 120, overflowY: 'auto'
            }}>
              {preview.errors.map((err, i) => <div key={i}>{err}</div>)}
            </div>
          )}

          {/* Table preview */}
          {preview.clients.length > 0 && (
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {['Name', 'Profession', 'Phone', 'Email', 'Type', 'Purpose', 'Status', 'Property', 'Budget', 'Requirements'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.clients.slice(0, 8).map(c => {
                    const reqParts = [c.reqLand, c.reqFlat, c.reqFacing].filter(Boolean);
                    return (
                      <tr key={c.id}>
                        <td style={tdStyle}>{c.name}</td>
                        <td style={tdStyle}>{c.profession || '—'}</td>
                        <td style={tdStyle}>{c.phone || '—'}</td>
                        <td style={tdStyle}>{c.email || '—'}</td>
                        <td style={tdStyle}>{c.type}</td>
                        <td style={tdStyle}>{c.purpose || '—'}</td>
                        <td style={tdStyle}>{c.status}</td>
                        <td style={tdStyle}>{c.propertyType}</td>
                        <td style={tdStyle}>
                          {c.budgetMin || c.budgetMax
                            ? `${c.budgetMin || '0'} – ${c.budgetMax || '0'}`
                            : '—'}
                        </td>
                        <td style={tdStyle}>{reqParts.length ? reqParts.join(' • ') : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {preview.clients.length > 8 && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  + {preview.clients.length - 8} more row(s) not shown
                </p>
              )}
            </div>
          )}

          {/* Import action */}
          {preview.clients.length > 0 && !imported && (
            <button onClick={handleImport} style={primaryBtnStyle}>
              <Upload size={14} /> Import {preview.clients.length} Client{preview.clients.length !== 1 ? 's' : ''}
            </button>
          )}

          {imported && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              color: '#22C55E', fontSize: 13, fontWeight: 700
            }}>
              <Check size={16} /> Import complete — clients added successfully.
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const tabStyle = (active) => ({
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
  border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
  background: active ? 'rgba(99,102,241,0.1)' : 'var(--surface)',
  color: active ? 'var(--primary)' : 'var(--text-muted)',
  cursor: 'pointer'
});

const primaryBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'var(--primary)', color: '#FFF', border: 'none',
  borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700,
  cursor: 'pointer'
};

const secondaryBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'none', border: '1px solid var(--border)',
  borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700,
  color: 'var(--text)', cursor: 'pointer'
};

const thStyle = {
  textAlign: 'left', padding: '8px 10px', fontSize: 11,
  fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
  borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap'
};

const tdStyle = {
  padding: '8px 10px', color: 'var(--text)',
  borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
  maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis'
};

export default ImportClients;