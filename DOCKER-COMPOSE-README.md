This repository contains two services: a NestJS backend in `mini-bank-back` and a Vite + React frontend served by nginx in `mini-bank-front`.

The compose file builds both images and runs them together.

Quick start

1. Build and start the services in the foreground:

   docker compose up --build

   - Backend will be available on http://localhost:3001
   - Frontend will be available on http://localhost:3000

2. Start in detached mode:

   docker compose up --build -d

3. Stop and remove containers:

   docker compose down

Notes and assumptions
- The backend Dockerfile exposes port 3000 inside the container. The compose file maps it to host port 3001 to avoid colliding with the frontend on 3000.
- The frontend is served by nginx on container port 80 and mapped to host port 3000.
- If you need to override ports, edit `docker-compose.yml`.
- If either service relies on external resources (databases, env files), extend the compose file and add volumes or secrets as needed.

Troubleshooting
- See container logs:

  docker compose logs -f backend
  docker compose logs -f frontend

If you want a healthcheck or to wait for the backend before the frontend serves requests, tell me and I can add a small wait-for script or a healthcheck definition.
