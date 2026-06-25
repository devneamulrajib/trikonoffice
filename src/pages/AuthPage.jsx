import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import GlobalStyles from '../theme/GlobalStyles';

const AuthPage = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('clear_session_v6', JSON.stringify(data.user));
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
              Trikon Office
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
          <h2 style={{
            fontSize: 20, fontWeight: 700,
            color: '#0F172A', marginBottom: 24, textAlign: 'center'
          }}>
            Sign In
          </h2>

          {error && (
            <div style={{
              background: '#FEE2E2', color: '#DC2626',
              padding: '10px 14px', borderRadius: 8,
              fontSize: 13, marginBottom: 16
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                placeholder="admin@trikonoffice.com"
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
              style={{ width: '100%', height: 48, justifyContent: 'center', marginTop: 8 }}
            >
              {loading
                ? <div style={{
                    width: 18, height: 18,
                    border: '2px solid #FFF',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }} />
                : 'Sign In'
              }
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;