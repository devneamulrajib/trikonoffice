import React from 'react';
import {
  Layout, Plus, Wallet, ListFilter, ClipboardList,
  CreditCard, Layers, History, ShieldCheck,
  Settings as SettingsIcon,
  Headphones, Phone, PhoneCall, ArrowLeftRight,
  MessageSquare, FileText, BookOpen, Users, Table2, Upload
} from 'lucide-react';

const NAVITEMS = [
  // ── Core ──────────────────────────────────────────────────────────────────
  { id: 'dashboard',      icon: <Layout      size={18} />, label: 'Dashboard'       },
  { id: 'add_expense',    icon: <Plus        size={18} />, label: 'Log Transaction'  },
  { id: 'approvals',      icon: <ShieldCheck size={18} />, label: 'Authorizations', badge: true },

  // ── Finance ───────────────────────────────────────────────────────────────
  { id: 'budget_request', icon: <Wallet      size={18} />, label: 'Phase Planning'  },
  { id: 'budget_history', icon: <ListFilter  size={18} />, label: 'History Ledger'  },
  { id: 'reports',        icon: <ClipboardList size={18} />, label: 'Audit Reports' },
  { id: 'salary_advance', icon: <CreditCard  size={18} />, label: 'Pay Advance'     },

  // ── System ────────────────────────────────────────────────────────────────
  { id: 'categories',     icon: <Layers      size={18} />, label: 'Sectors'         },
  { id: 'activity',       icon: <History     size={18} />, label: 'Audit Trail'     },
  { id: 'settings',       icon: <SettingsIcon size={18} />, label: 'Settings'       },

  // ── Client Management divider ─────────────────────────────────────────────
  { type: 'divider', section: 'Client Management' },
  // ── Clients (collapsible group) ───────────────────────────────────────────
  {
    type:  'group',
    id:    'clients',
    icon:  <Users size={18} />,
    label: 'Clients',
    children: [
      { id: 'clients_manage', icon: <Table2 size={16} />, label: 'Manage' },
      { id: 'clients_import', icon: <Upload size={16} />, label: 'Import' },
    ],
  },
  // ── Call Center (collapsible group) ───────────────────────────────────────
  {
    type:  'group',
    id:    'call_center',
    icon:  <Headphones size={18} />,
    label: 'Call Center',
    children: [
      { id: 'cc_new_call',     icon: <Phone          size={16} />, label: 'New Call'         },
      { id: 'cc_follow_up',    icon: <PhoneCall      size={16} />, label: 'Follow Up'        },
      { id: 'cc_transfer',     icon: <ArrowLeftRight size={16} />, label: 'Transfer Request' },
      { id: 'cc_comments',     icon: <MessageSquare  size={16} />, label: 'Comments'         },
      { id: 'cc_call_logs',    icon: <BookOpen       size={16} />, label: 'Call Logs'        },
      { id: 'cc_requirements', icon: <FileText       size={16} />, label: 'Requirements'     },
    ],
  },
];

export default NAVITEMS;