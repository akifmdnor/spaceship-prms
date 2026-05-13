# Spaceship X26 — PRMS (Passenger Resource Management System)

Domain-driven monorepo: **Express** + **PostgreSQL (Prisma)** for persistence and auth, **React (Vite)** for Mission Control, and **ship rules** in a TypeScript domain layer. Tests use **in-memory repositories** with `PRMS_AUTH_TEST` header auth.

## Database & auth

- **PostgreSQL** schema in `server/prisma/schema.prisma` with SQL migrations under `server/prisma/migrations/`.
- **Prisma** for queries, `prisma migrate deploy` for CI/prod, `prisma migrate dev` for local iteration.
- **Seed** (`server/prisma/seed.ts`) loads users (bcrypt hashes), resources, and demo audit rows — same accounts as the login hint.
- **JWT** (`Authorization: Bearer …`) protects `/api/*` except `GET /api/health`, `GET /api/meta/tiers`, `GET /api/meta/demo-accounts`, and `POST /api/auth/login`.
- **Login**: `POST /api/auth/login` → `{ token, user }`; `GET /api/auth/me` validates the token.

### Quick start (local)

```bash
cd spaceship-prms
npm install
cp server/.env.example server/.env
npm run db:up
cd server && npx prisma migrate deploy && npx prisma db seed && cd ..
npm run dev
```

- Postgres: `localhost:5433` (`npm run db:up` uses `server/docker-compose.yml` — Postgres only so the local API can use port 3001)
- API: `http://localhost:3001`
- UI: `http://localhost:5173` — login screen lists **all demo emails/passwords**; Everest (`everest@prms.local` / `admin-demo`) sees the **full crew roster**; everyone else sees **only their own** user in the switcher.

### Environment (`server/.env`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signing key for access tokens (set a long random value in production) |
| `PORT` | API port (default `3001`) |

### Full stack in Docker

`server/Dockerfile` builds the API; `web-client/Dockerfile` serves the Vite production build behind nginx (proxies `/api` to the `api` service). `server/docker-compose.yml` defines Postgres, `api`, and `web`; the root `docker-compose.yml` includes it.

```bash
cd spaceship-prms
npm run docker:up
```

- **App (UI + API proxy):** http://localhost:8081  
- **API direct:** http://localhost:3001  
- **Postgres:** localhost:5433  

Override the container `JWT_SECRET` with a host env var when running Compose if needed.

---

## Workflow pillars (how this was built)

### A. Foundational rigor (SOLID & OOP)

- **Single responsibility**: tier checks live in `ResourceService` / `authTier` middleware; JWT identifies the acting user for resource use.
- **Open / closed**: tiers are ordered numeric enum values; `TierStrategy` compares integers.

### B. Test-driven development

- **Unit / integration tests**: `server/tests/` — Vitest + Supertest; `tests/setup.ts` sets `PRMS_AUTH_TEST` so protected routes accept `X-User-Id` without JWT.

### C. AI workflow (disclosure)

I utilized AI to scaffold boilerplate and mock data. Core domain logic (tier inheritance, Rule of Three, repositories) was structured manually for SOLID alignment.

---

## Architecture & design patterns

| Pattern | Where | Purpose |
| --- | --- | --- |
| **Strategy** | `server/src/domain/TierStrategy.ts` | Tier vs resource clearance |
| **Singleton / guard** | `server/src/domain/CrewLeadRegistry.ts` | Max three crew leads |
| **Repository** | `server/src/repositories/*` | `Prisma*` for Postgres; in-memory for tests |

---

## Assumptions

- Three crew-lead slots; fourth promotion returns **403**.
- Tier order: **Platinum ≥ Gold ≥ Silver**.
- Production clients send **JWT**; tests use **`X-User-Id`** when `PRMS_AUTH_TEST=1`.

## Trade-offs

- **Monorepo** for easy review; services could be split later.
- **Prisma** for migrations + types; raw SQL migrations live in `prisma/migrations`.
- **Demo passwords** in seed and UI — **never** reuse in production.

---

## Project layout

```
spaceship-prms/
├── docker-compose.yml       # includes server/docker-compose.yml
├── web-client/              # React + login + Mission Control
├── server/
│   ├── Dockerfile           # production API image
│   ├── docker-compose.yml   # Postgres (+ optional api/web for docker:up)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   ├── seed.ts
│   │   └── seedData.ts      # Shared constants with seed
│   └── src/
│       ├── domain/
│       ├── repositories/    # prismaRepositories + in-memory
│       ├── routes/          # api + auth
│       └── middleware/      # requireAuth, authTier, ruleOfThree
└── README.md
```

---

## npm scripts

| Scope | Command |
| --- | --- |
| Root | `npm run dev`, `npm run db:up`, `npm run docker:up`, `npm test` |
| Server | `npm run db:migrate -w server`, `npm run db:seed -w server`, `npm run db:studio -w server` |

### Tests

```bash
npm test
```

### Client env (optional)

```bash
# web-client/.env.local — only if not using Vite proxy
VITE_API_BASE=http://localhost:3001
```

---

## API highlights

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/auth/login` | `{ email, password }` → JWT |
| `GET` | `/api/auth/me` | Bearer required |
| `GET` | `/api/meta/demo-accounts` | Public hint list (matches seed) |
| `GET` | `/api/users` | Admin: all users; else: self only |
| `GET` | `/api/resources` | Bearer required |
| `POST` | `/api/resources/:id/use` | Bearer identifies user |
| `POST` | `/api/admin/crew-leads` | `requestedByAdminId` must match JWT user |
| `GET` | `/api/audit` | Bearer required |

---

## Production-ready checklist (status)

- [x] Error handling: global Express handler + React Error Boundary
- [x] Environment variables: `.env` + examples
- [x] Migrations + seed for reproducible DB
- [ ] Strong secrets and HTTPS in real deployments

---

## License

MIT — demo / assessment use.
