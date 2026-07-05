# Deployment Guide

Target infrastructure: **Vercel** (frontend) · **Render** (backend) · **MongoDB Atlas** (database). No other managed services required — the course-generation job queue is MongoDB-backed (see `backend/app/services/job_worker.py`), not Redis/Celery/etc.

## 1. MongoDB Atlas

1. Create a free (M0) cluster.
2. Create a database user (username/password auth is enough — this app connects via a standard `mongodb+srv://` URI, not X.509).
3. Network Access → add `0.0.0.0/0` (Render's egress IPs aren't static on the free plan) or Render's specific IP ranges if you're on a paid Render plan with static IPs.
4. Copy the connection string — this is `MONGO_URI` below. The database name itself (`MONGO_DB_NAME`) is a separate env var, not part of the URI.
5. **Migrating existing local data?** See `scripts/export_for_atlas.sh` — dumps the local database to `atlas_migration.archive` at the project root, then `mongorestore --uri="<atlas-uri>" --archive=atlas_migration.archive --drop` imports it. That file contains real user data (emails, bcrypt hashes); it's gitignored and should be deleted once the migration is confirmed.

## 2. Backend → Render

A `render.yaml` Blueprint is included at the repo root — Render → New → Blueprint, point it at this repo, and it provisions the service with the build/start commands and health check pre-filled. Env vars marked `sync: false` in the blueprint still need to be filled in manually in the Render dashboard (secrets are never committed).

Manual setup (if not using the Blueprint):
- **Root directory:** `backend`
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health check path:** `/api/health`

### Required environment variables

| Variable | Required | Notes |
|---|---|---|
| `MONGO_URI` | Yes | Atlas connection string |
| `MONGO_DB_NAME` | No (default `learnify_ai`) | |
| `CORS_ORIGINS` | Yes | Comma-separated. Must include your Vercel URL, e.g. `https://learnify-ai.vercel.app` |
| `GEMINI_API_KEY` | Yes | Video discovery/notes and Hinglish TTS always use Gemini directly, regardless of `LLM_PROVIDER` |
| `GEMINI_API_KEY_1`, `_2`, … | No | Additional Gemini keys — auto-discovered and rotated through on rate-limit/quota errors (`app/agents/gemini_keys.py`). No code change needed to add more; just set the next `GEMINI_API_KEY_N`. |
| `LLM_PROVIDER` | No (default `openai`) | `openai` or `gemini` — picks the model for course/lesson text generation |
| `OPENAI_API_KEY` | Required if `LLM_PROVIDER=openai` | |
| `OPENAI_MODEL` | No (default `openai/gpt-4o-mini`) | |
| `JWT_SECRET` | **Yes — set a real random value** | Defaults to an insecure dev placeholder; rotating it logs out every user |
| `JWT_ALGORITHM` | No (default `HS256`) | |
| `JWT_EXPIRES_MINUTES` | No (default 7 days) | |
| `LOG_LEVEL` | No (default `INFO`) | |
| `JOB_WORKER_CONCURRENCY` | No (default `2`) | In-process async workers draining the course-generation job queue |

## 3. Frontend → Vercel

- **Root directory:** `frontend`
- **Build command:** `npm run build` (default)
- **Output directory:** `dist` (default)
- `frontend/vercel.json` adds the SPA rewrite (`/* → /index.html`) React Router needs — without it, a direct link to e.g. `/courses` 404s on refresh.

### Required environment variables

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | Yes | Your Render backend URL, e.g. `https://learnify-ai-backend.onrender.com`. Falls back to `http://localhost:8000` if unset — fine for local dev, wrong in production. |

## 4. Post-deploy checklist

- [ ] Atlas cluster created, network access configured, connection string copied
- [ ] Render backend deployed, `GET https://<backend>/api/health` returns `{"status": "ok"}`
- [ ] `GET https://<backend>/api/health/db` returns `{"status": "ok", ...}` (confirms Atlas connectivity, not just that the process started)
- [ ] `JWT_SECRET` set to a real random value (not the dev default)
- [ ] `CORS_ORIGINS` on the backend includes the exact Vercel URL (scheme + host, no trailing slash)
- [ ] Vercel frontend deployed with `VITE_API_URL` pointing at the Render backend
- [ ] Sign up a real test account through the deployed frontend and generate one course end-to-end
- [ ] Confirm the six official platform courses exist (`backend/scripts/seed_platform_courses.py` — run once against the production database if they haven't been seeded yet)

## Common pitfalls

- **Forgetting the Vercel rewrite** → every route except `/` 404s on a hard refresh or shared link. Fixed by `frontend/vercel.json`.
- **CORS mismatch** → browser console shows "blocked by CORS policy"; `CORS_ORIGINS` must exactly match the deployed frontend origin (including `https://`, excluding any trailing slash).
- **Atlas network access** → a Render backend that connects locally but times out in production almost always means Atlas's IP allowlist doesn't include Render's egress.
- **Leaving `JWT_SECRET` at its dev default** → not a functional bug, but a real security issue in production; every deployment should set its own.
- **Gemini quota exhaustion** → expected on the free tier; `LLM_PROVIDER=openai` (the default) keeps course/lesson text generation off Gemini entirely, and multiple `GEMINI_API_KEY_N` values give the always-on Gemini paths (video, Hinglish TTS) automatic failover.

## Dev vs. production env vars

Local development uses `backend/.env` / `frontend/.env` (gitignored, copied from the committed `.env.example` files) plus `docker compose up -d` for a local MongoDB — none of that applies in production, where Render/Vercel's own env var dashboards replace the `.env` files and Atlas replaces the Docker Mongo container.
