import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import GlobalStyles from '../theme/GlobalStyles';

const AuthPage = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ firstName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleAuth = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('clear_users_v6') || '[]');
      if (mode === 'signup') {
        users.push(form);
        localStorage.setItem('clear_users_v6', JSON.stringify(users));
        setMode('signin');
        setLoading(false);
        alert('Account created. Sign in to continue.');
      } else {
        const user = users.find(u => u.email === form.email && u.password === form.password);
        if (user) {
          localStorage.setItem('clear_session_v6', JSON.stringify(user));
          onLoginSuccess(user);
        } else {
          alert('Invalid credentials.');
          setLoading(false);
        }
      }
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F172A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }}>
      <GlobalStyles />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            gap: 12, marginBottom: 12
          }}>
            <div style={{
              width: 44, height: 44,
              background: 'var(--primary)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(16,185,129,0.3)'
            }}>
              <Zap size={24} color="#FFF" />
            </div>
            <span style={{
              fontSize: 24, fontWeight: 800,
              color: '#FFF', letterSpacing: '-0.02em'
            }}>
              Quite Clear
            </span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>Enterprise Financial Suite</p>
        </div>

        {/* CARD */}
        <div style={{
          background: '#FFF',
          borderRadius: 24,
          padding: 40,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}>

          {/* TABS */}
          <div style={{
            display: 'flex', gap: 4,
            background: '#F1F5F9',
            padding: 4, borderRadius: 12,
            marginBottom: 32
          }}>
            {['signin', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '10px',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  background: mode === m ? '#FFF' : 'transparent',
                  color: mode === m ? 'var(--zinc-900)' : 'var(--zinc-500)',
                  fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                  boxShadow: mode === m ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* FORM */}
          <form
            onSubmit={handleAuth}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            {mode === 'signup' && (
              <div>
                <label style={{
                  display: 'block', fontSize: 12,
                  fontWeight: 600, color: 'var(--zinc-500)', marginBottom: 8
                }}>
                  Full Name
                </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
            )}

            <div>
              <label style={{
                display: 'block', fontSize: 12,
                fontWeight: 600, color: 'var(--zinc-500)', marginBottom: 8
              }}>
                Email Address
              </label>
              <input
                className="input-field"
                type="email"
                placeholder="you@company.com"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: 12,
                fontWeight: 600, color: 'var(--zinc-500)', marginBottom: 8
              }}>
                Password
              </label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%', height: 48,
                justifyContent: 'center', marginTop: 8
              }}
            >
              {loading
                ? <div style={{
                    width: 18, height: 18,
                    border: '2px solid #FFF',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }} />
                : (mode === 'signin' ? 'Sign In' : 'Create Account')
              }
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;