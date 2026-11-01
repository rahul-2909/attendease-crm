# AttendEase

Attendance and workforce management SaaS with a React/Vite frontend and an
Express/MongoDB API.

## Requirements

- Node.js 20.19+ (or 22.12+)
- npm 10+
- MongoDB (local or hosted)

## Install

Install the frontend and backend dependencies from the repository root:

```sh
npm install
npm install --prefix backend-api
```

## Configure the API

Create `backend-api/.env` and set at least a JWT secret. The API defaults to
MongoDB at `mongodb://127.0.0.1:27017/attendance` and port `5000`.

```env
MONGODB_URI=mongodb://127.0.0.1:27017/attendance
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
```

To load the seeded demo workspace and role accounts, run:

```sh
npm run seed:api
```

## Run

Start the API and frontend in separate terminals from the repository root:

```sh
npm run dev:api
```

```sh
npm run dev
```

The API health check is at http://localhost:5000/health and the frontend is at
http://localhost:5173. Demo credentials are listed on the login screen.

For production, build the frontend and start the preview server:

```sh
npm run build
npm start
```

The frontend preview server listens on port 4173. Start the production API with
`npm run start:api`.

## Features

- Employee, department, project, attendance, leave, shift and location management
- Attendance check-in/check-out, manual attendance, and date/status filters
- Leave requests, review actions and request history
- Salary records, reports and organization settings
- Organization-scoped role permissions for dashboard, employees, departments,
  projects, attendance, leave, shifts, reports, salary, settings and permissions
- Role-based navigation and route protection, with API-side permission checks

## Tests

Run the backend module-permission tests:

```sh
npm run test:api
```

Run a frontend command directly in the workspace when needed:

```sh
npm run dev --workspace frontend-web
```
