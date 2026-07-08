import React, { useState } from "react";
import {
  Phone, Mail, Briefcase, MapPin,
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

/* Container queries so the panel reflows itself based on the
   space it's actually given, not the viewport — this is what
   makes it hold up when a parent layout squeezes it narrow. */
const RESPONSIVE_CSS = `
  .cp-root { container-type: inline-size; container-name: cp; }
  .cp-ledger { display: grid; column-gap: 20px; }
  .cp-header-body { display: flex; align-items: center; gap: 16px; }
  .cp-header-meta { display: flex; flex-wrap: wrap; row-gap: 4px; column-gap: 16px; margin-top: 10px; }
  .cp-stamp { position: absolute; top: -6px; right: -4px; }

  @container cp (max-width: 360px) {
    .cp-header-body { flex-direction: column; align-items: flex-start; gap: 10px; }
    .cp-stamp { position: static; transform: none; margin-top: 8px; display: inline-block; }
    .cp-avatar { width: 44px; height: 44px; font-size: 18px; }
    .cp-name { font-size: 19px; }
  }
  @container cp (max-width: 300px) {
    .cp-ledger[data-cols="2"] { grid-template-columns: 1fr; }
    .cp-ledger[data-cols="3"] { grid-template-columns: 1fr; }
  }
  @container cp (min-width: 301px) {
    .cp-ledger[data-cols="2"] { grid-template-columns: repeat(2, minmax(120px,1fr)); }
    .cp-ledger[data-cols="3"] { grid-template-columns: repeat(2, minmax(120px,1fr)); }
  }
  @container cp (min-width: 460px) {
    .cp-ledger[data-cols="3"] { grid-template-columns: repeat(3, minmax(120px,1fr)); }
  }
`;

function statusColor(status = "") {
  const s = status.toLowerCase();
  if (/hot|urgent|priority/.test(s)) return { fg: C.red, bg: C.redSoft };
  if (/closed|won|converted/.test(s)) return { fg: C.teal, bg: C.tealSoft };
  return { fg: C.amber, bg: C.amberSoft };
}

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
          flexShrink: 0,
        }}
      />
    )}
  </button>
);

const Entry = ({ label, value, mono }) => (
  <div style={{ padding: "10px 0", borderBottom: `1px dashed ${C.border}`, minWidth: 0 }}>
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
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        lineHeight: 1.35,
      }}
    >
      {value || "Not on file"}
    </div>
  </div>
);

const Ledger = ({ children, cols = 2 }) => (
  <div className="cp-ledger" data-cols={cols}>
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
    <div className="cp-root" style={{ background: C.paper, padding: 18, borderRadius: 18 }}>
      <style>{RESPONSIVE_CSS}</style>

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
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent, transparent 27px, rgba(255,255,255,0.035) 28px)",
            pointerEvents: "none",
          }}
        />
        <div className="cp-header-body" style={{ position: "relative" }}>
          <div
            className="cp-avatar"
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
              className="cp-name"
              style={{
                margin: 0,
                fontFamily: FONT_SERIF,
                fontSize: 24,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.01em",
                overflowWrap: "anywhere",
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
              className="cp-header-meta"
              style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: "rgba(255,255,255,0.85)" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <Phone size={12} style={{ flexShrink: 0 }} /> {client.phone || "—"}
              </span>
              <span
                style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, overflowWrap: "anywhere" }}
              >
                <Mail size={12} style={{ flexShrink: 0 }} /> {client.email || "—"}
              </span>
            </div>
          </div>

          {client.status && (
            <div
              className="cp-stamp"
              style={{
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
                flexShrink: 0,
              }}
            >
              {client.status}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Dossier sections ---------------- */}
      <Section n={1} title="Contact" icon={Phone}>
        <Ledger cols={2}>
          <Entry label="Full name" value={client.name} />
          <Entry label="Phone" value={client.phone} mono />
          <Entry label="Alternative phone" value={client.altPhone} mono />
          <Entry label="Email" value={client.email} mono />
        </Ledger>
      </Section>

      <Section n={2} title="Professional" icon={Briefcase} collapsible defaultOpen={!compact}>
        <Ledger cols={2}>
          <Entry label="Profession" value={client.profession} />
          <Entry label="Designation" value={client.designation} />
          <Entry label="Company" value={client.company} />
          <Entry label="Client type" value={client.type} />
        </Ledger>
      </Section>

      <Section n={3} title="Deal details" icon={Wallet}>
        <Ledger cols={2}>
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
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CalendarClock size={15} color={C.teal} style={{ flexShrink: 0 }} />
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
        <Ledger cols={2}>
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
              overflowWrap: "anywhere",
            }}
          >
            {client.notes || "No remarks on file."}
          </div>
        </Section>
      )}
    </div>
  );
}