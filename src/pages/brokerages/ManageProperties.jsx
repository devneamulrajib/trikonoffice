import React, { useState, useMemo } from 'react';
import {
  Search, X, Pencil, Trash2, Eye, MapPin, Home, Layers, Building2,
  Phone, Mail, MapPinned, FileText, Download, User, Calendar,
  ChevronLeft, ChevronRight, LandPlot, Wallet
} from 'lucide-react';
import PropertyForm, { CATEGORY_OPTIONS, STATUS_OPTIONS, STATUS_STYLE } from './PropertyForm';
import CoverSection from './CoverSection';

// ─── Action button (View / Edit / Delete) — icon + label, color-coded ──
const ACTION_STYLE = {
  view:   { bg: 'var(--info-bg)',   color: 'var(--info)',   hoverBg: 'var(--info-hover)' },
  edit:   { bg: 'var(--edit-bg)',   color: 'var(--edit)',   hoverBg: 'var(--edit-hover)' },
  delete: { bg: 'var(--danger-bg)', color: 'var(--danger)', hoverBg: 'var(--danger-hover)' },
};

const ActionButton = ({ variant, icon, label, onClick }) => {
  const [hover, setHover] = useState(false);
  const s = ACTION_STYLE[variant];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
        borderRadius: 9, border: 'none', cursor: 'pointer',
        background: hover ? s.hoverBg : s.bg, color: s.color,
        fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap',
        transform: hover ? 'translateY(-1px)' : 'none',
        boxShadow: hover ? '0 6px 14px rgba(15,23,42,0.10)' : 'none',
        transition: 'all 0.15s ease',
      }}
    >
      {icon}
      {label}
    </button>
  );
};

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
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)', zIndex: 200,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 16px',
    }} onClick={onClose}>
      <div
        className="card"
        style={{ padding: 0, maxWidth: 760, width: '100%', overflow: 'hidden', borderRadius: 22, boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / image banner */}
        <div style={{ position: 'relative' }}>
          {images.length > 0 ? (
            <div
              style={{ height: 260, width: '100%', cursor: 'pointer', overflow: 'hidden', background: 'var(--surface-2)' }}
              onClick={() => showLightbox(0)}
            >
              <img
                src={images[0].data} alt={images[0].name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(15,23,42,0.05) 55%, rgba(15,23,42,0.55) 100%)',
              }} />
            </div>
          ) : (
            <div style={{
              height: 150, width: '100%', background: 'var(--surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-lt)',
            }}>
              <Home size={32} />
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(15,23,42,0.55)', color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(15,23,42,0.75)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(15,23,42,0.55)')}
          >
            <X size={16} />
          </button>

          {images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 14, right: 16, background: 'rgba(15,23,42,0.65)',
              color: '#fff', fontSize: 11.5, fontWeight: 600, padding: '4px 12px', borderRadius: 99,
              backdropFilter: 'blur(4px)',
            }}>
              +{images.length - 1} more photo{images.length - 1 !== 1 && 's'}
            </div>
          )}
        </div>

        <div style={{ padding: '26px 30px 30px', maxHeight: '68vh', overflowY: 'auto' }}>
          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 11.5, fontWeight: 700, color: 'var(--primary-dk)', background: 'var(--primary-soft)',
                  padding: '4px 12px', borderRadius: 99,
                }}>
                  {p.category}
                </span>
                <span style={{
                  ...STATUS_STYLE[p.status], padding: '4px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 700,
                }}>
                  {p.status}
                </span>
              </div>
              <h2 style={{ fontSize: 23, fontWeight: 800, color: 'var(--zinc-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={19} style={{ color: 'var(--primary-dk)', flexShrink: 0 }} />
                {p.location}
              </h2>
            </div>
            <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--available-fg)', whiteSpace: 'nowrap' }}>
              ৳{Number(p.purchasePrice).toLocaleString()}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <img
                  key={img.id} src={img.data} alt={img.name}
                  loading="lazy" decoding="async"
                  onClick={() => showLightbox(i)}
                  style={{
                    width: 64, height: 64, objectFit: 'cover', borderRadius: 9,
                    border: '1px solid var(--border)', cursor: 'pointer',
                    transition: 'transform 0.15s ease', boxShadow: 'var(--shadow-xs)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
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
                  fontSize: 12, fontWeight: 600, color: 'var(--primary-dk)', background: 'var(--primary-soft)',
                  padding: '5px 12px', borderRadius: 99,
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
                style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: p.description }}
              />
            </>
          )}

          {/* Map */}
          {p.mapsEmbed && (
            <>
              <SectionHeading>Location Map</SectionHeading>
              <div
                style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}
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
                  width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                  background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--surface)', boxShadow: 'var(--shadow-xs)',
                }}>
                  {p.ownerPhoto
                    ? <img src={p.ownerPhoto.data} alt={p.ownerName} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {documents.map((f) => (
                  <a
                    key={f.id} href={f.data} download={f.name}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                      border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)',
                      textDecoration: 'none', color: 'inherit', transition: 'background 0.15s ease, border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = '#D6DCE5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
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
          <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
            <button className="btn-primary" onClick={onEdit}>
              <Pencil size={14} /> Edit Property
            </button>
            <button className="btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && images[lightbox] && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            style={{
              position: 'absolute', top: 20, right: 20, width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            <X size={18} />
          </button>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); navLightbox(-1); }}
              style={{
                position: 'absolute', left: 20, width: 42, height: 42, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <img
            src={images[lightbox].data} alt={images[lightbox].name}
            style={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 10 }}
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); navLightbox(1); }}
              style={{
                position: 'absolute', right: 20, width: 42, height: 42, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Stat card for the floating cover strip ────────────────────────────
const StatCard = ({ icon, label, value, tint }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: tint.bg, color: tint.fg }}>
      {icon}
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

// ─── Main list page ────────────────────────────────────────────────────
const ManageProperties = ({ db, setDb, logAction, setView }) => {
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('all');
  const [catF, setCatF]       = useState('all');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [hoverRow, setHoverRow] = useState(null);

  const properties = db.brokerages || [];
  const cover = db.propertiesCover || null;

  const setCover = (nextCover) => {
    setDb((prev) => ({ ...prev, propertiesCover: nextCover }));
  };

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

  const stats = useMemo(() => {
    const total = properties.length;
    const available = properties.filter((p) => p.status === 'Available').length;
    const soldout = properties.filter((p) => p.status === 'Soldout').length;
    const totalValue = properties.reduce((sum, p) => sum + (Number(p.purchasePrice) || 0), 0);
    return { total, available, soldout, totalValue };
  }, [properties]);

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
      {/* ── Cover / hero banner with floating stat cards ── */}
      <CoverSection
        cover={cover}
        onChange={setCover}
        eyebrow="Internal Register"
        title="All Properties"
        subtitle="Every land and flat purchase your team has recorded, in one portfolio view."
        primaryAction={{ label: 'Add Property', icon: <LandPlot size={17} />, onClick: () => setView('brokerages_add') }}
        statsSlot={
          <>
            <StatCard icon={<Building2 size={20} />} label="Total Properties" value={stats.total} tint={{ bg: 'var(--info-bg)', fg: 'var(--info)' }} />
            <StatCard icon={<Home size={20} />} label="Available" value={stats.available} tint={{ bg: 'var(--available-bg)', fg: 'var(--available-fg)' }} />
            <StatCard icon={<Layers size={20} />} label="Sold Out" value={stats.soldout} tint={{ bg: 'var(--soldout-bg)', fg: 'var(--soldout-fg)' }} />
            <StatCard icon={<Wallet size={20} />} label="Portfolio Value (BDT)" value={`৳${stats.totalValue.toLocaleString()}`} tint={{ bg: 'var(--primary-soft)', fg: 'var(--primary-dk)' }} />
          </>
        }
      />

      {/* Spacer so the floating stat cards don't crowd the filter bar */}
      <div style={{ height: 40 }} />

      {/* Section label / record count, echoing the header removed into the cover */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <span style={{ fontSize: 13.5, color: 'var(--text-lt)', fontWeight: 600 }}>
          {filtered.length} record{filtered.length !== 1 && 's'} shown
        </span>
      </div>

      {/* Filters */}
      <div className="card" style={{ display: 'flex', gap: 14, padding: '18px 22px', marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 260px',
          border: '1.5px solid var(--border)', borderRadius: 11, padding: '11px 14px',
          transition: 'border-color 0.15s ease',
        }}>
          <Search size={16} style={{ color: 'var(--text-lt)', flexShrink: 0 }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search location, block, serial, owner…"
            style={{ border: 'none', outline: 'none', fontSize: 13.75, width: '100%', background: 'transparent', fontFamily: 'var(--font-body)' }}
          />
          {search && <X size={14} style={{ cursor: 'pointer', color: 'var(--text-lt)', flexShrink: 0 }} onClick={() => setSearch('')} />}
        </div>
        <select className="input-field" style={{ width: 'auto', cursor: 'pointer' }} value={catF} onChange={(e) => setCatF(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-field" style={{ width: 'auto', cursor: 'pointer' }} value={statusF} onChange={(e) => setStatusF(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card table-scroll" style={{ overflow: 'hidden', borderRadius: 20 }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
          <thead>
            <tr>
              {['Location', 'Category', 'Details', 'Owner', 'Purchase Price (BDT)', 'Status', 'Actions'].map((h) => (
                <th key={h} style={{
                  padding: '16px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700,
                  color: 'var(--text-lt)', textTransform: 'uppercase', letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--border)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => (
              <tr
                key={p.id}
                onMouseEnter={() => setHoverRow(p.id)}
                onMouseLeave={() => setHoverRow(null)}
                style={{
                  background: hoverRow === p.id ? 'rgba(249,168,37,0.07)' : (idx % 2 ? 'rgba(148,163,184,0.035)' : 'transparent'),
                  borderTop: '1px solid var(--border-soft)',
                  boxShadow: hoverRow === p.id ? 'inset 3px 0 0 var(--primary)' : 'inset 3px 0 0 transparent',
                }}
              >
                <td
                  style={{ padding: '18px 20px', cursor: 'pointer', fontWeight: 700, color: 'var(--zinc-900)' }}
                  onClick={() => setViewing(p)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <MapPin size={15} style={{ color: 'var(--primary-dk)', flexShrink: 0 }} />
                    {p.location}
                  </div>
                </td>
                <td style={{ padding: '18px 20px', fontSize: 13.75, color: 'var(--text)' }}>{p.category}</td>
                <td style={{ padding: '18px 20px', fontSize: 13.75, color: 'var(--text)' }}>{details(p)}</td>
                <td style={{ padding: '18px 20px', fontSize: 13.75, color: 'var(--text)' }}>{p.ownerName || '—'}</td>
                <td style={{ padding: '18px 20px', fontSize: 13.75, fontWeight: 700, color: 'var(--zinc-900)' }}>
                  {Number(p.purchasePrice).toLocaleString()}
                </td>
                <td style={{ padding: '18px 20px' }}>
                  <span style={{
                    ...STATUS_STYLE[p.status], padding: '5px 13px', borderRadius: 99, fontSize: 11.5, fontWeight: 700,
                  }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <ActionButton variant="view" icon={<Eye size={14} />} label="View" onClick={() => setViewing(p)} />
                    <ActionButton variant="edit" icon={<Pencil size={14} />} label="Edit" onClick={() => setEditing(p)} />
                    <ActionButton variant="delete" icon={<Trash2 size={14} />} label="Delete" onClick={() => handleDelete(p)} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '56px 24px', textAlign: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', background: 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
                  }}>
                    <Building2 size={24} style={{ color: 'var(--text-lt)' }} />
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--zinc-900)', fontSize: 15.5 }}>No properties found</div>
                  <div style={{ color: 'var(--text-lt)', fontSize: 13.75, marginTop: 4 }}>
                    Try adjusting your filters, or add a new property to get started.
                  </div>
                </td>
              </tr>
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
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)', zIndex: 200,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 16px',
        }}>
          <PropertyForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} submitLabel="Save Changes" />
        </div>
      )}
    </div>
  );
};

export default ManageProperties;