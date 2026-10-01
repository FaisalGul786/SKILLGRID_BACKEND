# SKILLGRID_BACKEND

A high-performance, multi-role LMS engineered with secure cloud media pipelines, automated grading, and real-time, Redis-synced timed assessments.

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]() [![Bun](https://img.shields.io/badge/Bun-runtime-000000?logo=bun&logoColor=white)](https://bun.sh/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql&logoColor=000000)](https://neon.tech/)
[![Upstash Redis](https://img.shields.io/badge/Upstash-Redis-00C853?logo=redis&logoColor=white)](https://upstash.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=000000)](https://orm.drizzle.team/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-media%20storage-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![JWT](https://img.shields.io/badge/JWT-authentication-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-email%20service-22B573)](https://nodemailer.com/)

---

## Features

- **Architecture:**  Modular full-stack platform supporting students, instructors, and admins, built with PostgreSQL (Drizzle ORM) and Next.js Edge proxy authentication middleware.

- **Media Management:** Secure video lesson streaming and PDF assignment uploads/grading via Cloudinary signed pipelines.

- **Real-Time Features:** Time-bound quizzes with real-time draft state syncing powered by Upstash Redis.

- **Core Mechanics:** End-to-end course creation, progress tracking, and automated certificate generation.


## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL

---

## Table of contents
- [Quick Start](#quick-start)
- [Install](#install)
- [Configuration](#configuration)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [API Examples](#api-examples)
- [Testing](#testing)
- [Contact](#contact)


## Folder Structure

```text
SKILLGRID_BACKEND/
├── .env.example
├── .gitignore
├── README.md
├── bun.lock
├── drizzle.config.js
├── package.json
└── src/
    ├── app.js
    ├── external_services/
    │   ├── email_service/
    │   │   └── send-email.js
    │   └── upstash_redis_service/
    │       └── upstash-redis-draft.js
    ├── index.js
    ├── modules/
    │   ├── assignment_management/
    │   │   ├── controllers/
    │   │   │   └── assignment-management-controller.js
    │   │   ├── repositories/
    │   │   │   └── assignment-management-repository.js
    │   │   ├── routes/
    │   │   │   └── assignment-management-routes.js
    │   │   ├── schema/
    │   │   │   ├── assignment-schema.js
    │   │   │   └── assignment-submissions-schema.js
    │   │   └── services/
    │   │       └── assignment-management-service.js
    │   ├── authentication/
    │   │   ├── controllers/
    │   │   │   └── auth-controller.js
    │   │   ├── repositories/
    │   │   │   └── auth-repository.js
    │   │   ├── routes/
    │   │   │   └── auth-routes.js
    │   │   ├── schema/
    │   │   │   └── authentication-schema.js
    │   │   └── services/
    │   │       └── auth-service.js
    │   ├── certificate/
    │   │   ├── controllers/
    │   │   │   └── certificate-controller.js
    │   │   ├── repositories/
    │   │   │   └── certificate-repository.js
    │   │   ├── routes/
    │   │   │   └── certificate-routes.js
    │   │   ├── schema/
    │   │   │   └── certificate-schema.js
    │   │   └── services/
    │   │       ├── certificate-service.js
    │   │       └── pdf-generator-service.js
    │   ├── course_management/
    │   │   ├── controllers/
    │   │   │   └── course-management-controller.js
    │   │   ├── repositories/
    │   │   │   └── course-management-repository.js
    │   │   ├── routes/
    │   │   │   └── course-management-routes.js
    │   │   ├── schema/
    │   │   │   └── course-management-schema.js
    │   │   └── services/
    │   │       └── course-management-service.js
    │   ├── course_progress/
    │   │   ├── controllers/
    │   │   │   └── course-progress-controller.js
    │   │   ├── repositories/
    │   │   │   └── course-progress-repository.js
    │   │   ├── routes/
    │   │   │   └── course-progress-routes.js
    │   │   ├── schema/
    │   │   │   └── lesson-progress-schema.js
    │   │   └── services/
    │   │       └── course-progress-service.js
    │   ├── enrollment/
    │   │   ├── controllers/
    │   │   │   └── enrollment-controller.js
    │   │   ├── repositories/
    │   │   │   └── enrollment-repository.js
    │   │   ├── routes/
    │   │   │   └── enrollment-routes.js
    │   │   ├── schema/
    │   │   │   └── enrollment-schema.js
    │   │   └── services/
    │   │       └── enrollment-service.js
    │   ├── lesson_management/
    │   │   ├── controllers/
    │   │   │   └── lesson-management-controller.js
    │   │   ├── repositories/
    │   │   │   └── lesson-management-repository.js
    │   │   ├── routes/
    │   │   │   └── lesson-management-routes.js
    │   │   ├── schema/
    │   │   │   └── lesson-management-schema.js
    │   │   └── services/
    │   │       └── lesson-management-service.js
    │   └── quiz_management/
    │       ├── controllers/
    │       │   └── quiz-management-controller.js
    │       ├── repositories/
    │       │   └── quiz-management-repository.js
    │       ├── routes/
    │       │   └── quiz-management-routes.js
    │       ├── schema/
    │       │   ├── quiz-attempt-answer-schema.js
    │       │   ├── quiz-attempt-schema.js
    │       │   ├── quiz-management-schema.js
    │       │   ├── quiz-question-option-schema.js
    │       │   └── quiz-question-schema.js
    │       └── services/
    │           └── quiz-management-service.js
    └── shared/
        ├── access_control/
        │   └── schema/
        │       ├── permissions-schema.js
        │       ├── role-permissions-schema.js
        │       └── roles-schema.js
        ├── config_env/
        │   └── env-variables-config.js
        ├── database/
        │   └── config/
        │       └── db-connection.js
        ├── errors/
        │   └── app-error.js
        ├── middleware/
        │   ├── authenticate.js
        │   ├── authorize.js
        │   └── global-error-handler.js
        ├── redis_database/
        │   └── upstash-client.js
        └── utils/
            ├── create-otp.js
            └── logger.js
```



## Quick Start
Clone, install, and run the dev server:

```bash
git clone https://github.com/FaisalGul786/SKILLGRID_BACKEND
cd foldername
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