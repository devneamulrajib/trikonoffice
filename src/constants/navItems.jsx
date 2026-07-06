import React from 'react';
import {
  Layout, Plus, Wallet, ListFilter, ClipboardList,
  CreditCard, Layers, History, ShieldCheck,
  Settings as SettingsIcon,
  Headphones, Phone, PhoneCall, MapPin, ArrowLeftRight,
  BookOpen, Users, Table2, Upload, UserPlus
} from 'lucide-react';

const NAVITEMS = [
  { id: 'dashboard',      icon: <Layout        size={18} />, label: 'Dashboard',       roles: 'all', hideFor: ['call_center'] },
  { id: 'add_expense',    icon: <Plus          size={18} />, label: 'Log Transaction', roles: 'all', permKey: 'add_expense' },
  { id: 'approvals',      icon: <ShieldCheck   size={18} />, label: 'Authorizations',  roles: 'all', permKey: 'approvals', badge: true },
  { id: 'budget_request', icon: <Wallet        size={18} />, label: 'Phase Planning',  roles: 'all', permKey: 'budget_request' },
  { id: 'budget_history', icon: <ListFilter    size={18} />, label: 'History Ledger',  roles: 'all', permKey: 'budget_history' },
  { id: 'reports',        icon: <ClipboardList size={18} />, label: 'Audit Reports',   roles: 'all', permKey: 'reports' },
  { id: 'salary_advance', icon: <CreditCard    size={18} />, label: 'Pay Advance',     roles: 'all', permKey: 'salary_advance' },
  { id: 'categories',     icon: <Layers        size={18} />, label: 'Sectors',         roles: 'all', permKey: 'categories' },
  { id: 'activity',       icon: <History       size={18} />, label: 'Audit Trail',     roles: 'all', permKey: 'activity' },
  { id: 'settings',       icon: <SettingsIcon  size={18} />, label: 'Settings',        roles: 'all', permKey: 'settings' },
  { type: 'divider', section: 'Client Management' },
  {
    type:    'group',
    id:      'clients',
    icon:    <Users size={18} />,
    label:   'Add Client',
    roles:   'all',
    permKey: 'clients',
    children: [
      { id: 'clients_add',    icon: <UserPlus size={16} />, label: 'Add Client', roles: 'all', permKey: 'clients_add' },
      { id: 'clients_import', icon: <Upload size={16} />,   label: 'Import',     roles: 'all', permKey: 'clients_import' },
    ],
  },
  { id: 'clients_manage', icon: <Table2 size={18} />, label: 'All Clients', roles: 'all', permKey: 'clients_manage' },
  {
    type:    'group',
    id:      'call_center',
    icon:    <Headphones size={18} />,
    label:   'My Center',
    roles:   'all',
    permKey: 'call_center',
    defaultChild: 'cc_new_call',
    children: [
      { id: 'cc_new_call',  icon: <Phone     size={16} />, label: 'New Call',  roles: 'all', permKey: 'cc_new_call'  },
      { id: 'cc_follow_up', icon: <PhoneCall size={16} />, label: 'Follow Up', roles: 'all', permKey: 'cc_follow_up' },
      { id: 'cc_visit',     icon: <MapPin    size={16} />, label: 'Visit',     roles: 'all', permKey: 'cc_visit'     },
    ],
  },
  { id: 'cc_transfer',  icon: <ArrowLeftRight size={18} />, label: 'Client Transfer Request', roles: 'all', permKey: 'cc_transfer'  },
  { id: 'cc_call_logs', icon: <BookOpen       size={18} />, label: 'Call Logs',               roles: 'all', permKey: 'cc_call_logs' },
];

export default NAVITEMS;