import sqlite3 from "sqlite3";
import { promisify } from "util";
import fs from "fs";

const DB_FILE = "grades.db";
const RESET_DB = false;

// Delete corrupted database if it exists
if (RESET_DB && fs.existsSync(DB_FILE)) {
  fs.unlinkSync(DB_FILE);
}

// Create a new database instance
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error("Database creation error:", err);
    process.exit(1);
  }
  console.log("Connected to SQLite database");
});

// Promisify database methods
const run = promisify(db.run.bind(db));
const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));

// Initialize database tables
// const initDb = async () => {
//   try {
//     await run(`
//       CREATE TABLE IF NOT EXISTS teachers (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         username TEXT UNIQUE NOT NULL,
//         password TEXT NOT NULL,
//         subject TEXT NOT NULL,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     await run(`
//       CREATE TABLE IF NOT EXISTS grades (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         subject TEXT NOT NULL,
//         roll_no TEXT NOT NULL UNIQUE,
//         t1 REAL,
//         t2 REAL,
//         t_total REAL,
//         ap REAL,
//         tutorial REAL,
//         finals REAL,
//         teacher_id INTEGER,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY(teacher_id) REFERENCES teachers(id)
//       )
//     `);

//     console.log("Database tables initialized successfully");
//   } catch (error) {
//     console.error("Database initialization error:", error);
//     process.exit(1);
//   }
// };

const initDb = async () => {
  try {
    // Create teachers table
    await run(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        subject TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create students table
    await run(`
      CREATE TABLE IF NOT EXISTS students (
        roll_no TEXT PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);

    // Create grades table
    await run(`
      CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        roll_no TEXT NOT NULL,
        t1 REAL,
        t2 REAL,
        t_total REAL,
        ap REAL,
        tutorial REAL,
        finals REAL,
        teacher_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(teacher_id) REFERENCES teachers(id),
        FOREIGN KEY(roll_no) REFERENCES students(roll_no)
      )
    `);

    console.log("Database tables initialized successfully");

    // Insert hardcoded student data
    const students = [
      ["24MX101", "ABHISHEK K A"],
      ["24MX102", "ABINESH R"],
      ["24MX103", "ASHIKA S S"],
      ["24MX104", "ATHI SANKAR S"],
      ["24MX105", "BOOMIKA D M"],
      ["24MX106", "INDHUMATHI S"],
      ["24MX107", "JEYARAM A"],
      ["24MX108", "KALAIVANAN R"],
      ["24MX109", "KANNAN M"],
      ["24MX110", "KARNAN S"],
      ["24MX111", "KARTHIKEYAN R"],
      ["24MX112", "MANIKANDAN K S"],
      ["24MX113", "MANISHANKAR V"],
      ["24MX114", "MOHAMED ALI AKRAM S M"],
      ["24MX115", "MOHAN PRASATH S"],
      ["24MX116", "MYTHILY N"],
      ["24MX117", "N KEERTHANA"],
      ["24MX118", "NIRESH KUMAR M"],
      ["24MX119", "OVIASHRI V"],
      ["24MX120", "PREETHINTHRAN S"],
      ["24MX121", "RAMYA R"],
      ["24MX122", "RISHI SUNDARESAN"],
      ["24MX123", "SAMYUKTHA P"],
      ["24MX124", "SEKAR C"],
      ["24MX125", "SHARUN A"],
      ["24MX126", "VIGNESH A"],
      ["24MX127", "VIJAY SHARVESH V"],
      ["24MX128", "VINOTHA S"],
      ["24MX129", "DHURAIRAAJ I"],
      ["24MX201", "ABISHEK IMMANUEL R"],
      ["24MX202", "AKASH B"],
      ["24MX203", "AKSHAYA M"],
      ["24MX204", "ANTONY VIVIN S"],
      ["24MX205", "BOOPATHIRAJAN M"],
      ["24MX206", "DHARSINI B"],
      ["24MX207", "GURUPRASAD S"],
      ["24MX208", "HARISH V"],
      ["24MX209", "JANAKHAN K"],
      ["24MX210", "KIRUTHIKA S"],
      ["24MX211", "KISHOR M"],
      ["24MX212", "KISHORE B"],
      ["24MX213", "MAHALAKSHMI THANGA MONICA P"],
      ["24MX214", "MIDHUNA G T"],
      ["24MX215", "MITHUN KUMAR V"],
      ["24MX216", "MOHAMED RIYAS S"],
      ["24MX217", "MOKESH C"],
      ["24MX218", "NAVYA M"],
      ["24MX219", "NITHESH S"],
      ["24MX220", "NITIN SANKAR A"],
      ["24MX221", "PAVITHRA P"],
      ["24MX222", "PONMUTHU S"],
      ["24MX223", "PRAVEEN R"],
      ["24MX224", "PRISHA MV"],
      ["24MX225", "RAJESH N"],
      ["24MX226", "RANGESH S"],
      ["24MX227", "SANJANA DEVI M"],
      ["24MX228", "SANTHIYA G"],
      ["24MX229", "SUJITA S D"],
      ["24MX230", "VENISHA M"],
      ["24MX301", "AADHAVUN R B"],
      ["24MX302", "ARANGANATHAN R N"],
      ["24MX303", "ARCHANA S"],
      ["24MX304", "ASWINTH G"],
      ["24MX305", "BALAJI V"],
      ["24MX306", "BALASURYA P"],
      ["24MX307", "BEJOY J B T"],
      ["24MX308", "BHOOMIKA C"],
      ["24MX309", "DEVIN PRANESH T"],
      ["24MX310", "DHARSHINI V"],
      ["24MX311", "ENIYA A"],
      ["24MX312", "ESAKKI PANDI V"],
      ["24MX313", "GOBIKRISHNAN A"],
      ["24MX314", "GOKULNATH S"],
      ["24MX315", "HAAREEZ AHMED A"],
      ["24MX316", "HAREESH R P"],
      ["24MX317", "INDHUJAA S"],
      ["24MX318", "JANANI M"],
      ["24MX319", "JANANI M"],
      ["24MX320", "JAWAHAR PAISAL P"],
      ["24MX321", "JEFFRY PATRICK J"],
      ["24MX322", "JOEL A"],
      ["24MX323", "KARAN K P"],
      ["24MX324", "KARTHICK B"],
      ["24MX325", "KRIPESH K"],
      ["24MX326", "KRISHNA KUMAAR V"],
      ["24MX327", "LINGESHWARI M"],
      ["24MX328", "LOKESH KANNA A K"],
      ["24MX329", "MIQDAD SAIF N"],
      ["24MX330", "MOHAMED SAMI B"],
      ["24MX331", "NIVETHITHAA S"],
      ["24MX332", "POOVIZHI D"],
      ["24MX333", "PRAVEEN S"],
      ["24MX334", "PRAVEEN V"],
      ["24MX335", "PRAVEEN KUMAR S"],
      ["24MX336", "PUGAL VANAN K"],
      ["24MX337", "RESHMIKA C"],
      ["24MX338", "ROGITH KRISHNA M"],
      ["24MX339", "SABARISH R"],
      ["24MX340", "SANJAY G"],
      ["24MX341", "SANJAY P"],
      ["24MX342", "SANMUGA PRIYAN R S"],
      ["24MX343", "SARANYA A"],
      ["24MX344", "SARASWATHY M"],
      ["24MX345", "SATHIYA PRIYA P"],
      ["24MX346", "SHUKI R"],
      ["24MX347", "SHYAM SUNDAR S"],
      ["24MX348", "SOWMYA S"],
      ["24MX349", "SOWNDARYA M"],
      ["24MX350", "SRIKANTH S"],
      ["24MX351", "SRIMAAN S S"],
      ["24MX352", "SRIRAGUL B"],
      ["24MX353", "SRIVIDHYA V"],
      ["24MX354", "SUDHARSAN B"],
      ["24MX355", "SWETHA R"],
      ["24MX356", "TILAKARAAJ D"],
      ["24MX357", "VARSHETHAJ"],
      ["24MX358", "VENKATESAN V"],
      ["24MX359", "VIJAY D"],
      ["24MX360", "YUVAN RAAJU R"]
    ];
    

    // Insert students into the database
    for (const student of students) {
      await run(`
        INSERT OR IGNORE INTO students (roll_no, name)
        VALUES (?, ?)
      `, student);
    }

    console.log("Hardcoded student data inserted successfully");

  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
  }
};


// Initialize the database
initDb();

// Add error handling for database operations
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err);
    } else {
      console.log("Database connection closed");
    }
    process.exit(err ? 1 : 0);
  });
});

export default {
  run,
  get,
  all,
};
