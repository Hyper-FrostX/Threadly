# Threadly API

The Express API is organized around route, controller, service, and data modules. The current service layer uses sample JavaScript arrays in `data/sampleData.js`; this is development-only state, is not persistent, and resets whenever the server restarts. `X-Data-Storage: in-memory-development` is returned with API responses. No database or password is used.

## Run locally

```powershell
npm run dev --prefix server
```

The default server URL is `http://localhost:5000`. The API is mounted at `/api`.

## Response format

Successful JSON responses use:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

`meta` is present where pagination applies. Delete endpoints return `204 No Content`.

Errors use:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [
      { "field": "title", "message": "Must be between 5 and 200 characters." }
    ]
  }
}
```

## Endpoints

### Health

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | API health status |

Example response: `{"status":"ok","service":"threadly-api","timestamp":"..."}`.

### Authentication

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Registration contract; currently returns `501 AUTH_NOT_CONFIGURED` |
| POST | `/api/auth/login` | Public | Login contract; currently returns `501 AUTH_NOT_CONFIGURED` |
| GET | `/api/auth/me` | Protected | Current-user contract; currently returns `501 AUTH_NOT_CONFIGURED` |

Registration validates `username`, `email`, and `password` (minimum 8 characters). Login validates `email` and `password`. Requests are not persisted, and passwords are never stored. Authentication becomes available when persistent users, password hashing, and JWT validation are implemented.

### Users

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Public | List public sample profiles |
| GET | `/api/users/:userId` | Public | Get a profile (sample ID or username) |
| PUT | `/api/users/profile` | Protected | Update the current profile |
| GET | `/api/users/:userId/posts` | Public | List a user's posts; supports pagination and sorting |
| POST | `/api/users/:userId/follow` | Protected | Follow a user |
| DELETE | `/api/users/:userId/follow` | Protected | Unfollow a user |

Profile update accepts one or more of `displayName`, `bio`, and `location`.

### Communities

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/communities` | Public | List sample communities |
| GET | `/api/communities/:communityId` | Public | Get by sample ID or community name |
| POST | `/api/communities` | Protected | Create a community |
| POST | `/api/communities/:communityId/join` | Protected | Join a community |
| DELETE | `/api/communities/:communityId/join` | Protected | Leave a community |

Create body:

```json
{
  "name": "webdev",
  "title": "Web Development",
  "description": "React, Node, and the modern web stack."
}
```

### Posts

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/posts` | Public | List posts |
| GET | `/api/posts/:postId` | Public | Get a post |
| POST | `/api/posts` | Protected | Create a post |
| PUT | `/api/posts/:postId` | Protected | Update an authored post |
| DELETE | `/api/posts/:postId` | Protected | Delete an authored post |
| POST | `/api/posts/:postId/vote` | Protected | Set a vote |
| POST | `/api/posts/:postId/bookmark` | Protected | Toggle a bookmark |

Create body:

```json
{
  "communityId": "community-webdev",
  "title": "A useful discussion",
  "body": "Post details go here.",
  "image": null
}
```

Vote body: `{"value":1}`. Values are `1` (upvote), `-1` (downvote), or `0` (remove vote). Bookmark is a toggle and requires no body.

Post listing accepts:

- `page`: positive integer; defaults to `1`.
- `limit`: integer from `1` to `100`; defaults to `10`.
- `sort`: `latest`, `popular`, or `trending`; defaults to `latest`.
- `communityId` and `authorId`: optional exact filters.

Example: `/api/posts?page=2&limit=10&sort=trending`.

Pagination metadata has `page`, `limit`, `total`, `pages`, `hasNextPage`, and `hasPreviousPage`.

### Comments

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/posts/:postId/comments` | Public | List top-level comments and replies |
| POST | `/api/posts/:postId/comments` | Protected | Add a comment |
| POST | `/api/comments/:commentId/replies` | Protected | Reply to a comment |
| DELETE | `/api/comments/:commentId` | Protected | Delete an authored comment and its replies |

Comment body: `{"body":"A thoughtful reply."}`.

### Notifications

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/notifications` | Protected | List the current user's notifications |
| PATCH | `/api/notifications/:notificationId/read` | Protected | Mark read/unread |

Patch body: `{"read":true}`. An empty body marks the notification read.

### Search

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/search?q=term` | Public | Search sample users, communities, and posts |

An empty or missing `q` returns `400 QUERY_REQUIRED`.

## Authentication and implementation status

Protected routes are mounted with `requireAuth`, which deliberately returns `501 AUTH_NOT_CONFIGURED` until real authentication is added. No development token, fake user identity, or plaintext password storage is used. Consequently, protected read/write operations are intentionally unavailable in this phase, although their route, validation, controller, and service contracts are prepared.

The following authentication-dependent operations are intentionally unavailable until the next phase: register, login, current-user lookup, profile updates, follows, community creation/join/leave, post creation/update/delete/voting/bookmarking, comment creation/replies/deletion, and notification listing/read updates.

An unknown route returns `404 ROUTE_NOT_FOUND`. Invalid JSON and body validation return `400`; invalid pagination/sort also returns `400`; missing sample records return `404`; duplicate community names return `409`; forbidden ownership actions return `403` once authentication is configured; oversized JSON bodies return `413`. Unexpected server errors return `500`.

Example paginated response:

```json
{
  "success": true,
  "data": [
    {
      "id": "post-welcome",
      "title": "Welcome to Threadly",
      "score": 128,
      "community": { "id": "community-webdev", "name": "webdev", "title": "Web Development" },
      "author": { "id": "user-vishnu", "username": "vishnu", "displayName": "Vishnu" },
      "commentCount": 1
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```
