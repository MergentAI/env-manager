# Env Manager (easyenvmanager)

A self-hosted environment variable management system designed for teams and developers who need a secure, centralized way to sync `.env` files across projects and environments.

![License](https://img.shields.io/npm/l/easyenvmanager)
![Version](https://img.shields.io/npm/v/easyenvmanager)

## 🌟 Features

*   **Self-Hosted:** Full control over your data. Run it on your own infrastructure (Docker/Coolify).
*   **Secure Storage:** Variables are stored securely on your server.
*   **Team Sync:** Share variables instantly across your team without committing `.env` files to git.
*   **Multi-Environment:** Manage `development`, `staging`, `production`, etc. per project.
*   **CLI Integration:** Sync variables with a single command (`envmanager pull`).
*   **Smart Sync:** Only pulls updates if the server has newer changes (unless forced).
*   **Docker Ready:** Easy deployment with Docker Compose.

---

## 🚀 Quick Start (Self-Hosting)

### Prerequisites
*   Docker & Docker Compose
*   (Optional) Coolify or another PaaS for easy deployment.

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/env-manager.git
    cd env-manager
    ```

2.  **Configure Environment:**
    Copy the example file and set your `ADMIN_SECRET`.
    ```bash
    cp .env.example .env
    # Edit .env and change ADMIN_SECRET to a strong random string
    ```

3.  **Run with Docker Compose:**
    ```bash
    docker-compose up -d
    ```

4.  **Access the Dashboard:**
    Open `http://localhost` (or your configured domain/port).
    *   **Login:** Use the `ADMIN_SECRET` you set in step 2.

---

## 💻 CLI Usage

Install the CLI tool globally via npm:

```bash
npm install -g easyenvmanager
```

### 1. Configuration
Link your local machine to your self-hosted server.

```bash
easyenvmanager config
# Prompts for:
# - Server URL (e.g., http://localhost:3000)
# - Secret Key (Your ADMIN_SECRET)
```

### 2. Initialization
Run this inside your project root to link it to an environment.

```bash
cd my-awesome-project
easyenvmanager init
# Select Project -> Select Environment (e.g., development)
```

### 3. Sync Variables
Pull the latest variables from the server into your local `.env` file.

```bash
easyenvmanager pull
```

**Options:**
*   `--force` (`-f`): Overwrite local changes regardless of timestamps.
    ```bash
    easyenvmanager pull --force
    ```

### 4. Check Status
Check if your local variables are out of date without modifying anything.

```bash
easyenvmanager status
```

---

## 🛠️ Local Development

### Project Structure
This is a monorepo managed with npm workspaces:
*   `packages/server`: Express.js API (Port 3000)
*   `packages/client`: React Dashboard (Vite, Port 5173)
*   `packages/cli`: The `easyenvmanager` CLI tool

### Running Locally

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Development Servers:**
    ```bash
    npm run dev
    # Starts Server, Client, and CLI watch mode in parallel
    ```

3.  **Local Testing:**
    *   Server: `http://localhost:3000`
    *   Client: `http://localhost:5173`

---

## 🐳 Docker Deployment (Advanced)

### Custom Ports
You can customize the ports by editing the root `.env` file:
```bash
CLIENT_PORT=8080
SERVER_PORT=4000
```
Then restart: `docker-compose up -d`.

### Custom API URL (Client)
If your client is on a different domain than your API (e.g., `app.example.com` and `api.example.com`), set `VITE_API_URL` in `.env` before building:
```bash
VITE_API_URL=https://api.example.com
docker-compose up -d --build
```

---

## 📄 License
MIT
