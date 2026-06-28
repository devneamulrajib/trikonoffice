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
app.use(express.json({ limit: '10mb' })); // shared db blob can get large
app.use(express.static(path.join(__dirname, 'dist')));

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

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'superadmin')
    return res.status(403).json({ message: 'Admin only' });
  next();
};

async function main() {
  const db = await mysql.createPool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // ── Create users table with permissions column ──────────────────────────
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(100)  NOT NULL,
      email       VARCHAR(100)  UNIQUE NOT NULL,
      password    VARCHAR(255)  NOT NULL,
      role        ENUM('superadmin','user') DEFAULT 'user',
      permissions JSON          DEFAULT NULL,
      created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Add permissions column if table already exists without it ───────────
  try {
    await db.execute(`ALTER TABLE users ADD COLUMN permissions JSON DEFAULT NULL`);
    console.log('Added permissions column ✅');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') console.error('Alter table error:', err);
  }

  // ── Create app_data table — single-row shared db blob ──────────────────
  // One row (id=1) holds the entire frontend db as a JSON blob.
  // GET /api/data reads it; PUT /api/data overwrites it.
  // Using MEDIUMTEXT so the blob can grow to ~16 MB before hitting limits.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS app_data (
      id      INT PRIMARY KEY DEFAULT 1,
      payload MEDIUMTEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  console.log('DB connected ✅');

  // ── LOGIN ────────────────────────────────────────────────────────────────
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: 'Email and password required' });

      // Super admin login (env-based, no DB row)
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

      const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

      const match = await bcrypt.compare(password, rows[0].password);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });

      const u = rows[0];

      // Parse permissions — stored as JSON string in MySQL
      let permissions = [];
      if (u.permissions) {
        try {
          permissions = typeof u.permissions === 'string'
            ? JSON.parse(u.permissions)
            : u.permissions;
        } catch { permissions = []; }
      }

      const token = jwt.sign(
        { id: u.id, email: u.email, role: u.role, name: u.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: { id: u.id, name: u.name, email: u.email, role: u.role, permissions }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ── CREATE USER (with permissions) ──────────────────────────────────────
  app.post('/api/users', authMiddleware, adminOnly, async (req, res) => {
    try {
      const { name, email, password, permissions = [] } = req.body;
      if (!name || !email || !password)
        return res.status(400).json({ message: 'All fields required' });

      const hashed = await bcrypt.hash(password, 10);
      await db.execute(
        'INSERT INTO users (name, email, password, role, permissions) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashed, 'user', JSON.stringify(permissions)]
      );
      res.json({ message: 'User created' });
    } catch (err) {
      console.error('Create user error:', err);
      if (err.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ message: 'Email already exists' });
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ── GET ALL USERS (include permissions) ─────────────────────────────────
  app.get('/api/users', authMiddleware, adminOnly, async (req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT id, name, email, role, permissions, created_at FROM users'
      );
      const users = rows.map(u => ({
        ...u,
        permissions: (() => {
          if (!u.permissions) return [];
          try {
            return typeof u.permissions === 'string'
              ? JSON.parse(u.permissions)
              : u.permissions;
          } catch { return []; }
        })()
      }));
      res.json(users);
    } catch (err) {
      console.error('Get users error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ── UPDATE USER PERMISSIONS ──────────────────────────────────────────────
  app.patch('/api/users/:id/permissions', authMiddleware, adminOnly, async (req, res) => {
    try {
      const { permissions = [] } = req.body;
      await db.execute(
        'UPDATE users SET permissions = ? WHERE id = ?',
        [JSON.stringify(permissions), req.params.id]
      );
      res.json({ message: 'Permissions updated' });
    } catch (err) {
      console.error('Update permissions error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ── DELETE USER ──────────────────────────────────────────────────────────
  app.delete('/api/users/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
      await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
      res.json({ message: 'Deleted' });
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ── GET /api/data — load shared db ──────────────────────────────────────
  // Any authenticated user can read; the frontend permission system controls
  // which pages/views each user can actually see.
  app.get('/api/data', authMiddleware, async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT payload FROM app_data WHERE id = 1');
      if (!rows.length) {
        // First ever load — no data saved yet, return empty object so the
        // frontend falls back to DEFAULT_DB gracefully.
        return res.json({});
      }
      const payload = JSON.parse(rows[0].payload);
      res.json(payload);
    } catch (err) {
      console.error('GET /api/data error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ── PUT /api/data — save shared db ──────────────────────────────────────
  // Overwrites the single shared row with whatever the client sends.
  // Uses INSERT … ON DUPLICATE KEY UPDATE so it works on both first write
  // and all subsequent updates without needing a separate "init" call.
  app.put('/api/data', authMiddleware, async (req, res) => {
    try {
      const payload = JSON.stringify(req.body);
      await db.execute(`
        INSERT INTO app_data (id, payload)
        VALUES (1, ?)
        ON DUPLICATE KEY UPDATE payload = VALUES(payload)
      `, [payload]);
      res.json({ message: 'Saved' });
    } catch (err) {
      console.error('PUT /api/data error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // ── SPA fallback — must be last ──────────────────────────────────────────
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Running on port ${PORT} 🚀`));
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});