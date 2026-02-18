# AGENTS.md

This document serves as the primary instruction set for AI agents and developers working in this repository.

## 1. Project Overview & Architecture

**Goal:** A self-hosted environment variable management system.
**Structure:** Monorepo using npm workspaces.

*   `packages/server`: Express.js backend.
    *   **Storage:** File-based JSON storage in `packages/server/data/<project>/<env>.json`.
    *   **Data Structure:**
        ```json
        {
          "lastModified": "ISO-8601-DATE",
          "variables": { "KEY": "VALUE" }
        }
        ```
    *   **Auth:** Simple `x-api-key` header checked against `ADMIN_SECRET` env var.
    *   **Port:** Defaults to 3000.
*   `packages/client`: React (Vite) frontend.
    *   **UI:** Tailwind CSS.
    *   **State:** Local state/Context API.
    *   **Port:** Defaults to 5173.
*   `packages/cli`: Node.js CLI tool.
    *   **Local Config:** `.envmanager.json` in the user's project root.
        *   Stores: `serverUrl`, `project`, `environment`, `secretKey` (optional, or use global), `lastSynced`.
    *   **Commands:**
        *   `envmanager init`: Setup local config (URL, Key, Project, Env).
        *   `envmanager status`: Check if local env is out of sync with server.
        *   `envmanager sync`: Check `lastModified` on server vs local. If server is newer, pull and update `.env`.
        *   `envmanager pull`: Force pull.

## 2. Build, Lint, and Test Commands

Run these commands from the **root directory** to affect all workspaces, or cd into a specific package to run them individually.

*   **Install Dependencies:**
    ```bash
    npm install
    ```

*   **Build All:**
    ```bash
    npm run build --workspaces
    ```

*   **Lint All:**
    ```bash
    npm run lint --workspaces
    ```

*   **Test All:**
    ```bash
    npm test --workspaces
    ```

*   **Run Single Test (Jest/Vitest):**
    To run a specific test file or test case in a specific package:
    ```bash
    # Example for server package
    npm test --workspace=packages/server -- -t 'should validate api key'
    ```

*   **Start Dev Servers:**
    ```bash
    npm run dev --workspaces
    ```

## 3. Code Style & Conventions

### General
*   **Language:** TypeScript (Strict Mode). No `any` unless absolutely necessary and commented.
*   **Formatting:** Prettier default settings (2 spaces, semi-colons, single quotes).
*   **Linting:** ESLint recommended rules.

### Imports
Organize imports in the following order:
1.  Node.js built-in modules (`fs`, `path`, etc.)
2.  External libraries (`express`, `react`, etc.)
3.  Internal modules (relative paths)

```typescript
import path from 'path';
import express from 'express';
import { getProjectData } from './storage';
```

### Naming Conventions
*   **Variables/Functions:** `camelCase` (e.g., `fetchEnvVars`, `projectList`).
*   **Classes/Components:** `PascalCase` (e.g., `ProjectCard`, `StorageManager`).
*   **Constants:** `UPPER_SNAKE_CASE` (e.g., `DEFAULT_PORT`, `API_TIMEOUT`).
*   **Files:**
    *   React Components: `PascalCase.tsx`
    *   Utilities/Logic: `camelCase.ts`

### Error Handling
*   **No Silent Failures:** Always log errors or return meaningful error responses.
*   **Try/Catch:** Use for async operations, especially file I/O and network requests.
*   **HTTP Errors:** Return appropriate status codes (400 for bad input, 401 for auth, 404 for not found, 500 for server error).

### Specific Patterns
*   **Async/Await:** Prefer `async/await` over `.then()/.catch()` chains.
*   **File I/O (Server):** Use `fs/promises` for all file operations. Ensure directory existence before writing.
*   **React:** Functional components with Hooks. avoid class components.

## 4. Agent Guidelines (Cursor/Copilot)
*   **Context:** Always read `AGENTS.md` before starting a task to understand standard commands and structure.
*   **Validation:** Verify changes by running `npm run build` and `npm test` (if applicable) before completing a task.
*   **Scaffolding:** When creating new features, follow the existing folder structure (e.g., separate routes from controllers in server, separate components in client).
