import React from 'react';
import { Upload, UserPlus, ChevronRight } from 'lucide-react';
import Page from '../../components/Page';

const HubCard = ({ icon, label, description, color, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: '#FFF',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      transition: 'all 0.15s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.borderColor = color;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'var(--border)';
    }}
  >
    <div style={{
      position: 'absolute', bottom: -8, right: -4,
      opacity: 0.04, color,
    }}>
      {React.cloneElement(icon, { size: 72 })}
    </div>

    <div style={{
      width: 48, height: 48, borderRadius: 14,
      background: `${color}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {React.cloneElement(icon, { size: 22, color })}
    </div>

    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--zinc-900)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: 'var(--zinc-500)', lineHeight: 1.5 }}>
        {description}
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color }}>
      Open <ChevronRight size={14} />
    </div>
  </button>
);

const SECTIONS = [
  {
    id: 'clients_add',
    icon: <UserPlus />,
    label: 'Add Client',
    description: 'Add a single client record manually.',
    color: '#7C3AED',
  },
  {
    id: 'clients_import',
    icon: <Upload />,
    label: 'Import Clients',
    description: 'Bulk import client records from a CSV or Excel file.',
    color: '#F59E0B',
  },
];

const ClientsHub = ({ setView }) => (
  <Page title="Clients" subtitle="Manage and import your client records">
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 20,
    }}>
      {SECTIONS.map(s => (
        <HubCard
          key={s.id}
          icon={s.icon}
          label={s.label}
          description={s.description}
          color={s.color}
          onClick={() => setView(s.id)}
        />
      ))}
    </div>
  </Page>
);

export default ClientsHub;