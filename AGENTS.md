# AGENTS.md

This document serves as the primary instruction set for AI agents and developers working in this repository.

## 1. Project Overview & Architecture

**Goal:** A self-hosted environment variable management system.
**Structure:** Monorepo using npm workspaces.

- `packages/server`: Express.js backend that also serves the React frontend.
  - **Storage:** File-based JSON storage in `packages/server/data/<project>/<env>.json`.
  - **Auth:** Simple `x-api-key` header checked against `ADMIN_SECRET` env var.
  - **Port:** Defaults to 3000 (Host/Internal via `SERVER_PORT`).

- `packages/client`: React (Vite) frontend.
  - **UI:** Tailwind CSS, Radix UI.
  - **State:** Local state/Context API.

- `packages/cli`: Node.js CLI tool (`easyenvmanager`).
  - **Commands:** `init`, `status`, `pull`, `config`.

## 2. Docker & Deployment

The system is deployed via a single Docker container.

- **Dockerfile:** Located in root. Multi-stage build for client and server.
- **Orchestration:** `docker-compose.yml`.
- **Configuration:** `SERVER_PORT` (default: 3000), `ADMIN_SECRET` (master key).

## 3. Build, Lint, and Test Commands

Run these commands from the **root directory** to affect all workspaces.

- **Install Dependencies:** `npm ci`
- **Build All:** `npm run build --workspaces`
- **Lint All:** `npm run lint --workspaces`
- **Test All:** `npm test --workspaces`
- **Start Dev Servers:** `npm run dev` (Concurrent client/server)

### Running a Single Test

Use the `--workspace` flag to target a specific package and pass the file path to the test runner.

**Note:** Tests are currently placeholders. When implementing tests, ensure a runner (e.g., Jest, Vitest, or Node native test runner) is configured in the respective `package.json`.

**Example Pattern:**

```bash
# General pattern
npm test --workspace=<workspace-name> -- <path-to-test-file>

# Example (Server - if using a runner like Jest)
npm test --workspace=@env-manager/server -- src/storage.test.ts

# Example (Client - if using Vitest)
npm test --workspace=@env-manager/client -- src/components/Button.test.tsx
```

## 4. Code Style & Conventions

### General

- **Language:** TypeScript (Strict Mode). No `any` unless absolutely necessary.
- **Formatting:** Prettier (2 spaces, semi-colons, single quotes).
- **Linting:** ESLint with standard configuration.

### Imports

Organize imports in the following order:

1.  Node.js built-in modules (`fs`, `path`)
2.  External libraries (`express`, `react`)
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

### Operational Rules

1.  **Context First:** Read `AGENTS.md` and relevant `README.md` files before starting tasks.
2.  **Safety:**
    - **Never** commit secrets or `.env` files.
    - **Never** run destructive commands without user confirmation.
3.  **Pathing:** Always use **absolute paths** when using file tools. Resolve relative paths against the project root `/Users/kaanayden/Documents/GitKraken/env-manager`.
4.  **Verification:**
    - After modifying code, run `npm run build` to check for compilation errors.
    - Run `npm run lint` to ensure code style compliance.
    - If tests exist, run them to verify no regressions.

### Implementation Workflow

1.  **Analyze:** specific file locations and dependencies.
2.  **Plan:** outline changes before editing.
3.  **Execute:** use `edit` or `write` tools.
4.  **Verify:** run build/lint/test commands.

### Scaffolding

- Follow existing folder structures.
- When adding new packages, update the root `package.json` workspaces.
- Ensure `Dockerfile` is updated if new build steps are introduced.

## 6. Project Specific Details

- **Environment Variables:**
  - `ADMIN_SECRET`: Required for all API requests.
  - `SERVER_PORT`: Port for the server (default 3000).
- **Data Storage:**
  - JSON files are stored in `packages/server/data/`.
  - Ensure correct permissions when running in Docker.

## 7. Troubleshooting

- **Module Not Found:** Ensure you have run `npm ci` in the root directory.
- **Build Failures:** Check for TypeScript errors in the specific workspace using `npm run build --workspace=@env-manager/<workspace>`.
- **Docker Issues:** Check logs with `docker-compose logs -f`. Ensure ports are not in use.
