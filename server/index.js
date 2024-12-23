import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import gradesRoutes from "./routes/grades.js";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// Routes
app.use("/api", authRoutes);
app.use("/api/grades", gradesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Oops something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
