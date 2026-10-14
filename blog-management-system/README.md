# Fieldnotes - Blog Management System

Spring Boot 3 (Java 17) REST API + React 18 (Vite, Tailwind) single-page app.

## Run everything with Docker

    cp .env.example .env        # then edit secrets
    docker compose up --build

| Service  | URL                                   |
|----------|---------------------------------------|
| Frontend | http://localhost:3000                 |
| API      | http://localhost:8080/api             |
| Swagger  | http://localhost:8080/swagger-ui.html |
| MySQL    | localhost:3307                        |

Bootstrap admin: `admin` / `Admin@12345` (override with `ADMIN_*` env vars; change it before going live).

## Run locally without Docker (H2 in-memory DB)

    cd backend  && mvn spring-boot:run          # http://localhost:8080
    cd frontend && npm install && npm run dev   # http://localhost:5173 (proxies /api to :8080)

## API summary

| Method | Path | Access |
|--------|------|--------|
| POST | /api/auth/register, /api/auth/login | public |
| GET  | /api/auth/me | user |
| GET  | /api/posts?page&size&category&search | public |
| GET  | /api/posts/{id}, /api/posts/categories | public |
| GET  | /api/posts/mine | user |
| POST | /api/posts | user |
| PUT  | /api/posts/{id} | author only |
| DELETE | /api/posts/{id} | author or admin |
| GET  | /api/posts/{id}/comments | public |
| POST | /api/posts/{id}/comments | user |
| DELETE | /api/comments/{id} | author or admin |
| GET  | /api/admin/metrics, /api/admin/users, /api/admin/comments | admin |
| PUT  | /api/admin/users/{id}/roles | admin |
| PATCH | /api/admin/users/{id}/enabled | admin |

Errors share one shape: `{ timestamp, status, error, message, path, fieldErrors? }`.

## Production notes

- Set a strong `JWT_SECRET` and a new admin password.
- `DDL_AUTO=update` is convenient; switch to `validate` and use Flyway/Liquibase migrations for real deployments.
- Serve the frontend over HTTPS (put a TLS-terminating proxy in front of nginx).
- The JWT is kept in `localStorage`; keep post rendering Markdown-only (no raw HTML) to limit XSS exposure.
