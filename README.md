# Bookd

Bookd is an AI-powered booking and travel-assistant platform. This repository contains the three components that make up the product:

| Folder | Description |
|---|---|
| [`frontend/`](frontend) | Customer-facing web app (React + Vite + TypeScript + Tailwind CSS) |
| [`admin/`](admin) | Admin dashboard for managing users, roles, plans, bookings, and content (React + Vite + TypeScript + Tailwind CSS) |
| [`backend/`](backend) | API server powering both apps — auth, bookings, AI chat assistant, payments, and travel-provider integrations (NestJS + TypeScript + PostgreSQL) |

Each folder is an independent project with its own dependencies, environment configuration, and README. See the README inside each folder for setup instructions specific to that component.

## Getting started

Each project keeps its own `.env.example` — copy it to `.env` inside that project's folder and fill in the required values before running it:

```bash
cd frontend && cp .env.example .env && npm install && npm run dev
cd admin && cp .env.example .env && npm install && npm run dev
cd backend && cp .env.example .env && npm install && npm run start:dev
```

The backend requires a running PostgreSQL instance; see [`backend/README.md`](backend/README.md) for details.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE). The `admin/` folder is derived from the TailAdmin template and additionally carries TailAdmin's original MIT license — see [`admin/LICENSE.md`](admin/LICENSE.md).
