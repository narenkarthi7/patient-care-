# Patient Management System

A full-stack patient and billing application built with React, Redux Toolkit, NestJS, TypeORM, and PostgreSQL. Razorpay and all online payment processing are intentionally excluded.

## Features

- JWT-based login, route protection, and logout.
- Patient CRUD, details, name search, and gender filtering.
- Bill CRUD linked to patients, with pending/paid/failed/cancelled statuses.
- Dashboard totals for patients and bills, paid and pending amounts, and recently added patients.
- DTO validation, consistent REST responses, database constraints, and meaningful API errors.
- Responsive interface with client-side form validation.

## Requirements

- Node.js 20+
- PostgreSQL 14+

## Run locally

1. Create a PostgreSQL database (for example `patient_management`).
2. Copy `backend/.env.example` to `backend/.env` and set your database connection and initial login credentials.
3. Install and start both applications from the project root:

   ```sh
   npm install
   npm run dev
   ```

   The frontend runs at `http://localhost:5173`, and the API runs at `http://localhost:3000/api`.
4. Sign in with `SEED_EMAIL` and `SEED_PASSWORD` from `backend/.env`. The backend creates this user on first startup if it does not already exist.

For production, set `NODE_ENV=production`, apply `backend/schema.sql` to the PostgreSQL database before starting, and set `JWT_SECRET` to a long, unique secret. Production startup fails if `JWT_SECRET` is missing. TypeORM schema synchronization is enabled only in development. The backend accepts CORS requests from `FRONTEND_URL`.

## API overview

All routes except login require `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate and return a JWT |
| GET | `/api/patients?search=&gender=` | List/search/filter patients |
| GET | `/api/patients/:id` | Get a patient |
| POST | `/api/patients` | Create a patient |
| PATCH | `/api/patients/:id` | Update a patient |
| DELETE | `/api/patients/:id` | Delete a patient (blocked if bills exist) |
| GET | `/api/bills` | List bills and patient names |
| GET | `/api/bills/:id` | Get a bill |
| POST | `/api/bills` | Create a pending bill |
| PATCH | `/api/bills/:id` | Update a bill |
| DELETE | `/api/bills/:id` | Delete a bill |
| GET | `/api/dashboard` | Dashboard totals and recent patients |

Bill amounts and tax are entered in the currency's major unit (for example, `25.50`). Total is calculated by the API as amount plus tax; it is never trusted from the client. Payment status is informational and is managed through bill updates; no payment gateway or payment-history API is included.

## Data flow

React components dispatch Redux Toolkit thunks. The slices call the shared API client, which adds the JWT, then NestJS guards and validated controllers call services and TypeORM repositories. TypeORM persists to PostgreSQL and results return through the same chain. Redux provides a shared source of truth for authentication, patients, bills, dashboard data, request loading, and API errors so separate pages stay consistent after mutations.

## Data model

- `users`: UUID primary key, unique email, password hash, creation time.
- `patients`: UUID primary key, patient attributes, unique email, created/updated timestamps.
- `bills`: UUID primary key, patient foreign key, description, amount, tax, computed total, status, timestamps.

PostgreSQL relations enforce patient/bill integrity. Patient deletion is restricted when bills reference the patient. Online payment records are not modeled because Razorpay is out of scope.
