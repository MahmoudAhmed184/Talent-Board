# Talent Board

A full-stack hiring marketplace where candidates discover and apply for jobs, employers manage listings and applicants, and administrators moderate opportunities. The platform combines a Laravel API with a Vue application and broadcasts application-status changes in real time.

## Product Capabilities

### Public Discovery

- Search and filter approved job listings
- View job details, locations, categories, work type, experience, and salary information
- View platform statistics
- Register as a candidate or employer and sign in through Laravel Sanctum

### Candidate Workspace

- Maintain candidate profile and skills
- Upload, list, select, and delete resumes
- Apply to jobs and prevent duplicate applications
- Review application history and cancel eligible applications
- Receive live application-status updates

### Employer Workspace

- Maintain company profile and logo
- Create, update, list, and remove owned job listings
- Review applicants for owned jobs
- Accept or reject applications with ownership and transition checks
- Trigger queued notifications and real-time candidate updates

### Administration

- Review all and pending job listings
- Approve or reject submitted listings
- Inspect platform activity data
- Enforce role-specific moderation routes and throttling

## Engineering Highlights

- Domain services and repository abstractions keep controllers thin
- Laravel policies enforce ownership for jobs, resumes, profiles, and applications
- Sanctum session authentication with CSRF protection
- Laravel Reverb/Echo application-status broadcasts
- Queue jobs for notifications, uploads, and cache warming
- S3-compatible resume and company-logo storage
- Paginated job discovery with category, location, salary, work-type, and date filters
- Vue feature components, Pinia stores, typed file-based routes, and shared design-system components
- Pest feature coverage for identity, discovery, candidate, employer, admin, uploads, and broadcasting
- Vitest coverage for UI, composables, design tokens, and status helpers

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Backend | PHP 8.3+, Laravel 13, Eloquent |
| Authentication | Laravel Sanctum, policies, role middleware |
| Realtime and async | Laravel Reverb, Echo, Pusher protocol, queues |
| Storage and cache | S3-compatible filesystem, Laravel cache, Redis-ready config |
| Frontend | Vue 3, TypeScript, Pinia, Vue Router, Axios |
| UI | Tailwind CSS 4, Reka UI, Lucide, Motion for Vue |
| Testing | Pest, PHPUnit, Vitest, Vue Test Utils, jsdom |

## Repository Structure

```text
.
├── client/
│   └── src/
│       ├── components/       # Shared app and design-system components
│       ├── composables/      # API workflows and reusable state
│       ├── features/         # Auth, jobs, candidate, employer, applications
│       ├── pages/            # File-based Vue routes
│       ├── realtime/         # Laravel Echo/Reverb client
│       └── stores/           # Pinia stores
├── server/
│   ├── app/
│   │   ├── Http/Controllers/ # Versioned API controllers
│   │   ├── Models/           # Jobs, applications, profiles, resumes, users
│   │   ├── Policies/         # Ownership and permission rules
│   │   ├── Repositories/     # Persistence interfaces/implementations
│   │   ├── Services/         # Business workflows and discovery
│   │   ├── Events/           # Application status events
│   │   └── Jobs/             # Upload, notification, and cache work
│   ├── routes/api/           # Public, candidate, employer, and admin routes
│   └── tests/                # Pest feature and unit tests
└── docs/                     # Requirements, SRS, plan, and task ownership
```

## Getting Started

### Prerequisites

- PHP 8.3+
- Composer
- Node.js 20+ and npm
- A database supported by Laravel
- Optional: Redis, an S3-compatible bucket, and Reverb for the complete async/realtime flow

### Backend Setup

```bash
git clone https://github.com/MahmoudAhmed184/Talent-Board.git
cd Talent-Board/server
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

The API runs at `http://127.0.0.1:8000` by default.

Configure the checked-in `.env.example` for:

- Database connection
- `FRONTEND_URL`, CORS, session, and Sanctum stateful domains
- Queue and cache drivers
- Reverb application/server details
- Mail delivery
- AWS/S3-compatible storage

For the complete local workflow, run the queue worker and Reverb server in separate terminals:

```bash
php artisan queue:work
php artisan reverb:start
```

### Frontend Setup

```bash
cd Talent-Board/client
npm install
cp .env.example .env
npm run dev
```

Important client variables:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Laravel origin, or `auto` to use the browser host |
| `VITE_API_PORT` | Backend port used when the URL is automatic |
| `VITE_REVERB_APP_KEY` | Reverb application key |
| `VITE_REVERB_HOST` | WebSocket host, or `auto` |
| `VITE_REVERB_PORT` | WebSocket port |
| `VITE_REVERB_SCHEME` | `http` or `https` |

## API Overview

The API prefix is `/api/v1`.

| Audience | Base routes |
| --- | --- |
| Public | `/jobs`, `/stats`, `/categories`, `/locations`, `/auth/*` |
| Candidate | `/candidate/profile`, `/candidate/resumes`, `/candidate/applications` |
| Employer | `/employer/profile`, `/employer/jobs`, `/employer/applications` |
| Administrator | `/admin/jobs`, `/admin/jobs/pending`, `/admin/activity` |

Representative operations:

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/jobs
POST   /api/v1/jobs/{job}/applications
POST   /api/v1/candidate/resumes
DELETE /api/v1/candidate/applications/{application}
POST   /api/v1/employer/jobs
PATCH  /api/v1/employer/applications/{application}/status
PATCH  /api/v1/admin/jobs/{job}/approve
PATCH  /api/v1/admin/jobs/{job}/reject
```

Route files under `server/routes/api/` are the source of truth.

## Verification

Backend:

```bash
cd server
php artisan test
```

Frontend:

```bash
cd client
npm run test
npm run typecheck
npm run build
```

## Architecture

State-changing backend requests follow this general flow:

```text
Route -> controller -> authorization/validation -> service -> repository -> model
                                              \-> event/job/broadcast
```

Public discovery uses a dedicated service and cache layer. Application decisions are persisted before queued notifications and real-time broadcasts are dispatched. The Vue client centralizes HTTP behavior, maps workflows into composables and Pinia stores, and authorizes private Reverb channels through Laravel.

## Documentation

- [Project description](docs/project_description.md)
- [Requirements](docs/requirements.md)
- [Software Requirements Specification](docs/SRS.md)
- [Delivery plan](docs/plan.md)
- [Task distribution](docs/tasks.md)

## License

The Laravel application skeleton declares MIT in its package metadata. No root-level license file is currently included for the complete repository.
