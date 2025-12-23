# Sharing Localhost with Others

When you need to show your local development version (localhost:3000) to a client or colleague without deploying, you have two main options:

## Option 1: Ngrok (Easiest / Quickest)

Best for: Quick, one-off sharing sessions.

1. **Install Ngrok**:

   ```bash
   brew install ngrok
   ```

   **Alternative (if Brew fails)**:
   You can run it directly with `npx` without installing:

   ```bash
   npx ngrok http 3000
   ```

2. **Run your app (Frontend + Backend)**:
   You need to run both because the frontend relies on the backend API.

   ```bash
   # Terminal 1: Backend
   npm run dev:api

   # Terminal 2: Frontend
   npm run dev:web
   ```

3. **Start the tunnel** (in a new terminal):
   ```bash
   ngrok http 3000
   # OR
   npx ngrok http 3000
   ```
4. **Share the URL**: Copy the `https://xxxx.ngrok-free.app` link shown in the terminal.

**Cons**:

- URL changes every time you restart ngrok (on free plan).
- Request limits may apply.

---

## Option 2: Cloudflare Tunnel (Recommended / Best for Stability)

Best for: Consistent URLs, unlimited stability, and better performance.

1. **Install Cloudflared**:
   ```bash
   brew install cloudflared
   ```
2. **Start the tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
3. **Share the URL**: Cloudflare will generate a `https://[random-name].trycloudflare.com` link.

**Why it's better**:

- Completely free with no artificial limits.
- Often faster than ngrok.
- Can be configured to use a real domain even on localhost if you set up a named tunnel.
