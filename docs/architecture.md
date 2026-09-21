# AI Code Review System — Architecture

## 1. Overview

The AI Code Review System is a full-stack web application that analyzes source code using an AI model and provides structured code-review feedback.

The system supports two primary review flows:

1. **Manual Code Review** — A user submits source code and selects a programming language through the React frontend.
2. **Automated GitHub Pull Request Review** — GitHub sends pull-request webhook events to the backend, which analyzes the changed files and can post review comments back to GitHub.

The system follows a layered architecture where the backend separates routing, controllers, business logic, external providers, authentication, and database models.

---

## 2. High-Level Architecture

flowchart LR
    User([User])

    Frontend["React/Vite Frontend<br/>client--"]
    Backend["Express Backend<br/>server/server.js"]

    Auth["Authentication / JWT<br/>HttpOnly cookie + authMiddleware"]
    Mongo[("MongoDB<br/>User and Review collections")]
    ReviewService["Code Review Service<br/>reviewService.js + prReviewService.js"]
    Groq["Groq AI API<br/>groqProvider.js"]

    GitHub["GitHub"]
    Webhook["GitHub Webhook<br/>/webhook/github"]

    subgraph NormalFlow["Normal Code Review Flow"]
        User -->|"Enter code, select language"| Frontend
        Frontend -->|"POST /v1/api/review<br/>credentials included"| Backend
        Backend -->|"Validate JWT cookie"| Auth
        Auth -->|"Authorize request<br/>attach userId"| Backend
        Backend -->|"Review request"| ReviewService
        ReviewService -->|"Streaming prompt"| Groq
        Groq -->|"Streaming AI tokens"| ReviewService
        ReviewService -->|"SSE review tokens/status"| Backend
        Backend -->|"SSE response"| Frontend
        Frontend -->|"Display issues, suggestions,<br/>score and summary"| User
        ReviewService -->|"Persist validated review"| Mongo
    end

    subgraph GitHubFlow["GitHub Pull Request Automated Review Flow"]
        GitHub -->|"pull_request opened/synchronize"| Webhook
        Webhook -->|"POST /webhook/github"| Backend
        Backend -->|"Verify x-hub-signature-256"| Webhook
        Webhook -->|"Fetch changed files and context"| GitHub
        Webhook -->|"PR diff review request"| ReviewService
        ReviewService -->|"Analyze PR changes"| Groq
        Groq -->|"AI review result"| ReviewService
        ReviewService -->|"Review issues"| Webhook
        Webhook -->|"Post PR review when issues exist"| GitHub
    end

    Auth -.->|"JWT_SECRET"| Backend
    Auth -.->|"Login/register user data"| Mongo