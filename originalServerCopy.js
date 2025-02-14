require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// ✅ Allow both production & development domains
app.use(cors({
  origin: [
    "https://to-dolist.xyz",
    "https://www.to-dolist.xyz",
    "https://api.to-dolist.xyz",
    "http://localhost:3000"  // ✅ Added for local testing
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }, // ✅ SSL enabled for secure connection
});

// ✅ Initialize DB if tables don't exist
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending'
      );
    `);
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}
initializeDatabase();

// ✅ Health Check Route
app.get("/", (req, res) => res.send("API is running"));

// ✅ Fetch all projects
app.get("/projects", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// ✅ Create a new project
app.post("/projects", async (req, res) => {
  try {
    const { name } = req.body;
    const newProject = await pool.query(
      "INSERT INTO projects (id, name) VALUES ($1, $2) RETURNING *",
      [uuidv4(), name]
    );
    res.status(201).json(newProject.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

// ✅ Fetch all tasks for a project
app.get("/projects/:projectId/tasks", async (req, res) => {
  try {
    const { projectId } = req.params;

    const projectCheck = await pool.query("SELECT * FROM projects WHERE id = $1", [projectId]);
    if (projectCheck.rows.length === 0) return res.status(404).json({ error: "Project not found" });

    const tasks = await pool.query("SELECT * FROM tasks WHERE project_id = $1", [projectId]);

    const formattedTasks = tasks.rows.map((task) => ({
      ...task,
      done: task.status === "Completed",
    }));

    res.json(formattedTasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ✅ Create a new task for a project
app.post("/projects/:projectId/tasks", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, status } = req.body;

    if (!name || name.trim() === "") return res.status(400).json({ error: "Task name is required" });

    const newTask = await pool.query(
      "INSERT INTO tasks (id, project_id, name, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [uuidv4(), projectId, name, status || "Pending"]
    );
    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

// ✅ Fetch all tasks (Removed Duplicate)
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await pool.query("SELECT * FROM tasks");
    res.json(tasks.rows);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ✅ Start the server
app.listen(5000, '0.0.0.0', () => {
  console.log("Server running on port 5000 (IPv4 and IPv6)");
});