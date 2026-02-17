# StoryHub Backend

Node.js + Express API for the blog platform: posts, comments, auth (Firebase), Redis caching, Swagger docs.

## Tech stack

- **Runtime:** Node.js 20
- **Framework:** Express
- **DB:** MongoDB (Mongoose)
- **Auth:** Firebase Admin (verify ID token); users synced to MongoDB on first request
- **Cache:** Redis (optional; app works without it)
- **Docs:** Swagger at `/api-docs`

## Security (never commit)

- **Do not commit:** `.env`, `.env.local`, `.env.vault`, `.env.keys`, or any file containing real API keys, secrets, or passwords. These are in `.gitignore`; keep them that way.
- Use `.env.example` as a template only; never fill it with real values and commit.

## Setup

1. **Env**
   - Copy `.env.example` to `.env`.
   - Set `MONGO_URI` or `MONGODB_URI`, `JWT_SECRET`, and Firebase Admin vars (see `.env.example`).
   - Production CORS: `CORS_ALLOWED_ORIGINS=https://your-frontend-origin` or `FRONTEND_URL=...`
   - Optional: `REDIS_URL` (default `redis://localhost:6379`).

2. **Run**
   - Local: `npm install && npm start` (or `npm run dev`).
   - With Docker: `docker-compose up` (MongoDB + Redis + backend).

## API

- **Base:** `http://localhost:5000` (or your deploy URL)
- **Docs:** `GET /api-docs`
- **Health:** `GET /health` (includes `db`, `redis` status)
- **Metrics:** `GET /metrics` (request count, cache hits/misses, uptime)
- **Auth:** Send Firebase ID token in header `x-auth-token`

## CI / tests

- **Workflow:** `.github/workflows/ci.yml` runs on push/PR to `main` and `develop`.
- **Steps:** `npm ci`, `npm run lint`, `npm test` (Jest + Supertest with MongoDB and Redis services).
- **Tests:** Auth is mocked; use `x-auth-token` and optionally `x-test-uid` for non-owner tests.

So: *Every push runs tests and lint; no manual-only testing.*

## Design decisions

| Decision | Reason |
|----------|--------|
| **Firebase + Node** | Firebase for auth; Node for blog data and ownership. Backend verifies token and syncs user to MongoDB. |
| **Atlas vs local Mongo** | Same code; use Atlas in production, local (or MongoMemoryServer in tests) for dev/CI. |
| **Redis** | Cache GETs for posts; TTL + invalidation on write. Optional: graceful degradation if Redis is down. |
| **Security** | Helmet, CORS allowlist, rate limiting, mongo-sanitize, xss-clean, HPP. |

## Deploy

- **Live API:** https://blog-backend-2-5hun.onrender.com  
- **Frontend:** https://blog-frontend-sigma-ecru.vercel.app  

**Deployment checklist (Render):** Set env vars in dashboard: `MONGO_URI`/`MONGODB_URI`, Firebase Admin vars, and `CORS_ALLOWED_ORIGINS` or `FRONTEND_URL` to your frontend origin. Never put secrets in code or in the repo.

See `docs/IMPLEMENTATION_AUDIT.md` for a full checklist of what’s implemented.
