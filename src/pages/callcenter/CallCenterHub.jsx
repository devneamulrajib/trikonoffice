import React from 'react';
import { Phone, PhoneCall, ArrowLeftRight, MessageSquare, BookOpen, FileText, ChevronRight } from 'lucide-react';
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
    {/* bg icon watermark */}
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
    id: 'cc_new_call',
    icon: <Phone />,
    label: 'New Call',
    description: 'Log a new inbound or outbound call and assign it to a queue.',
    color: '#10B981',
  },
  {
    id: 'cc_follow_up',
    icon: <PhoneCall />,
    label: 'Follow Up',
    description: 'Track scheduled follow-up calls and mark them complete.',
    color: '#3B82F6',
  },
  {
    id: 'cc_transfer',
    icon: <ArrowLeftRight />,
    label: 'Transfer Request',
    description: 'Submit and review requests to transfer calls between agents.',
    color: '#6366F1',
  },
  {
    id: 'cc_comments',
    icon: <MessageSquare />,
    label: 'Comments',
    description: 'Add and view comments and notes attached to call records.',
    color: '#F59E0B',
  },
  {
    id: 'cc_call_logs',
    icon: <BookOpen />,
    label: 'Call Logs',
    description: 'Full history of all calls — searchable and filterable.',
    color: '#06B6D4',
  },
  {
    id: 'cc_requirements',
    icon: <FileText />,
    label: 'Requirements',
    description: 'Manage client requirements collected during calls.',
    color: '#8B5CF6',
  },
];

const CallCenterHub = ({ setView }) => (
  <Page title="Call Center" subtitle="Manage all call center operations from one place">
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

export default CallCenterHub;