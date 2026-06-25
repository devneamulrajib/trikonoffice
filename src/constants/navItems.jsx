import React from 'react';
import {
  Layout, Plus, Wallet, ListFilter, ClipboardList,
  CreditCard, Layers, History, ShieldCheck,
  Settings as SettingsIcon,
  Headphones, Phone, PhoneCall, ArrowLeftRight,
  MessageSquare, FileText, BookOpen, Users, Table2, Upload
} from 'lucide-react';

// roles: which roles can see this item
// 'superadmin' = only super admin
// 'all'        = every logged-in user

const NAVITEMS = [
  // ── Core ──────────────────────────────────────────────────────────────────
  { id: 'dashboard',      icon: <Layout        size={18} />, label: 'Dashboard',       roles: 'all'         },
  { id: 'add_expense',    icon: <Plus          size={18} />, label: 'Log Transaction',  roles: 'all'         },
  { id: 'approvals',      icon: <ShieldCheck   size={18} />, label: 'Authorizations',   roles: 'superadmin', badge: true },

  // ── Finance ───────────────────────────────────────────────────────────────
  { id: 'budget_request', icon: <Wallet        size={18} />, label: 'Phase Planning',   roles: 'superadmin'  },
  { id: 'budget_history', icon: <ListFilter    size={18} />, label: 'History Ledger',   roles: 'all'         },
  { id: 'reports',        icon: <ClipboardList size={18} />, label: 'Audit Reports',    roles: 'superadmin'  },
  { id: 'salary_advance', icon: <CreditCard    size={18} />, label: 'Pay Advance',      roles: 'all'         },

  // ── System ────────────────────────────────────────────────────────────────
  { id: 'categories',     icon: <Layers        size={18} />, label: 'Sectors',          roles: 'superadmin'  },
  { id: 'activity',       icon: <History       size={18} />, label: 'Audit Trail',      roles: 'superadmin'  },
  { id: 'settings',       icon: <SettingsIcon  size={18} />, label: 'Settings',         roles: 'all'         },

  // ── Client Management ─────────────────────────────────────────────────────
  { type: 'divider', section: 'Client Management', roles: 'all' },
  {
    type:  'group',
    id:    'clients',
    icon:  <Users size={18} />,
    label: 'Clients',
    roles: 'all',
    children: [
      { id: 'clients_manage', icon: <Table2 size={16} />, label: 'Manage', roles: 'superadmin' },
      { id: 'clients_import', icon: <Upload size={16} />, label: 'Import', roles: 'superadmin' },
    ],
  },
  {
    type:  'group',
    id:    'call_center',
    icon:  <Headphones size={18} />,
    label: 'Call Center',
    roles: 'all',
    children: [
      { id: 'cc_new_call',      icon: <Phone          size={16} />, label: 'New Call',          roles: 'all' },
      { id: 'cc_follow_up',     icon: <PhoneCall      size={16} />, label: 'Follow Up',         roles: 'all' },
      { id: 'cc_transfer',      icon: <ArrowLeftRight size={16} />, label: 'Transfer Request',  roles: 'all' },
      { id: 'cc_comments',      icon: <MessageSquare  size={16} />, label: 'Comments',          roles: 'all' },
      { id: 'cc_call_logs',     icon: <BookOpen       size={16} />, label: 'Call Logs',         roles: 'all' },
      { id: 'cc_requirements',  icon: <FileText       size={16} />, label: 'Requirements',      roles: 'all' },
    ],
  },
];

export default NAVITEMS;