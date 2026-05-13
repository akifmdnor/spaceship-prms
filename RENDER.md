# Deploying Spaceship PRMS on Render

This monorepo can be deployed **from one Git connection** (Blueprint: `render.yaml`) or as **two independent services** (API + static UI) for a split pipeline.

## One Render Web Service (API + SPA, single deploy)

Use this when you want **one** service and **one** build at the **repository root** (no second Static Site):

| Field | Value |
|--------|--------|
| **Root Directory** | *(leave empty)* — repo root with root `package.json` |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm run start -w server` |

`npm run build` already runs **`build` for `server` and `web-client`**. In **production**, Express serves **`web-client/dist`** from the same process, so the UI and **`/api`** share one origin. Leave **`VITE_API_BASE`** unset (or empty) for the Vite build so the client calls **`/api`** on the same host.

Do **not** point **Root Directory** at `server` only for this flow — the workspace build expects the monorepo root so both packages build; the server still resolves `web-client/dist` relative to the repo layout after deploy.

---

1. In [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
2. Connect the repo that contains **`spaceship-prms/`** as the root (or this folder if the repo is only PRMS).
3. Render reads **`render.yaml`** and provisions **Postgres**, **prms-api** (Node), and **prms-web** (static).
4. When prompted, set **`VITE_API_BASE`** on **prms-web** to the **public URL** of **prms-api** (shown on the API service page), e.g. `https://prms-api.onrender.com`. No trailing slash.
5. **Seed (optional, demo data):** Shell into **prms-api** or run a one-off job:  
   `npm run db:seed -w server`  
   (from repo root after `npm ci --include=dev`).

### Commands Render uses (monorepo root)

| Phase | Command |
|--------|---------|
| Install + build API | `npm ci --include=dev && npm run render:build:api` |
| Migrate | `npm run render:migrate:api` (`prisma migrate deploy` in `server/`) |
| Start API | `npm run render:start:api` (`node dist/index.js` in `server/`) |
| Build UI | `npm ci --include=dev && npm run render:build:web` |

`--include=dev` on the **API** build is optional now that the server pins build tools in `dependencies`; it does not hurt. For **web-client**, `vite` is also in `dependencies`.

---

## Frontend: use a **Static Site** (recommended)

The Vite UI should be a **Render Static Site**, not a Web Service: you only **build** and **publish** `web-client/dist`; there is no long-lived Node process.

If you accidentally created a **Web Service** for the SPA, the logs show a successful `vite build` then **“Application exited early”** / **no open ports** — nothing is listening on `PORT`. Fix either:

1. **Switch the service type to Static Site** (best), **or**
2. Set **Start Command** (monorepo root): **`npm run render:start:web`**  
   **or** (Root Directory = `web-client`): **`npm start`**.

That runs **`vite preview`** with **`host: true`** and **`PORT`** from Render (see `web-client/vite.config.ts`).

---

| Key | Source |
|-----|--------|
| `DATABASE_URL` | Render Postgres (Blueprint wires this) or set manually |
| `JWT_SECRET` | Generate in Render or set a strong secret |
| `NODE_ENV` | `production` |
| `PORT` | Render sets automatically — `server` already uses `process.env.PORT` |

---

## Microservices: API only

1. **New** → **Web Service** → same repo.
2. **Root directory:** leave empty if the Git root **is** `spaceship-prms` (monorepo root with `package.json` workspaces).  
   If your Git repository root is **`everest-engineering`** and PRMS is a subfolder, set **Root directory** to `spaceship-prms`.
3. **Build command:** `npm ci --include=dev && npm run render:build:api`
4. **Start command:** `npm run render:start:api`
5. **Pre-deploy / deploy hook:** add **Pre-deploy command** `npm run render:migrate:api` (or run migrations manually once).
6. Add **PostgreSQL** (managed or external) and set **`DATABASE_URL`**, **`JWT_SECRET`**, **`NODE_ENV=production`**.

### API only with Root directory = `server`

If you point Render’s **Root directory** at **`server/`** (no workspace), use:

- **Build:** `npm ci --include=dev && npm run build`
- **Start:** `npm start`
- **Pre-deploy:** `npx prisma migrate deploy`

Ensure **`server/package.json`** has all runtime and build deps (it does for standalone `npm ci` in that folder).

---

## Microservices: Static UI only

1. **New** → **Static Site** → same repo.
2. **Root directory:** monorepo root (`spaceship-prms` or parent + `spaceship-prms`).
3. **Build command:** `npm ci --include=dev && npm run render:build:web`
4. **Publish directory:** `web-client/dist`
5. **Environment:** **`VITE_API_BASE`** = full public URL of your API, e.g. `https://your-api.onrender.com`.

If **Root directory** = **`web-client`**, use:

- **Build:** `npm ci --include=dev && npm run build`
- **Publish:** `dist`
- Still set **`VITE_API_BASE`**.

---

## Troubleshooting

- **Prisma / tsc not found during build:** Dev dependencies were skipped; use `npm ci --include=dev` or `npm install` (see build commands above).
- **DB connection:** Use the **External** connection string from Render Postgres if the driver requires SSL; Prisma typically accepts `?sslmode=require` if needed.
- **CORS:** API uses `cors({ origin: true })`, so the static site origin is allowed once the browser calls the correct **`VITE_API_BASE`**.

## Git repo contains multiple projects

If this app lives under a **parent** folder (e.g. `everest-engineering/spaceship-prms`) in a single Git repository:

- Set **Root Directory** on each Render service to **`spaceship-prms`**, **or** configure the Blueprint to use **`spaceship-prms/render.yaml`** as the spec path (Render Dashboard → Blueprint settings).
- Ensure **`render.yaml`** and **`package-lock.json`** at **`spaceship-prms/`** are what Render builds from.
