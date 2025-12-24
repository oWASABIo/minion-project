# 🚀 Minions Deployment Guide

This project uses a **Monorepo** structure. We deploy the two parts separately using the optimal Cloudflare service for each:

1.  **Frontend (`apps/web`)** -> **Cloudflare Pages** (Best for Nuxt/SSR & Git Automation)
2.  **Backend (`apps/api`)** -> **Cloudflare Workers** (Best for API/Nitro & Low Latency)

---

## ⚡ Quick Cheat Sheet

| Component    | Service            | Method                   | Output Dir       | Main Command                          |
| :----------- | :----------------- | :----------------------- | :--------------- | :------------------------------------ |
| **Frontend** | Cloudflare Pages   | **Git Push** (Automated) | `dist`           | `npm run build`                       |
| **Backend**  | Cloudflare Workers | **CLI** (Manual)         | `.output/server` | `npm run build:cf && wrangler deploy` |

---

## 🏗 Phase 1: Deploy Backend (API)

Create the API first so we can get the URL to configure the Frontend.

### 1. Build & Deploy

Run these commands in your terminal:

```bash
cd apps/api
# 1. Clean old builds
rm -rf .output .nitro node_modules && npm install

# 2. Build for Cloudflare Workers
npm run build:cf

# 3. Deploy to Production
wrangler deploy --env production
```

### 2. Configure Secrets

Go to **Cloudflare Dashboard** > **Workers** > `minion-api` > **Settings** > **Variables** and add:

- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `SUPABASE_URL`: Your Supabase Project URL.
- `SUPABASE_KEY`: Your Supabase Anon/Service Key.

### 3. Save the URL

Copy the **Worker URL** (e.g., `https://minion-api.your-subdomain.workers.dev`). You will need this for Phase 2.

---

## 🎨 Phase 2: Deploy Frontend (Web)

We recommend using **Cloudflare Pages Git Integration** for automatic builds.

### 1. Connect to Git

1.  Go to **Cloudflare Dashboard** > **Workers & Pages**.
2.  Click **Create Application** > **Pages** > **Connect to Git**.
3.  Select your repository (`minions`).

### 2. Build Settings (Critical)

Configure exactly as follows:

- **project name**: `minion-web`
- **Production branch**: `main`
- **Framework preset**: `Nuxt.js`
- **Build command**: `npm run build`
- **Build output directory**: `dist` ⚠️ _(Note: standard Nuxt is .output/public, but our config uses `dist`)_
- **Root directory**: `apps/web` ⚠️ _(Do not leave empty)_

### 3. Environment Variables

Add these variables in the setup screen (or later in Settings):

| Variable               | Value                   | Description                                            |
| :--------------------- | :---------------------- | :----------------------------------------------------- |
| `API_BASE_URL`         | `https://minion-api...` | Paste the Backend URL from Phase 1 (No trailing slash) |
| `NUXT_PUBLIC_SITE_URL` | `...`                   | Your Page's URL                                        |
| `SUPABASE_URL`         | `...`                   | Your Supabase URL                                      |
| `SUPABASE_KEY`         | `...`                   | Your Supabase Anon Key                                 |
| `NODE_VERSION`         | `20`                    | Recommended for stability                              |

### 4. Deploy

Click **Save and Deploy**. Cloudflare will clone, build, and deploy your site automatically.

---

## 🔄 Updates & Maintenance

### How to Update Frontend?

Just **Push code to GitHub** (`main` branch). Cloudflare Pages will auto-deploy.

### How to Update Backend?

Run the CLI command manually:

```bash
cd apps/api
npm run build:cf
wrangler deploy --env production
```
