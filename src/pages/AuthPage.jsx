import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlobalStyles from '../theme/GlobalStyles';

// ── Decorative abstract blobs (matches the Uizard dark-panel aesthetic) ───────
const AbstractPanel = () => (
  <div style={{
    position: 'relative', width: '100%', height: '100%',
    overflow: 'hidden', background: '#111111'
  }}>
    {/* Brand name top-left */}
    <div style={{
      position: 'absolute', top: 36, left: 36,
      color: '#FFFFFF', fontWeight: 800, fontSize: 22,
      letterSpacing: '-0.02em', zIndex: 2
    }}>
      Trikon<br />Office
    </div>

    {/* Blob 1 – yellow-gold */}
    <div style={{
      position: 'absolute', bottom: '18%', left: '8%',
      width: 130, height: 130,
      background: 'radial-gradient(circle at 40% 40%, #F9A825 0%, #e65c00 100%)',
      borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
      filter: 'blur(2px)',
    }} />

    {/* Blob 2 – olive / dark yellow */}
    <div style={{
      position: 'absolute', top: '22%', right: '12%',
      width: 110, height: 80,
      background: 'radial-gradient(circle at 30% 50%, #8a7d20 0%, #5a5210 100%)',
      borderRadius: '30% 70% 60% 40% / 50% 30% 70% 50%',
      filter: 'blur(1px)',
      transform: 'rotate(-20deg)',
    }} />

    {/* Blob 3 – orange / red */}
    <div style={{
      position: 'absolute', bottom: '30%', right: '18%',
      width: 100, height: 110,
      background: 'radial-gradient(circle at 60% 40%, #EF4444 0%, #b91c1c 100%)',
      borderRadius: '50% 50% 40% 60% / 60% 40% 60% 40%',
      filter: 'blur(1.5px)',
    }} />

    {/* Small sphere / circle */}
    <div style={{
      position: 'absolute', top: '44%', left: '38%',
      width: 52, height: 52,
      background: 'radial-gradient(circle at 35% 35%, #e0e0e0 0%, #888 100%)',
      borderRadius: '50%',
      boxShadow: 'inset -6px -6px 12px rgba(0,0,0,0.3)',
    }} />

    {/* Tiny dot accent */}
    <div style={{
      position: 'absolute', top: '42%', left: '28%',
      width: 8, height: 8,
      background: '#FFFFFF',
      borderRadius: '50%', opacity: 0.6,
    }} />
    <div style={{
      position: 'absolute', top: '56%', left: '55%',
      width: 6, height: 6,
      background: '#FFFFFF',
      borderRadius: '50%', opacity: 0.4,
    }} />

    {/* White squiggle line (SVG) */}
    <svg style={{ position: 'absolute', bottom: '15%', left: '20%', opacity: 0.5 }}
      width="160" height="90" viewBox="0 0 160 90" fill="none">
      <path d="M10 80 C 40 10, 80 90, 120 30 S 150 70 150 20"
        stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="10" cy="80" r="4" fill="white" opacity="0.7" />
      <circle cx="150" cy="20" r="4" fill="white" opacity="0.7" />
    </svg>
  </div>
);

// ─── MAIN AUTH PAGE ───────────────────────────────────────────────────────────
const AuthPage = ({ onLoginSuccess }) => {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showPw,  setShowPw]  = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token',             data.token);
      localStorage.setItem('clear_session_v6',  JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display:   'flex',
      background: '#FFFFFF',
    }}>
      <GlobalStyles />

      {/* ── LEFT dark panel ─────────────────────────────────────── */}
      <div style={{
        width: '45%',
        minHeight: '100vh',
        flexShrink: 0,
        display: 'none',
      }}
        className="auth-left-panel"
      >
        <AbstractPanel />
      </div>

      {/* ── RIGHT white panel ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          flex:            1,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          padding:         '48px 40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Title */}
          <h1 style={{
            fontSize:      32,
            fontWeight:    800,
            color:         '#111111',
            letterSpacing: '-0.02em',
            marginBottom:  8,
          }}>
            Sign in
          </h1>
          <p style={{
            fontSize:     14,
            color:        '#94A3B8',
            marginBottom: 36,
          }}>
            Welcome back to Trikon Office
          </p>

          {/* Error banner */}
          {error && (
            <div style={{
              background:   '#FEE2E2',
              color:        '#DC2626',
              padding:      '10px 14px',
              borderRadius: 8,
              fontSize:     13,
              marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <input
                type="email"
                placeholder="email.address@mail.com"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                onFocus={e  => e.target.style.borderColor = '#F9A825'}
                onBlur={e   => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28, position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••••••••••••"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e  => e.target.style.borderColor = '#F9A825'}
                onBlur={e   => e.target.style.borderColor = '#E2E8F0'}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position:   'absolute', right: 14, top: '50%',
                  transform:  'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor:     'pointer', color: '#94A3B8',
                  fontSize:   13, lineHeight: 1,
                }}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width:         '100%',
                height:        52,
                background:    loading ? '#fdd05a' : '#F9A825',
                border:        'none',
                borderRadius:  10,
                color:         '#111111',
                fontSize:      15,
                fontWeight:    700,
                cursor:        loading ? 'not-allowed' : 'pointer',
                display:       'flex',
                alignItems:    'center',
                justifyContent:'center',
                gap:           10,
                transition:    'background 0.18s, transform 0.12s',
                marginBottom:  24,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#e8970f'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#F9A825'; }}
            >
              {loading ? (
                <div style={{
                  width: 18, height: 18,
                  border: '2.5px solid #111',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
              ) : 'Sign in'}
            </button>

          </form>

          {/* Divider */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            gap:            12,
            marginBottom:   24,
          }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            <span style={{ fontSize: 12, color: '#94A3B8' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

        </div>
      </motion.div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 768px) {
          .auth-left-panel { display: block !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const inputStyle = {
  width:        '100%',
  height:       48,
  border:       '1.5px solid #E2E8F0',
  borderRadius: 8,
  padding:      '0 14px',
  fontSize:     14,
  color:        '#111111',
  outline:      'none',
  background:   '#FAFAFA',
  transition:   'border-color 0.18s',
  boxSizing:    'border-box',
};

export default AuthPage;