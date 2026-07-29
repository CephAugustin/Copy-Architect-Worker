import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as serverGemini from "./serverGemini";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API routes FIRST
  app.post("/api/gemini", async (req, res) => {
    try {
      const { action, args } = req.body;
      if (!action || !args || !Array.isArray(args)) {
        return res.status(400).json({ error: "Invalid request payload. Must include action and args." });
      }

      // Check if action is exported in serverGemini
      const fn = (serverGemini as any)[action];
      if (typeof fn !== 'function') {
        return res.status(444).json({ error: `Action '${action}' not found on server.` });
      }

      const result = await fn(...args);
      res.json(result);
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.status(500).json({ error: err?.message || "Internal Server Error in Gemini handler" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
