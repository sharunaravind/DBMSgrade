import express from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authenticateToken, async (req, res) => {
  const { subject, roll_no, t1, t2, ap, tutorial, finals } = req.body;
  const t_total = (parseFloat(t1) + parseFloat(t2)) / 2;

  try {
    await db.run(
      `INSERT INTO grades (subject, roll_no, t1, t2, t_total, ap, tutorial, finals, teacher_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject, roll_no, t1, t2, t_total, ap, tutorial, finals, req.user.id]
    );
    res.status(201).json({ message: 'Grades added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Skip the header row and filter out any empty rows
    const rows = data.slice(1).filter(row => row.length > 0);
    
    for (const row of rows) {
      const [roll_no, t1, t2, ap, tutorial, finals] = row;
      const t_total = (parseFloat(t1) + parseFloat(t2)) / 2;
      
      await db.run(
        `INSERT INTO grades (subject, roll_no, t1, t2, t_total, ap, tutorial, finals, teacher_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.subject,
          roll_no.toString(),
          parseFloat(t1),
          parseFloat(t2),
          t_total,
          parseFloat(ap),
          parseFloat(tutorial),
          parseFloat(finals),
          req.user.id
        ]
      );
    }

    res.json({ 
      message: 'Grades uploaded successfully',
      count: rows.length
    });
  } catch (error) {
    console.error('Excel upload error:', error);
    res.status(500).json({ error: 'Error processing Excel file' });
  }
});

router.get('/:subject', authenticateToken, async (req, res) => {
  try {
    const grades = await db.all(
      'SELECT * FROM grades WHERE subject = ? AND teacher_id = ?',
      [req.params.subject, req.user.id]
    );
    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.run(
      'DELETE FROM grades WHERE id = ? AND teacher_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;