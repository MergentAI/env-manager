import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import {
  getProjectEnv,
  saveProjectEnv,
  listProjects,
  listEnvironments,
  deleteProjectData,
} from "./storage";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || "changeme";

if (ADMIN_SECRET === "changeme") {
  console.warn(
    '⚠️  WARNING: ADMIN_SECRET is set to default "changeme". Please set a secure secret in your environment.',
  );
}

app.use(
  cors({
    origin: true, // Reflect request origin
    credentials: true, // Allow cookies
  }),
);
app.use(express.json());
app.use(cookieParser());

// Auth Middleware
const authMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const apiKeyHeader = req.headers["x-api-key"];
  const apiKeyCookie = req.cookies?.auth_token;

  const apiKey = apiKeyHeader || apiKeyCookie;

  if (!apiKey || apiKey !== ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

const isValidName = (name: string) => /^[a-zA-Z0-9_-]+$/.test(name);

// Health Check / API Root
app.get("/api", (req, res) => {
  res.json({
    message: "Env Manager API is running",
    version: "1.0.0",
    status: "ok",
  });
});

// Login Endpoint
app.post("/api/login", (req, res) => {
  const { apiKey } = req.body;

  if (apiKey === ADMIN_SECRET) {
    res.cookie("auth_token", apiKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Use lax for development ease, consider strict for prod
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return res.json({ success: true });
  }

  return res.status(401).json({ error: "Invalid API Key" });
});

// Logout Endpoint
app.post("/api/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ success: true });
});

// List Projects
app.get("/api/projects", authMiddleware, async (req, res) => {
  try {
    const projects = await listProjects();
    res.json(projects);
  } catch (error) {
    console.error("Error listing projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// List Environments for a Project
app.get("/api/projects/:project/envs", authMiddleware, async (req, res) => {
  try {
    const { project } = req.params;

    if (!isValidName(project)) {
      return res.status(400).json({ error: "Invalid project name" });
    }

    const envs = await listEnvironments(project);
    res.json(envs);
  } catch (error) {
    console.error("Error listing environments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Environment Variables (and metadata)
app.get("/api/projects/:project/env/:env", authMiddleware, async (req, res) => {
  try {
    const { project, env } = req.params;

    if (!isValidName(project) || !isValidName(env)) {
      return res
        .status(400)
        .json({ error: "Invalid project or environment name" });
    }

    const data = await getProjectEnv(project, env);

    if (!data) {
      return res.status(404).json({ error: "Environment not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error getting environment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Environment Variables
app.post(
  "/api/projects/:project/env/:env",
  authMiddleware,
  async (req, res) => {
    try {
      const { project, env } = req.params;

      if (!isValidName(project) || !isValidName(env)) {
        return res
          .status(400)
          .json({ error: "Invalid project or environment name" });
      }

      const { variables } = req.body;

      if (!variables || typeof variables !== "object") {
        return res.status(400).json({ error: "Variables object is required" });
      }

      const data = await saveProjectEnv(project, env, variables);
      res.json(data);
    } catch (error) {
      console.error("Error saving environment:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

// Delete Project
app.delete("/api/projects/:project", authMiddleware, async (req, res) => {
  try {
    const { project } = req.params;

    if (!isValidName(project)) {
      return res.status(400).json({ error: "Invalid project name" });
    }

    await deleteProjectData(project);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Check for Updates (HEAD request or GET with check query)
// Using GET /api/projects/:project/env/:env/status for simplicity in CLI
app.get(
  "/api/projects/:project/env/:env/status",
  authMiddleware,
  async (req, res) => {
    try {
      const { project, env } = req.params;

      if (!isValidName(project) || !isValidName(env)) {
        return res
          .status(400)
          .json({ error: "Invalid project or environment name" });
      }

      const data = await getProjectEnv(project, env);

      if (!data) {
        return res.status(404).json({ error: "Environment not found" });
      }

      res.json({ lastModified: data.lastModified });
    } catch (error) {
      console.error("Error checking status:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

// Serve Static Assets
app.use(express.static(path.join(__dirname, "../../client/dist")));

// SPA Fallback - Serve index.html for any unknown route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
