# Mini Job Application Tracker

A full stack web app for tracking job applications across hiring stages. It includes a React + TypeScript frontend, an Express + TypeScript REST API, Prisma validation/persistence, and a SQLite database for quick local review.

## Tech Stack

- Frontend: React, Vite, TypeScript, Lucide icons
- Backend: Node.js, Express, TypeScript, Zod
- Database: SQLite-compatible SQL file through sql.js
- Testing: Vitest

## Features

- List applications with company, title, job type, status, applied date, and actions
- Create, view, edit, and delete applications
- Delete confirmation before removal
- Filter by status: Applied, Interviewing, Offer, Rejected
- Search by company name or job title
- Frontend and backend validation
- Loading, empty, and error states
- Responsive UI

## Prerequisites

- Node.js 20+
- pnpm 9+

## Installation

```bash
pnpm --dir backend install
pnpm --dir frontend install
```

Create environment files:

```bash
copy .env.example backend\.env
copy .env.example frontend\.env
```

Initialize the database:

```bash
pnpm --dir backend db:init
```

## Development

Start the API:

```bash
pnpm --dir backend dev
```

Start the frontend in a second terminal:

```bash
pnpm --dir frontend dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4000

## API Documentation

Base URL: `http://localhost:4000`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/applications?status=Applied&search=company` | List applications with optional filters |
| GET | `/applications/:id` | Get one application |
| POST | `/applications` | Create an application |
| PATCH | `/applications/:id` | Partially update an application |
| DELETE | `/applications/:id` | Delete an application |

### Application Fields

```json
{
  "companyName": "InternSathi",
  "jobTitle": "Full Stack Intern",
  "jobType": "Internship",
  "status": "Applied",
  "appliedDate": "2026-06-19",
  "notes": "Submitted assignment"
}
```

Allowed `jobType` values: `Internship`, `Full_time`, `Part_time`

Allowed `status` values: `Applied`, `Interviewing`, `Offer`, `Rejected`

## Tests

```bash
pnpm --dir backend test
```

## Build

```bash
pnpm --dir backend build
pnpm --dir frontend build
```

## Environment Variables

Backend:

- `DATABASE_FILE`: SQL database file path, default `data/applications.db`
- `PORT`: API port, default `4000`
- `CORS_ORIGIN`: Frontend origin, default `http://localhost:5173`

Frontend:

- `VITE_API_URL`: API URL, default `http://localhost:4000`

## Architecture Notes

The backend is kept as the source of truth for validation and persistence. Zod validates incoming API payloads before the SQL layer writes to a local database file. The frontend performs lightweight validation for faster feedback, then refreshes from the API after mutations so the UI always reflects persisted data. REST was chosen because the assignment surface is small and maps cleanly to CRUD endpoints.

## AI Usage

AI was used to interpret the assignment requirements, scaffold the full stack structure, draft validation and API behavior, and refine the UI/README. The final implementation was reviewed through build and test commands before submission.
