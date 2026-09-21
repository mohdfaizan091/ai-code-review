# API Reference

## Overview

The backend is an Express application started from `server/server.js`.

Base route groups:

- `/v1/api/auth`
- `/v1/api/review`
- `/v1/api/users`
- `/webhook`

Global backend behavior:

- JSON request parsing is enabled with `express.json()`.
- Cookies are parsed with `cookie-parser`.
- CORS allows:
  - `http://localhost:5173`
  - `https://ai-code-review-olive.vercel.app`
- Cross-origin credentials are enabled.
- Authentication uses a JWT stored in the `token` cookie.

## Authentication conventions

Protected endpoints require a valid JWT cookie:

HTTP

```
Cookie: token=<jwt>

```

The JWT is read and verified by:

Text

```
server/src/middleware/authMiddleware.js

```

The middleware verifies the token with `JWT_SECRET` and attaches:

JavaScript

```
req.user = {
  userId: decode.userId
};

```

The implementation does not define a bearer-token header scheme such as:

HTTP

```
Authorization: Bearer <token>

```

---

# Authentication

## POST `/v1/api/auth/register`

Register a new user.

### Authentication

Not required.

### Request headers

The frontend sends:

HTTP

```
Content-Type: application/json

```

Other headers are not specified in the implementation.

### Request body

Defined by `registerSchema` in `server/src/services/authService.js`:

JSON

```
{
  "name": "string",
  "email": "user@example.com",
  "password": "string"
}

```

Validation rules:

- `name`: Required, at least one character.
- `email`: Required and must be a valid email format.
- `password`: Required and at least six characters.

Additional request fields are not specified as being accepted or rejected by the implementation.

### Query parameters

None.

### Path parameters

None.

### Success response

**HTTP 201**

JSON

```
{
  "message": "User registered successfully",
  "userId": "<user_id>"
}

```

The `userId` is the newly created MongoDB/Mongoose user identifier.

### Error responses

#### Email already exists

**HTTP 409**

JSON

```
{
  "message": "Email already exists"
}

```

#### Validation or other registration error

**HTTP 400**

JSON

```
{
  "message": "<error message>"
}

```

The exact error message is generated from the thrown error and is not fixed for every failure.

### Example request

HTTP

```
POST /v1/api/auth/register
Content-Type: application/json

```

JSON

```
{
  "name": "Mohd Faizan",
  "email": "faizan@example.com",
  "password": "secret123"
}

```

### Controller

Text

```
server/src/controllers/authController.js
register

```

### Relevant service

Text

```
server/src/services/authService.js

```

This service defines the registration Zod schema. User creation is performed directly by the controller using the `User` model.

### Streaming/SSE

No. The response is a regular JSON response.

---

## POST `/v1/api/auth/login`

Authenticate an existing user and issue a JWT cookie.

### Authentication

Not required.

### Request headers

The frontend sends:

HTTP

```
Content-Type: application/json

```

Other headers are not specified in the implementation.

### Request body

The controller directly reads:

JavaScript

```
req.body.email
req.body.password

```

Therefore, the implementation expects:

JSON

```
{
  "email": "string",
  "password": "string"
}

```

No Zod or other request-body validation schema is applied to the login body.

### Query parameters

None.

### Path parameters

None.

### Success response

**HTTP 200**

JSON

```
{
  "message": "Login successful",
  "user": {
    "userId": "<user_id>"
  }
}

```

The response also sets a cookie:

Text

```
token=<jwt>

```

Cookie attributes configured in the controller:

- `httpOnly: true`
- `secure: true`
- `sameSite: "none"`
- `maxAge`: seven days

### Error responses

#### User not found

**HTTP 401**

JSON

```
{
  "message": "Invalid email or password"
}

```

#### Incorrect password

**HTTP 401**

JSON

```
{
  "message": "Invalid email or password"
}

```

#### Other login error

**HTTP 400**

JSON

```
{
  "message": "<error message>"
}

```

### Example request

HTTP

```
POST /v1/api/auth/login
Content-Type: application/json

```

JSON

```
{
  "email": "faizan@example.com",
  "password": "secret123"
}

```

### Controller

Text

```
server/src/controllers/authController.js
login

```

### Relevant service

No business-logic service is called by the login controller. The controller directly uses:

- `server/src/models/User.js`
- `bcrypt`
- `jsonwebtoken`

### Streaming/SSE

No. The response is a regular JSON response.

---

## GET `/v1/api/auth/me`

Return the authenticated user information attached by the JWT middleware.

### Authentication

**Required.**

The request must include a valid JWT cookie:

HTTP

```
Cookie: token=<jwt>

```

### Request headers

No application-specific header is required by the implementation. Authentication is read from the cookie.

### Request body

None.

### Query parameters

None.

### Path parameters

None.

### Success response

**HTTP 200**

JSON

```
{
  "success": true,
  "user": {
    "userId": "<user_id>"
  }
}

```

The `user` object contains the `userId` extracted from the JWT. The controller does not query MongoDB for the complete user document.

### Error responses

#### Missing token

**HTTP 401**

JSON

```
{
  "success": false,
  "message": "Acess denied. No token is provided."
}

```

The spelling `"Acess"` is present in the implementation.

#### Invalid or expired token

**HTTP 401**

JSON

```
{
  "success": false,
  "message": "Invalid or expired token."
}

```

### Controller

Text

```
server/src/controllers/authController.js
getMe

```

### Relevant service

No service is called. The endpoint uses:

Text

```
server/src/middleware/authMiddleware.js

```

### Streaming/SSE

No. The response is a regular JSON response.

---

## POST `/v1/api/auth/logout`

Clear the JWT authentication cookie.

### Authentication

**Required.**

The route applies `authMiddleware` before executing the logout controller. A valid `token` cookie is therefore required.

### Request headers

No application-specific header is required by the implementation. Authentication is read from the cookie.

### Request body

None.

### Query parameters

None.

### Path parameters

None.

### Success response

**HTTP 200**

JSON

```
{
  "message": "Logged out successfully"
}

```

The controller also clears the `token` cookie using:

- `httpOnly: true`
- `secure: true`
- `sameSite: "none"`

### Error responses

#### Missing token

**HTTP 401**

JSON

```
{
  "success": false,
  "message": "Acess denied. No token is provided."
}

```

#### Invalid or expired token

**HTTP 401**

JSON

```
{
  "success": false,
  "message": "Invalid or expired token."
}

```

### Controller

Text

```
server/src/controllers/authController.js
logout

```

### Relevant service

No service is called.

### Streaming/SSE

No. The response is a regular JSON response.

---

# Reviews

## POST `/v1/api/review`

Submit code for AI review.

### Authentication

**Required.**

The request must include a valid JWT cookie:

HTTP

```
Cookie: token=<jwt>

```

### Request headers

The frontend sends:

HTTP

```
Content-Type: application/json

```

The request must also include the authentication cookie.

### Request body

Validated in `server/src/controllers/reviewController.js` by `reviewSchema`:

JSON

```
{
  "code": "string",
  "language": "javascript"
}

```

Supported `language` values are exactly:

- `javascript`
- `typescript`
- `python`
- `java`
- `cpp`

Validation rules:

- `code`: Required and must not be empty.
- `language`: Must be one of the supported values above.

### Query parameters

None.

### Path parameters

None.

### Success response

This endpoint uses a streaming response with:

HTTP

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

```

The backend emits SSE-style events.

#### Token event

For streamed AI content:

Text

```
data: {"token":"<token>"}

```

The `token` value contains a partial piece of the AI-generated response.

#### Processing success event

After the complete AI response has been parsed, normalized, validated, and saved:

Text

```
data: {"status":"success"}

```

#### Stream completion event

At the end of the stream:

Text

```
data: [DONE]

```

The complete AI result is expected to have this structure internally:

JSON

```
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

The exact AI-generated content is dynamic. The structure is validated by `reviewResponseSchema`.

### Error responses

#### Missing or invalid authentication

**HTTP 401**

Missing token:

JSON

```
{
  "success": false,
  "message": "Acess denied. No token is provided."
}

```

Invalid or expired token:

JSON

```
{
  "success": false,
  "message": "Invalid or expired token."
}

```

#### Invalid request body

The controller catches validation errors and attempts to return:

**HTTP 400**

JSON

```
{
  "message": "<error message>"
}

```

The exact message is generated by Zod.

#### Truncated AI response

The stream emits:

Text

```
data: {"status":"error","message":"AI response was truncated. Please try again with shorter code."}

```

It then emits:

Text

```
data: [DONE]

```

#### AI response validation failure

If the AI output cannot be extracted, parsed, normalized, or validated, the stream emits:

Text

```
data: {"status":"error","message":"AI response could not be validated. Please try again."}

```

It then emits:

Text

```
data: [DONE]

```

#### Groq or review-service failure

The stream emits an error event:

Text

```
data: {"status":"error","message":"<error message>"}

```

The fallback message used when no error message is available is:

Text

```
The review service could not complete the request.

```

The implementation does not define a separate structured HTTP error response for failures occurring after the SSE response has started.

### Example request

HTTP

```
POST /v1/api/review
Content-Type: application/json
Cookie: token=<jwt>

```

JSON

```
{
  "code": "function add(a, b) {\n  return a + b;\n}",
  "language": "javascript"
}

```

### Controller

Text

```
server/src/controllers/reviewController.js
createReview

```

### Relevant services

- `server/src/services/reviewService.js`
  - Builds the review prompt.
  - Consumes streamed AI output.
  - Parses and normalizes the response.
  - Validates the final result.
  - Saves the review.
- `server/src/providers/groqProvider.js`
  - Calls the Groq API and yields AI tokens.

### Database model

Text

```
server/src/models/Review.js

```

The validated review is saved with:

JavaScript

```
{
  userId,
  code,
  language,
  feedback: validated
}

```

### Streaming/SSE

**Yes.**

The endpoint streams token events and status events using the `text/event-stream` content type.

---

## GET `/v1/api/review`

Retrieve the authenticated user’s review history.

### Authentication

**Required.**

The request must include a valid JWT cookie:

HTTP

```
Cookie: token=<jwt>

```

### Request headers

No application-specific header is required by the implementation. Authentication is read from the cookie.

### Request body

None.

### Query parameters

Both parameters are optional.

| **ParameterTypeDefaultBehavior** |                     |      |                                    |
| -------------------------------- | ------------------- | ---- | ---------------------------------- |
| `page`                           | Integer-like string | `1`  | Used to calculate the page offset  |
| `limit`                          | Integer-like string | `10` | Maximum number of reviews returned |

The implementation uses `parseInt`. It does not define additional validation or maximum/minimum bounds.

### Path parameters

None.

### Success response

**HTTP 200**

JSON

```
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

Important implementation behavior:

- Reviews are filtered by the authenticated `userId`.
- Reviews are sorted by `createdAt` descending.
- The `code` field is explicitly excluded from returned review documents using `.select('-code')`.
- The exact serialized Mongoose output can vary according to the stored document and Mongoose behavior.

### Error responses

#### Missing or invalid authentication

**HTTP 401**

Missing token:

JSON

```
{
  "success": false,
  "message": "Acess denied. No token is provided."
}

```

Invalid or expired token:

JSON

```
{
  "success": false,
  "message": "Invalid or expired token."
}

```

#### Database or retrieval error

**HTTP 500**

JSON

```
{
  "message": "<error message>"
}

```

### Example request

HTTP

```
GET /v1/api/review?page=1&limit=10
Cookie: token=<jwt>

```

### Controller

Text

```
server/src/controllers/reviewController.js
getReviews

```

### Relevant service

No service is called. The controller directly queries:

Text

```
server/src/models/Review.js

```

### Streaming/SSE

No. The response is regular JSON.

---

# Users

## GET `/v1/api/users/`

Return the current implementation’s user endpoint response.

### Authentication

Not required.

The route does not apply `authMiddleware`.

### Request headers

No required headers are specified.

### Request body

None.

### Query parameters

None.

### Path parameters

None.

### Success response

**HTTP 200**

The controller uses:

JavaScript

```
res.send("Alll Users");

```

Therefore, the response body is the plain-text string:

Text

```
Alll Users

```

The implementation does not query MongoDB or return user records despite the route/controller naming.

### Error responses

No explicit error responses are implemented in this controller.

### Controller

Text

```
server/src/controllers/userController.js
getAllUsers

```

### Relevant service

None.

### Streaming/SSE

No. The response is plain text.

---

# GitHub Webhook

## POST `/webhook/github`

Receive GitHub pull request webhook events and trigger automated PR review processing.

### Authentication

This endpoint does not use the application’s JWT `authMiddleware`.

It authenticates webhook requests by validating the GitHub signature header using `GITHUB_WEBHOOK_SECRET`.

### Request headers

The implementation reads:

HTTP

```
X-Hub-Signature-256: sha256=<hmac_signature>
X-GitHub-Event: pull_request

```

The signature is calculated over the raw request body.

The raw body is captured in `server/server.js` before the general JSON parser:

JavaScript

```
app.use('/webhook/github', express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

```

The implementation also expects the request body to be JSON.

### Request body

The controller destructures these top-level properties:

JavaScript

```
const { action, pull_request, repository } = req.body;

```

For supported pull request events, it accesses:

JavaScript

```
repository.owner.login
repository.name
pull_request.number
pull_request.head.sha

```

The endpoint therefore requires a GitHub webhook payload containing those properties for the automated PR flow.

The exact complete GitHub payload schema is not defined in this repository.

### Supported event behavior

The controller processes only:

JavaScript

```
event === 'pull_request'

```

with one of these actions:

- `opened`
- `synchronize`

Other GitHub event types or pull request actions receive the initial `200 OK` response but do not trigger PR review processing.

### Query parameters

None.

### Path parameters

None.

### Success response

After signature validation, the endpoint immediately sends:

**HTTP 200**

Text

```
OK

```

The review processing continues asynchronously after this response is sent.

### Error responses

#### Missing or invalid signature

**HTTP 401**

JSON

```
{
  "error": "Invalid signature"
}

```

#### GitHub API or review-processing failures

The controller catches background processing failures and logs:

Text

```
Failed to review/post PR: <error message>

```

The implementation does not send a later HTTP error response because it sends `200 OK` before beginning the asynchronous review work.

### Automated processing behavior

For a supported pull request event:

1. `getPRFiles` retrieves changed files from GitHub.
2. For each changed file with a patch:
   - Full file content is retrieved.
   - Related imported files are retrieved.
   - Same-folder JavaScript files are retrieved.
3. Related files are combined and deduplicated by path.
4. `reviewPRDiff` analyzes the changed files and related context.
5. If at least one file contains an issue, `postPRReview` posts a GitHub review.
6. If no issues are found, no review is posted.

### Controller

Text

```
server/src/controllers/webhookController.js
handleGithubWebhook

```

### Relevant services

- `server/src/services/githubService.js`
  - Retrieves PR files.
  - Retrieves file content.
  - Retrieves related and folder files.
  - Posts the final PR review to GitHub.
- `server/src/services/prReviewService.js`
  - Builds and executes the PR-diff review.
  - Validates the structured PR review result.
- `server/src/services/ragService.js`
  - Used by `prReviewService.js` through `findRelevantContext`.
- `server/src/services/embeddingService.js`
  - Exists in the services directory; its direct participation in this endpoint is not established by the inspected controller/service code.

### External GitHub API calls

The webhook processing uses the GitHub API through `server/src/services/githubService.js`.

The implementation calls endpoints equivalent to:

Text

```
GET https://api.github.com/repos/{owner}/{repo}/pulls/{pullNumber}/files

```

Text

```
GET https://api.github.com/repos/{owner}/{repo}/contents/{filePath}?ref={ref}

```

Text

```
GET https://api.github.com/repos/{owner}/{repo}/contents/{directory}?ref={ref}

```

Text

```
POST https://api.github.com/repos/{owner}/{repo}/pulls/{pullNumber}/reviews

```

These are internal outbound service calls, not additional Express routes exposed by this repository.

The GitHub API requests use:

HTTP

```
Authorization: token <GITHUB_TOKEN>
Accept: application/vnd.github+json

```

### Streaming/SSE

No for the webhook HTTP response.

The endpoint immediately returns plain-text `OK`. The internal PR AI processing consumes Groq’s streaming provider, but that stream is not exposed to the webhook caller.

---

# Endpoint summary

| **MethodEndpointAuthenticationResponse typeController** |                         |                       |                       |                                         |
| ------------------------------------------------------- | ----------------------- | --------------------- | --------------------- | --------------------------------------- |
| `POST`                                                  | `/v1/api/auth/register` | No                    | JSON                  | `authController.register`               |
| `POST`                                                  | `/v1/api/auth/login`    | No                    | JSON + JWT cookie     | `authController.login`                  |
| `GET`                                                   | `/v1/api/auth/me`       | Yes                   | JSON                  | `authController.getMe`                  |
| `POST`                                                  | `/v1/api/auth/logout`   | Yes                   | JSON + cleared cookie | `authController.logout`                 |
| `POST`                                                  | `/v1/api/review`        | Yes                   | SSE                   | `reviewController.createReview`         |
| `GET`                                                   | `/v1/api/review`        | Yes                   | JSON                  | `reviewController.getReviews`           |
| `GET`                                                   | `/v1/api/users/`        | No                    | Plain text            | `userController.getAllUsers`            |
| `POST`                                                  | `/webhook/github`       | GitHub HMAC signature | Plain text `OK`       | `webhookController.handleGithubWebhook` |

# Route source files

- Authentication: `server/src/routes/authRoutes.js`
- Reviews: `server/src/routes/reviewRoutes.js`
- Users: `server/src/routes/userRoutes.js`
- GitHub webhook: `server/src/routes/webhookRoutes.js`
- Route mounting: `server/server.js`

[**svg**](https://github.com/mohdfaizan091/ai-code-review)