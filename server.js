import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { config } from 'dotenv';

config();

const require = createRequire(import.meta.url);
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

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

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
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
});

app.post('/api/users', authMiddleware, adminOnly, async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });
  const hashed = await bcrypt.hash(password, 10);
  await db.execute('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
    [name, email, hashed, 'user']);
  res.json({ message: 'User created' });
});

app.get('/api/users', authMiddleware, adminOnly, async (req, res) => {
  const [rows] = await db.execute('SELECT id,name,email,role,created_at FROM users');
  res.json(rows);
});

app.delete('/api/users/:id', authMiddleware, adminOnly, async (req, res) => {
  await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'Deleted' });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));