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
app.use(express.json());
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
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('superadmin','user') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('DB connected ✅');

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: 'Email and password required' });

      if (
        email === process.env.SUPER_ADMIN_EMAIL &&
        password === process.env.SUPER_ADMIN_PASSWORD
      ) {
        const token = jwt.sign(
          { id: 0, email, role: 'superadmin', name: 'Super Admin' },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        return res.json({ token, user: { id: 0, name: 'Super Admin', email, role: 'superadmin' } });
      }

      const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

      const match = await bcrypt.compare(password, rows[0].password);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });

      const u = rows[0];
      const token = jwt.sign(
        { id: u.id, email: u.email, role: u.role, name: u.name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      res.json({ token, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/users', authMiddleware, adminOnly, async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password)
        return res.status(400).json({ message: 'All fields required' });
      const hashed = await bcrypt.hash(password, 10);
      await db.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashed, 'user']
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
      const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM users');
      res.json(rows);
    } catch (err) {
      console.error('Get users error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/users/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
      await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
      res.json({ message: 'Deleted' });
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // SPA fallback — must be last
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