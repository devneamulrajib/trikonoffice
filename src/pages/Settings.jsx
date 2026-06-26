import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Page from '../components/Page';

const Settings = ({ db, setDb }) => {
  const [m, setM] = useState({ name: '', role: '' });

  const handleInvite = () => {
    if (!m.name.trim()) return;
    setDb({
      ...db,
      members: [...db.members, { ...m, id: Date.now() }]
    });
    setM({ name: '', role: '' });
  };

  const handleRemove = (id) => {
    setDb({
      ...db,
      members: db.members.filter(x => x.id !== id)
    });
  };

  return (
    <Page title="Settings" subtitle="Manage team access and global parameters">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

        {/* INVITE FORM */}
        <div className="card" style={{ padding: 40 }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 24 }}>
            Personnel Registry
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div>
              <label style={{
                fontSize: 12, fontWeight: 600,
                display: 'block', marginBottom: 8,
                color: 'var(--zinc-500)'
              }}>
                Full Name
              </label>
              <input
                className="input-field"
                placeholder="John Doe"
                value={m.name}
                onChange={e => setM({ ...m, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
              />
            </div>

            <div>
              <label style={{
                fontSize: 12, fontWeight: 600,
                display: 'block', marginBottom: 8,
                color: 'var(--zinc-500)'
              }}>
                Designation
              </label>
              <input
                className="input-field"
                placeholder="Operations Lead"
                value={m.role}
                onChange={e => setM({ ...m, role: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
              />
            </div>

            <button
              className="btn-primary"
              onClick={handleInvite}
              style={{ justifyContent: 'center', padding: 14 }}
            >
              Invite Member
            </button>

          </div>
        </div>

        {/* TEAM LIST */}
        <div className="card" style={{ padding: 40 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 24
          }}>
            <h3 style={{ fontWeight: 800, fontSize: 18 }}>Team Overview</h3>
            <span style={{
              background: '#F1F5F9', color: 'var(--zinc-500)',
              padding: '4px 12px', borderRadius: 99,
              fontSize: 12, fontWeight: 700
            }}>
              {db.members.length} member{db.members.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* EMPTY STATE */}
          {db.members.length === 0 && (
            <div style={{
              padding: '40px 0', textAlign: 'center',
              color: 'var(--zinc-400)', fontSize: 14
            }}>
              No members yet. Invite someone above.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {db.members.map(mem => (
              <div key={mem.id} style={{
                padding: 16,
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
                background: '#F8FAFC', borderRadius: 12,
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'var(--zinc-900)', color: '#FFF',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 800, fontSize: 14
                  }}>
                    {mem.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{mem.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--zinc-500)', marginTop: 2 }}>
                      {mem.role || 'No designation'}
                    </p>
                  </div>
                </div>

                <button
                  className="btn-danger"
                  style={{ padding: 6 }}
                  onClick={() => handleRemove(mem.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Page>
  );
};

export default Settings;