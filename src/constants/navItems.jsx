import React from 'react';
import {
  Layout, Plus, Wallet, ListFilter, ClipboardList,
  CreditCard, Layers, History, ShieldCheck,
  Settings as SettingsIcon,
  Headphones, Phone, PhoneCall, ArrowLeftRight,
  MessageSquare, FileText, BookOpen, Users, Table2, Upload
} from 'lucide-react';

// ─── HOW PERMISSIONS WORK ─────────────────────────────────────────────────────
// Each nav item has:
//   roles: 'superadmin'  → only superadmin can see it (never assignable to users)
//   roles: 'all'         → every logged-in user sees it (dashboard is always visible)
//   permKey: 'xyz'       → regular users only see it if 'xyz' is in their permissions array
//
// Dashboard has roles: 'all' and no permKey → always visible to everyone.
// All other 'all' items need a permKey so they can be hidden when not granted.

const NAVITEMS = [
  // ── Core ──────────────────────────────────────────────────────────────────
  { id: 'dashboard',      icon: <Layout        size={18} />, label: 'Dashboard',      roles: 'all'                                   },
  { id: 'add_expense',    icon: <Plus          size={18} />, label: 'Log Transaction', roles: 'all',        permKey: 'add_expense'    },
  { id: 'approvals',      icon: <ShieldCheck   size={18} />, label: 'Authorizations',  roles: 'superadmin', badge: true               },

  // ── Finance ───────────────────────────────────────────────────────────────
  { id: 'budget_request', icon: <Wallet        size={18} />, label: 'Phase Planning',  roles: 'superadmin'                            },
  { id: 'budget_history', icon: <ListFilter    size={18} />, label: 'History Ledger',  roles: 'all',        permKey: 'budget_history' },
  { id: 'reports',        icon: <ClipboardList size={18} />, label: 'Audit Reports',   roles: 'superadmin'                            },
  { id: 'salary_advance', icon: <CreditCard    size={18} />, label: 'Pay Advance',     roles: 'all',        permKey: 'salary_advance' },

  // ── System ────────────────────────────────────────────────────────────────
  { id: 'categories',     icon: <Layers        size={18} />, label: 'Sectors',         roles: 'superadmin'                            },
  { id: 'activity',       icon: <History       size={18} />, label: 'Audit Trail',     roles: 'superadmin'                            },
  { id: 'settings',       icon: <SettingsIcon  size={18} />, label: 'Settings',        roles: 'all',        permKey: 'settings'       },

  // ── Client Management ─────────────────────────────────────────────────────
  { type: 'divider', section: 'Client Management' },
  {
    type:    'group',
    id:      'clients',
    icon:    <Users size={18} />,
    label:   'Clients',
    roles:   'all',
    permKey: 'clients',
    children: [
      { id: 'clients_manage', icon: <Table2 size={16} />, label: 'Manage', roles: 'superadmin' },
      { id: 'clients_import', icon: <Upload size={16} />, label: 'Import', roles: 'superadmin' },
    ],
  },
  {
    type:    'group',
    id:      'call_center',
    icon:    <Headphones size={18} />,
    label:   'Call Center',
    roles:   'all',
    permKey: 'call_center',
    children: [
      { id: 'cc_new_call',     icon: <Phone          size={16} />, label: 'New Call',         roles: 'all', permKey: 'cc_new_call'     },
      { id: 'cc_follow_up',    icon: <PhoneCall      size={16} />, label: 'Follow Up',        roles: 'all', permKey: 'cc_follow_up'    },
      { id: 'cc_transfer',     icon: <ArrowLeftRight size={16} />, label: 'Transfer Request', roles: 'all', permKey: 'cc_transfer'     },
      { id: 'cc_comments',     icon: <MessageSquare  size={16} />, label: 'Comments',         roles: 'all', permKey: 'cc_comments'     },
      { id: 'cc_call_logs',    icon: <BookOpen       size={16} />, label: 'Call Logs',        roles: 'all', permKey: 'cc_call_logs'    },
      { id: 'cc_requirements', icon: <FileText       size={16} />, label: 'Requirements',     roles: 'all', permKey: 'cc_requirements' },
    ],
  },
];

export default NAVITEMS;