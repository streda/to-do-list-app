require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());


// Allow requests from Amplify frontend
app.use(cors({
  origin: ["https://main.d8cefkg5o9i5z.amplifyapp.com", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }, // Add this line
});

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

app.get("/", (req, res) => res.send("API is running"));

app.get("/projects", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

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

app.get("/projects/:projectId/tasks", async (req, res) => {
  try {
    const { projectId } = req.params;

    // ✅ Ensure the project exists
    const projectCheck = await pool.query("SELECT * FROM projects WHERE id = $1", [projectId]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    // ✅ Fetch tasks associated with the project
    const tasks = await pool.query("SELECT * FROM tasks WHERE project_id = $1", [projectId]);

    // ✅ Transform the `status` field to a `done` boolean
    const formattedTasks = tasks.rows.map((task) => ({
      ...task,
      done: task.status === "Completed", // ✅ Convert "Completed" → true, "Pending" → false
    }));

    res.json(formattedTasks); // ✅ Return updated task objects
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

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

app.put("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status, done } = req.body; // Accept `done`

        console.log("Incoming update request for Task ID:", id);
        console.log("Request Body:", req.body);

        // Ensure at least one field is provided for update
        if (!name && !status && done === undefined) {
            return res.status(400).json({ error: "At least one field (name, status, or done) must be provided." });
        }

        // Check if task exists
        const taskCheck = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Build dynamic update query
        const fields = [];
        const values = [];
        let query = "UPDATE tasks SET ";

        if (name) {
            fields.push("name = $" + (values.length + 1));
            values.push(name);
        }
        if (status) {
            fields.push("status = $" + (values.length + 1));
            values.push(status);
        }
        if (done !== undefined) { // ✅ Add done field update
            fields.push("done = $" + (values.length + 1));
            values.push(done);
        }

        query += fields.join(", ") + " WHERE id = $" + (values.length + 1) + " RETURNING *";
        values.push(id);

        console.log("Executing Query:", query, "With Values:", values);

        const updatedTask = await pool.query(query, values);

        if (updatedTask.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        console.log("Updated Task:", updatedTask.rows[0]);
        res.json(updatedTask.rows[0]); // ✅ Send back the updated task
    } catch (err) {
        console.error("❌ Error updating task:", err);
        res.status(500).json({ error: "Failed to update task" });
    }
});


app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);

    if (deletedTask.rows.length === 0) {
      console.log(`❌ Task not found for deletion: ${id}`);
      return res.status(404).json({ error: "Task not found" });
    }

    console.log(`✅ Task deleted: ${id}`);
    res.status(200).json({ message: `Task ${id} deleted successfully` });
  } catch (err) {
    console.error(`⚠️ Error deleting task: ${err.message}`);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

app.delete("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const projectCheck = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);

    if (projectCheck.rows.length === 0) {
      console.log(`❌ Project not found for deletion: ${id}`);
      return res.status(404).json({ error: "Project not found" });
    }

    await pool.query("DELETE FROM projects WHERE id = $1", [id]);
    console.log(`✅ Project deleted: ${id}`);
    res.status(200).json({ message: `Project ${id} deleted successfully` });
  } catch (err) {
    console.error(`⚠️ Error deleting project: ${err.message}`);
    res.status(500).json({ error: "Failed to delete project" });
  }
});


app.listen(5000, '0.0.0.0', () => {
  console.log("Server running on port 5000 (IPv4 and IPv6)");
});