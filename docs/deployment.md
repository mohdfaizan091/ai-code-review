# AI Code Review System — Deployment Diagram

## 1. Overview

The AI Code Review System is deployed as a distributed web application consisting of a React/Vite frontend, a Node.js/Express backend, MongoDB Atlas, the Groq AI API, and GitHub integration.

The deployment architecture supports two major flows:

1. **Normal Code Review** — The user's browser communicates with the React frontend, which communicates with the backend. The backend interacts with MongoDB and Groq AI.
2. **GitHub Pull Request Review** — GitHub sends pull-request webhook events to the backend, which retrieves pull-request information, performs AI analysis, and posts review results back to GitHub.

The README documents the frontend deployment as **Vercel**, the backend deployment as **Render**, and the database as **MongoDB Atlas**.

## 2. Deployment Diagram

```mermaid
flowchart LR
    Browser["User's Browser<br/>Client runtime"]

    subgraph Vercel["Vercel<br/>(documented in README)"]
        Frontend["React/Vite Frontend<br/>client/<br/>Client-side application"]
    end

    subgraph Render["Render<br/>(documented in README)"]
        Backend["Node.js / Express Backend<br/>server/<br/>Backend server"]
        Webhook["GitHub Webhook Endpoint<br/>POST /webhook/github"]
    end

    Mongo[("MongoDB Atlas<br/>(documented in README)<br/>Database")]
    Groq["Groq AI API<br/>External AI service"]
    GitHub["GitHub<br/>External GitHub service"]
    GitHubWebhook["GitHub Webhook<br/>pull_request events"]

    Browser -->|"Load and use web application"| Frontend

    Frontend -->|"HTTP API requests<br/>/v1/api/auth/*<br/>/v1/api/review"| Backend

    Backend -->|"Read/write users and reviews<br/>Mongoose"| Mongo

    Backend -->|"Streaming AI review request"| Groq
    Groq -->|"Streaming review response"| Backend

    Backend -->|"SSE review response"| Frontend
    Frontend -->|"Display review result"| Browser

    GitHub -->|"Send pull_request event"| GitHubWebhook
    GitHubWebhook -->|"POST /webhook/github"| Webhook

    Webhook -->|"Webhook handling and signature verification"| Backend

    Backend -->|"Fetch changed files/context<br/>and post PR review"| GitHub

    Backend -->|"PR analysis request"| Groq
    Groq -->|"AI analysis result"| Backend

    Webhook -.->|"Runs as part of backend deployment"| Backend
```

## 3. Deployment Components

### Client-Side Application (Vercel)

The React/Vite frontend is located in `client/` and is documented as deployed on **Vercel**. Relevant paths:

```text
client/src/main.jsx
client/src/App.jsx
client/src/pages
client/src/components
client/src/services
```

The frontend sends authenticated API requests to the backend with credentials included, so the JWT cookie is sent with each request.

### Backend Server (Render)

The Node.js/Express backend (`server/`, started by `server/server.js`) is documented as deployed on **Render**. It exposes:

```text
/v1/api/auth
/v1/api/review
/v1/api/users
/webhook/github
```

The backend is responsible for authentication, code-review processing, AI API communication, database operations, and GitHub integration (including webhook handling) — all within the same deployed service. The GitHub webhook endpoint is not a separately deployed service; it runs as a route within this backend.

### Database (MongoDB Atlas)

The backend connects to MongoDB Atlas via Mongoose, using the `MONGO_URI` environment variable. Relevant files:

```text
server/src/config/db.js
server/src/models/User.js
server/src/models/Review.js
```

The database stores user accounts and code-review records, related one-to-many:

```text
User (1) ──── (0..*) Review
```

### Groq AI Integration

The backend communicates with the external Groq API through `server/src/providers/groqProvider.js`, which sends streaming chat-completion requests. Generated review tokens are relayed to the frontend via the backend's SSE response (see the flow in Section 2).

## 4. Environment Configuration

The backend uses environment variables (validated in `server/src/config/envConfig.js`) for:

- MongoDB connection (`server/src/config/db.js`)
- JWT authentication
- Groq API access
- GitHub integration and webhook signature verification

## 5. External Services &amp; Responsibilities

| Component | Hosting / Location | Responsibility |
|---|---|---|
| React/Vite Frontend | Vercel | Client-side application, executed in the user's browser |
| Node.js/Express Backend | Render | REST API, authentication, review processing, GitHub webhook handling |
| MongoDB Atlas | MongoDB Atlas | Persistent storage for users and reviews |
| Groq AI API | External | AI-powered code analysis |
| GitHub / GitHub Webhook | External | Repository and pull-request integration; sends `pull_request` events |

## 6. Deployment Security

- JWT authentication with HttpOnly cookies, verified via authentication middleware
- GitHub webhook signature verification (`x-hub-signature-256`)
- Password hashing using bcrypt
- Sensitive configuration (API keys, database credentials, JWT secret, webhook secret) kept in environment variables rather than source code

## 7. Deployment Limitations

The deployment locations described above are based on the project README rather than independently verified live infrastructure. The GitHub webhook is not a separately deployed service — it runs as an endpoint within the backend deployment. No separate deployment manifests were available in the analyzed source.