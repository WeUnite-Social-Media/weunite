# WeUnite Monorepo

WeUnite is a social network that connects people to opportunities. This repo hosts both the Spring Boot backend and the React/Vite frontend.

## Repo Structure
- `backend/` — Spring Boot 3 (Java 17) API with JWT auth, PostgreSQL, Cloudinary, mail, and WebSocket support.
- `frontend/` — React + TypeScript SPA built with Vite, Tailwind, and shadcn/ui, proxying `/api` to the backend.

## Tech Snapshot
- Backend: Java 17, Spring Boot 3, Spring Security (JWT/OAuth2), JPA + PostgreSQL, Cloudinary, SMTP mail, WebSocket (STOMP), Maven
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router DOM, TanStack Query, Zustand, React Hook Form + Zod, Axios

## Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+ and npm
- PostgreSQL 15+ (or Docker)
- Docker & Docker Compose (optional, for containerized backend)

## Quick Start (Local)
Backend (terminal 1):
```bash
cd backend
cp .env.example .env   # fill values
mvn spring-boot:run
```
Frontend (terminal 2):
```bash
cd frontend
npm install
npm run dev
```
- API: `http://localhost:8080/api`
- Web: `http://localhost:3000` (Vite proxies `/api` to port 8080)

## Environment Configuration
Backend uses `spring-dotenv` to load `.env` in `backend/`:
- `JWT_PUBLIC_KEY` / `JWT_PRIVATE_KEY`
- `DB_USERNAME` / `DB_PASSWORD`
- `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_PORT`
- `CLOUDINARY_URL`
Create the database when running locally:
```sql
CREATE DATABASE weunite;
```

## Scripts
Backend:
```bash
mvn spring-boot:run             # dev
mvn clean package -DskipTests   # build (no tests)
mvn test                        # tests
```
Frontend:
```bash
npm run dev     # dev server
npm run lint    # eslint
npm run build   # type-check + build
npm run preview # preview build
```

## Docker (Backend)
From `backend/`:
```bash
docker compose up -d --build
```
Starts API on `8080` and PostgreSQL on `5432` (container service `db`).

## CI & Merge Requirements
- Workflow: `.github/workflows/pr-quality.yml` runs frontend lint/build and backend build (tests skipped) on `pull_request` to `main`.
- Copilot review: the workflow requests a `github-copilot` review and fails until that review is approved. (Ensure Copilot for PRs is enabled for the repo.)
- Human approval: protect `main` to require at least one approving review from a team member and the required status checks below.

Recommended branch protection status checks: `frontend`, `backend`, `copilot-review`.

## Contributing
1) Create a branch (`git checkout -b feature/my-change`)
2) Commit and push
3) Open a Pull Request

