import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { getProjectEnv, saveProjectEnv, listProjects, listEnvironments } from './storage';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'changeme';

if (ADMIN_SECRET === 'changeme') {
  console.warn('⚠️  WARNING: ADMIN_SECRET is set to default "changeme". Please set a secure secret in your environment.');
}

app.use(cors({
  origin: true, // Reflect request origin
  credentials: true // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());

// Auth Middleware
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKeyHeader = req.headers['x-api-key'];
  const apiKeyCookie = req.cookies?.auth_token;
  
  const apiKey = apiKeyHeader || apiKeyCookie;

  if (!apiKey || apiKey !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.get('/', (req, res) => {
  res.send('Env Manager API is running');
});

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { apiKey } = req.body;
  
  if (apiKey === ADMIN_SECRET) {
    res.cookie('auth_token', apiKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Use lax for development ease, consider strict for prod
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    return res.json({ success: true });
  }
  
  return res.status(401).json({ error: 'Invalid API Key' });
});

// Logout Endpoint
app.post('/api/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

// List Projects
app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await listProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List Environments for a Project
app.get('/api/projects/:project/envs', authMiddleware, async (req, res) => {
  try {
    const { project } = req.params;
    const envs = await listEnvironments(project);
    res.json(envs);
  } catch (error) {
    console.error('Error listing environments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get Environment Variables (and metadata)
app.get('/api/projects/:project/env/:env', authMiddleware, async (req, res) => {
  try {
    const { project, env } = req.params;
    const data = await getProjectEnv(project, env);
    
    if (!data) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error getting environment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update Environment Variables
app.post('/api/projects/:project/env/:env', authMiddleware, async (req, res) => {
  try {
    const { project, env } = req.params;
    const { variables } = req.body;
    
    if (!variables || typeof variables !== 'object') {
      return res.status(400).json({ error: 'Variables object is required' });
    }
    
    const data = await saveProjectEnv(project, env, variables);
    res.json(data);
  } catch (error) {
    console.error('Error saving environment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Check for Updates (HEAD request or GET with check query)
// Using GET /api/projects/:project/env/:env/status for simplicity in CLI
app.get('/api/projects/:project/env/:env/status', authMiddleware, async (req, res) => {
  try {
    const { project, env } = req.params;
    const data = await getProjectEnv(project, env);
    
    if (!data) {
      return res.status(404).json({ error: 'Environment not found' });
    }
    
    res.json({ lastModified: data.lastModified });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
