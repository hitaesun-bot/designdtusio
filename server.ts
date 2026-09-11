import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "DSII TEAM TRACKER", time: new Date().toISOString() });
  });

  // Client Firebase configuration delivery endpoint
  app.get("/api/config", (_req, res) => {
    const apiKey = process.env.FIREBASE_API_KEY || "";
    const authDomain = process.env.FIREBASE_AUTH_DOMAIN || "";
    const projectId = process.env.FIREBASE_PROJECT_ID || "";
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || "";
    const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || "";
    const appId = process.env.FIREBASE_APP_ID || "";

    const isConfigured = Boolean(apiKey && projectId);

    res.json({
      isConfigured,
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId
    });
  });

  // Server-side user role verification using PROFESSOR_EMAILS environment variable
  app.post("/api/auth/verify-role", (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "이메일이 제공되지 않았습니다." });
      }

      const rawEmails = process.env.PROFESSOR_EMAILS || "hitaesun@gmail.com,professor.kim@university.ac.kr";
      const professorList = rawEmails
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.length > 0);

      const normalizedEmail = email.trim().toLowerCase();
      const isProfessor = professorList.includes(normalizedEmail);

      return res.json({
        email: normalizedEmail,
        isProfessor,
        role: isProfessor ? "professor" : "student"
      });
    } catch (error) {
      console.error("Role verification error:", error);
      return res.status(500).json({ error: "역할 검증 중 서버 오류가 발생했습니다." });
    }
  });

  // Serve static assets from public (e.g., og-image.png, og-image.svg)
  app.use(express.static(path.join(process.cwd(), "public")));

  // Vite middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DSII TEAM TRACKER] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
