# AGENTS.md

This document serves as the primary instruction set for AI agents and developers working in this repository.

## 1. Project Overview & Architecture

**Goal:** A self-hosted environment variable management system.
**Structure:** Monorepo using npm workspaces.

- `packages/server`: Express.js backend that also serves the React frontend.
  - **Storage:** File-based JSON storage in `packages/server/data/<project>/<env>.json`.
  - **Data Structure:**
    ```json
    {
      "lastModified": "ISO-8601-DATE",
      "variables": { "KEY": "VALUE" }
    }
    ```
  - **Auth:** Simple `x-api-key` header checked against `ADMIN_SECRET` env var.
  - **Port:** Defaults to 3000 (Host/Internal via `SERVER_PORT`).
  - **Static Serving:** Serves built client files from `packages/client/dist`.
  - **Security:** Path traversal protection on project/env names.
- `packages/client`: React (Vite) frontend.
  - **UI:** Tailwind CSS, Radix UI.
  - **State:** Local state/Context API.
  - **Build:** Output to `dist`, served by server.
- `packages/cli`: Node.js CLI tool (`easyenvmanager`).
  - **Commands:** `init`, `status`, `pull`, `config`.

## 2. Docker & Deployment

The system is deployed via a single Docker container.

- **Dockerfile:** Located in root. Multi-stage build for client and server.
- **Orchestration:** `docker-compose.yml`.
- **Configuration:**
  - `SERVER_PORT`: Port for the application (default: 3000).
  - `ADMIN_SECRET`: The master key for authentication.

## 3. Build, Lint, and Test Commands

Run these commands from the **root directory** to affect all workspaces, or cd into a specific package to run them individually.

- **Install Dependencies:**

  ```bash
  npm ci
  ```

- **Build All:**

  ```bash
  npm run build --workspaces
  ```

- **Lint All:**

  ```bash
  npm run lint --workspaces
  ```

- **Test All:**

  ```bash
  npm test --workspaces
  ```

- **Start Dev Servers:**
  ```bash
  npm run dev --workspaces
  ```

### Running a Single Test

If using a test runner like Jest/Vitest (not currently set up but recommended):

```bash
# Example for server tests
npm test --workspace=@env-manager/server -- src/storage.test.ts
```

## 4. Code Style & Conventions

### General

- **Language:** TypeScript (Strict Mode). No `any` unless absolutely necessary.
- **Formatting:** Prettier (2 spaces, semi-colons, single quotes).
- **Linting:** ESLint.

### Imports

Organize imports in the following order:

1.  Node.js built-in modules (`fs`, `path`, etc.)
2.  External libraries (`express`, `react`, etc.)
3.  Internal modules (relative paths)

```typescript
import path from "path";
import express from "express";
import { getProjectData } from "./storage";
```

### Naming Conventions

- **Variables/Functions:** `camelCase` (e.g., `fetchEnvVars`, `projectList`).
- **Classes/Components:** `PascalCase` (e.g., `ProjectCard`, `StorageManager`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `DEFAULT_PORT`, `API_TIMEOUT`).
- **Files:**
  - React Components: `PascalCase.tsx`
  - Utilities/Logic: `camelCase.ts`

### Error Handling

- **No Silent Failures:** Always log errors or return meaningful error responses.
- **Try/Catch:** Use for async operations.
- **HTTP Errors:** Return appropriate status codes (400, 401, 404, 500).

### React Best Practices

- **Components:** Functional components with Hooks.
- **State:** Use `useState` for local UI state, Context for global app state.
- **Effects:** Use `useEffect` sparingly and correctly manage dependencies.

## 5. Agent Guidelines

- **Context:** Read `AGENTS.md` before starting tasks.
- **Validation:** Run `npm run build` to verify changes.
- **Scaffolding:** Follow existing folder structures.
- **Docker:** When modifying `Dockerfile`, ensure multi-stage build efficiency.
