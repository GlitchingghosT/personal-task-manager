# TaskDuty

TaskDuty is a full-stack personal task manager built with React, TypeScript, Express, and MongoDB. I started it as a static interface and have since connected the real pieces: accounts, protected task routes, per-user data, validation, tests, and production deployment configuration.

> **Status:** the application works end to end and is covered by automated tests. It is deployment-ready but not presented as live until the production services and MongoDB environment are configured.

## What works

- Registration, login, logout, and session restoration
- Password hashing with bcrypt
- JWT bearer authentication with explicit algorithm verification
- Task creation, listing, editing, and deletion
- Per-user task ownership on every database query
- Strict request validation and predictable JSON errors
- Responsive screens with loading, empty, retry, and form-error states
- Keyboard-visible focus styles and labeled form controls
- Authentication rate limiting, restricted CORS, Helmet headers, and bounded request bodies
- Client, API, and ownership-isolation tests
- Render Blueprint configuration for the API and static frontend

## Architecture

```text
Browser (React + Vite)
        |
        | JSON over HTTPS + bearer token
        v
Express API
        |
        | validated, owner-scoped queries
        v
MongoDB (Mongoose)
```

The client only receives the public API URL. `MONGO_URI` and `JWT_SECRET` stay in the server environment.

More detail:

- [API contract](docs/API.md)
- [Architecture and trust boundaries](docs/ARCHITECTURE.md)
- [Deployment guide](docs/DEPLOYMENT.md)

## API

Base path: `/api`

| Method | Route | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Service health check |
| `POST` | `/auth/register` | No | Create an account |
| `POST` | `/auth/login` | No | Start a session |
| `GET` | `/auth/me` | Bearer token | Restore the current user |
| `GET` | `/tasks` | Bearer token | List the current user's tasks |
| `POST` | `/tasks` | Bearer token | Create a task |
| `GET` | `/tasks/:id` | Bearer token | Retrieve an owned task |
| `PATCH` | `/tasks/:id` | Bearer token | Update an owned task |
| `DELETE` | `/tasks/:id` | Bearer token | Delete an owned task |

Requests for another user's task return the same `404` response as a missing task.

## Local setup

### Prerequisites

- Node.js 22.12 through 22.x
- npm
- A local or hosted MongoDB instance

Install both applications:

```bash
npm run install:all
```

Configure the server:

```bash
cp server/.env.example server/.env
```

Set a private JWT secret with at least 32 characters:

```env
MONGO_URI=mongodb://localhost:27017/taskduty
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
PORT=2100
```

Configure the client:

```bash
cp client/.env.example client/.env
```

```env
VITE_API_URL=http://localhost:2100/api
```

Run each service in a separate terminal:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

## Verification

Run the complete repository gate:

```bash
npm run check
```

That command runs:

- tracked and untracked non-ignored file secret scan
- API integration and ownership tests
- client unit and component tests
- ESLint
- server TypeScript checking
- server and client production builds
- dependency audits at high severity

The API tests use `mongodb-memory-server`, so they do not require a developer database or touch production data.

## Deployment

`render.yaml` defines:

- `taskduty-api`: compiled Node web service
- `taskduty-web`: Vite static site with SPA rewrites

Render still needs a production `MONGO_URI`, the final client origin, and the public API URL. It generates `JWT_SECRET` rather than storing it in the repository. Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the exact sequence and post-deploy checks.

## Security notes

- Environment files, dependencies, builds, coverage, and logs are ignored.
- The repository secret scanner runs as part of `npm run check`.
- The previously exposed MongoDB credential was rotated, removed from the current tree, and purged from first-party Git history.
- A fresh mirror clone was scanned after the history rewrite and contained no copy of that credential.
- `sessionStorage` keeps the one-hour bearer token across refreshes in the current tab and clears it when the tab closes. The frontend does not render or log it, and the production static site applies a restrictive content security policy.

## License

Original source code is available under the MIT License. Third-party visual assets remain subject to their respective owners' terms.
