# Deploying TaskDuty

TaskDuty is structured as a monorepo with a Node API in `server/` and a Vite static site in `client/`. The root `render.yaml` defines both services.

## Prerequisites

- A MongoDB Atlas database or another production MongoDB connection string
- A Render account connected to the GitHub repository
- The repository's `main` branch passing local verification

## Create the Render Blueprint

1. In Render, choose **New > Blueprint**.
2. Select `GlitchingghosT/personal-task-manager`.
3. Render reads `render.yaml` and proposes two services:
   - `taskduty-api`: Node web service
   - `taskduty-web`: static Vite site
4. Supply `MONGO_URI` when prompted. Do not put it in GitHub, the client, or the Blueprint file.
5. Let Render generate `JWT_SECRET`.
6. Deploy the API first and copy its public URL.
7. Set the static site's `VITE_API_URL` to `<api-url>/api`, then redeploy the static site.
8. Copy the static site's public URL and set the API's `CLIENT_ORIGIN` to that exact origin, without a trailing slash.
9. Redeploy the API after updating `CLIENT_ORIGIN`.

The static service applies a content security policy that permits scripts, styles, and images from the deployed site and HTTPS API connections. Update it deliberately if the application later adds another external service.

## Required environment variables

### API

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | Production MongoDB connection string; secret |
| `JWT_SECRET` | Signs access tokens; generated and stored by Render |
| `CLIENT_ORIGIN` | Exact public origin of the frontend |
| `NODE_ENV` | Set to `production` |

Render provides `PORT` automatically.

### Client

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Public API base URL ending in `/api` |

`VITE_*` values are public at build time. Never place database credentials, JWT secrets, or private tokens in them.

## Post-deploy checks

1. Open the API health endpoint and confirm it returns `200`.
2. Register a new account through the frontend.
3. Create, edit, and delete a task.
4. Sign out and sign back in.
5. Open a protected task URL while signed out and confirm the app redirects to login.
6. Create a second account and confirm it cannot see the first account's tasks.
7. Refresh a nested frontend route and confirm the SPA rewrite loads the app.

## Rollback

Render keeps previous deploys for each service. Roll back the API and client together when an API contract change is involved. Database schema changes must remain backward compatible until both services have completed deployment.
