# WeUnite - Frontend

React + TypeScript SPA for the WeUnite social network. Built with Vite, Tailwind, and shadcn/ui, talking to the backend through a `/api` proxy.

## Tech Stack
- React 18, TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router DOM
- TanStack Query, Zustand
- React Hook Form + Zod
- Axios

## Features
- Auth flows (login, register, email verify, reset password)
- Feed with post creation (text + images), likes, and comments
- User search and profiles
- Responsive layout with light/dark theme
- WebSocket notifications (STOMP)

## Prerequisites
- Node.js 18+
- npm
- Backend running on `http://localhost:8080` (default proxy target)

## Getting Started
From the repo root:
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:3000` and proxies `/api` to `http://localhost:8080` (see `vite.config.ts`).

### Scripts
```bash
npm run dev     # start dev server
npm run lint    # lint with ESLint
npm run build   # type-check (tsc -b) and build
npm run preview # preview production build
```

## Project Structure (key parts)
```
src/
  @types/          # shared TS types
  api/             # axios instance and services
  assets/          # static assets
  components/      # UI and domain components
  hooks/           # custom hooks
  lib/             # utilities
  pages/           # routed pages
  routes/          # route definitions
  schemas/         # Zod schemas
  stores/          # Zustand stores
```

## Notes
- No `.env` is required for local dev; the Vite dev server proxies `/api` to port 8080. For production, configure your reverse proxy to forward `/api` to the backend.

## Contributing
- Create a feature branch (`git checkout -b feature/my-change`)
- Commit and push your work
- Open a Pull Request
