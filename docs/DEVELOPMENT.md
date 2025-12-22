# Development Guide

This guide explains how to work with the **Minions AI Builder** monorepo, run services efficiently, and ensure code quality.

## 🏗 Architecture Overview

We use a **Monorepo** structure managed by `npm workspaces`.

| Workspace | Path | Purpose | Port |
|-----------|------|---------|------|
| **@minions/web** | `apps/web` | The Frontend (Nuxt 3) | `3000` |
| **@minions/api** | `apps/api` | The Backend (Nitro) | `3001` |
| **@minions/shared** | `packages/shared` | Shared Types | - |

### Why Monorepo?
You might ask: *"Why not separate projects?"*
1.  **Shared Types**: We share `PageConfig`, `ProjectConfig`, and other types between Frontend and Backend in real-time. If they were separate repos, you'd need to publish a private npm package every time you changed a type.
2.  **Atomic Commits**: You can add a new feature (e.g., "Dark Mode") that requires changes to both the API (generator) and Web (UI) in a single commit.
3.  **Unified Tooling**: Linting, formatting, and installing dependencies happen once.

---

## 🚀 Running the Project

### Option A: Run Everything (Recommended)
To start both the Frontend and Backend simultaneously:
```bash
npm run dev
```
> Note: This relies on your terminal supporting concurrent output or you can use `npm-run-all`. We have set up individual scripts for clarity.

### Option B: Run Services Separately
If you want to debug specific services or view cleaner logs, open two terminal windows:

**Terminal 1 (Backend/API)**
```bash
npm run dev:api
# OR
npm run dev --workspace=@minions/api
```
*Runs on http://localhost:3001*

**Terminal 2 (Frontend/Web)**
```bash
npm run dev:web
# OR
npm run dev --workspace=@minions/web
```
*Runs on http://localhost:3000*

> The Web app is configured to proxy requests from `/api/**` to `localhost:3001`, so they work seamlessly together.

---

## 🧪 Testing

We use **Vitest** for unit testing, primarily for the API domain logic.

### Running Tests
To run all tests across the monorepo:
```bash
npm run test
```

To run tests for the API only (faster loop):
```bash
npm run test --workspace=@minions/api
```

### Writing Tests
Place test files next to the logic they test, ending in `.test.ts`.
Example: `apps/api/server/domain/generator/normalize.test.ts`.

---

## 🚢 Deployment

Even though this is a monorepo, **Frontend and Backend are deployed as separate services**.

### Vercel (recommended)
Vercel supports monorepos out of the box.
1.  **Import Project**: Select the git repo.
2.  **Configure Web**:
    - Root Directory: `apps/web`
    - Framework: Nuxt
3.  **Configure API**:
    - Add New Project (from same repo)
    - Root Directory: `apps/api`
    - Framework: Nitro (or Other)

### Docker / Manual
You can build them independently:

**Build Web:**
```bash
npm run build --workspace=@minions/web
# Output: apps/web/.output
```

**Build API:**
```bash
npm run build --workspace=@minions/api
# Output: apps/api/.output
```
