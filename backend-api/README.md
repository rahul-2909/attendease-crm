# backend-api

Attendance SaaS backend API (Node.js, Express, MongoDB).

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `JWT_SECRET` in `.env` to a long, unique random value before using the API.
The server waits for MongoDB before listening on `PORT` (default `5000`).

Seed the demo organization and role accounts with:

```bash
npm run seed
```

Run the backend tests with:

```bash
npm test
```

## Structure

- `src/config` - environment, database, and JWT configuration
- `src/controllers` - request handlers
- `src/services` - business logic
- `src/models` - Mongoose models
- `src/routes` - Express routers
- `src/middlewares` - auth, roles, validation, and error handling
- `src/validations` - request schemas
- `src/utils` - shared helpers
- `src/constants` - shared constants
