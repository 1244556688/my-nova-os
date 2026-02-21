import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("nova_os.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    name TEXT,
    content TEXT,
    type TEXT,
    parentId INTEGER DEFAULT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/auth/register", (req, res) => {
    const { username, password } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
      const info = stmt.run(username, password);
      res.json({ success: true, userId: info.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Username already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/files/:userId", (req, res) => {
    const files = db.prepare("SELECT * FROM files WHERE userId = ?").all(req.params.userId);
    res.json(files);
  });

  app.post("/api/files", (req, res) => {
    const { userId, name, content, type, parentId } = req.body;
    const stmt = db.prepare("INSERT INTO files (userId, name, content, type, parentId) VALUES (?, ?, ?, ?, ?)");
    const info = stmt.run(userId, name, content, type, parentId);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/files/:id", (req, res) => {
    const { content, name } = req.body;
    const stmt = db.prepare("UPDATE files SET content = ?, name = ? WHERE id = ?");
    stmt.run(content, name, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/files/:id", (req, res) => {
    const stmt = db.prepare("DELETE FROM files WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NovaOS running on http://localhost:${PORT}`);
  });
}

startServer();
