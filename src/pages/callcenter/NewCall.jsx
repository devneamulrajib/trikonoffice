import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, X, Plus, Search, ChevronLeft, ChevronRight, ChevronDown,
  MessageCircle, PhoneCall, Users, User, Calendar, Pencil, Trash2,
  Briefcase, MapPin, CheckCircle2, Filter, Gift, Home, Compass,
  LandPlot, PhoneOff, PhoneMissed, PhoneIncoming, AlertCircle,
  ArrowRight, Zap, TrendingUp, CheckCheck, CalendarClock, XCircle,
  ShieldCheck, Lock,
} from 'lucide-react';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  canvas:        '#0F172A',
  nav:           '#1E293B',
  surface:       '#FFFFFF',
  surfaceRaised: '#F8FAFC',
  surfaceSunken: '#F1F5F9',
  border:        '#E2E8F0',
  borderStrong:  '#CBD5E1',
  text:          '#0F172A',
  textMid:       '#475569',
  textMuted:     '#94A3B8',
  textInverse:   '#FFFFFF',
  accent:        '#F59E0B',
  accentDark:    '#D97706',
  accentLight:   '#FEF3C7',
  accentBorder:  '#FCD34D',
  green:    '#10B981', greenBg: '#ECFDF5', greenBorder: '#6EE7B7',
  red:      '#EF4444', redBg:   '#FEF2F2', redBorder:   '#FCA5A5',
  blue:     '#3B82F6', blueBg:  '#EFF6FF', blueBorder:  '#BFDBFE',
  yellow:   '#F59E0B', yellowBg:'#FFFBEB', yellowBorder:'#FDE68A',
  purple:   '#8B5CF6', purpleBg:'#F5F3FF', purpleBorder:'#DDD6FE',
  slate:    '#64748B', slateBg: '#F8FAFC', slateBorder: '#E2E8F0',
  r: { xs: 4, sm: 6, md: 8, lg: 12, xl: 16, full: 9999 },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.08)',
    md: '0 4px 6px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.05)',
    lg: '0 20px 60px rgba(0,0,0,.2),0 8px 20px rgba(0,0,0,.1)',
    xl: '0 32px 80px rgba(0,0,0,.28)',
  },
};

const SOURCE_ACCENT = {
  Facebook:        '#2563EB',
  'Walk-in':       '#9333EA',
  Referral:        '#16A34A',
  Website:         '#0EA5E9',
  'Call Center':   '#F59E0B',
  'Agent Network': '#EC4899',
  Other:           '#94A3B8',
};

const SOURCE_PALETTE = {
  Facebook:        { bg:'#EFF6FF', color:'#2563EB', border:'#BFDBFE' },
  'Walk-in':       { bg:'#FDF4FF', color:'#9333EA', border:'#E9D5FF' },
  Referral:        { bg:'#F0FDF4', color:'#16A34A', border:'#BBF7D0' },
  Website:         { bg:'#F0F9FF', color:'#0284C7', border:'#BAE6FD' },
  'Call Center':   { bg:'#FFFBEB', color:'#D97706', border:'#FDE68A' },
  'Agent Network': { bg:'#FDF2F8', color:'#DB2777', border:'#FBCFE8' },
  Other:           { bg:'#F8FAFC', color:'#64748B', border:'#E2E8F0' },
};

const CLIENT_TYPES   = ['Buyer','Seller','Tenant','Landlord','Investor'];
const PURPOSES       = ['Invest','Living','Rent'];
const STATUS_OPTIONS = ['Lead','Contacted','Negotiation','Closed','Lost'];
const SOURCES        = ['Referral','Walk-in','Website','Facebook','Call Center','Agent Network','Other'];
const PROPERTY_TYPES = ['Apartment','Villa','Plot/Land','Commercial','Office Space','Townhouse'];

const CALL_OUTCOMES = [
  { value:'Answered',     label:'Answered',    icon: PhoneIncoming, color: C.green,  bg: C.greenBg,  border: C.greenBorder  },
  { value:'Busy',         label:'Busy',         icon: PhoneOff,      color: C.blue,   bg: C.blueBg,   border: C.blueBorder   },
  { value:'No Answer',    label:'No Answer',    icon: PhoneMissed,   color: C.yellow, bg: C.yellowBg, border: C.yellowBorder },
  { value:'Switched Off', label:'Switched Off', icon: PhoneOff,      color: C.red,    bg: C.redBg,    border: C.redBorder    },
  { value:'Wrong Number', label:'Wrong Number', icon: AlertCircle,   color: C.slate,  bg: C.slateBg,  border: C.slateBorder  },
];

// Only the 4 lead statuses requested
const LEAD_STATUSES = [
  { value:'Interested',     color: C.green,  bg: C.greenBg  },
  { value:'Not Interested', color: C.slate,  bg: C.slateBg  },
  { value:'Followup',       color: C.purple, bg: C.purpleBg },
  { value:'Dropped',        color: C.red,    bg: C.redBg    },
];

// Only Call / WhatsApp as contact method
const CONTACT_METHODS = ['Call','WhatsApp'];

// Offer discussed options (with "Other" as a free-text option)
const OFFER_OPTIONS = [
  { value:'projects',  label:'Projects' },
  { value:'land_flat', label:'Land / Flat Plan' },
  { value:'site_visit',label:'Free Site Visit' },
  { value:'other',     label:'Other' },
];

const emptyClient = () => ({
  id: Date.now(), name:'', profession:'', designation:'', company:'',
  phone:'', altPhone:'', email:'', type:'Buyer', purpose:'', status:'Lead',
  source:'Referral', propertyType:'Apartment', budgetMin:'', budgetMax:'',
  location:'', address:'', reqLand:'', reqFlat:'', reqFacing:'', notes:'',
  calledAt: null, createdAt: new Date().toISOString(),
  // ── Ownership fields ────────────────────────────────────────────────────
  // Set on import/add. Stays null until an agent hits "Take call" — at that
  // point the client is attached to that agent and hidden from everyone
  // else's queue (Super Admin always sees everything).
  assignedAgentId: null,
  assignedAgentName: null,
  assignedAt: null,
});

const AVATAR_PALETTE = [
  ['#DBEAFE','#1E40AF'],['#DCFCE7','#15803D'],['#FEF3C7','#92400E'],
  ['#FCE7F3','#9D174D'],['#E0E7FF','#3730A3'],['#FFEDD5','#9A3412'],
  ['#CCFBF1','#0F766E'],['#FAE8FF','#7E22CE'],
];
const hashStr = s => { let h=0; for(let i=0;i<(s||'').length;i++) h=(h*31+s.charCodeAt(i))>>>0; return h; };

// ─── Primitives ───────────────────────────────────────────────────────────────
const Avatar = ({ name, size=32 }) => {
  const initials = (name||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()).join('')||'?';
  const [bg, fg] = AVATAR_PALETTE[hashStr(name) % AVATAR_PALETTE.length];
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:bg, color:fg, display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*.34, fontWeight:700, letterSpacing:'-.01em' }}>
      {initials}
    </div>
  );
};

const Tag = ({ label, color, bg, border }) => (
  <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px',
    borderRadius:C.r.full, fontSize:11, fontWeight:600,
    background:bg||C.surfaceRaised, color:color||C.textMid,
    border:`1px solid ${border||C.border}`, letterSpacing:'.01em', whiteSpace:'nowrap' }}>
    {label}
  </span>
);

const SourceTag = ({ source }) => {
  const p = SOURCE_PALETTE[source] || SOURCE_PALETTE.Other;
  return <Tag label={source} color={p.color} bg={p.bg} border={p.border}/>;
};

const FieldLabel = ({ children, required }) => (
  <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, letterSpacing:'.07em',
    textTransform:'uppercase', marginBottom:5, display:'flex', gap:3 }}>
    {children}{required && <span style={{ color:C.red }}>*</span>}
  </div>
);

const inputBase = {
  width:'100%', padding:'9px 12px', fontSize:14,
  border:`1.5px solid ${C.border}`, borderRadius:C.r.md,
  color:C.text, background:C.surface, outline:'none',
  boxSizing:'border-box', lineHeight:1.5,
  fontFamily:'inherit', transition:'border-color .12s,box-shadow .12s',
};
const onFocus = e => { e.target.style.borderColor=C.accent; e.target.style.boxShadow=`0 0 0 3px ${C.accent}22`; };
const onBlur  = e => { e.target.style.borderColor=C.border; e.target.style.boxShadow='none'; };
const focusProps = { onFocus, onBlur };

const Input    = ({ style, ...p }) => <input style={{ ...inputBase, ...style }} {...focusProps} {...p}/>;
const Select   = ({ children, style, ...p }) => (
  <div style={{ position:'relative' }}>
    <select style={{ ...inputBase, paddingRight:30, cursor:'pointer', appearance:'none', ...style }} {...focusProps} {...p}>
      {children}
    </select>
    <ChevronDown size={12} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
      color:C.textMuted, pointerEvents:'none' }}/>
  </div>
);
const Textarea = ({ style, ...p }) => (
  <textarea style={{ ...inputBase, resize:'vertical', minHeight:80, lineHeight:1.6, ...style }} {...focusProps} {...p}/>
);
const ROField  = ({ value }) => (
  <div style={{ ...inputBase, background:C.surfaceSunken, color:C.textMid, cursor:'default',
    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
    {value||'—'}
  </div>
);

const PrimaryBtn = ({ children, onClick, style, disabled, ...p }) => (
  <button onClick={onClick} disabled={disabled} style={{
    display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px',
    borderRadius:C.r.md, fontSize:13.5, fontWeight:700, cursor:disabled?'not-allowed':'pointer',
    border:'none', background:disabled?C.border:`linear-gradient(135deg,${C.accentDark},${C.accent})`,
    color:disabled?C.textMuted:'#fff',
    boxShadow:disabled?'none':`0 2px 10px ${C.accent}44`,
    transition:'opacity .15s,transform .12s', ...style,
  }}
    onMouseEnter={e=>{ if(!disabled){e.currentTarget.style.opacity='.9';e.currentTarget.style.transform='translateY(-1px)';} }}
    onMouseLeave={e=>{ e.currentTarget.style.opacity='1';e.currentTarget.style.transform='translateY(0)'; }}
    {...p}
  >
    {children}
  </button>
);

const GhostBtn = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{
    display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px',
    borderRadius:C.r.md, fontSize:13.5, fontWeight:600, cursor:'pointer',
    border:`1.5px solid ${C.border}`, background:C.surface, color:C.textMid,
    transition:'background .12s,border-color .12s', ...style,
  }}
    onMouseEnter={e=>{ e.currentTarget.style.background=C.surfaceRaised; e.currentTarget.style.borderColor=C.borderStrong; }}
    onMouseLeave={e=>{ e.currentTarget.style.background=C.surface; e.currentTarget.style.borderColor=C.border; }}
  >
    {children}
  </button>
);

const IconAction = ({ icon: Icon, onClick, title, variant='default', disabled }) => {
  const variants = {
    default: { bg:'#F1F5F9', color:'#475569' },
    danger:  { bg:'#FEF2F2', color:C.red },
    primary: { bg:`linear-gradient(135deg,${C.accentDark},${C.accent})`, color:'#fff' },
    muted:   { bg:'#F1F5F9', color:'#CBD5E1' },
  };
  const v = variants[disabled ? 'muted' : variant];
  return (
    <button onClick={disabled?undefined:onClick} title={title} disabled={disabled} style={{
      width:32, height:32, borderRadius:C.r.sm, border:'none', flexShrink:0,
      background:v.bg, color:v.color, cursor:disabled?'not-allowed':'pointer',
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      boxShadow: (variant==='primary' && !disabled) ? `0 2px 8px ${C.accent}44` : 'none',
      transition:'opacity .12s,transform .1s',
    }}
      onMouseEnter={e=>{ if(!disabled){ e.currentTarget.style.opacity='.8'; e.currentTarget.style.transform='scale(1.07)'; } }}
      onMouseLeave={e=>{ e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='scale(1)'; }}
    >
      <Icon size={14}/>
    </button>
  );
};

const Card = ({ children, style }) => (
  <div style={{ background:C.surface, border:`1px solid ${C.border}`,
    borderRadius:C.r.lg, padding:20, boxShadow:C.shadow.sm, ...style }}>
    {children}
  </div>
);

const CardHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
    <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
      <div style={{ width:32, height:32, borderRadius:C.r.sm, background:C.accentLight,
        color:C.accentDark, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={15}/>
      </div>
      <div>
        <div style={{ fontSize:13.5, fontWeight:700, color:C.text }}>{title}</div>
        {subtitle && <div style={{ fontSize:12, color:C.textMuted, marginTop:1 }}>{subtitle}</div>}
      </div>
    </div>
    {action}
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <div onClick={onChange} style={{
    width:40, height:22, borderRadius:C.r.full, cursor:'pointer', flexShrink:0,
    background:checked ? C.accent : C.border, transition:'background .18s', position:'relative',
  }}>
    <div style={{
      position:'absolute', top:2, left:checked?20:2, width:18, height:18,
      borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,.2)',
      transition:'left .18s',
    }}/>
  </div>
);

const Collapse = ({ title, icon: Icon, defaultOpen=false, summary, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border:`1px solid ${C.border}`, borderRadius:C.r.lg, overflow:'hidden' }}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'12px 16px', background:open?C.surfaceRaised:C.surface,
        border:'none', cursor:'pointer', textAlign:'left', transition:'background .12s',
      }}>
        <span style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
          {Icon && <Icon size={14} style={{ color:C.textMuted, flexShrink:0 }}/>}
          <span style={{ fontSize:13.5, fontWeight:700, color:C.text }}>{title}</span>
          {!open && summary && (
            <span style={{ fontSize:12, color:C.textMuted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{summary}</span>
          )}
        </span>
        <ChevronDown size={14} style={{ color:C.textMuted, transition:'transform .2s', transform:open?'rotate(180deg)':'none', flexShrink:0 }}/>
      </button>
      {open && <div style={{ padding:16, borderTop:`1px solid ${C.border}` }}>{children}</div>}
    </div>
  );
};

const HeaderPill = ({ children }) => (
  <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 9px', borderRadius:C.r.full,
    fontSize:11, fontWeight:600, background:'rgba(255,255,255,.18)', color:'rgba(255,255,255,.95)',
    letterSpacing:'.02em' }}>
    {children}
  </span>
);

const OutcomePicker = ({ value, onChange }) => (
  <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:7 }}>
    {CALL_OUTCOMES.map(o => {
      const active = value === o.value;
      const Icon   = o.icon;
      return (
        <button key={o.value} onClick={()=>onChange(o.value)} style={{
          padding:'10px 6px', border:`2px solid ${active?o.color:C.border}`,
          borderRadius:C.r.md, background:active?o.bg:C.surface,
          cursor:'pointer', textAlign:'center', transition:'all .13s',
          display:'flex', flexDirection:'column', alignItems:'center', gap:5,
        }}>
          <Icon size={16} color={active?o.color:C.textMuted}/>
          <span style={{ fontSize:10.5, fontWeight:active?700:500, color:active?o.color:C.textMuted, lineHeight:1.2 }}>{o.label}</span>
        </button>
      );
    })}
  </div>
);

const LeadStatusPicker = ({ value, onChange }) => (
  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
    {LEAD_STATUSES.map(s => {
      const active = value === s.value;
      return (
        <button key={s.value} onClick={()=>onChange(s.value)} style={{
          padding:'6px 13px', borderRadius:C.r.full,
          border:`1.5px solid ${active?s.color:C.border}`,
          background:active?s.bg:C.surface,
          color:active?s.color:C.textMid, fontSize:12.5,
          fontWeight:active?700:500, cursor:'pointer', transition:'all .13s',
        }}>
          {s.value}
        </button>
      );
    })}
  </div>
);

const MethodPicker = ({ value, onChange }) => (
  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
    {CONTACT_METHODS.map(m => {
      const active = value === m;
      return (
        <button key={m} onClick={()=>onChange(m)} style={{
          padding:'6px 13px', borderRadius:C.r.full,
          border:`1.5px solid ${active?C.accent:C.border}`,
          background:active?C.accentLight:C.surface,
          color:active?C.accentDark:C.textMid, fontSize:12.5,
          fontWeight:active?700:500, cursor:'pointer', transition:'all .13s',
        }}>
          {m}
        </button>
      );
    })}
  </div>
);

const Grid = ({ cols='1fr 1fr', gap=13, children, style }) => (
  <div style={{ display:'grid', gridTemplateColumns:cols, gap, ...style }}>{children}</div>
);

// ─── Dashboard Stat Box ───────────────────────────────────────────────────────
const StatBox = ({ icon: Icon, label, value, color, bg, border, active, onClick, dot, sublabel }) => {
  const [hov, setHov] = useState(false);
  const isClickable = Boolean(onClick);
  return (
    <button
      onClick={onClick}
      onMouseEnter={()=>isClickable&&setHov(true)}
      onMouseLeave={()=>isClickable&&setHov(false)}
      style={{
        display:'flex', flexDirection:'column', alignItems:'flex-start', gap:2,
        padding:'13px 16px',
        background: active ? bg : hov ? bg : C.surface,
        border:`1.5px solid ${active ? color : hov ? border : C.border}`,
        borderRadius:C.r.lg,
        cursor:isClickable?'pointer':'default',
        textAlign:'left',
        transition:'all .15s',
        boxShadow: active ? `0 2px 12px ${color}22` : hov ? `0 1px 6px ${color}18` : C.shadow.sm,
        flex:1,
        minWidth:0,
      }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:7, width:'100%', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {dot && (
            <span style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0, display:'block' }}/>
          )}
          {Icon && !dot && (
            <div style={{ width:28, height:28, borderRadius:C.r.sm, background:bg||C.surfaceRaised,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon size={13} color={color||C.textMuted}/>
            </div>
          )}
          <span style={{ fontSize:11, fontWeight:700, color: active ? color : C.textMuted,
            textTransform:'uppercase', letterSpacing:'.06em', whiteSpace:'nowrap' }}>
            {label}
          </span>
        </div>
        {active && (
          <span style={{ width:6, height:6, borderRadius:'50%', background:color, flexShrink:0 }}/>
        )}
      </div>
      <div style={{ fontSize:22, fontWeight:800, color: active ? color : C.text, lineHeight:1, marginTop:4 }}>
        {value}
      </div>
      {sublabel && (
        <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>{sublabel}</div>
      )}
    </button>
  );
};

// ─── Client Form Modal ────────────────────────────────────────────────────────
const ClientFormModal = ({ onClose, onSave, client }) => {
  const isEdit = Boolean(client);
  const [form, setForm]   = useState({ ...emptyClient(), ...(client||{}) });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(p=>({...p,[k]:v})); if(errors[k]) setErrors(p=>({...p,[k]:false})); };

  const handleSubmit = () => {
    const e={};
    if (!form.name?.trim()) e.name=true;
    if (!form.phone?.trim()) e.phone=true;
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(isEdit ? {...client,...form} : {...form, id:Date.now(), calledAt:null, createdAt:new Date().toISOString()});
    onClose();
  };

  const errField = { borderColor:C.red, boxShadow:`0 0 0 3px ${C.red}18` };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{ position:'fixed', inset:0, background:'rgba(2,6,23,.7)', backdropFilter:'blur(6px)',
        display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100, padding:20 }}
      onClick={onClose}>
      <motion.div initial={{opacity:0,y:20,scale:.97}} animate={{opacity:1,y:0,scale:1}}
        exit={{opacity:0,y:14,scale:.97}} transition={{duration:.2,ease:[.16,1,.3,1]}}
        onClick={e=>e.stopPropagation()}
        style={{ background:C.surface, borderRadius:C.r.xl, width:'100%', maxWidth:680,
          maxHeight:'90vh', overflowY:'auto', boxShadow:C.shadow.xl }}>

        <div style={{ padding:'20px 24px', background:`linear-gradient(135deg,${C.accentDark},${C.accent})`,
          borderRadius:`${C.r.xl}px ${C.r.xl}px 0 0`, position:'sticky', top:0, zIndex:10,
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:11 }}>
            <div style={{ width:36, height:36, borderRadius:C.r.md, background:'rgba(255,255,255,.2)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              {isEdit ? <Pencil size={16} color="#fff"/> : <Users size={17} color="#fff"/>}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{isEdit?'Edit Client':'Add New Client'}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.72)', marginTop:1 }}>
                {isEdit?'Update the client record':'All fields except phone & name are optional'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:C.r.sm, border:'none',
            background:'rgba(255,255,255,.15)', color:'#fff', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={15}/>
          </button>
        </div>

        <div style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:14 }}>
          <Card>
            <CardHeader icon={Briefcase} title="Basic info" subtitle="Identity and professional background"/>
            <Grid>
              <div style={{ gridColumn:'1/-1' }}>
                <FieldLabel required>Full name</FieldLabel>
                <Input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Mr. Ahmed Karim"
                  style={errors.name?errField:{}}/>
                {errors.name && <div style={{ fontSize:11, color:C.red, marginTop:4 }}>Name is required</div>}
              </div>
              <div>
                <FieldLabel>Profession</FieldLabel>
                <Input value={form.profession} onChange={e=>set('profession',e.target.value)} placeholder="Doctor, Engineer…"/>
              </div>
              <div>
                <FieldLabel>Designation</FieldLabel>
                <Input value={form.designation} onChange={e=>set('designation',e.target.value)} placeholder="Senior Manager"/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <FieldLabel>Company / Organization</FieldLabel>
                <Input value={form.company} onChange={e=>set('company',e.target.value)} placeholder="ABC Ltd."/>
              </div>
            </Grid>
          </Card>

          <Card>
            <CardHeader icon={Phone} title="Contact info" subtitle="Phone is required; email and alt number are optional"/>
            <Grid>
              <div>
                <FieldLabel required>Phone</FieldLabel>
                <Input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="01XXXXXXXXX"
                  style={errors.phone?errField:{}}/>
                {errors.phone && <div style={{ fontSize:11, color:C.red, marginTop:4 }}>Phone is required</div>}
              </div>
              <div>
                <FieldLabel>Alternative number</FieldLabel>
                <Input value={form.altPhone} onChange={e=>set('altPhone',e.target.value)} placeholder="01XXXXXXXXX"/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <FieldLabel>Email</FieldLabel>
                <Input value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@example.com"/>
              </div>
            </Grid>
          </Card>

          <Card>
            <CardHeader icon={MapPin} title="Deal info" subtitle="Type, source, property and budget"/>
            <Grid>
              <div>
                <FieldLabel>Client type</FieldLabel>
                <Select value={form.type} onChange={e=>set('type',e.target.value)}>
                  {CLIENT_TYPES.map(o=><option key={o}>{o}</option>)}
                </Select>
              </div>
              <div>
                <FieldLabel>Purpose</FieldLabel>
                <Select value={form.purpose} onChange={e=>set('purpose',e.target.value)}>
                  <option value="">— Not specified —</option>
                  {PURPOSES.map(o=><option key={o}>{o}</option>)}
                </Select>
              </div>
              <div>
                <FieldLabel>Status</FieldLabel>
                <Select value={form.status} onChange={e=>set('status',e.target.value)}>
                  {STATUS_OPTIONS.map(o=><option key={o}>{o}</option>)}
                </Select>
              </div>
              <div>
                <FieldLabel>Source</FieldLabel>
                <Select value={form.source} onChange={e=>set('source',e.target.value)}>
                  {SOURCES.map(o=><option key={o}>{o}</option>)}
                </Select>
              </div>
              <div>
                <FieldLabel>Property type</FieldLabel>
                <Select value={form.propertyType} onChange={e=>set('propertyType',e.target.value)}>
                  {PROPERTY_TYPES.map(o=><option key={o}>{o}</option>)}
                </Select>
              </div>
              <div>
                <FieldLabel>Preferred location</FieldLabel>
                <Input value={form.location} onChange={e=>set('location',e.target.value)} placeholder="Gulshan, Dhaka"/>
              </div>
              <div>
                <FieldLabel>Budget min (BDT)</FieldLabel>
                <Input type="number" value={form.budgetMin} onChange={e=>set('budgetMin',e.target.value)} placeholder="0"/>
              </div>
              <div>
                <FieldLabel>Budget max (BDT)</FieldLabel>
                <Input type="number" value={form.budgetMax} onChange={e=>set('budgetMax',e.target.value)} placeholder="0"/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <FieldLabel>Address</FieldLabel>
                <Input value={form.address} onChange={e=>set('address',e.target.value)} placeholder="Full address"/>
              </div>
            </Grid>
          </Card>

          <Card style={{ background:C.surfaceRaised }}>
            <CardHeader icon={LandPlot} title="Requirements" subtitle="What the client is specifically looking for"/>
            <Grid>
              <div>
                <FieldLabel>Land requirement</FieldLabel>
                <Input value={form.reqLand} onChange={e=>set('reqLand',e.target.value)} placeholder="e.g. 5 katha land"/>
              </div>
              <div>
                <FieldLabel>Flat requirement</FieldLabel>
                <Input value={form.reqFlat} onChange={e=>set('reqFlat',e.target.value)} placeholder="e.g. 1500 sft flat"/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <FieldLabel>Facing preference</FieldLabel>
                <Input value={form.reqFacing} onChange={e=>set('reqFacing',e.target.value)} placeholder="South faced, Corner plot…"/>
              </div>
            </Grid>
          </Card>

          <Card>
            <CardHeader icon={MessageCircle} title="Remarks" subtitle="Anything else worth noting"/>
            <Textarea value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Additional notes about this client…"/>
          </Card>
        </div>

        <div style={{ padding:'14px 24px', borderTop:`1px solid ${C.border}`, background:C.surfaceRaised,
          borderRadius:`0 0 ${C.r.xl}px ${C.r.xl}px`, position:'sticky', bottom:0,
          display:'flex', justifyContent:'flex-end', gap:10 }}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn onClick={handleSubmit}>{isEdit?'Save changes':'Add client'}</PrimaryBtn>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({ client, onCancel, onConfirm }) => (
  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
    style={{ position:'fixed', inset:0, background:'rgba(2,6,23,.7)', backdropFilter:'blur(6px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:1200, padding:20 }}
    onClick={onCancel}>
    <motion.div initial={{opacity:0,y:14,scale:.97}} animate={{opacity:1,y:0,scale:1}}
      exit={{opacity:0,y:10,scale:.97}} transition={{duration:.18,ease:[.16,1,.3,1]}}
      onClick={e=>e.stopPropagation()}
      style={{ background:C.surface, borderRadius:C.r.xl, width:'100%', maxWidth:400,
        boxShadow:C.shadow.xl, overflow:'hidden' }}>
      <div style={{ padding:'28px 24px 22px', textAlign:'center' }}>
        <div style={{ width:52, height:52, borderRadius:'50%', background:C.redBg,
          display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
          <Trash2 size={22} color={C.red}/>
        </div>
        <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:8 }}>Remove this client?</div>
        <div style={{ fontSize:13.5, color:C.textMid, lineHeight:1.5 }}>
          <strong>{client?.name}</strong> will be permanently deleted. This cannot be undone.
        </div>
      </div>
      <div style={{ display:'flex', gap:10, padding:'14px 24px', borderTop:`1px solid ${C.border}`, background:C.surfaceRaised }}>
        <GhostBtn onClick={onCancel} style={{ flex:1, justifyContent:'center' }}>Cancel</GhostBtn>
        <button onClick={onConfirm} style={{ flex:1, padding:'9px 0', borderRadius:C.r.md,
          fontSize:13.5, fontWeight:700, border:'none', background:C.red, color:'#fff', cursor:'pointer',
          boxShadow:`0 2px 8px ${C.red}44`, transition:'opacity .12s' }}
          onMouseEnter={e=>e.currentTarget.style.opacity='.85'}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
          Delete
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Take Call Modal ──────────────────────────────────────────────────────────
const TakeCallModal = ({ lead, onChange, onClose, onSubmit, user }) => {
  const [fuOn, setFuOn] = useState(Boolean(lead.followupDate));
  const toggleFu = () => { const n=!fuOn; setFuOn(n); if(!n) onChange('followupDate',''); };
  const reqSummary = [lead.reqLand,lead.reqFlat,lead.reqFacing].filter(Boolean).join(' · ');
  const telLink = lead.phone ? `tel:${lead.phone}` : null;
  const waLink  = lead.phone ? `https://wa.me/${String(lead.phone).replace(/[^0-9]/g,'')}` : null;
  const ready   = Boolean(lead.coStatus);

  // Auto-enable the follow-up scheduler when lead status is set to "Followup"
  useEffect(() => {
    if (lead.callStatus === 'Followup' && !fuOn) setFuOn(true);
  }, [lead.callStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{ position:'fixed', inset:0, background:'rgba(2,6,23,.72)', backdropFilter:'blur(6px)',
        display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
      onClick={onClose}>
      <motion.div initial={{opacity:0,y:22,scale:.97}} animate={{opacity:1,y:0,scale:1}}
        exit={{opacity:0,y:14,scale:.97}} transition={{duration:.22,ease:[.16,1,.3,1]}}
        onClick={e=>e.stopPropagation()}
        style={{ background:C.surface, borderRadius:C.r.xl, width:'100%', maxWidth:820,
          maxHeight:'93vh', overflowY:'auto', boxShadow:C.shadow.xl }}>

        <div style={{ padding:'20px 24px', background:`linear-gradient(135deg,${C.accentDark},${C.accent})`,
          borderRadius:`${C.r.xl}px ${C.r.xl}px 0 0`, position:'sticky', top:0, zIndex:10,
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Avatar name={lead.name} size={42}/>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:'#fff', letterSpacing:'-.01em' }}>{lead.name}</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:5 }}>
                {lead.propertyType && <HeaderPill>{lead.propertyType}</HeaderPill>}
                {lead.source       && <HeaderPill>{lead.source}</HeaderPill>}
                {lead.purpose      && <HeaderPill>{lead.purpose}</HeaderPill>}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:C.r.sm, border:'none',
            background:'rgba(255,255,255,.15)', color:'#fff', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={15}/>
          </button>
        </div>

        <div style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {telLink && (
              <a href={telLink} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px',
                borderRadius:C.r.md, fontSize:13.5, fontWeight:700, textDecoration:'none',
                background:`linear-gradient(135deg,${C.accentDark},${C.accent})`,
                color:'#fff', boxShadow:`0 2px 10px ${C.accent}44` }}>
                <PhoneCall size={15}/> Call {lead.phone}
              </a>
            )}
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px',
                  borderRadius:C.r.md, fontSize:13.5, fontWeight:700, textDecoration:'none',
                  background:'#F0FDF4', color:'#16A34A', border:'1.5px solid #BBF7D0' }}>
                <MessageCircle size={15}/> WhatsApp
              </a>
            )}
          </div>

          <Collapse title="Client details" icon={User}
            summary={[lead.phone,lead.email].filter(Boolean).join(' · ')}>
            <Grid cols="repeat(3,1fr)">
              {[
                {label:'Phone',      value:lead.phone},
                {label:'Alt. number',value:lead.altPhone},
                {label:'Email',      value:lead.email},
                {label:'Address',    value:lead.address},
                {label:'Profession', value:lead.profession},
                {label:'Company',    value:lead.company},
                {label:'Budget',     value:(lead.budgetMin||lead.budgetMax)?`${lead.budgetMin||'0'} – ${lead.budgetMax||'0'}`:undefined},
                {label:'Location',   value:lead.location},
              ].map(f=>(
                <div key={f.label}>
                  <FieldLabel>{f.label}</FieldLabel>
                  <ROField value={f.value}/>
                </div>
              ))}
            </Grid>
            {reqSummary && <div style={{ marginTop:14 }}><FieldLabel>Requirements</FieldLabel><ROField value={reqSummary}/></div>}
          </Collapse>

          <Grid cols="1fr 1fr" gap={16}>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <Card>
                <CardHeader icon={PhoneCall} title="Call outcome" subtitle="What happened when you called"/>
                <div style={{ marginBottom:14 }}>
                  <OutcomePicker value={lead.coStatus||''} onChange={v=>onChange('coStatus',v)}/>
                </div>
                <div style={{ marginBottom:14 }}>
                  <FieldLabel>Method used</FieldLabel>
                  <MethodPicker value={lead.coMethod||'Call'} onChange={v=>onChange('coMethod',v)}/>
                </div>
                <FieldLabel>Notes from this call</FieldLabel>
                <Textarea value={lead.coComment||''} onChange={e=>onChange('coComment',e.target.value)}
                  placeholder="What was discussed, client's reaction, key details…"/>
              </Card>

              <Card>
                <CardHeader icon={Gift} title="Offer discussed" subtitle={`Property: ${lead.propertyType||'—'}`}/>
                <Select value={lead.offers||''} onChange={e=>{
                  const v = e.target.value;
                  onChange('offers', v);
                  if (v !== 'other') onChange('offersOther','');
                }}>
                  <option value="">None selected</option>
                  {OFFER_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
                {lead.offers === 'other' && (
                  <div style={{ marginTop:10 }}>
                    <FieldLabel>Specify offer</FieldLabel>
                    <Input value={lead.offersOther||''} onChange={e=>onChange('offersOther',e.target.value)}
                      placeholder="Describe the offer discussed…"/>
                  </div>
                )}
              </Card>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <Card>
                <CardHeader icon={CheckCircle2} title="Lead status" subtitle="Update after this call"/>
                <LeadStatusPicker value={lead.callStatus||''} onChange={v=>onChange('callStatus',v)}/>
              </Card>

              <Card style={{ background:fuOn?'#FFFDF7':C.surface }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:fuOn?16:0 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:C.r.sm,
                      background:fuOn?C.accentLight:C.surfaceSunken,
                      color:fuOn?C.accentDark:C.textMuted,
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Calendar size={15}/>
                    </div>
                    <div>
                      <div style={{ fontSize:13.5, fontWeight:700, color:C.text }}>Schedule follow-up</div>
                      <div style={{ fontSize:12, color:C.textMuted, marginTop:1 }}>Adds to the Follow Up list on submit</div>
                    </div>
                  </div>
                  <Toggle checked={fuOn} onChange={toggleFu}/>
                </div>
                <AnimatePresence>
                  {fuOn && (
                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}}
                      exit={{opacity:0,height:0}} style={{overflow:'hidden'}}>
                      <Grid>
                        <div>
                          <FieldLabel>Date</FieldLabel>
                          <Input type="date" value={lead.followupDate||''} onChange={e=>onChange('followupDate',e.target.value)}/>
                        </div>
                        <div>
                          <FieldLabel>Type</FieldLabel>
                          <Select value={lead.followupType||'Regular'} onChange={e=>onChange('followupType',e.target.value)}>
                            <option>Regular</option><option>Priority</option><option>Site Visit</option>
                          </Select>
                        </div>
                      </Grid>
                      <div style={{ marginTop:12 }}>
                        <FieldLabel>Follow-up note</FieldLabel>
                        <Textarea value={lead.followupNote||''} onChange={e=>onChange('followupNote',e.target.value)}
                          placeholder="What to discuss on the next call…" style={{ minHeight:64 }}/>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!fuOn && (
                  <div style={{ fontSize:12, color:C.textMuted, fontStyle:'italic' }}>
                    Toggle on to set a date and keep this client on your radar.
                  </div>
                )}
              </Card>

              <Collapse title="More options" icon={Filter} summary="Visit scheduling — coming soon">
                <div style={{ fontSize:13, color:C.textMuted }}>Visit scheduling isn't available yet.</div>
              </Collapse>
            </div>
          </Grid>
        </div>

        <div style={{ padding:'14px 24px', borderTop:`1px solid ${C.border}`, background:C.surfaceRaised,
          borderRadius:`0 0 ${C.r.xl}px ${C.r.xl}px`, position:'sticky', bottom:0, zIndex:10,
          display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
          <div style={{ fontSize:13, color:ready?C.green:C.textMuted, display:'flex', alignItems:'center', gap:6 }}>
            {ready
              ? <><CheckCircle2 size={14} color={C.green}/> Ready — logging as <strong>{lead.coStatus}</strong></>
              : <>Pick a call outcome to continue</>
            }
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <GhostBtn onClick={onClose}>Close</GhostBtn>
            <PrimaryBtn onClick={onSubmit}>
              {fuOn ? 'Log call & schedule follow-up' : 'Log call'}
              <ArrowRight size={14}/>
            </PrimaryBtn>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Pagination button ────────────────────────────────────────────────────────
const PageBtn = ({ active, disabled, onClick, children }) => (
  <button onClick={onClick} disabled={disabled} style={{
    minWidth:32, height:30, padding:'0 9px', borderRadius:C.r.sm,
    border: active?'none':`1.5px solid ${C.border}`,
    background: active ? `linear-gradient(135deg,${C.accentDark},${C.accent})` : C.surface,
    color: active?'#fff':disabled?C.textMuted:C.text,
    fontSize:12.5, fontWeight:600, cursor:disabled?'not-allowed':'pointer',
    opacity:disabled?.5:1, display:'flex', alignItems:'center', justifyContent:'center', gap:2,
    boxShadow:active?`0 2px 6px ${C.accent}44`:'none', transition:'all .13s',
  }}>{children}</button>
);

// ─── Divider with label ───────────────────────────────────────────────────────
const DividerLabel = ({ children }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, margin:'4px 0 2px' }}>
    <div style={{ flex:1, height:1, background:C.border }}/>
    <span style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:'uppercase', letterSpacing:'.08em', whiteSpace:'nowrap' }}>
      {children}
    </span>
    <div style={{ flex:1, height:1, background:C.border }}/>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const NewCall = ({ db, setDb, logAction, user }) => {
  const [search,       setSearch]       = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);
  const [activeLead,   setActiveLead]   = useState(null);
  const [showAdd,      setShowAdd]      = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [hoveredRow,   setHoveredRow]   = useState(null);

  const allClients = db?.clients  || [];
  const callLogs   = db?.callLogs  || [];
  const followUps  = db?.followUps || [];

  // ── Ownership / visibility scoping ─────────────────────────────────────────
  const isSuperAdmin = user?.role === 'superadmin';
  const myAgentId     = user?.id;
  const myAgentName   = user?.name || 'Agent';
  const isUnassigned  = c => c.assignedAgentId === null || c.assignedAgentId === undefined;
  const isMine        = c => c.assignedAgentId === myAgentId;

  // Clients this user is allowed to see at all. Super Admin sees everyone's.
  // Everyone else sees unclaimed clients (so they can take them) plus their
  // own already-claimed clients — never another agent's.
  const visibleClients = useMemo(() => {
    if (isSuperAdmin) return allClients;
    return allClients.filter(c => isUnassigned(c) || isMine(c));
  }, [allClients, isSuperAdmin, myAgentId]);

  // Queue = not yet called, scoped to what this user can see
  const queue = useMemo(() => visibleClients.filter(c => !c.calledAt), [visibleClients]);

  // "My book" — clients actually attached to this agent (used for the
  // Closed / Dropped tallies so each agent's numbers reflect only clients
  // they personally took, not the whole shared pool).
  const myClients = useMemo(() => {
    if (isSuperAdmin) return allClients;
    return allClients.filter(isMine);
  }, [allClients, isSuperAdmin, myAgentId]);

  const myCallLogs  = useMemo(() => isSuperAdmin ? callLogs  : callLogs.filter(l => l.agentId === myAgentId),  [callLogs, isSuperAdmin, myAgentId]);
  const myFollowUps = useMemo(() => isSuperAdmin ? followUps : followUps.filter(f => f.agentId === myAgentId), [followUps, isSuperAdmin, myAgentId]);

  // ── Dashboard metrics ──────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    // Calls logged (scoped to this agent, or everyone for Super Admin)
    const callsLogged = myCallLogs.length;

    // Follow-ups sent/scheduled (scoped)
    const followupsSent = myFollowUps.length;

    // Closed leads: clients with status 'Closed' from this agent's own book
    const closedLeads = myClients.filter(c => c.status === 'Closed').length;

    // Dropped / Lost — same scoping
    const droppedLeads = myClients.filter(c => c.status === 'Lost').length;

    // By source — count in the visible queue (uncalled)
    const bySource = {};
    queue.forEach(c => { const s = c.source || 'Other'; bySource[s] = (bySource[s]||0)+1; });

    return { total: queue.length, callsLogged, followupsSent, closedLeads, droppedLeads, bySource };
  }, [queue, myClients, myCallLogs, myFollowUps]);

  // ── Filtered table list ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = sourceFilter === 'All' ? queue : queue.filter(c => c.source === sourceFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) || c.phone?.includes(q) ||
        c.propertyType?.toLowerCase().includes(q) || c.source?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) || String(c.id).includes(q)
      );
    }
    return list;
  }, [queue, search, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems  = filtered.slice((page-1)*pageSize, page*pageSize);

  const openTakeCall = lead => setActiveLead({
    ...lead, coComment:'', coStatus:'', coMethod:'Call',
    offers:'', offersOther:'',
    followupDate:'', followupType:'Regular',
    followupNote:'', callStatus:'',
  });

  // Clicking "Take call": if the client is still unclaimed, attach it to
  // this agent right away (this is the moment ownership is created). If
  // it's already theirs (they opened it before and closed without logging),
  // just reopen — no need to reassign.
  const takeClient = lead => {
    if (isUnassigned(lead)) {
      const assignedAt = new Date().toISOString();
      setDb(prev => ({
        ...prev,
        clients: (prev.clients||[]).map(c =>
          c.id === lead.id
            ? { ...c, assignedAgentId: myAgentId, assignedAgentName: myAgentName, assignedAt }
            : c
        ),
      }));
      logAction?.('Took client', 'Client', lead.name);
      openTakeCall({ ...lead, assignedAgentId: myAgentId, assignedAgentName: myAgentName, assignedAt });
    } else {
      openTakeCall(lead);
    }
  };

  const updateActive = (k, v) => setActiveLead(p => ({...p,[k]:v}));

  const followupPriorityMap = { Priority:'high', 'Site Visit':'medium', Regular:'low' };

  const submitCall = () => {
    if (!activeLead) return;
    const now = new Date().toISOString();

    const offerLabel = activeLead.offers === 'other'
      ? (activeLead.offersOther || 'Other')
      : (OFFER_OPTIONS.find(o=>o.value===activeLead.offers)?.label || '');

    const entry = {
      id:Date.now(), clientId:activeLead.id, clientName:activeLead.name, phone:activeLead.phone,
      email:activeLead.email||'',
      subject:`${activeLead.propertyType||''} — Lead follow-up`.trim(),
      priority:'medium', notes:activeLead.coComment||'',
      agent: myAgentName, agentId: myAgentId, type:'inbound', duration:0,
      date:new Date().toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short'}),
      timestamp:now, propertyType:activeLead.propertyType, source:activeLead.source,
      callStatus:activeLead.callStatus, callOutcome:activeLead.coStatus,
      callMethod:activeLead.coMethod, offer:offerLabel,
    };

    // Map the new lead-status set onto the existing client.status field
    let nextClientStatus;
    if (activeLead.callStatus === 'Dropped')      nextClientStatus = 'Lost';
    else if (activeLead.callStatus === 'Interested')     nextClientStatus = 'Negotiation';
    else if (activeLead.callStatus === 'Not Interested') nextClientStatus = 'Contacted';
    else if (activeLead.callStatus === 'Followup')       nextClientStatus = 'Contacted';

    const hasFu = Boolean(activeLead.followupDate);
    setDb(prev => {
      const next = {
        ...prev,
        callLogs:[entry,...(prev.callLogs||[])],
        clients:(prev.clients||[]).map(c =>
          c.id===activeLead.id
            ? {
                ...c, calledAt:now, status: nextClientStatus || c.status,
                // Belt-and-suspenders: make sure the client is attached to
                // this agent even if takeClient() somehow didn't run first.
                assignedAgentId: c.assignedAgentId ?? myAgentId,
                assignedAgentName: c.assignedAgentName ?? myAgentName,
                assignedAt: c.assignedAt ?? now,
              }
            : c
        ),
      };
      if (hasFu) {
        next.followUps = [{
          id:Date.now()+1, clientId:activeLead.id, client:activeLead.name, clientName:activeLead.name,
          phone:activeLead.phone, clientPhone:activeLead.phone,
          subject:activeLead.followupNote?.trim()||`${activeLead.propertyType||'Lead'} follow-up`,
          note:activeLead.followupNote||'',
          dueDate:activeLead.followupDate,
          priority:followupPriorityMap[activeLead.followupType]||'medium',
          followupType:activeLead.followupType||'Regular',
          status:'pending', createdBy: myAgentName,
          agentId: myAgentId, agentName: myAgentName,
          // Snapshot of what happened during the call, so the Follow-up page
          // can show context without needing to look anything else up.
          callOutcome:activeLead.coStatus, callMethod:activeLead.coMethod,
          callNote:activeLead.coComment||'', leadStatus:activeLead.callStatus,
          offer:offerLabel,
          propertyType:activeLead.propertyType, source:activeLead.source,
          email:activeLead.email||'', company:activeLead.company||'',
          address:activeLead.address||'', location:activeLead.location||'',
          budgetMin:activeLead.budgetMin||'', budgetMax:activeLead.budgetMax||'',
        }, ...(prev.followUps||[])];
      }
      return next;
    });
    logAction?.(hasFu?'Took call & scheduled follow-up':'Took call','Call',activeLead.name);
    setActiveLead(null);
  };

  const addClient    = c => { setDb(prev=>({...prev,clients:[c,...(prev.clients||[])]})); logAction?.('Added client','Client',c.name); };
  const editClient   = c => { setDb(prev=>({...prev,clients:(prev.clients||[]).map(x=>x.id===c.id?c:x)})); logAction?.('Updated client','Client',c.name); };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDb(prev=>({...prev,clients:(prev.clients||[]).filter(c=>c.id!==deleteTarget.id)}));
    logAction?.('Deleted client','Client',deleteTarget.name);
    setDeleteTarget(null);
  };

  const pageNums = Array.from({length:totalPages},(_,i)=>i+1)
    .filter(p=>Math.abs(p-page)<=2||p===1||p===totalPages)
    .reduce((acc,p,i,arr)=>{ if(i>0&&p-arr[i-1]>1) acc.push('…'); acc.push(p); return acc; },[]);

  // sources that have at least 1 entry in the visible queue
  const activeSources = Object.keys(SOURCE_PALETTE).filter(s => metrics.bySource[s] > 0);

  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.2}}
      style={{ fontFamily:'-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif', color:C.text }}>

      {/* ── Page header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
        marginBottom:20, flexWrap:'wrap', gap:14 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:4 }}>
            <div style={{ width:30, height:30, borderRadius:C.r.sm,
              background:`linear-gradient(135deg,${C.accentDark},${C.accent})`,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Phone size={15} color="#fff"/>
            </div>
            <h1 style={{ fontSize:22, fontWeight:800, color:C.text, margin:0, letterSpacing:'-.02em' }}>
              New Calls
            </h1>
            {isSuperAdmin && (
              <Tag label="Super Admin — viewing all agents" color={C.purple} bg={C.purpleBg} border={C.purpleBorder}/>
            )}
          </div>
          <p style={{ fontSize:13.5, color:C.textMuted, margin:0 }}>
            Clients awaiting first contact — {queue.length} in queue
          </p>
        </div>
        <PrimaryBtn onClick={()=>setShowAdd(true)}>
          <Plus size={15}/> Add client
        </PrimaryBtn>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ── ROW 1: Key metrics ──────────────────────────────────────────────
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:10 }}>

        {/* Total in queue */}
        <StatBox
          icon={Phone}
          label="In Queue"
          value={metrics.total}
          color={C.accentDark}
          bg={C.accentLight}
          border={C.accentBorder}
          sublabel="Awaiting first call"
        />

        {/* Calls logged */}
        <StatBox
          icon={PhoneCall}
          label="Calls Logged"
          value={metrics.callsLogged}
          color={C.blue}
          bg={C.blueBg}
          border={C.blueBorder}
          sublabel={isSuperAdmin ? 'All agents' : 'By you'}
        />

        {/* Follow-ups sent */}
        <StatBox
          icon={CalendarClock}
          label="Follow-ups"
          value={metrics.followupsSent}
          color={C.purple}
          bg={C.purpleBg}
          border={C.purpleBorder}
          sublabel={isSuperAdmin ? 'All agents' : 'Scheduled by you'}
        />

        {/* Closed leads */}
        <StatBox
          icon={CheckCheck}
          label="Closed"
          value={metrics.closedLeads}
          color={C.green}
          bg={C.greenBg}
          border={C.greenBorder}
          sublabel={isSuperAdmin ? 'All agents' : 'Your converted leads'}
        />

        {/* Dropped / Lost */}
        <StatBox
          icon={XCircle}
          label="Dropped"
          value={metrics.droppedLeads}
          color={C.red}
          bg={C.redBg}
          border={C.redBorder}
          sublabel={isSuperAdmin ? 'All agents' : 'Your lost leads'}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ── ROW 2: Source breakdown (clickable filter chips) ────────────────
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSources.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <DividerLabel>Filter by source</DividerLabel>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>

            {/* "All" pill */}
            <button
              onClick={()=>{ setSourceFilter('All'); setPage(1); }}
              style={{
                display:'inline-flex', alignItems:'center', gap:6, padding:'7px 15px',
                borderRadius:C.r.full, cursor:'pointer', fontSize:12.5, fontWeight:700,
                border:`1.5px solid ${sourceFilter==='All' ? C.accentDark : C.border}`,
                background: sourceFilter==='All' ? C.accentLight : C.surface,
                color: sourceFilter==='All' ? C.accentDark : C.textMid,
                boxShadow: sourceFilter==='All' ? `0 1px 6px ${C.accent}33` : 'none',
                transition:'all .13s',
              }}>
              <Zap size={11}/>
              All sources
              <strong style={{ marginLeft:3, fontSize:13 }}>{metrics.total}</strong>
            </button>

            {activeSources.map(src => {
              const pal    = SOURCE_PALETTE[src] || SOURCE_PALETTE.Other;
              const accent = SOURCE_ACCENT[src]  || C.textMuted;
              const active = sourceFilter === src;
              const count  = metrics.bySource[src] || 0;
              return (
                <button key={src}
                  onClick={()=>{ setSourceFilter(p=>p===src?'All':src); setPage(1); }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:7, padding:'7px 15px',
                    borderRadius:C.r.full, cursor:'pointer', fontSize:12.5, fontWeight:active?700:600,
                    border:`1.5px solid ${active ? pal.color : C.border}`,
                    background: active ? pal.bg : C.surface,
                    color: active ? pal.color : C.textMid,
                    boxShadow: active ? `0 1px 6px ${pal.color}33` : 'none',
                    transition:'all .13s',
                  }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:accent, flexShrink:0 }}/>
                  {src}
                  <span style={{
                    display:'inline-flex', alignItems:'center', justifyContent:'center',
                    minWidth:20, height:18, borderRadius:C.r.full, padding:'0 6px',
                    fontSize:11, fontWeight:800,
                    background: active ? pal.color : C.surfaceSunken,
                    color: active ? '#fff' : C.textMid,
                    marginLeft:1,
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Table card ── */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:C.r.lg, overflow:'hidden', boxShadow:C.shadow.md }}>

        {/* Controls bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
          flexWrap:'wrap', gap:12, padding:'13px 18px',
          borderBottom:`1px solid ${C.border}`, background:C.surfaceRaised }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, color:C.textMid }}>
              Show
              <select value={pageSize} onChange={e=>{ setPageSize(Number(e.target.value)); setPage(1); }}
                style={{ ...inputBase, width:'auto', padding:'5px 9px', fontSize:13, cursor:'pointer', appearance:'none' }}>
                {[10,25,50,100].map(n=><option key={n}>{n}</option>)}
              </select>
              entries
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 13px',
            background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:C.r.md }}>
            <Search size={13} style={{ color:C.textMuted, flexShrink:0 }}/>
            <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, phone, property…"
              style={{ background:'none', border:'none', outline:'none', fontSize:13.5, color:C.text, width:220 }}/>
            {search && (
              <button onClick={()=>{ setSearch(''); setPage(1); }} style={{ background:'none', border:'none',
                color:C.textMuted, cursor:'pointer', padding:0, display:'flex' }}>
                <X size={12}/>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:C.surfaceRaised }}>
                {[
                  {label:'Client',   align:'left'},
                  {label:'Phone',    align:'left'},
                  {label:'Property', align:'left'},
                  {label:'Source',   align:'left'},
                  {label:'Type',     align:'left'},
                  {label:'Added',    align:'left'},
                  ...(isSuperAdmin ? [{label:'Agent', align:'left'}] : []),
                  {label:'Actions',  align:'center'},
                ].map(h => (
                  <th key={h.label} style={{ textAlign:h.align, padding:'10px 16px',
                    fontSize:10.5, fontWeight:700, color:C.textMuted,
                    textTransform:'uppercase', letterSpacing:'.07em',
                    borderBottom:`1.5px solid ${C.border}`, whiteSpace:'nowrap' }}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 8 : 7} style={{ padding:'72px 20px', textAlign:'center', color:C.textMuted }}>
                    <div style={{ width:52, height:52, borderRadius:'50%', background:C.surfaceRaised,
                      display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                      <Users size={24} style={{ opacity:.4 }}/>
                    </div>
                    <div style={{ fontSize:14.5, fontWeight:700, color:C.textMid, marginBottom:6 }}>
                      No clients in the queue
                    </div>
                    <div style={{ fontSize:13, opacity:.7 }}>
                      {allClients.length === 0
                        ? 'Add a client or import a list to get started.'
                        : 'All clients have been called, claimed by other agents, or adjust your search / filter.'}
                    </div>
                  </td>
                </tr>
              ) : pageItems.map((item, i) => {
                const srcColor = SOURCE_ACCENT[item.source] || C.textMuted;
                const hovered  = hoveredRow === item.id;
                const claimedByOther = isSuperAdmin && item.assignedAgentId && item.assignedAgentId !== myAgentId;
                return (
                  <tr key={item.id}
                    onMouseEnter={()=>setHoveredRow(item.id)}
                    onMouseLeave={()=>setHoveredRow(null)}
                    style={{
                      background: hovered ? '#FFFDF5' : i%2 ? C.surfaceRaised : 'transparent',
                      transition:'background .1s',
                    }}>
                    <td style={{ padding:'11px 16px', borderBottom:`1px solid ${C.border}99`,
                      maxWidth:240, paddingLeft:0 }}>
                      <div style={{ display:'flex', alignItems:'center' }}>
                        <div style={{ width:3, height:44, flexShrink:0, borderRadius:2,
                          background:srcColor, marginRight:13, opacity:.85 }}/>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <Avatar name={item.name} size={32}/>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:13.5, fontWeight:600, color:C.text,
                              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize:11, color:C.textMuted, marginTop:1 }}>
                              {item.company || `#${item.id}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'11px 16px', fontSize:13, color:C.text,
                      borderBottom:`1px solid ${C.border}99`, whiteSpace:'nowrap' }}>
                      {item.phone || <span style={{ color:C.textMuted }}>—</span>}
                    </td>
                    <td style={{ padding:'11px 16px', fontSize:13, color:C.text,
                      borderBottom:`1px solid ${C.border}99` }}>
                      {item.propertyType || <span style={{ color:C.textMuted }}>—</span>}
                    </td>
                    <td style={{ padding:'11px 16px', borderBottom:`1px solid ${C.border}99` }}>
                      {item.source ? <SourceTag source={item.source}/> : <span style={{ color:C.textMuted }}>—</span>}
                    </td>
                    <td style={{ padding:'11px 16px', fontSize:13, color:C.text,
                      borderBottom:`1px solid ${C.border}99` }}>
                      {item.type || '—'}
                    </td>
                    <td style={{ padding:'11px 16px', fontSize:12, color:C.textMuted,
                      borderBottom:`1px solid ${C.border}99`, whiteSpace:'nowrap' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                    </td>
                    {isSuperAdmin && (
                      <td style={{ padding:'11px 16px', borderBottom:`1px solid ${C.border}99` }}>
                        {item.assignedAgentId
                          ? <Tag label={item.assignedAgentName || 'Unknown agent'} color={C.blue} bg={C.blueBg} border={C.blueBorder}/>
                          : <span style={{ fontSize:11, color:C.textMuted, fontStyle:'italic' }}>Unclaimed</span>}
                      </td>
                    )}
                    <td style={{ padding:'11px 16px', textAlign:'center',
                      borderBottom:`1px solid ${C.border}99` }}>
                      <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
                        <IconAction
                          icon={claimedByOther ? Lock : Phone}
                          onClick={()=>takeClient(item)}
                          title={claimedByOther ? `Claimed by ${item.assignedAgentName}` : 'Take call'}
                          variant="primary"
                          disabled={claimedByOther}
                        />
                        <IconAction icon={Pencil} onClick={()=>setEditTarget(item)}   title="Edit"      variant="default"/>
                        <IconAction icon={Trash2} onClick={()=>setDeleteTarget(item)} title="Delete"    variant="danger"/>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
          flexWrap:'wrap', gap:12, padding:'11px 18px',
          borderTop:`1px solid ${C.border}`, background:C.surfaceRaised }}>
          <span style={{ fontSize:12.5, color:C.textMuted }}>
            Showing {filtered.length===0?0:(page-1)*pageSize+1}–{Math.min(page*pageSize,filtered.length)} of {filtered.length}
            {filtered.length !== queue.length ? ` (filtered from ${queue.length})` : ''}
          </span>
          <div style={{ display:'flex', gap:4, alignItems:'center' }}>
            <PageBtn disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>
              <ChevronLeft size={12}/> Prev
            </PageBtn>
            {pageNums.map((p,i) =>
              p==='…'
                ? <span key={`d${i}`} style={{ padding:'0 4px', color:C.textMuted, fontSize:12 }}>…</span>
                : <PageBtn key={p} active={p===page} onClick={()=>setPage(p)}>{p}</PageBtn>
            )}
            <PageBtn disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>
              Next <ChevronRight size={12}/>
            </PageBtn>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showAdd      && <ClientFormModal key="add"  onClose={()=>setShowAdd(false)}    onSave={addClient}/>}
        {editTarget   && <ClientFormModal key="edit" client={editTarget} onClose={()=>setEditTarget(null)} onSave={editClient}/>}
        {deleteTarget && <DeleteConfirmModal key="del" client={deleteTarget} onCancel={()=>setDeleteTarget(null)} onConfirm={confirmDelete}/>}
        {activeLead   && <TakeCallModal key="call" lead={activeLead} onChange={updateActive} onClose={()=>setActiveLead(null)} onSubmit={submitCall} user={user}/>}
      </AnimatePresence>
    </motion.div>
  );
};

export default NewCall;