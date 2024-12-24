import express from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", authenticateToken, async (req, res) => {
  const { subject, roll_no, t1, t2, ap, tutorial, finals } = req.body;
  const t_total = (parseFloat(t1) + parseFloat(t2)) / 2;

  try {
    await db.run(
      `INSERT INTO grades (subject, roll_no, t1, t2, t_total, ap, tutorial, finals, teacher_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject, roll_no, t1, t2, t_total, ap, tutorial, finals, req.user.id]
    );
    res.status(201).json({ message: "Grades added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/upload", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const rows = data.slice(1).filter((row) => row.length > 0);

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
          req.user.id,
        ]
      );
    }

    res.json({
      message: "Grades uploaded successfully",
      count: rows.length,
    });
  } catch (error) {
    console.error("Excel upload error:", error);
    res.status(500).json({ error: "Error processing Excel file" });
  }
});

router.get("/cgpa", async (req, res) => {
  try {
    console.log("hello");
    // Fetch all grades from the database
    const grades = await db.all("SELECT roll_no, subject, t1, t2, t_total, ap, tutorial, finals FROM grades");
    console.log(grades);
    // Define subject credit weights
    const subjectCredits = {
      WAD: 3,
      DS: 3,
      SPC: 3,
      MFCS: 4,
      DBMS: 4,
    };

    // Transform grades into a structure suitable for calculating CGPAs
    const studentData = {};

    grades.forEach((grade) => {
      const { roll_no, subject, t1, t2, t_total, ap, tutorial, finals } = grade;

    
      if (!subjectCredits[subject]) return;

      // Ensure each student has an entry
      if (!studentData[roll_no]) {
        studentData[roll_no] = { subjects: {}, totalWeight: 0, weightedCgpaSum: 0 };
      }

      
      const totalScore = (t_total + ap + tutorial) / (40 / 50) + finals / (60 / 50);

      
      const cgpa =
        totalScore >= 91
          ? 10
          : totalScore >= 81
          ? 9
          : totalScore >= 71
          ? 8
          : totalScore >= 61
          ? 7
          : totalScore >= 56
          ? 6
          : totalScore >= 50
          ? 5
          : null; // Below 50 doesn't contribute to CGPA

      // Store subject CGPA
      studentData[roll_no].subjects[subject] = cgpa;

      // Accumulate weighted CGPA
      if (cgpa !== null) {
        const weight = subjectCredits[subject];
        studentData[roll_no].totalWeight += weight;
        studentData[roll_no].weightedCgpaSum += cgpa * weight;
      }
    });

    // Final transformation to compute weighted average CGPA
    const results = Object.entries(studentData).map(([roll_no, data]) => ({
      roll_no,
      ...data.subjects, // Spread subject-wise CGPAs
      overall_cgpa: data.totalWeight > 0 ? (data.weightedCgpaSum / data.totalWeight).toFixed(2) : "N/A",
    }));

    // Return the transformed data
    console.log(results);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:subject", authenticateToken, async (req, res) => {
  try {
    console.log("hello ths is subject");
    const grades = await db.all("SELECT * FROM grades WHERE subject = ? AND teacher_id = ?", [req.params.subject, req.user.id]);
    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await db.run("DELETE FROM grades WHERE id = ? AND teacher_id = ?", [req.params.id, req.user.id]);
    res.json({ message: "Grade deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
