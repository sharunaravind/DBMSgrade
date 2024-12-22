import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password, subject } = req.body;
  
  try {
    // First check if username already exists
    const existingUser = await db.get('SELECT username FROM teachers WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username already exists. Please choose a different username.' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      'INSERT INTO teachers (username, password, subject) VALUES (?, ?, ?)',
      [username, hashedPassword, subject]
    );
    res.status(201).json({ message: 'Teacher registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'An error occurred during registration. Please try again.' 
    });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const teacher = await db.get('SELECT * FROM teachers WHERE username = ?', [username]);
    if (!teacher) {
      return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, teacher.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = generateToken({ id: teacher.id, subject: teacher.subject });
    res.json({ token, subject: teacher.subject });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'An error occurred during login. Please try again.' 
    });
  }
});

export default router;