# Contributing to MINIONS AI Builder

Thank you for your interest in contributing!

## structure

This is a Monorepo managed by `npm workspaces`.

- `apps/web`: The Builder UI (Nuxt 3).
- `apps/api`: The Generation Engine (Nitro).
- `packages/shared`: Shared Types and Utilities.

## Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Servers**:
   ```bash
   npm run dev
   ```
   This should start both the Web UI (localhost:3000) and API (localhost:3001).

## Code Style

- We use standard ESLint / Prettier configurations (coming soon).
- Please follow the Domain-Driven Design structure in `apps/api/server/domain`.

## Pull Requests

1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.
