import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const Comments = ({ db, setDb, logAction, user }) => {
  const comments = db.ccComments || [];
  const [form, setForm] = useState({ client: '', text: '' });

  const inputStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 12px', fontSize: 13,
    color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const handleAdd = () => {
    if (!form.text || !form.client) return;
    const entry = {
      id:        Date.now(),
      author:    user?.firstName || 'Unknown',
      client:    form.client,
      text:      form.text,
      date:      new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      timestamp: new Date().toISOString(),
    };
    setDb(prev => ({ ...prev, ccComments: [entry, ...(prev.ccComments || [])] }));
    logAction('Added comment', 'Comment', form.client);
    setForm({ client: '', text: '' });
  };

  const handleDelete = (id) => {
    setDb(prev => ({ ...prev, ccComments: prev.ccComments.filter(c => c.id !== id) }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
    >
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Comments</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Internal notes and client remarks.</p>
      </div>

      {/* Add Comment Box */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 22, marginBottom: 24, maxWidth: 700,
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Add Comment</p>
        <div style={{ marginBottom: 12 }}>
          <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}
            placeholder="Client name" style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <textarea value={form.text} onChange={e => setForm({ ...form, text: e.target.value })}
            placeholder="Write your comment..." rows={3}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <button onClick={handleAdd} style={{
          background: 'var(--primary)', color: '#fff', border: 'none',
          borderRadius: 8, padding: '9px 20px', fontSize: 13,
          fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Post Comment
        </button>
      </div>

      {/* Comment List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 700 }}>
        {comments.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '60px 0' }}>
            No comments yet. Add one above.
          </div>
        )}
        {comments.map(c => (
          <div key={c.id} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* Avatar */}
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'var(--primary)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>
                  {(c.author || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.author || 'Unknown'}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>re: {c.client}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary, var(--text))', marginTop: 5, lineHeight: 1.5 }}>{c.text}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{c.date}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(c.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 0, flexShrink: 0, marginTop: 2,
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Comments;