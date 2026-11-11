# Threadly API

The Express API is organized into routes, controllers, services, repositories, and validation middleware. The repository layer uses Node's built-in `node:sqlite`; MongoDB and Mongoose are intentionally deferred.

## Requirements and setup

- Node.js 22.13 or newer.
- `npm install --prefix server`
- Optional: copy `.env.example` to `.env`.

Run the API from the project root:

```powershell
npm run dev:server
```

The default API URL is `http://localhost:5000/api`. The SQLite file defaults to `server/data/threadly.sqlite`; `DATABASE_PATH` can override it. The file and its WAL files are ignored by source control.

Environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | HTTP port |
| `CLIENT_URL` | `http://localhost:5173` | Allowed browser origin |
| `DATABASE_PATH` | `./data/threadly.sqlite` | SQLite database file |
| `JWT_SECRET` | Generated once and stored in SQLite in development | Production must set a unique secret of at least 32 characters |
| `JWT_EXPIRES_IN` | `7d` | Access-token lifetime (`s`, `m`, `h`, or `d`) |

Seed content is inserted once when the database is empty. Seed accounts are public read-only profiles without login credentials. New account records and supported interactions are persisted.

## Authentication

Register with `POST /api/auth/register`:

```json
{
  "username": "reader_1",
  "displayName": "A Threadly Reader",
  "email": "reader@example.test",
  "password": "a-long-password",
  "confirmPassword": "a-long-password"
}
```

Passwords are hashed with bcrypt before storage. Registration and `POST /api/auth/login` return a Bearer access token and a safe user object. Login accepts `identity` (email or username) and `password`. Send `Authorization: Bearer <accessToken>` to protected endpoints. `GET /api/auth/me` returns the signed-in user; `POST /api/auth/logout` revokes that token's session.

There is no refresh-token endpoint. The access token is valid for the configured lifetime; users sign in again after expiry. Logout removes the browser session and revokes its server-side session record. Production deployments must configure `JWT_SECRET` and protect the SQLite file and backups.

## Response format

Successful JSON responses use:

```json
{ "success": true, "data": {}, "meta": {} }
```

`meta` is present where pagination applies. Delete and logout endpoints return `204 No Content`.

Errors use:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [{ "field": "title", "message": "Must be between 5 and 200 characters." }]
  }
}
```

## API endpoints

All paths below are relative to `/api`.

| Module | Public endpoints | Protected endpoints |
|---|---|---|
| Health | `GET /health` | — |
| Authentication | `POST /auth/register`, `POST /auth/login` | `GET /auth/me`, `POST /auth/logout` |
| Users | `GET /users`, `GET /users/:userId`, `GET /users/:userId/posts`, `GET /users/:userId/followers`, `GET /users/:userId/following` | `PUT /users/profile`, `POST` / `DELETE /users/:userId/follow` |
| Spaces | `GET /communities`, `GET /communities/:communityId` | `POST /communities`, `POST` / `DELETE /communities/:communityId/join` |
| Posts | `GET /posts`, `GET /posts/:postId`, `GET /posts/:postId/comments` | `POST /posts`, `PUT` / `DELETE /posts/:postId`, `POST /posts/:postId/vote`, `POST /posts/:postId/bookmark`, `GET /posts/saved`, `POST /posts/:postId/comments` |
| Comments | — | `POST /comments/:commentId/replies`, `PUT` / `DELETE /comments/:commentId`, `POST /comments/:commentId/vote` |
| Notifications | — | `GET /notifications`, `PATCH /notifications/:notificationId/read` |
| Search | `GET /search?q=term` | — |

Post and user-post listings accept `page`, `limit` (1–100), and `sort` (`latest`, `popular`, or `trending`). Posts can be filtered by exact `communityId` or `authorId`. Authenticated post reads include the current user's vote and bookmark state.

Post creation example:

```json
{
  "communityId": "community-webdev",
  "title": "A useful discussion",
  "body": "Post details go here.",
  "image": null
}
```

Vote body: `{"value":1}`. Values are `1`, `-1`, or `0` to remove a vote. Comment bodies use `{"body":"A thoughtful reply."}`. Post and comment mutations enforce ownership on the server.

## Implemented and deferred functionality

The API persists registration, login sessions, profile display name/bio/location, follows, Space memberships, posts, votes, bookmarks, nested comments, and notifications. It enforces unique usernames/emails, protected routes, and post/comment ownership. Following, post appreciation, and new comments create persisted notifications.

Space editing/deletion, profile image uploads, moderation roles, user blocking/reporting, comment/report workflows, messaging, polls, mentions/hashtags, account preferences, and administrator tools are not implemented yet. Public search is currently a bounded in-process match over SQLite-backed records rather than a full-text index. Notification updates are request/poll based; there is no real-time transport.

Run the API integration tests with:

```powershell
npm test --prefix server
```

The tests cover registration, duplicate account handling, login-protected operations, ownership checks, nested replies, notifications, logout revocation, and reading persisted posts from a new server process.
