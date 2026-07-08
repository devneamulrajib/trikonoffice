import React, { useState } from "react";
import {
  Phone, Mail, Briefcase, Building2, MapPin,
  LandPlot, MessageSquare, Wallet, CalendarClock, ChevronDown
} from "lucide-react";

/* ---------------------------------------------------------
   TOKENS — "Land Ledger" identity
   A property dossier, not a dashboard card: ledger-navy ink,
   soft paper background, ochre stamp accent, mono for figures.
--------------------------------------------------------- */
const C = {
  paper: "#FAF9F6",
  card: "#FFFFFF",
  border: "#E5E1D8",
  ink: "#16213D",
  inkSoft: "#3A4A6B",
  muted: "#7A7568",
  amber: "#B7791F",
  amberSoft: "#FCEFD8",
  teal: "#0F766E",
  tealSoft: "#E4F3F1",
  red: "#B3402E",
  redSoft: "#FBE8E3",
};

const FONT_SERIF = `"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif`;
const FONT_SANS = `-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,sans-serif`;
const FONT_MONO = `"JetBrains Mono","SF Mono",Menlo,Consolas,monospace`;

/* Status → stamp color mapping. Falls back to teal for anything unmapped. */
function statusColor(status = "") {
  const s = status.toLowerCase();
  if (/hot|urgent|priority/.test(s)) return { fg: C.red, bg: C.redSoft };
  if (/closed|won|converted/.test(s)) return { fg: C.teal, bg: C.tealSoft };
  return { fg: C.amber, bg: C.amberSoft };
}

/* ---------------------------------------------------------
   Numbered index tab — sections in a dossier are a fixed
   sequence, so the number carries real information here.
--------------------------------------------------------- */
const SectionTab = ({ n, title, icon: Icon, open, onToggle, collapsible }) => (
  <button
    onClick={collapsible ? onToggle : undefined}
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 16px",
      background: "transparent",
      border: "none",
      cursor: collapsible ? "pointer" : "default",
      textAlign: "left",
    }}
  >
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 11,
        color: C.muted,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        width: 26,
        height: 26,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {String(n).padStart(2, "0")}
    </div>
    <Icon size={16} color={C.inkSoft} strokeWidth={2} style={{ flexShrink: 0 }} />
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: C.ink,
        flex: 1,
      }}
    >
      {title}
    </div>
    {collapsible && (
      <ChevronDown
        size={16}
        color={C.muted}
        style={{
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
        }}
      />
    )}
  </button>
);

const Entry = ({ label, value, mono }) => (
  <div style={{ padding: "10px 0", borderBottom: `1px dashed ${C.border}` }}>
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: C.muted,
        marginBottom: 4,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: mono ? FONT_MONO : FONT_SANS,
        fontSize: 14.5,
        fontWeight: mono ? 500 : 600,
        color: value ? C.ink : C.muted,
      }}
    >
      {value || "Not on file"}
    </div>
  </div>
);

const Ledger = ({ children, cols = 2 }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
      columnGap: 20,
    }}
  >
    {children}
  </div>
);

const Section = ({ n, title, icon, children, collapsible = false, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      <SectionTab
        n={n}
        title={title}
        icon={icon}
        open={open}
        onToggle={() => setOpen((o) => !o)}
        collapsible={collapsible}
      />
      {open && <div style={{ padding: "0 16px 14px 16px" }}>{children}</div>}
    </div>
  );
};

export default function CustomerProfile({ client, compact = false, nextScheduledCall }) {
  if (!client) {
    return (
      <div
        style={{
          padding: 48,
          textAlign: "center",
          fontFamily: FONT_SANS,
          color: C.muted,
          background: C.paper,
          borderRadius: 14,
        }}
      >
        No customer selected.
      </div>
    );
  }

  const budget =
    client.budgetMin || client.budgetMax
      ? `৳${(client.budgetMin || 0).toLocaleString()} – ৳${(client.budgetMax || 0).toLocaleString()}`
      : "";

  const stamp = statusColor(client.status);
  const initial = (client.name || "?")[0].toUpperCase();

  return (
    <div style={{ background: C.paper, padding: 18, borderRadius: 18 }}>
      {/* ---------------- Header : case-file plate ---------------- */}
      <div
        style={{
          position: "relative",
          background: C.ink,
          borderRadius: 14,
          padding: "22px 24px",
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        {/* faint ledger rule lines, subject-appropriate texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent, transparent 27px, rgba(255,255,255,0.035) 28px)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: `2px solid ${C.amber}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_SERIF,
              fontSize: 22,
              fontWeight: 700,
              color: C.amber,
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: FONT_SERIF,
                fontSize: 24,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.01em",
              }}
            >
              {client.name}
            </h2>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12.5,
                color: "rgba(255,255,255,0.65)",
                marginTop: 3,
                letterSpacing: "0.03em",
              }}
            >
              {client.propertyType || "Prospective client"}
              {client.type ? ` · ${client.type}` : ""}
            </div>
            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 10,
                fontFamily: FONT_MONO,
                fontSize: 12.5,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Phone size={12} /> {client.phone || "—"}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Mail size={12} /> {client.email || "—"}
              </span>
            </div>
          </div>

          {/* Signature element: rotated ink-stamp status badge */}
          {client.status && (
            <div
              style={{
                position: "absolute",
                top: -6,
                right: -4,
                transform: "rotate(-8deg)",
                border: `2px solid ${stamp.fg}`,
                borderRadius: 8,
                padding: "5px 12px",
                fontFamily: FONT_SANS,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: stamp.fg,
                background: "rgba(255,255,255,0.06)",
                whiteSpace: "nowrap",
              }}
            >
              {client.status}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Dossier sections ---------------- */}
      <Section n={1} title="Contact" icon={Phone}>
        <Ledger>
          <Entry label="Full name" value={client.name} />
          <Entry label="Phone" value={client.phone} mono />
          <Entry label="Alternative phone" value={client.altPhone} mono />
          <Entry label="Email" value={client.email} mono />
        </Ledger>
      </Section>

      <Section n={2} title="Professional" icon={Briefcase} collapsible defaultOpen={!compact}>
        <Ledger>
          <Entry label="Profession" value={client.profession} />
          <Entry label="Designation" value={client.designation} />
          <Entry label="Company" value={client.company} />
          <Entry label="Client type" value={client.type} />
        </Ledger>
      </Section>

      <Section n={3} title="Deal details" icon={Wallet}>
        <Ledger>
          <Entry label="Purpose" value={client.purpose} />
          <Entry label="Source" value={client.source} />
          <Entry label="Budget range" value={budget} mono />
          <Entry label="Assigned agent" value={client.assignedAgentName} />
        </Ledger>
        <div
          style={{
            marginTop: 10,
            paddingTop: 12,
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CalendarClock size={15} color={C.teal} />
          <span style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: C.muted }}>
            Next scheduled call
          </span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 13,
              fontWeight: 600,
              color: C.ink,
              marginLeft: "auto",
              background: C.tealSoft,
              padding: "3px 10px",
              borderRadius: 6,
            }}
          >
            {nextScheduledCall || client.nextScheduledCall || "Not scheduled"}
          </span>
        </div>
      </Section>

      <Section n={4} title="Property requirements" icon={MapPin} collapsible defaultOpen={!compact}>
        <Ledger>
          <Entry label="Property type" value={client.propertyType} />
          <Entry label="Preferred location" value={client.location} />
        </Ledger>
        <div style={{ marginTop: 4 }}>
          <Entry label="Address" value={client.address} />
        </div>
      </Section>

      <Section n={5} title="Specifications" icon={LandPlot} collapsible defaultOpen={!compact}>
        <Ledger cols={3}>
          <Entry label="Land requirement" value={client.reqLand} />
          <Entry label="Flat requirement" value={client.reqFlat} />
          <Entry label="Facing preference" value={client.reqFacing} />
        </Ledger>
      </Section>

      {!compact && (
        <Section n={6} title="Remarks" icon={MessageSquare}>
          <div
            style={{
              background: C.amberSoft,
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${C.amber}`,
              borderRadius: 8,
              padding: "14px 16px",
              fontFamily: FONT_SERIF,
              fontSize: 14.5,
              lineHeight: 1.7,
              color: C.ink,
            }}
          >
            {client.notes || "No remarks on file."}
          </div>
        </Section>
      )}
    </div>
  );
}