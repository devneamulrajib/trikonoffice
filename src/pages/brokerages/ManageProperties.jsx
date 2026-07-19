import React, { useState, useMemo } from 'react';
import {
  Search, X, Pencil, Trash2, Eye, MapPin, Home, Layers,
  Phone, Mail, MapPinned, FileText, Download, User, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import PropertyForm, { CATEGORY_OPTIONS, STATUS_OPTIONS, STATUS_STYLE } from './PropertyForm';

// ─── Small helper bits ─────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0' }}>
      <div style={{ color: 'var(--primary-dk)', marginTop: 1, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11.5, color: 'var(--text-lt)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: 'var(--zinc-900)', fontWeight: 600, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
};

const SectionHeading = ({ children }) => (
  <div style={{
    fontSize: 12, fontWeight: 700, color: 'var(--text-lt)', textTransform: 'uppercase',
    letterSpacing: '0.06em', margin: '22px 0 10px', paddingTop: 18, borderTop: '1px solid var(--border)',
  }}>
    {children}
  </div>
);

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return null;
  }
};

// ─── Property view panel (read-only) ──────────────────────────────────
const PropertyView = ({ property: p, onClose, onEdit }) => {
  const [lightbox, setLightbox] = useState(null); // index into p.images

  const isLand = p.category === 'Land / Plot';
  const isFlat = p.category === 'Flat / Apartment';
  const images = p.images || [];
  const documents = p.documents || [];

  const showLightbox = (i) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const navLightbox = (dir) => {
    setLightbox((i) => {
      const next = i + dir;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 200,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 16px',
    }} onClick={onClose}>
      <div
        className="card"
        style={{ padding: 0, maxWidth: 720, width: '100%', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / image banner */}
        <div style={{ position: 'relative' }}>
          {images.length > 0 ? (
            <div
              style={{ height: 220, width: '100%', cursor: 'pointer', overflow: 'hidden', background: 'var(--surface-2)' }}
              onClick={() => showLightbox(0)}
            >
              <img
                src={images[0].data} alt={images[0].name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div style={{
              height: 140, width: '100%', background: 'var(--surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-lt)',
            }}>
              <Home size={32} />
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(15,23,42,0.55)', color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>

          {images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 12, right: 14, background: 'rgba(15,23,42,0.6)',
              color: '#fff', fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
            }}>
              +{images.length - 1} more photo{images.length - 1 !== 1 && 's'}
            </div>
          )}
        </div>

        <div style={{ padding: '24px 28px 28px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 11.5, fontWeight: 700, color: 'var(--primary-dk)', background: 'var(--surface-2)',
                  padding: '3px 10px', borderRadius: 99,
                }}>
                  {p.category}
                </span>
                <span style={{
                  ...STATUS_STYLE[p.status], padding: '3px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700,
                }}>
                  {p.status}
                </span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--zinc-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} style={{ color: 'var(--text-lt)', flexShrink: 0 }} />
                {p.location}
              </h2>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#065F46', whiteSpace: 'nowrap' }}>
              ৳{Number(p.purchasePrice).toLocaleString()}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <img
                  key={img.id} src={img.data} alt={img.name}
                  onClick={() => showLightbox(i)}
                  style={{
                    width: 60, height: 60, objectFit: 'cover', borderRadius: 8,
                    border: '1px solid var(--border)', cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}

          {/* Category-specific details */}
          <SectionHeading>Property Details</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0 20px' }}>
            {isLand && (
              <>
                <InfoRow icon={<Layers size={16} />} label="Block" value={p.blockName} />
                <InfoRow icon={<Layers size={16} />} label="Plot Size" value={p.plotSize} />
                <InfoRow icon={<Layers size={16} />} label="Plot Serial" value={p.plotSerial} />
                <InfoRow icon={<Layers size={16} />} label="Facing" value={p.facing} />
              </>
            )}
            {isFlat && (
              <>
                <InfoRow icon={<Home size={16} />} label="Area" value={p.areaSft && `${p.areaSft} sft`} />
                <InfoRow icon={<Home size={16} />} label="Bedrooms" value={p.bedrooms} />
                <InfoRow icon={<Home size={16} />} label="Bathrooms" value={p.bathrooms} />
                <InfoRow icon={<Home size={16} />} label="Balconies" value={p.balconies} />
                <InfoRow icon={<Home size={16} />} label="Floor Level" value={p.floorLevel} />
              </>
            )}
          </div>

          {isFlat && p.amenities?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {p.amenities.map((a) => (
                <span key={a} style={{
                  fontSize: 12, fontWeight: 600, color: 'var(--primary-dk)', background: 'var(--surface-2)',
                  padding: '4px 10px', borderRadius: 99,
                }}>
                  {a}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {p.description && p.description.replace(/<[^>]*>/g, '').trim() && (
            <>
              <SectionHeading>Description</SectionHeading>
              <div
                style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: p.description }}
              />
            </>
          )}

          {/* Map */}
          {p.mapsEmbed && (
            <>
              <SectionHeading>Location Map</SectionHeading>
              <div
                style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}
                dangerouslySetInnerHTML={{ __html: p.mapsEmbed }}
              />
            </>
          )}

          {/* Owner info */}
          {(p.ownerName || p.ownerPhone || p.ownerEmail || p.ownerAddress || p.ownerPhoto) && (
            <>
              <SectionHeading>Seller / Owner Information</SectionHeading>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 6 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                  background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {p.ownerPhoto
                    ? <img src={p.ownerPhoto.data} alt={p.ownerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={20} style={{ color: 'var(--text-lt)' }} />
                  }
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--zinc-900)' }}>
                  {p.ownerName || '—'}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0 20px' }}>
                <InfoRow icon={<Phone size={16} />} label="Phone" value={p.ownerPhone} />
                <InfoRow icon={<Mail size={16} />} label="Email" value={p.ownerEmail} />
                <InfoRow icon={<MapPinned size={16} />} label="Address" value={p.ownerAddress} />
              </div>
            </>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <>
              <SectionHeading>Documents &amp; Files</SectionHeading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {documents.map((f) => (
                  <a
                    key={f.id} href={f.data} download={f.name}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                      border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)',
                      textDecoration: 'none', color: 'inherit',
                    }}
                  >
                    <FileText size={15} style={{ color: 'var(--text-lt)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-lt)', flexShrink: 0 }}>{formatSize(f.size)}</span>
                    <Download size={14} style={{ color: 'var(--text-lt)', flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            </>
          )}

          {/* Meta */}
          {(p.createdBy || p.createdAt) && (
            <div style={{
              marginTop: 22, paddingTop: 14, borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-lt)',
            }}>
              <Calendar size={13} />
              Added{p.createdBy && ` by ${p.createdBy}`}{formatDate(p.createdAt) && ` on ${formatDate(p.createdAt)}`}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="btn-primary" style={{ background: '#F9A825', color: '#111' }} onClick={onEdit}>
              <Pencil size={14} style={{ marginRight: 6 }} /> Edit Property
            </button>
            <button className="btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && images[lightbox] && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            style={{
              position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); navLightbox(-1); }}
              style={{
                position: 'absolute', left: 20, width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <img
            src={images[lightbox].data} alt={images[lightbox].name}
            style={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8 }}
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); navLightbox(1); }}
              style={{
                position: 'absolute', right: 20, width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main list page ────────────────────────────────────────────────────
const ManageProperties = ({ db, setDb, logAction, setView }) => {
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('all');
  const [catF, setCatF]       = useState('all');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const properties = db.brokerages || [];

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (statusF !== 'all' && p.status !== statusF) return false;
      if (catF !== 'all' && p.category !== catF) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${p.location} ${p.blockName || ''} ${p.plotSerial || ''} ${p.ownerName || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [properties, search, statusF, catF]);

  const handleUpdate = (data) => {
    setDb((prev) => ({
      ...prev,
      brokerages: prev.brokerages.map((p) =>
        p.id === editing.id ? { ...p, ...data, purchasePrice: Number(data.purchasePrice) || 0 } : p
      ),
    }));
    logAction(`Updated property "${data.location}"`, 'property', data.location);
    setEditing(null);
  };

  const handleDelete = (p) => {
    if (!window.confirm(`Delete property "${p.location}"?`)) return;
    setDb((prev) => ({ ...prev, brokerages: prev.brokerages.filter((x) => x.id !== p.id) }));
    logAction(`Deleted property "${p.location}"`, 'property', p.location);
  };

  const details = (p) => {
    if (p.category === 'Land / Plot') {
      return [p.blockName && `Block ${p.blockName}`, p.plotSize].filter(Boolean).join(' · ') || '—';
    }
    if (p.category === 'Flat / Apartment') {
      return [p.areaSft && `${p.areaSft} sft`, p.bedrooms && `${p.bedrooms} bed`].filter(Boolean).join(' · ') || '—';
    }
    return '—';
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--zinc-900)' }}>All Properties</h1>
          <p style={{ color: 'var(--text-lt)', fontSize: 15, marginTop: 4 }}>{filtered.length} record{filtered.length !== 1 && 's'}</p>
        </div>
        <button className="btn-primary" style={{ background: '#F9A825', color: '#111' }} onClick={() => setView('brokerages_add')}>
          + Add Property
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ display: 'flex', gap: 12, padding: '14px 18px', marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 220px', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px' }}>
          <Search size={15} style={{ color: 'var(--text-lt)' }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search location, block, serial, owner…"
            style={{ border: 'none', outline: 'none', fontSize: 13.5, width: '100%' }}
          />
          {search && <X size={14} style={{ cursor: 'pointer', color: 'var(--text-lt)' }} onClick={() => setSearch('')} />}
        </div>
        <select className="input-field" style={{ width: 'auto' }} value={catF} onChange={(e) => setCatF(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-field" style={{ width: 'auto' }} value={statusF} onChange={(e) => setStatusF(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card table-scroll" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              {['Location', 'Category', 'Details', 'Owner', 'Purchase Price (BDT)', 'Status', ''].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => setViewing(p)}>{p.location}</td>
                <td style={{ padding: '12px 16px' }}>{p.category}</td>
                <td style={{ padding: '12px 16px' }}>{details(p)}</td>
                <td style={{ padding: '12px 16px' }}>{p.ownerName || '—'}</td>
                <td style={{ padding: '12px 16px' }}>{Number(p.purchasePrice).toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    ...STATUS_STYLE[p.status], padding: '2px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 700,
                  }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: 6 }}>
                  <button className="btn-ghost" style={{ padding: 6 }} onClick={() => setViewing(p)}><Eye size={14} /></button>
                  <button className="btn-ghost" style={{ padding: 6 }} onClick={() => setEditing(p)}><Pencil size={14} /></button>
                  <button className="btn-danger" style={{ padding: 6 }} onClick={() => handleDelete(p)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--text-lt)' }}>No properties found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View panel */}
      {viewing && (
        <PropertyView
          property={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => { setEditing(viewing); setViewing(null); }}
        />
      )}

      {/* Edit modal */}
      {editing && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 200,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 16px',
        }}>
          <PropertyForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} submitLabel="Save Changes" />
        </div>
      )}
    </div>
  );
};

export default ManageProperties;