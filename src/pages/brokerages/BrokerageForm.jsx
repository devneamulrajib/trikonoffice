import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link as LinkIcon, Undo2, Redo2, X, Upload
} from 'lucide-react';

export const CATEGORY_OPTIONS = ['Land / Plot', 'Flat / Apartment'];
export const BLOCK_OPTIONS     = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','P'];
export const STATUS_OPTIONS    = ['Sold', 'For Sale', 'New Listing', 'Hot Offer', 'Urgent'];

export const STATUS_STYLE = {
  'Sold':        { bg: '#F1F5F9', color: '#475569' },
  'For Sale':    { bg: '#D1FAE5', color: '#065F46' },
  'New Listing': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Hot Offer':   { bg: '#FFEDD5', color: '#C2410C' },
  'Urgent':      { bg: '#FEE2E2', color: '#991B1B' },
};

const EMPTY = {
  category:    CATEGORY_OPTIONS[0],
  location:    '',
  mapsEmbed:   '',
  blockName:   '',
  plotSize:    '',
  plotSerial:  '',
  facing:      '',
  askingPrice: '',
  status:      'For Sale',
  images:      [],
  description: '',
};

// ─── Minimal rich text editor (no external lib) ──────────────────────────
const RichTextEditor = ({ value, onChange, resetKey }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    onChange(ref.current.innerHTML);
    ref.current.focus();
  };

  const handleLink = () => {
    const url = window.prompt('Enter URL');
    if (url) exec('createLink', url);
  };

  const toolBtn = (icon, onClick, title) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 6,
        borderRadius: 6, display: 'flex', alignItems: 'center', color: '#475569',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      {icon}
    </button>
  );

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)' }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 2, padding: '6px 8px',
        borderBottom: '1px solid var(--border)', background: 'var(--surface-2)',
        borderRadius: '8px 8px 0 0',
      }}>
        {toolBtn(<Bold size={15} />, () => exec('bold'), 'Bold')}
        {toolBtn(<Italic size={15} />, () => exec('italic'), 'Italic')}
        {toolBtn(<UnderlineIcon size={15} />, () => exec('underline'), 'Underline')}
        {toolBtn(<Strikethrough size={15} />, () => exec('strikeThrough'), 'Strikethrough')}
        {toolBtn(<Heading2 size={15} />, () => exec('formatBlock', 'H2'), 'Heading 2')}
        {toolBtn(<Heading3 size={15} />, () => exec('formatBlock', 'H3'), 'Heading 3')}
        {toolBtn(<AlignLeft size={15} />, () => exec('justifyLeft'), 'Align left')}
        {toolBtn(<AlignCenter size={15} />, () => exec('justifyCenter'), 'Align center')}
        {toolBtn(<AlignRight size={15} />, () => exec('justifyRight'), 'Align right')}
        {toolBtn(<List size={15} />, () => exec('insertUnorderedList'), 'Bullet list')}
        {toolBtn(<ListOrdered size={15} />, () => exec('insertOrderedList'), 'Numbered list')}
        {toolBtn(<LinkIcon size={15} />, handleLink, 'Insert link')}
        {toolBtn(<Undo2 size={15} />, () => exec('undo'), 'Undo')}
        {toolBtn(<Redo2 size={15} />, () => exec('redo'), 'Redo')}
      </div>
      <div
        ref={ref}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        style={{
          minHeight: 120, padding: '12px 14px', fontSize: 14, color: 'var(--text)',
          outline: 'none', lineHeight: 1.6,
        }}
      />
    </div>
  );
};

// ─── Image upload (base64, drag & drop) ──────────────────────────────────
const ImageUploader = ({ images, onChange }) => {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback((fileList) => {
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        onChange((prev) => [...prev, { id: Date.now() + Math.random(), name: file.name, data: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  }, [onChange]);

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        style={{
          border: `1.5px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 10, padding: '28px 16px', textAlign: 'center', cursor: 'pointer',
          background: dragOver ? 'rgba(16,185,129,0.05)' : 'var(--surface)',
          transition: 'all 0.15s',
        }}
      >
        <Upload size={20} style={{ color: 'var(--text-lt)', marginBottom: 6 }} />
        <div style={{ fontSize: 13.5, color: 'var(--text-lt)' }}>
          Drag &amp; Drop your files or <span style={{ color: 'var(--primary-dk)', fontWeight: 600 }}>Browse</span>
        </div>
        <input
          ref={inputRef} type="file" accept="image/*" multiple hidden
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
          {images.map((img) => (
            <div key={img.id} style={{ position: 'relative', width: 84, height: 84 }}>
              <img
                src={img.data} alt={img.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
              />
              <button
                type="button"
                onClick={() => onChange((prev) => prev.filter((i) => i.id !== img.id))}
                style={{
                  position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
                  background: '#EF4444', color: '#fff', border: '2px solid #fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Field wrapper ────────────────────────────────────────────────────────
const Field = ({ label, required, hint, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
      {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
    </label>
    {children}
    {hint && <div style={{ fontSize: 12, color: 'var(--text-lt)', marginTop: 4 }}>{hint}</div>}
  </div>
);

// ─── Main form ────────────────────────────────────────────────────────────
const BrokerageForm = ({ initial, onSubmit, onCancel, submitLabel = 'Create' }) => {
  const [data, setData] = useState(initial ? { ...EMPTY, ...initial } : EMPTY);
  const set = (key) => (e) => setData((d) => ({ ...d, [key]: e.target.value }));

  const handleSubmit = (andCreateAnother = false) => {
    if (!data.category || !data.location || !data.askingPrice) {
      alert('Category, Location, and Asking Price are required.');
      return;
    }
    onSubmit(data, andCreateAnother);
    if (andCreateAnother) setData(EMPTY);
  };

  return (
    <div className="card" style={{ padding: 28, maxWidth: 640 }}>
      <Field label="Category" required>
        <select className="input-field" value={data.category} onChange={set('category')} style={{ cursor: 'pointer' }}>
          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      <Field label="Location / Area" required>
        <input
          className="input-field" value={data.location} onChange={set('location')}
          placeholder="e.g. Bashundhara R/A, Purbachol"
        />
      </Field>

      <Field label="Google Maps Embed Link" hint="Go to Google Maps → Share → Embed a map → Copy HTML">
        <textarea
          className="input-field" rows={2} value={data.mapsEmbed} onChange={set('mapsEmbed')}
          placeholder="Paste the <iframe> code here" style={{ resize: 'vertical', fontFamily: 'inherit' }}
        />
      </Field>

      <Field label="Block Name">
        <select className="input-field" value={data.blockName} onChange={set('blockName')} style={{ cursor: 'pointer' }}>
          <option value="">Select block…</option>
          {BLOCK_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </Field>

      <Field label="Plot Size">
        <input className="input-field" value={data.plotSize} onChange={set('plotSize')} placeholder="e.g. 3 Katha" />
      </Field>

      <Field label="Plot Serial">
        <input className="input-field" value={data.plotSerial} onChange={set('plotSerial')} />
      </Field>

      <Field label="Facing">
        <input className="input-field" value={data.facing} onChange={set('facing')} placeholder="e.g. South" />
      </Field>

      <Field label="Asking Price (BDT)" required>
        <input
          className="input-field" type="number" value={data.askingPrice} onChange={set('askingPrice')}
          placeholder="e.g. 9,500,000"
        />
      </Field>

      <Field label="Status">
        <select className="input-field" value={data.status} onChange={set('status')} style={{ cursor: 'pointer' }}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>

      <Field label="Images">
        <ImageUploader images={data.images} onChange={(fn) => setData((d) => ({ ...d, images: typeof fn === 'function' ? fn(d.images) : fn }))} />
      </Field>

      <Field label="Description">
        <RichTextEditor
          value={data.description}
          resetKey={initial?.id || 'new'}
          onChange={(html) => setData((d) => ({ ...d, description: html }))}
        />
      </Field>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn-primary" style={{ background: '#F9A825', color: '#111' }} onClick={() => handleSubmit(false)}>
          {submitLabel}
        </button>
        {!initial && (
          <button className="btn-ghost" onClick={() => handleSubmit(true)}>
            {submitLabel} &amp; create another
          </button>
        )}
        {onCancel && <button className="btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
};

export default BrokerageForm;