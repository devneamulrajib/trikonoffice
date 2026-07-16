import React from 'react';
import { PlusCircle, Table2 } from 'lucide-react';

const HubCard = ({ icon, title, desc, onClick }) => (
  <div
    className="card" onClick={onClick}
    style={{ padding: 24, cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'flex-start', flex: '1 1 260px' }}
  >
    <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 10, color: 'var(--primary-dk)' }}>{icon}</div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--zinc-900)' }}>{title}</div>
      <div style={{ fontSize: 13.5, color: 'var(--text-lt)', marginTop: 4 }}>{desc}</div>
    </div>
  </div>
);

const PropertyHub = ({ setView }) => (
  <div>
    <div className="page-header" style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--zinc-900)' }}>Properties</h1>
      <p style={{ color: 'var(--text-lt)', fontSize: 15, marginTop: 4 }}>Internal record of land and flats purchased.</p>
    </div>
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <HubCard icon={<PlusCircle size={22} />} title="Add Property" desc="Record a new land or flat purchase" onClick={() => setView('properties_add')} />
      <HubCard icon={<Table2 size={22} />} title="All Properties" desc="View, edit, and manage existing records" onClick={() => setView('properties_manage')} />
    </div>
  </div>
);

export default PropertyHub;