# API Reference

## Overview

The backend is an Express application started from `server/server.js`.

### Base Routes

- `/v1/api/auth`
- `/v1/api/review`
- `/v1/api/users`
- `/webhook/github`

### Global Behavior

- JSON parsing: `express.json()`
- Cookies: `cookie-parser`
- CORS:
  - `http://localhost:5173`
  - `https://ai-code-review-olive.vercel.app`
- Cross-origin credentials are enabled.
- Authentication uses a JWT stored in the `token` cookie.

### Authentication

Protected endpoints require:

```http
Cookie: token=<jwt>
```

JWT verification is handled by:

```text
server/src/middleware/authMiddleware.js
```

The middleware attaches:

```js
req.user = {
  userId: decode.userId
}
```

The API does not use a `Bearer` authorization header.

---

# Authentication

## POST `/v1/api/auth/register`

Register a new user.

**Auth:** Not required

### Request

```json
{
  "name": "string",
  "email": "user@example.com",
  "password": "string"
}
```

Validation:

- `name`: required
- `email`: required and valid
- `password`: required, minimum 6 characters

### Success — 201

```json
{
  "message": "User registered successfully",
  "userId": "<user_id>"
}
```

### Errors

**409 — Email already exists**

```json
{
  "message": "Email already exists"
}
```

**400 — Validation/registration error**

```json
{
  "message": "<error message>"
}
```

### Implementation

- Controller: `server/src/controllers/authController.js` → `register`
- Schema: `server/src/services/authService.js` → `registerSchema`
- Model: `User`

---

## POST `/v1/api/auth/login`

Authenticate a user and issue a JWT cookie.

**Auth:** Not required

### Request

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

### Success — 200

```json
{
  "message": "Login successful",
  "user": {
    "userId": "<user_id>"
  }
}
```

The response sets a `token` cookie with:

- `httpOnly: true`
- `secure: true`
- `sameSite: "none"`
- `maxAge`: 7 days

### Errors

**401 — Invalid credentials**

```json
{
  "message": "Invalid email or password"
}
```

**400 — Other login error**

```json
{
  "message": "<error message>"
}
```

### Implementation

- Controller: `server/src/controllers/authController.js` → `login`
- Uses: `User`, `bcrypt`, `jsonwebtoken`

---

## GET `/v1/api/auth/me`

Return the authenticated user's ID.

**Auth:** Required

### Success — 200

```json
{
  "success": true,
  "user": {
    "userId": "<user_id>"
  }
}
```

### Errors

**401 — Missing token**

```json
{
  "success": false,
  "message": "Acess denied. No token is provided."
}
```

**401 — Invalid/expired token**

```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

### Implementation

- Controller: `server/src/controllers/authController.js` → `getMe`
- Middleware: `server/src/middleware/authMiddleware.js`

---

## POST `/v1/api/auth/logout`

Clear the JWT cookie.

**Auth:** Required

### Success — 200

```json
{
  "message": "Logged out successfully"
}
```

The `token` cookie is cleared.

### Errors

Uses the same authentication errors as `/auth/me`.

### Implementation

- Controller: `server/src/controllers/authController.js` → `logout`

---

# Reviews

## POST `/v1/api/review`

Submit code for AI review.

**Auth:** Required

### Request

```json
{
  "code": "function add(a, b) {\n  return a + b;\n}",
  "language": "javascript"
}
```

Supported languages:

- `javascript`
- `typescript`
- `python`
- `java`
- `cpp`

Validation:

- `code`: required and non-empty
- `language`: must be supported

### Response

This endpoint uses Server-Sent Events (SSE):

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

Token events:

```text
data: {"token":"<token>"}
```

Success:

```text
data: {"status":"success"}
```

Completion:

```text
data: [DONE]
```

The final review structure is:

```json
{
  "issues": [
    {
      "line": 2,
      "severity": "low",
      "message": "Missing semicolon."
    }
  ],
  "suggestions": [
    {
      "description": "Add documentation.",
      "fix": "Add a documentation block."
    }
  ],
  "overall_score": 8,
  "summary": "Review summary."
}
```

### Errors

**401 — Authentication**

```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

**400 — Invalid request**

```json
{
  "message": "<error message>"
}
```

**SSE — AI response truncated**

```text
data: {"status":"error","message":"AI response was truncated. Please try again with shorter code."}
```

**SSE — AI response validation failed**

```text
data: {"status":"error","message":"AI response could not be validated. Please try again."}
```

**SSE — Review service failure**

```text
data: {"status":"error","message":"<error message>"}
```

### Implementation

- Controller: `server/src/controllers/reviewController.js` → `createReview`
- `reviewService.js`
  - Builds the review prompt
  - Processes streamed AI output
  - Parses and validates the result
  - Saves the review
- `groqProvider.js`
  - Calls Groq
  - Streams AI tokens
- Model: `server/src/models/Review.js`

Stored review data:

```js
{
  userId,
  code,
  language,
  feedback
}
```

---

## GET `/v1/api/review`

Retrieve the authenticated user's review history.

**Auth:** Required

### Query Parameters

| Parameter | Type | Default |
|---|---|---:|
| `page` | integer-like string | `1` |
| `limit` | integer-like string | `10` |

### Success — 200

```json
{
  "success": true,
  "reviews": [
    {
      "_id": "<review_id>",
      "userId": "<user_id>",
      "language": "javascript",
      "feedback": {
        "issues": [],
        "suggestions": [],
        "overall_score": 8,
        "summary": "Review summary."
      },
      "createdAt": "<timestamp>",
      "updatedAt": "<timestamp>"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

Behavior:

- Reviews are filtered by authenticated `userId`.
- Sorted by `createdAt` descending.
- `code` is excluded from the response.

### Errors

**401 — Authentication failure**

Same authentication errors as other protected endpoints.

**500 — Database/retrieval error**

```json
{
  "message": "<error message>"
}
```

### Implementation

- Controller: `server/src/controllers/reviewController.js` → `getReviews`
- Model: `server/src/models/Review.js`

---

# Users

## GET `/v1/api/users/`

Return the current implementation's user endpoint response.

**Auth:** Not required

### Success — 200

```text
Alll Users
```

This endpoint does not query MongoDB or return actual user records.

### Implementation

- Controller: `server/src/controllers/userController.js` → `getAllUsers`

---

# GitHub Webhook

## POST `/webhook/github`

Receive GitHub pull-request events and trigger automated PR review processing.

**Auth:** GitHub HMAC signature

This endpoint does **not** use the application's JWT middleware.

### Required Headers

```http
X-Hub-Signature-256: sha256=<hmac_signature>
X-GitHub-Event: pull_request
```

The signature is calculated from the raw request body using `GITHUB_WEBHOOK_SECRET`.

### Request Body

The endpoint uses:

```js
{
  action,
  pull_request,
  repository
}
```

Required fields for PR processing include:

```text
repository.owner.login
repository.name
pull_request.number
pull_request.head.sha
```

### Supported Events

Only `pull_request` events with these actions trigger processing:

- `opened`
- `synchronize`

Other events/actions receive `200 OK` without triggering review processing.

### Success — 200

```text
OK
```

The review runs asynchronously after the response is sent.

### Error — 401

```json
{
  "error": "Invalid signature"
}
```

### Automated Processing

For supported PR events:

1. Retrieve changed files from GitHub.
2. Retrieve full content for changed files with patches.
3. Retrieve related/imported files when applicable.
4. Deduplicate files by path.
5. Run the PR review.
6. Post a GitHub review if issues are found.
7. Do nothing if no issues are found.

### Implementation

- Controller: `server/src/controllers/webhookController.js` → `handleGithubWebhook`
- `githubService.js`
  - Retrieves PR files/content
  - Retrieves related files
  - Posts GitHub reviews
- `prReviewService.js`
  - Builds and executes PR review
  - Validates the result
- `ragService.js`
  - Provides relevant context
- `embeddingService.js`
  - Present in the service layer; direct participation in this endpoint is not established

### GitHub API

The service communicates with GitHub using endpoints equivalent to:

```text
GET  /repos/{owner}/{repo}/pulls/{pullNumber}/files
GET  /repos/{owner}/{repo}/contents/{filePath}?ref={ref}
GET  /repos/{owner}/{repo}/contents/{directory}?ref={ref}
POST /repos/{owner}/{repo}/pulls/{pullNumber}/reviews
```

Authentication:

```http
Authorization: token <GITHUB_TOKEN>
Accept: application/vnd.github+json
```

---

# Endpoint Summary

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| POST | `/v1/api/auth/register` | No | JSON |
| POST | `/v1/api/auth/login` | No | JSON + JWT cookie |
| GET | `/v1/api/auth/me` | Yes | JSON |
| POST | `/v1/api/auth/logout` | Yes | JSON + cleared cookie |
| POST | `/v1/api/review` | Yes | SSE |
| GET | `/v1/api/review` | Yes | JSON |
| GET | `/v1/api/users/` | No | Plain text |
| POST | `/webhook/github` | GitHub HMAC | Plain text `OK` |

# Route Source Files

- Authentication: `server/src/routes/authRoutes.js`
- Reviews: `server/src/routes/reviewRoutes.js`
- Users: `server/src/routes/userRoutes.js`
- GitHub webhook: `server/src/routes/webhookRoutes.js`
- Route mounting: `server/server.js`

