# SKILLGRID_BACKEND

Backend API for SkillGrid — user management, courses, and skill-tracking for the SkillGrid platform.

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]() [![Tests](https://img.shields.io/badge/run-coverage-yellow)]()

<!-- Short description -->
A Node.js/Express backend that provides REST APIs for SkillGrid. It handles authentication, user profiles, course CRUD, and progress tracking.

## Table of contents
- [Quick Start](#quick-start)
- [Install](#install)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Examples](#api-examples)
- [Testing](#testing)
- [Contact](#contact)

## Quick Start
Clone, install, and run the dev server:

```bash
git clone https://github.com/FaisalGul786/SKILLGRID_BACKEND
cd SKILLGRID_BACKEND-main
cp .env.example .env                # fill in values
bun install
bun run dev                         # starts in development mode
```

For production build:

```bash
bun ci
bun run build
bun start
```

## Install
Requirements:
- Node.js 18+

Install dependencies:

```bash
bun install
```

## Configuration
Create a `.env` file (see `.env.example`) and set the required variables:

```
PORT=3000
DATABASE_URL=postgresql://<user>:<password>@<endpoint-id>-pooler.<region>.aws.neon.tech/<database>?sslmode=require
DATABASE_URL_DIRECT=postgresql://<user>:<password>@<endpoint-id>.<region>.aws.neon.tech/<database>?sslmode=require
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

## Usage
Start a local dev server:

```bash
bun  run dev
```


## API Examples
Authenticate and call a protected endpoint (example):

1) Get a token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret"}'
```

Response:
```json
{ "token": "eyJhbGciOi..." }
```

2) Use the token:

```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer eyJhbGciOi..."
```

## Testing
Run tests and linter:

```bash
bun test
bun run lint
```

CI will run tests and coverage on push/pull requests.

## Contributing
Contributions are welcome. Please:
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Run tests and lint locally
4. Open a pull request describing your change

See CONTRIBUTING.md for detailed guidelines (link to file if present).

## Deployment
Example using Docker (optional):

```bash
docker build -t skillgrid-backend:latest .
docker run -e DATABASE_URL=$DATABASE_URL -p 3000:3000 skillgrid-backend:latest
```


## Contact
Maintainer: Muhammad Faisal Gul — <faisalgull3.o@gmail.com>