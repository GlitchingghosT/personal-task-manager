# TaskDuty API contract

Base URL: `/api`

All responses are JSON. Protected routes require:

```http
Authorization: Bearer <token>
```

## Error envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Check the submitted fields.",
    "fields": {
      "email": "Enter a valid email address."
    }
  }
}
```

`fields` is optional. Supported codes: `VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, and `INTERNAL_ERROR`.

## Authentication

### `POST /auth/register`

Request:

```json
{
  "name": "Emmanuel",
  "email": "emmanuel@example.com",
  "password": "at-least-eight-characters"
}
```

Response `201`:

```json
{
  "user": {
    "id": "mongo-id",
    "name": "Emmanuel",
    "email": "emmanuel@example.com"
  },
  "token": "jwt"
}
```

Returns `409 CONFLICT` when the email already exists.

### `POST /auth/login`

Request:

```json
{
  "email": "emmanuel@example.com",
  "password": "user-password"
}
```

Response `200` uses the same `{ user, token }` shape as registration. Invalid credentials return `401 UNAUTHENTICATED` without revealing which field was wrong.

### `GET /auth/me`

Protected. Response `200`:

```json
{
  "user": {
    "id": "mongo-id",
    "name": "Emmanuel",
    "email": "emmanuel@example.com"
  }
}
```

## Tasks

Task shape:

```json
{
  "id": "mongo-id",
  "title": "Finish API integration",
  "description": "Connect the task screens to the protected endpoints.",
  "tag": "important",
  "createdAt": "2026-07-19T00:00:00.000Z",
  "updatedAt": "2026-07-19T00:00:00.000Z"
}
```

Allowed tags: `urgent`, `important`, `normal`.

### `GET /tasks`

Protected. Returns up to 500 of the authenticated user's tasks, newest first:

```json
{ "tasks": [] }
```

### `POST /tasks`

Protected. Accepts `title`, `description`, and `tag`. Returns `{ "task": ... }` with status `201`.

### `GET /tasks/:id`

Protected. Returns `{ "task": ... }`. A task owned by another user is returned as `404 NOT_FOUND` so ownership is not disclosed.

### `PATCH /tasks/:id`

Protected. Accepts any non-empty subset of `title`, `description`, and `tag`. Unknown fields are rejected. Returns `{ "task": ... }`.

### `DELETE /tasks/:id`

Protected. Returns status `204` with no body.

## Validation limits

- Name: 2–80 characters
- Email: normalized to lowercase and validated
- Password: at least 8 characters and no more than 72 UTF-8 bytes
- Task title: 1–120 characters
- Description: 1–2000 characters
- Tag: `urgent`, `important`, or `normal`

## Environment

Server:

```env
MONGO_URI=mongodb://localhost:27017/taskduty
JWT_SECRET=replace-with-at-least-32-random-characters
CLIENT_ORIGIN=http://localhost:5173
PORT=2100
```

Client:

```env
VITE_API_URL=http://localhost:2100/api
```
