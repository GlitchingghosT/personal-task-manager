# TaskDuty — Personal Task Manager

TaskDuty is an in-development full-stack task-management project with a React and TypeScript client plus an Express and MongoDB CRUD API.

> **Current status:** the client prototype and server exist in the same repository, but end-to-end client/API integration, authentication, per-user authorization, automated tests, and deployment are not complete.

## Architecture

```text
PTM/
├── client/   React, TypeScript, Vite, Tailwind CSS
└── server/   Express, TypeScript, MongoDB, Mongoose
```

## Implemented

- Task creation, listing, retrieval, editing, and deletion endpoints
- MongoDB-backed task model with title, description, and tag fields
- React task-management interface prototype
- Environment-based database configuration
- Restricted development CORS origin and bounded JSON request bodies
- Tracked-file secret scanner

## API routes

Base path: `/api/task`

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/create` | Create a task |
| `GET` | `/` | List tasks |
| `GET` | `/each/:id` | Retrieve one task |
| `PATCH` | `/edit/:id` | Update a task |
| `DELETE` | `/delete/:id` | Delete a task |

## Local setup

### Prerequisites

- Node.js and npm
- A local or hosted MongoDB instance

### Server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Set `MONGO_URI` in `server/.env`. Do not commit that file. Optional settings:

```env
CLIENT_ORIGIN=http://localhost:5173
PORT=2100
```

### Client

```bash
cd client
npm install
npm run dev
```

The client development server runs separately from the API. Full client/API integration remains planned work.

## Verification

```bash
# Client
cd client
npm run lint
npm run build

# Server
cd ../server
npx tsc --noEmit

# Repository hygiene
cd ..
npm run scan:secrets
```

The repository does not yet include a canonical automated test suite.

## Security status

- Runtime credentials are read from environment variables.
- `server/.env` is ignored and `server/.env.example` contains safe local placeholders.
- Root dependency directories are not tracked.
- The previously exposed database credential has been rotated.
- Historical credential removal requires a separately reviewed Git history rewrite and is not represented as complete by the current-tree cleanup.

## Roadmap

- Connect client forms and lists to the API
- Add authentication and per-user task ownership
- Validate and sanitize request payloads
- Add controller and integration tests
- Add deployment configuration and production observability

## License

Original source code is available under the MIT License. Third-party visual assets, if any, remain subject to their respective owners' terms.
