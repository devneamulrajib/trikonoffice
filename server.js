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
app.use(express.json({ limit: '10mb' }));
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