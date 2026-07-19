# TaskDuty architecture

## System overview

```text
Browser (React + Vite)
        |
        | HTTPS JSON + Bearer token
        v
Express API
  |-- request validation
  |-- authentication middleware
  |-- task ownership filters
        |
        v
MongoDB (Mongoose)
```

The client and API are separate deployable services. The client knows only the public API URL. Database credentials and the JWT signing secret exist only in the API environment.

## Client

The React client owns presentation, form state, route protection, and the current session:

- `src/lib/api.ts` defines the typed HTTP client and parses the API error envelope.
- `src/context/AuthContext.tsx` restores a tab-scoped session, revalidates it through `/auth/me`, and exposes login, registration, and logout.
- `src/components/ProtectedRoute.tsx` prevents unauthenticated access to task screens.
- Task pages call the API rather than maintaining mock data.

The one-hour bearer token is stored in `sessionStorage`, so a session survives refreshes in the current tab but is cleared when the tab closes. Browser JavaScript can still read it, so the deployment uses a restrictive content security policy and the UI must continue avoiding raw HTML and other XSS-prone patterns.

## API

The Express API owns all trust decisions:

1. Zod validates and normalizes request bodies at the route boundary.
2. Authentication middleware verifies HS256 JWTs with an explicit algorithm and confirms the user still exists.
3. Task queries always include the authenticated user's ID.
4. Requests for another user's task return the same `404` response as a missing task.
5. Error middleware returns the documented JSON envelope without stack traces or internal database details.

Password hashes use bcrypt and are excluded from normal model queries and API responses.

## Data model

### User

- `name`
- normalized unique `email`
- password hash
- timestamps

### Task

- `owner` reference to User
- `title`
- `description`
- `tag`: `urgent`, `important`, or `normal`
- timestamps

Tasks are ordered newest first. The owner field is assigned from the authenticated request and never accepted from client input.

## API compatibility

`docs/API.md` is the contract between the two services. API changes should be additive when possible. Update the contract, server tests, client types, and client tests in the same change.

## Security boundaries

- `MONGO_URI` and `JWT_SECRET` are server-only secrets.
- `VITE_API_URL` and all other `VITE_*` values are public build-time configuration.
- CORS permits only the configured client origin.
- JSON bodies are size-limited.
- Authentication endpoints are rate-limited.
- Rate-limit failures use the same JSON error envelope as other API failures.
- Credentials, tokens, and raw driver errors must never be logged.
