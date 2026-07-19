import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Raised from 10mb -> 50mb: property records can carry several base64-encoded
// images, an owner photo, and documents (deed/NID/agreement) all inside the
// single app_data JSON blob. Base64 inflates size ~33%, and every save resends
// the ENTIRE db (all properties' files included), so 10mb was getting hit
// quickly and causing 413s -> the "Offline — changes saved locally only" banner.
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// Roles that are allowed to be set via the API. 'superadmin' is intentionally
// excluded — it's only ever assigned via the SUPER_ADMIN_EMAIL/PASSWORD env
// vars, never through user creation, to avoid accidentally minting one.
const ASSIGNABLE_ROLES = new Set(['user', 'admin', 'call_center']);

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Was superadmin-only before. Manage Users is now allowed for 'admin' too,
// matching the frontend (Sidebar.jsx / App.jsx) which lets admins see and
// use that page.
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admin only' });
  next();
};

// ─── Client row → frontend shape mapper ────────────────────────────────────
const mapClient = (r) => ({
  id: r.id,
  name: r.name,
  profession: r.profession || '',
  designation: r.designation || '',
  company: r.company || '',
  phone: r.phone || '',
  altPhone: r.alt_phone || '',
  email: r.email || '',
  type: r.type,
  purpose: r.purpose || '',
  status: r.status,
  source: r.source,
  propertyType: r.property_type,
  budgetMin: r.budget_min ?? '',
  budgetMax: r.budget_max ?? '',
  location: r.location || '',
  address: r.address || '',
  reqLand: r.req_land || '',
  reqFlat: r.req_flat || '',
  reqFacing: r.req_facing || '',
  notes: r.notes || '',
  calledAt: r.called_at,
  assignedAgentId: r.assigned_agent_id,
  assignedAgentName: r.assigned_agent_name,
  assignedAt: r.assigned_at,
  createdAt: r.created_at,
});

// Builds the positional value array for INSERT/UPDATE on clients, in the
// fixed column order used by every write route below.
const clientCols = (c) => [
  c.name, c.profession || null, c.designation || null, c.company || null, c.phone || null,
  c.altPhone || null, c.email || null, c.type || 'Buyer', c.purpose || null, c.status || 'Lead',
  c.source || 'Other', c.propertyType || 'Apartment', c.budgetMin || null, c.budgetMax || null,
  c.location || null, c.address || null, c.reqLand || null, c.reqFlat || null, c.reqFacing || null,
  c.notes || null,
];

async function main() {
  const pool = await mysql.createPool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(100)  NOT NULL,
      email       VARCHAR(100)  UNIQUE NOT NULL,
      password    VARCHAR(255)  NOT NULL,
      role        ENUM('superadmin','admin','user','call_center') DEFAULT 'user',
      permissions JSON          DEFAULT NULL,
      created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    await pool.execute(`ALTER TABLE users ADD COLUMN permissions JSON DEFAULT NULL`);
    console.log('Added permissions column');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') console.error('Alter error:', err);
  }

  // Widen the role enum for existing tables created before 'admin' and
  // 'call_center' were added. Safe to run every boot — MODIFY COLUMN is a
  // no-op if the definition already matches.
  try {
    await pool.execute(
      `ALTER TABLE users MODIFY COLUMN role ENUM('superadmin','admin','user','call_center') DEFAULT 'user'`
    );
    console.log('Widened role enum');
  } catch (err) {
    console.error('Widen role enum error:', err);
  }

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS app_data (
      id         INT PRIMARY KEY DEFAULT 1,
      payload    MEDIUMTEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // ── Clients table (replaces clients living inside the app_data blob) ──────
  // Having its own table (instead of a field inside the single JSON blob)
  // is what makes atomic "claim" possible — see PATCH /:id/claim below.
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS clients (
      id                  INT AUTO_INCREMENT PRIMARY KEY,
      name                VARCHAR(150) NOT NULL,
      profession          VARCHAR(100),
      designation         VARCHAR(100),
      company             VARCHAR(150),
      phone               VARCHAR(30),
      alt_phone           VARCHAR(30),
      email               VARCHAR(150),
      type                VARCHAR(30)  DEFAULT 'Buyer',
      purpose             VARCHAR(30),
      status              VARCHAR(30)  DEFAULT 'Lead',
      source              VARCHAR(50)  DEFAULT 'Other',
      property_type       VARCHAR(50)  DEFAULT 'Apartment',
      budget_min          DECIMAL(14,2),
      budget_max          DECIMAL(14,2),
      location            VARCHAR(150),
      address             VARCHAR(255),
      req_land            VARCHAR(255),
      req_flat            VARCHAR(255),
      req_facing          VARCHAR(255),
      notes               TEXT,
      called_at           TIMESTAMP NULL,
      assigned_agent_id   INT NULL,
      assigned_agent_name VARCHAR(100) NULL,
      assigned_at         TIMESTAMP NULL,
      created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_assigned (assigned_agent_id)
    )
  `);

  // One-time migration: pull any clients still sitting inside the old
  // app_data JSON blob into the new table. Only runs while the clients
  // table is empty, so it's safe to leave in place across reboots.
  try {
    const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM clients');
    if (cnt === 0) {
      const [rows] = await pool.execute('SELECT payload FROM app_data WHERE id = 1');
      if (rows.length) {
        const oldClients = JSON.parse(rows[0].payload)?.clients || [];
        for (const c of oldClients) {
          await pool.execute(
            `INSERT INTO clients
              (name, profession, designation, company, phone, alt_phone, email, type, purpose,
               status, source, property_type, budget_min, budget_max, location, address,
               req_land, req_flat, req_facing, notes, called_at,
               assigned_agent_id, assigned_agent_name, assigned_at, created_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              c.name || 'Unnamed', c.profession || null, c.designation || null, c.company || null,
              c.phone || null, c.altPhone || null, c.email || null, c.type || 'Buyer', c.purpose || null,
              c.status || 'Lead', c.source || 'Other', c.propertyType || 'Apartment',
              c.budgetMin || null, c.budgetMax || null, c.location || null, c.address || null,
              c.reqLand || null, c.reqFlat || null, c.reqFacing || null, c.notes || null,
              c.calledAt || null, c.assignedAgentId || null, c.assignedAgentName || null,
              c.assignedAt || null, c.createdAt || new Date(),
            ]
          );
        }
        console.log(`Migrated ${oldClients.length} client(s) into the clients table`);
      }
    }
  } catch (err) {
    console.error('Client migration error:', err);
  }

  console.log('DB ready');

  app.get('/api/ping', (req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: 'Email and password required' });

      if (
        email    === process.env.SUPER_ADMIN_EMAIL &&
        password === process.env.SUPER_ADMIN_PASSWORD
      ) {
        const token = jwt.sign(
          { id: 0, email, role: 'superadmin', name: 'Super Admin' },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        return res.json({
          token,
          user: { id: 0, name: 'Super Admin', email, role: 'superadmin', permissions: [] }
        });
      }

      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

      const match = await bcrypt.compare(password, rows[0].password);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });

      const u = rows[0];
      let permissions = [];
      if (u.permissions) {
        try {
          permissions = typeof u.permissions === 'string'
            ? JSON.parse(u.permissions) : u.permissions;
        } catch { permissions = []; }
      }

      const token = jwt.sign(
        { id: u.id, email: u.email, role: u.role, name: u.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ token, user: { id: u.id, name: u.name, email: u.email, role: u.role, permissions } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/users', authMiddleware, adminOnly, async (req, res) => {
    try {
      const { name, email, password, role = 'user', permissions = [] } = req.body;
      if (!name || !email || !password)
        return res.status(400).json({ message: 'All fields required' });

      // Never trust the client to hand out superadmin. Anything not in the
      // assignable set silently falls back to 'user'.
      const safeRole = ASSIGNABLE_ROLES.has(role) ? role : 'user';

      const hashed = await bcrypt.hash(password, 10);
      await pool.execute(
        'INSERT INTO users (name, email, password, role, permissions) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashed, safeRole, JSON.stringify(permissions)]
      );
      res.json({ message: 'User created' });
    } catch (err) {
      console.error('Create user error:', err);
      if (err.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ message: 'Email already exists' });
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/users', authMiddleware, adminOnly, async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, email, role, permissions, created_at FROM users'
      );
      const users = rows.map(u => ({
        ...u,
        permissions: (() => {
          if (!u.permissions) return [];
          try {
            return typeof u.permissions === 'string'
              ? JSON.parse(u.permissions) : u.permissions;
          } catch { return []; }
        })()
      }));
      res.json(users);
    } catch (err) {
      console.error('Get users error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.patch('/api/users/:id/permissions', authMiddleware, adminOnly, async (req, res) => {
    try {
      const { permissions = [] } = req.body;
      await pool.execute(
        'UPDATE users SET permissions = ? WHERE id = ?',
        [JSON.stringify(permissions), req.params.id]
      );
      res.json({ message: 'Permissions updated' });
    } catch (err) {
      console.error('Update permissions error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // NEW: lets you fix an existing user's role (e.g. the 'test' account
  // created before this fix) without deleting and recreating them.
  app.patch('/api/users/:id/role', authMiddleware, adminOnly, async (req, res) => {
    try {
      const { role } = req.body;
      if (!ASSIGNABLE_ROLES.has(role))
        return res.status(400).json({ message: 'Invalid role' });

      await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
      res.json({ message: 'Role updated' });
    } catch (err) {
      console.error('Update role error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/users/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
      await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
      res.json({ message: 'Deleted' });
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/data', authMiddleware, async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT payload FROM app_data WHERE id = 1');
      if (!rows.length) return res.json({});
      res.json(JSON.parse(rows[0].payload));
    } catch (err) {
      console.error('GET /api/data error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/data', authMiddleware, async (req, res) => {
    try {
      const payload = JSON.stringify(req.body);
      await pool.execute(
        'INSERT INTO app_data (id, payload) VALUES (1, ?) ON DUPLICATE KEY UPDATE payload = VALUES(payload)',
        [payload]
      );
      res.json({ message: 'Saved' });
    } catch (err) {
      console.error('PUT /api/data error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ══════════════════════════════════════════════════════════════════════
  // ── CLIENTS API ─────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════

  // GET /api/clients — scoped: superadmin/admin see everyone, agents see
  // unclaimed clients + their own already-claimed clients.
  app.get('/api/clients', authMiddleware, async (req, res) => {
    try {
      const privileged = req.user.role === 'superadmin' || req.user.role === 'admin';
      const [rows] = privileged
        ? await pool.execute('SELECT * FROM clients ORDER BY created_at DESC')
        : await pool.execute(
            'SELECT * FROM clients WHERE assigned_agent_id IS NULL OR assigned_agent_id = ? ORDER BY created_at DESC',
            [req.user.id]
          );
      res.json(rows.map(mapClient));
    } catch (err) {
      console.error('GET /api/clients error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // POST /api/clients — add a single client
  app.post('/api/clients', authMiddleware, async (req, res) => {
    try {
      const [result] = await pool.execute(
        `INSERT INTO clients
          (name, profession, designation, company, phone, alt_phone, email, type, purpose,
           status, source, property_type, budget_min, budget_max, location, address,
           req_land, req_flat, req_facing, notes)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        clientCols(req.body)
      );
      const [rows] = await pool.execute('SELECT * FROM clients WHERE id = ?', [result.insertId]);
      res.json(mapClient(rows[0]));
    } catch (err) {
      console.error('POST /api/clients error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // POST /api/clients/bulk — bulk import (CSV / paste)
  app.post('/api/clients/bulk', authMiddleware, async (req, res) => {
    try {
      const list = Array.isArray(req.body.clients) ? req.body.clients : [];
      if (!list.length) return res.status(400).json({ message: 'No clients provided' });

      for (const c of list) {
        await pool.execute(
          `INSERT INTO clients
            (name, profession, designation, company, phone, alt_phone, email, type, purpose,
             status, source, property_type, budget_min, budget_max, location, address,
             req_land, req_flat, req_facing, notes)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          clientCols(c)
        );
      }
      res.json({ message: `${list.length} client(s) imported` });
    } catch (err) {
      console.error('POST /api/clients/bulk error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // PUT /api/clients/:id — edit (owner or admin/superadmin only)
  app.put('/api/clients/:id', authMiddleware, async (req, res) => {
    try {
      const [existing] = await pool.execute('SELECT * FROM clients WHERE id = ?', [req.params.id]);
      if (!existing.length) return res.status(404).json({ message: 'Not found' });

      const privileged = req.user.role === 'superadmin' || req.user.role === 'admin';
      const isOwner = existing[0].assigned_agent_id === req.user.id;
      if (!privileged && !isOwner)
        return res.status(403).json({ message: 'You do not own this client' });

      await pool.execute(
        `UPDATE clients SET
          name=?, profession=?, designation=?, company=?, phone=?, alt_phone=?, email=?,
          type=?, purpose=?, status=?, source=?, property_type=?, budget_min=?, budget_max=?,
          location=?, address=?, req_land=?, req_flat=?, req_facing=?, notes=?
         WHERE id = ?`,
        [...clientCols(req.body), req.params.id]
      );
      const [rows] = await pool.execute('SELECT * FROM clients WHERE id = ?', [req.params.id]);
      res.json(mapClient(rows[0]));
    } catch (err) {
      console.error('PUT /api/clients/:id error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // DELETE /api/clients/:id
  app.delete('/api/clients/:id', authMiddleware, async (req, res) => {
    try {
      const [existing] = await pool.execute('SELECT * FROM clients WHERE id = ?', [req.params.id]);
      if (!existing.length) return res.status(404).json({ message: 'Not found' });

      const privileged = req.user.role === 'superadmin' || req.user.role === 'admin';
      const isOwner = existing[0].assigned_agent_id === req.user.id;
      if (!privileged && !isOwner)
        return res.status(403).json({ message: 'You do not own this client' });

      await pool.execute('DELETE FROM clients WHERE id = ?', [req.params.id]);
      res.json({ message: 'Deleted' });
    } catch (err) {
      console.error('DELETE /api/clients/:id error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // PATCH /api/clients/:id/claim — atomic claim. Only succeeds if nobody
  // else has claimed the client yet; this is what eliminates the race
  // condition between two agents taking the same call.
  app.patch('/api/clients/:id/claim', authMiddleware, async (req, res) => {
    try {
      const [result] = await pool.execute(
        `UPDATE clients
           SET assigned_agent_id = ?, assigned_agent_name = ?, assigned_at = NOW()
         WHERE id = ? AND assigned_agent_id IS NULL`,
        [req.user.id, req.user.name, req.params.id]
      );

      if (result.affectedRows === 0) {
        // Either already claimed by someone, or the client doesn't exist.
        const [rows] = await pool.execute(
          'SELECT assigned_agent_id, assigned_agent_name FROM clients WHERE id = ?',
          [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: 'Client not found' });
        return res.status(409).json({
          message: 'Already claimed',
          assignedAgentId: rows[0].assigned_agent_id,
          assignedAgentName: rows[0].assigned_agent_name,
        });
      }

      const [rows] = await pool.execute('SELECT * FROM clients WHERE id = ?', [req.params.id]);
      res.json(mapClient(rows[0]));
    } catch (err) {
      console.error('PATCH /api/clients/:id/claim error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // PATCH /api/clients/:id/log-call — update status/calledAt after a call
  app.patch('/api/clients/:id/log-call', authMiddleware, async (req, res) => {
    try {
      const { status, calledAt } = req.body;
      await pool.execute(
        'UPDATE clients SET status = COALESCE(?, status), called_at = ? WHERE id = ?',
        [status || null, calledAt || new Date(), req.params.id]
      );
      const [rows] = await pool.execute('SELECT * FROM clients WHERE id = ?', [req.params.id]);
      res.json(mapClient(rows[0]));
    } catch (err) {
      console.error('PATCH /api/clients/:id/log-call error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Running on port ${PORT}`));
}

main().catch(err => {
  console.error('Startup error:', err);
  process.exit(1);
});