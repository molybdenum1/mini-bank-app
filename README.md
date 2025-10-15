mini-bank-plat
=================

This workspace contains a small demo banking platform with two services:

- mini-bank-back — NestJS backend (API + Postgres DB)
- mini-bank-front — Vite + React frontend served by nginx

Quick start (Docker Compose)

1. From the repository root (this folder) build and start everything:

   docker compose up --build

2. Start in detached mode:

   docker compose up --build -d

3. Stop and remove containers:

   docker compose down

Endpoints / ports

- Frontend (nginx): http://localhost:3000
- Backend (NestJS): http://localhost:3001

Notes about Postgres

- Compose runs a Postgres container named `mini-bank-postgres` and stores its data in a Docker volume named `pgdata`.
- Postgres is not published to the host by default (it is only reachable from inside the Docker network). If you need host access, edit `docker-compose.yml` and add a `ports` mapping for the `postgres` service.

Frontend API proxy

- The frontend is configured to call the same origin for API routes (no hard-coded backend URL). nginx proxies API paths (/auth, /accounts, /transactions) from the frontend to the backend.

Register page: name field

- The Register form now includes a `Name` field and the frontend sends it in the JSON body to POST /auth/register as `name`.

Troubleshooting

- If you get a port conflict on 3000 or 3001, change the host port mappings in `docker-compose.yml`.
- To inspect logs:

  docker compose logs -f backend
  docker compose logs -f frontend
  docker compose logs -f postgres

If you want a more detailed README (development workflow, environment variables, or CI), tell me which sections to add and I'll expand it.
