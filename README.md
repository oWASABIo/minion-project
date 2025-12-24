# MINIONS AI Builder

> The AI-First Landing Page Builder.

![Minions Builder](https://raw.githubusercontent.com/placeholder/banner.png)

MINIONS AI Builder is an open-source tool that generates production-ready landing pages (Nuxt, Vue+Vite, HTML/CSS) from a simple text brief using Google Gemini.

## Features

- 🏗 **Multi-Stack Generation**: Create projects for Nuxt 3, Vue 3 + Vite, or HTML/Tailwind.
- 🎨 **Visual Variance**: Support for Light/Dark modes, multiple themes, and layout randomization.
- 📋 **Diverse Templates**: Built-in specialized templates for **Landing Pages, SaaS, Portfolios, E-Commerce, Blogs, and Company Sites**.
- ⚡ **Real-time Streaming**: Watch your project being built in real-time.
- 🧠 **Smart Context**: Uses Domain-Driven Design to generate coherent content and structure.
- 📦 **Monorepo Architecture**: Clean separation of UI and Generation Logic.

## Architecture

This project is a Monorepo:

| Path              | Description           | Stack                   |
| ----------------- | --------------------- | ----------------------- |
| `apps/web`        | The Builder Interface | Nuxt 3, Vue 3, Tailwind |
| `apps/api`        | The Generation Engine | Nitro, Gemini API       |
| `packages/shared` | Shared Types & Utils  | TypeScript              |

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API Key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/minions-ai/builder.git
   cd builder
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure Environment:
   Create a `.env` file in the root:

   ```env
   GEMINI_API_KEY=your_key_here
   ```

4. Run Development Server:
   ```bash
   npm run dev
   ```
   - **Web UI**: http://localhost:3000
   - **API**: http://localhost:3001

> For detailed deployment instructions (Cloudflare Pages & Workers), see the [Deployment Guide](docs/DEPLOYMENT.md).
>
> For architecture decisions and development workflow, see the [Development Guide](docs/DEVELOPMENT.md).
>
> 🇹🇭 **สำหรับภาษาไทย:** ดูคู่มือการพัฒนาและการรันระบบได้ที่ [คู่มือภาษาไทย (Thai Guide)](docs/DEVELOPMENT_TH.md)

## License

MIT © [Minions AI](https://github.com/minions-ai)
