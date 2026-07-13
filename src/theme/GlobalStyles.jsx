const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #F8FAFC;
      --surface:   #FFFFFF;
      --surface-2: #F1F5F9;
      --primary:   #10B981;
      --primary-dk:#059669;
      --zinc-900:  #0F172A;
      --zinc-400:  #94A3B8;
      --zinc-500:  #64748B;
      --zinc-100:  #E2E8F0;
      --red:       #EF4444;
      --text:      #1E293B;
      --text-lt:   #64748B;
      --border:    #E2E8F0;
      --shadow:    0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      --sidebar-w: 260px;
    }

    html { -webkit-text-size-adjust: 100%; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

    .input-field {
      width: 100%; background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 10px 14px; color: var(--text); font-family: 'Inter', sans-serif;
      font-size: 14px; font-weight: 500; outline: none; transition: all 0.2s;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
    }
    .input-field:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }

    .btn-primary {
      background: var(--zinc-900); color: #FFF; font-weight: 600; border: none; cursor: pointer;
      font-family: 'Inter', sans-serif; font-size: 14px; padding: 10px 20px; border-radius: 8px;
      transition: all 0.2s; display: flex; align-items: center; gap: 8px;
    }
    .btn-primary:hover { background: #000; transform: translateY(-1px); box-shadow: var(--shadow-lg); }

    .btn-ghost {
      background: #FFF; border: 1px solid var(--border); color: var(--text);
      cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
      padding: 8px 16px; border-radius: 8px; transition: all 0.2s;
    }
    .btn-ghost:hover { background: var(--surface-2); border-color: var(--zinc-400); }

    .btn-danger {
      background: #FFF; border: 1px solid #FECACA; color: var(--red);
      cursor: pointer; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
      padding: 8px 16px; border-radius: 8px; transition: all 0.2s;
    }
    .btn-danger:hover { background: #FEF2F2; border-color: var(--red); }

    .card {
      background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
      box-shadow: var(--shadow);
    }

    .nav-link {
      display: flex; align-items: center; gap: 12px; padding: 10px 14px;
      border-radius: 8px; border: none; cursor: pointer; width: 100%; text-align: left;
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
      background: transparent; color: #94A3B8; transition: all 0.2s;
    }
    .nav-link:hover { background: rgba(255,255,255,0.05); color: #FFF; }
    .nav-link.active { background: var(--primary); color: #FFF; font-weight: 600; box-shadow: 0 4px 12px rgba(16,185,129,0.25); }

    table { border-collapse: separate; border-spacing: 0; width: 100%; }
    th { color: var(--text-lt); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
    td { font-size: 14px; color: var(--text); border-bottom: 1px solid var(--border); }

    .badge-green { background: #D1FAE5; color: #065F46; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .badge-red   { background: #FEE2E2; color: #991B1B; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .badge-gray  { background: #F1F5F9; color: #475569; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ══════════════════════════════════════════════════════════════════
       RESPONSIVE / MOBILE SHELL
       Breakpoint: 900px. Above it, the sidebar is a static permanent
       column (as before). Below it, the sidebar becomes an off-canvas
       drawer toggled by the hamburger button in the mobile top bar.
       ══════════════════════════════════════════════════════════════════ */

    .app-sidebar { transition: transform 0.25s ease; }

    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      z-index: 99;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    .mobile-topbar { display: none; }

    @media (max-width: 900px) {
      .app-sidebar {
        transform: translateX(-100%);
        box-shadow: var(--shadow-lg);
      }
      .app-sidebar.open {
        transform: translateX(0);
      }

      .sidebar-overlay {
        display: block;
      }
      .sidebar-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }

      .mobile-close-btn {
        display: flex !important;
      }

      .mobile-topbar {
        display: flex !important;
        align-items: center;
        gap: 12px;
        position: sticky;
        top: 0;
        z-index: 90;
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        padding: 14px 16px;
      }

      .app-main {
        margin-left: 0 !important;
        padding: 20px 16px 32px !important;
        width: 100% !important;
      }

      .page-header {
        flex-wrap: wrap;
        align-items: flex-start !important;
        gap: 12px;
      }
      .page-header h1 {
        font-size: 24px !important;
      }
      .page-header p {
        font-size: 14px !important;
      }

      /* Tables: allow horizontal scroll instead of squeezing columns */
      .table-scroll {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
    }
  `}</style>
);

export default GlobalStyles;