# easyenvmanager

The official CLI tool for **Env Manager** - a self-hosted environment variable management system.

Use this tool to sync `.env` files from your self-hosted Env Manager server directly to your local development environment.

## 📦 Installation

```bash
npm install -g easyenvmanager
```

## 🚀 Usage

### 1. Connect to Server

First, link your local machine to your self-hosted Env Manager server.

```bash
easyenvmanager config
# Prompts for:
# - Server URL (e.g., http://env.yourcompany.com)
# - Secret Key (Your ADMIN_SECRET)
```

### 2. Initialize Project

Run this inside your project root to link it to a specific project and environment.

```bash
cd my-project
easyenvmanager init
# Select Project -> Select Environment (e.g., development)
```

### 3. Sync Variables

Pull the latest variables from the server into your local `.env` file.

```bash
easyenvmanager pull
```

**How it works:**

- **Smart Check:** The CLI compares the _content_ of your local `.env` file with the server version. If they match, no changes are made.
- **Safe Updates:** If your local file is older than the server version, it updates automatically.
- **Conflict Resolution:** If your local file is **newer** and has different content, the CLI will warn you and ask for confirmation before overwriting.
- **Strict Overwrite:** This command performs a strict overwrite. It does **not** merge keys. Local-only keys will be removed to match the server state exactly.

**Options:**

- `--force` (`-f`): Skip all checks and overwrite the local `.env` file immediately.

### 4. Check Status

Check if your local variables are out of date without modifying anything.

```bash
easyenvmanager status
```

## 🔗 Server Setup

This CLI requires a running **Env Manager** server.
To set up your own server using Docker, please refer to the main repository documentation.
