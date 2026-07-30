# Frontend Information Architecture

Route map, shells, and the API contracts each surface depends on.

Routes are file-based (`vue-router/vite`, `src/pages/`). `_parent.vue` files
provide shells and route metadata.

---

## 1. Shells

| Shell | File | Used by |
| --- | --- | --- |
| Public | `layouts/AppLayout.vue` | Landing, job discovery, job detail, error pages |
| Auth | `layouts/AuthLayout.vue` via `pages/auth/_parent.vue` | Sign in, registration |
| Workspace | `layouts/WorkspaceShell.vue` | Candidate, employer, and admin — one shell, three navigations |

The public shell is a dark navigation band over a light canvas. The workspace
shell is a light sidebar from `lg` up, collapsing into a drawer below it.

A **single** workspace shell serves all three roles deliberately: the
destinations differ (`src/lib/navigation.ts`) but structure, landmarks, focus
order, and responsive behaviour are identical, which is what makes the three
workspaces feel like one product.

---

## 2. Route map

### Public

| Route | File | Notes |
| --- | --- | --- |
| `/` | `pages/index.vue` | Landing. Hero + latest approved listings. |
| `/jobs` | `pages/jobs/index.vue` | Discovery. The closest descendant of the reference direction. |
| `/jobs/:id` | `pages/jobs/[id].vue` | Detail. Role-aware apply panel. |
| `/unauthorized` | `pages/unauthorized.vue` | 401 — signing in fixes it. |
| `/forbidden` | `pages/forbidden.vue` | 403 — no retry offered; retrying a 403 fails again. |
| `/:path(.*)` | `pages/[...path].vue` | 404. |

### Auth — `guestOnly`

| Route | File |
| --- | --- |
| `/auth/login` | `pages/auth/login.vue` |
| `/auth/register` | `pages/auth/register/index.vue` — account-type chooser |
| `/auth/register/candidate` | `pages/auth/register/candidate.vue` |
| `/auth/register/employer` | `pages/auth/register/employer.vue` |

**There is no separate administrator sign-in.** The API exposes one
`POST /api/v1/auth/login` and derives the role from the account; a second form
would imply a credential store that does not exist. Admins are seeded
(`UserRole::canSelfRegister()` excludes them) and sign in here.

### Candidate — `requiresAuth`, `role: candidate`

| Route | File | Purpose |
| --- | --- | --- |
| `/candidate` | `candidate/index.vue` | Dashboard, profile completion, realtime status |
| `/candidate/jobs` | `candidate/jobs.vue` | Discovery + inline apply |
| `/candidate/applications` | `candidate/applications/index.vue` | History, status tabs, withdraw |
| `/candidate/applications/:id` | `candidate/applications/[id].vue` | Detail + timeline |
| `/candidate/resumes` | `candidate/resumes.vue` | Upload, default, delete |
| `/candidate/profile` | `candidate/profile.vue` | Summary, contact, skills |

### Employer — `requiresAuth`, `role: employer`

| Route | File | Purpose |
| --- | --- | --- |
| `/employer` | `employer/index.vue` | Operational overview |
| `/employer/jobs` | `employer/jobs/index.vue` | Owned listings, status tabs |
| `/employer/jobs/create` | `employer/jobs/create.vue` | Sectioned create form |
| `/employer/jobs/:id` | `employer/jobs/[id]/index.vue` | Listing + moderation status |
| `/employer/jobs/:id/edit` | `employer/jobs/[id]/edit.vue` | Edit |
| `/employer/applications` | `employer/applications/index.vue` | Applicants, grouped by job |
| `/employer/applications/:id` | `employer/applications/[id].vue` | Applicant detail, accept/reject |
| `/employer/company` | `employer/company.vue` | Company profile + logo |

### Admin — `requiresAuth`, `role: admin`

| Route | File | Purpose |
| --- | --- | --- |
| `/admin` | `admin/index.vue` | Overview + queue preview |
| `/admin/jobs` | `admin/jobs/index.vue` | Moderation queue (pending / all) |
| `/admin/jobs/:id` | `admin/jobs/[id].vue` | Moderation detail + decision |
| `/admin/activity` | `admin/activity.vue` | Platform activity summary |

### Development only

`/dev/showcase` — design-system showcase. `vite.config.ts` excludes
`src/pages/dev/**` from production builds, so the route and its chunk do not
exist in a deployed bundle (verified: no `showcase` chunk in `dist/`).

---

## 3. File-based routing traps

A sibling `foo.vue` **and** `foo/` directory makes the directory's pages
*children* of `foo.vue`, which then renders nothing unless it contains a
`<RouterView>`. Two surfaces hit this and were restructured:

- `auth/register.vue` → `auth/register/index.vue`
- `candidate/applications.vue` → `candidate/applications/index.vue`

Keep index pages inside their directory whenever child routes exist.

---

## 4. API dependencies per surface

| Surface | Endpoints |
| --- | --- |
| Discovery | `GET /api/v1/jobs`, `/categories`, `/locations` |
| Job detail | `GET /api/v1/jobs/{id}` |
| Auth | `POST /auth/login`, `/auth/register`, `/auth/logout`, `GET /auth/me` |
| Candidate profile | `GET`/`PATCH /candidate/profile` |
| Resumes | `GET`/`POST /candidate/resumes`, `DELETE /candidate/resumes/{id}` |
| Applying | `POST /jobs/{id}/applications` |
| Candidate applications | `GET /candidate/applications`, `/applied-ids`, `DELETE /candidate/applications/{id}` |
| Employer jobs | `GET`/`POST`/`PATCH`/`DELETE /employer/jobs[/{id}]` |
| Employer applications | `GET /employer/applications[/{id}]`, `PATCH /{id}/status` |
| Employer branding | `GET`/`PATCH /employer/profile`, `DELETE /employer/company-logo` |
| Admin | `GET /admin/jobs`, `/admin/jobs/pending`, `PATCH /{id}/approve`, `PATCH /{id}/reject`, `GET /admin/activity` |
| Realtime | private `application-status.candidate.{id}` / `.employer.{id}`, event `ApplicationStatusChanged` |

---

## 5. Contract gaps the UI works around

These are **backend gaps**, surfaced honestly rather than faked.

1. **Contact-only applications are not supported.** `docs/requirements.md`
   FR-AP-03 describes applying with forwarded contact details instead of a
   resume. `StoreApplicationRequest` marks `resume_id` as **required**, and the
   controller always snapshots `contact_email`/`contact_phone` from the profile.
   The apply dialog therefore requires a resume and *shows* the contact details
   that will be forwarded. The previous frontend sent `submission_mode` and
   `use_profile_contact`, which the API silently discarded.
   **Needs a product decision:** implement the contact-only path, or drop
   FR-AP-03.

2. **No `GET /candidate/applications/{id}`.** The candidate detail page resolves
   its record from the collection and fetches page 1 on a cold load. A deep link
   to an application beyond page 1 shows the "could not find" state.
   **Suggested fix:** add the endpoint.

3. **No `GET /admin/jobs/{id}`.** Moderation detail resolves from the pending/all
   collections. The full listing body is read from the public endpoint, which
   only serves *approved* listings — so a pending listing's description cannot be
   shown, and the page says so instead of rendering blank sections.
   **Suggested fix:** add an admin detail endpoint returning the full record
   regardless of moderation state. This currently limits how well an admin can
   actually moderate.

4. **No job filter on `GET /employer/applications`.** It accepts only `status`
   and `per_page`. Applications are therefore *grouped* by job within the loaded
   page, labelled "on this page" — a "filter by job" control would lie across
   page boundaries.

5. **No sort parameter on `GET /api/v1/jobs`**, so no sort control exists.

6. **`GET /employer/jobs` has no status filter**, so the employer status tabs
   filter the loaded page in memory and their counts describe that page.

---

## 6. State ownership

| Store | Scope |
| --- | --- |
| `useAuthStore` | Session, role, abilities |
| `useJobStore` | Public listings and detail |
| `useSearchStore` | Search filter state, mirrored to the URL |
| `useEmployerJobsStore` | Owned listings |
| `useAdminJobsStore` | Moderation queues + activity |
| `useCandidateApplicationsStore` | History, applied-ids set |
| `useCandidateProfileStore` | Profile |

`useTaxonomies` caches categories/locations at module level and shares an
in-flight request, so opening the mobile filter drawer does not refetch what the
sidebar already has.

Search filters live in the URL, so a filtered result set is linkable and
survives refresh.

---

## 7. Required states

Every collection and detail surface implements: **loading** (skeletons matching
the final layout, one `role="status"` announcement per region), **empty**
(explains what would fill it and offers the action that does), **error** (names
the failure and offers retry), **permission error** (`UiErrorState`
`variant="forbidden"`, no retry), and **success feedback**.
