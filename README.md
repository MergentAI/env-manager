# Env Manager (easyenvmanager)

A self-hosted environment variable management system designed for teams and developers who need a secure, centralized way to sync `.env` files across projects and environments.

![License](https://img.shields.io/npm/l/easyenvmanager)
![Version](https://img.shields.io/npm/v/easyenvmanager)

## 🌟 Features

- **Self-Hosted:** Full control over your data. Run it on your own infrastructure (Docker/Coolify).
- **Unified Architecture:** Single Docker container serves both the API and the React Dashboard.
- **Secure Storage:** Variables are stored securely on your server in JSON format.
- **Team Sync:** Share variables instantly across your team without committing `.env` files to git.
- **Multi-Environment:** Manage `development`, `staging`, `production`, etc. per project.
- **CLI Integration:** Sync variables with a single command (`envmanager pull`).
- **Smart Sync:** Only pulls updates if the server has newer changes (unless forced).

---

## 🚀 Deployment (Docker)

The simplest way to run Env Manager is with Docker Compose. This runs the **Production** build where the server hosts the static client files.

### 1. Clone & Configure

```bash
git clone https://github.com/your-username/env-manager.git
cd env-manager
cp .env.example .env
# Edit .env: Set a secure ADMIN_SECRET
```

### 2. Run

```bash
docker-compose up -d
```

### 3. Access

- **Dashboard:** `http://localhost:3000` (Login with your `ADMIN_SECRET`)
- **API Health:** `http://localhost:3000/api`

---

## 💻 CLI Usage

Use the CLI to sync variables to your local machine.

### Installation

**Option 1: Install via npm (Recommended)**
[View on npm](https://www.npmjs.com/package/easyenvmanager)

```bash
npm install -g easyenvmanager
```

**Option 2: Run from Source (For Developers)**
If you are developing the tool locally:

```bash
cd packages/cli && npm link
```

Or link locally from source:

```bash
cd packages/cli && npm link
```

### 1. Configuration

Link your machine to your server.

```bash
easyenvmanager config
# Prompts for:
# - Server URL (e.g., http://localhost:3000)
# - Secret Key (Your ADMIN_SECRET)
```

### 2. Initialization (Per Project)

Run inside your project root.

```bash
easyenvmanager init
# Select Project -> Select Environment (e.g., development)
```

### 3. Sync Variables

Pull latest variables into `.env`.

```bash
easyenvmanager pull
```

**Options:**

- `--force` (`-f`): Overwrite local changes regardless of timestamps.

### 4. Check Status

Check if local variables are out of date.

```bash
easyenvmanager status
```

---

## 🛠️ Local Development

### Project Structure

This is a monorepo managed with npm workspaces:

- `packages/server`: Express.js API (Port 3000). Serves client in prod.
- `packages/client`: React Dashboard (Vite, Port 5173). Proxies `/api` to server in dev.
- `packages/cli`: The `easyenvmanager` CLI tool.

### Running Locally

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Start Development Servers:**

    ```bash
    npm run dev
    # Starts Server (Blue) and Client (Green) in parallel
    ```

3.  **Access:**
    - **Client (Dev):** `http://localhost:5173` (Proxies API calls to 3000)
    - **Server (API):** `http://localhost:3000`

---

## 🐳 Advanced Configuration

### Custom Port

Customize the application port by editing the root `.env` file:

```bash
SERVER_PORT=4000
```

Then restart: `docker-compose up -d`.

### Data Persistence

Data is stored in `packages/server/data`, which is mounted as a volume in `docker-compose.yml`. Ensure this directory is backed up.

---

## 📄 License

MIT
