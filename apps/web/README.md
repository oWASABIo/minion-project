# MINIONS AI Builder 🍌

An AI-powered website builder prototype. Generates multi-page websites based on text prompts.

## 🚀 Changelog / Release Notes

### v0.5.0 - The "Polish & Power" Update (Current)

This major update focuses on stability, customization, and architectural cleanup.

#### ✨ New Features

- **Deep Customization:** Added Section-specific background & text color overrides.
- **Inline Visual Editing:** Edit text directly on the preview canvas with hover/focus states.
- **Hero Variants:** Added multiple Hero styles (Split, Center, Glow, Glass, Terminal).
- **Public Project Links:** Dedicated public usage endpoint for published pages.

#### 🛠️ Architecture & API

- **Centralized API:** Migrated all project endpoints to a unified backend layer (`apps/api`).
- **Authorization:** Added robust auth headers to all API calls (fix 401 errors).
- **Type Safety:** rigorous cleanup of `as any` and strict `PageConfig` typing.
- **Blueprint Mode:** Refined blueprint theme to allow inline style overrides.

#### 🐛 Bug Fixes

- Fixed "Loading Preview" hangs.
- Resolved `projectId` type mismatch (string vs number) in Analytics.
- Fixed reactivity issues in builder sidebar color pickers.
- Optimized history snapshots for smoother undo/redo.

---

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
