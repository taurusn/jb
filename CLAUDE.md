# CLAUDE.md - ReadyHR Platform

## Project Overview
Next.js 15 recruitment platform (TypeScript, Prisma, PostgreSQL) connecting job seekers with employers.

**Roles:** Employees (public), Employers (auth required), Admins (`/adminofjb/*`)

## Tech Stack
- **Frontend:** Next.js 15 App Router, React, TailwindCSS, IBM Plex Sans Arabic
- **Backend:** Service/Controller pattern, JWT auth (httpOnly cookies)
- **Database:** PostgreSQL (local or Supabase), Prisma ORM
- **Storage:** Supabase (priority 1), Cloudinary (fallback), Local (dev)
- **Email:** Resend API
- **Calendar:** Google Calendar/Meet (optional)

## Key Architecture

### Database Models
```
User (employer/admin)
├─ email, passwordHash, role (EMPLOYER/ADMIN)
├─ status (PENDING/APPROVED/REJECTED) - approval workflow
├─ commercialRegistrationNumber, commercialRegistrationImageUrl (required)
└─ EmployerProfile (1:1) → EmployeeRequest[] (1:many)

EmployeeApplication (job seekers)
├─ fullName, phone, city, nationality, skills (comma-separated)
├─ resumeUrl, iqamaNumber, iqamaExpiryDate, kafeelNumber (required)
└─ EmployeeRequest[] (1:many)

AuditLog - Tracks admin actions
PlatformSettings - Maintenance mode, registration toggles
```

### Authentication Flow
- JWT tokens in httpOnly cookies via `lib/auth.ts` (Node) and `lib/auth-edge.ts` (Edge)
- `middleware.ts` protects `/employer/*`, `/api/employer/*`, `/adminofjb/*`
- Employer approval workflow: Register (PENDING) → Admin approves → Login enabled

### File Upload Priority
1. **Supabase Storage** (bucket: `JB`, folders: `resumes/`, `profiles/`, `commercial-registrations/`)
2. **Cloudinary** (if configured)
3. **Local** (`UPLOAD_DIR` fallback)

Handled by `lib/upload.ts` (auto-detects). Document viewer at `/view-document`.

### Directory Structure (Key Paths)
```
app/
├── api/
│   ├── adminofjb/         # Admin endpoints
│   ├── auth/              # Login, register, logout
│   ├── employer/          # Protected employer endpoints
│   └── files/view/        # Document proxy
├── adminofjb/             # Admin dashboard pages
│   ├── employers/pending/ # Employer approval UI
│   └── settings/          # Platform settings
├── employer/dashboard/    # Employer dashboard
├── employers/             # Public landing (Arabic, RTL)
└── page.tsx              # Employee application form

backend/
├── controllers/          # HTTP handlers
├── services/            # Business logic + DB ops
└── validators/          # Zod schemas

components/
├── admin/               # Admin UI components
├── SkillSelector.tsx    # Multi-select skill picker
└── employer/            # Employer UI components

lib/
├── auth.ts, auth-edge.ts  # JWT helpers
├── upload.ts              # Storage auto-detection
└── google-calendar.ts     # Optional Meet integration
```

## Admin Dashboard Features (Fully Implemented)
- **Employer Approval:** View/approve/reject with CR document viewer
- **Requests Management:** Full CRUD, meeting details display
- **Candidates/Employers:** Search, filter, manage with status badges
- **Platform Settings:** Maintenance mode, registration toggles (enforced)
- **Audit Logging:** Complete action trail
- **Skills Analytics:** Top skills charts, distribution, insights

Admin login: `admin@readyhr.com` / `Admin@123456` (change immediately)

## Skills System (Complete)
- **8 Predefined Skills:** Kitchen (Barista, Chef, Assistant, Baker), Service (Waiter, Cashier, Cleaner), Management (Supervisor)
- **SkillSelector Component:** Multi-select checkboxes, min 1 required
- **Filtering:** OR/AND logic (`skillMatchMode: 'any' | 'all'`)
- **Display:** Color-coded badges (Kitchen=Orange, Service=Blue, Management=Purple)
- **Matching:** Yellow glow + animation on matched skills
- **Views:** List (4-col grid) vs Grid (2-col grid) with localStorage

## Database Configuration

### Local PostgreSQL (Development Default)
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/ready_hr?schema=public"
```

### Supabase (Testing/Production)
```bash
# Development (IPv6, direct)
DATABASE_URL="postgresql://postgres:password@db.dnqytwjcdobhwiyyqdwe.supabase.co:5432/postgres"

# Production/Vercel (IPv4, pooler - REQUIRED)
DATABASE_URL="postgresql://postgres.dnqytwjcdobhwiyyqdwe:password@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

**Switching:** Edit `.env`, run `npx prisma migrate deploy` if needed, `npx prisma db seed` if empty.

## Essential Commands
```bash
npm run dev                # Start dev server
npm run deploy:db          # Smart DB deploy (checks, migrates, seeds)
npx prisma generate        # After schema changes
npx prisma migrate dev     # Create new migration
npx prisma studio          # DB GUI
```

## Critical Environment Variables
**Required:**
- `DATABASE_URL` - Use pooler URL for Vercel (IPv4)
- `JWT_SECRET`, `JWT_EXPIRES_IN` (default: 7d)

**Recommended:**
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` - For storage
- `CLOUDINARY_*` - Alternative storage
- `GOOGLE_*` - Optional Meet integration (platform works without it)
- `RESEND_API_KEY` - Email notifications

## Key Implementation Notes

**Employer Registration & Approval:**
- Default Arabic with English toggle, RTL/LTR support
- CR number + document required (uploaded to `commercial-registrations/`)
- Status: PENDING → Cannot login until approved
- Success screen with animations, no auto-redirect

**Meeting Scheduling:**
- Always saves `meetingDate`, `meetingDuration`, `meetingEndsAt` in DB
- Google Meet link optional (nullable field)
- Works with or without Google Calendar configured

**Middleware:**
- Runs on Edge runtime, auto-protects routes
- Injects `x-user-id`, `x-user-email`, `x-user-role` headers
- No manual auth checks needed in protected handlers

**Document Viewer:**
- Full-page viewer at `/view-document?file=<url>&name=<name>`
- Secured via `/api/files/view` proxy
- Supports private Supabase files, Cloudinary URLs, local files

**Design System:**
- Primary: Electric Yellow (#FEE715)
- Background: Dark Navy (#101820)
- English: Inter + Space Grotesk, Arabic: IBM Plex Sans Arabic
- Glassmorphism effects, smooth animations

## Common Workflows

**New Protected API Route:**
1. Create `app/api/employer/<feature>/route.ts`
2. Extract user: `request.headers.get('x-user-id')`
3. Call service with user context (middleware handles auth)

**New DB Model:**
1. Update `prisma/schema.prisma`
2. `npx prisma migrate dev --name description`
3. Update `backend/types.ts`, create service functions

**Switch Database for Testing:**
1. Stop dev server
2. Toggle `DATABASE_URL` in `.env`
3. Run migrations/seed if needed
4. Restart server

**Vercel Deployment:**
- Use Supabase **Session Pooler** URL (IPv4-compatible)
- Add all env vars in Vercel dashboard
- Migrations run automatically via `build:vercel`
- DB seeds if empty

## Seed Accounts
**Employers:**
- `employer@test.com` / `password123`
- `hr@company.com` / `password123`

**Admin:**
- `admin@readyhr.com` / `Admin@123456` (change immediately)

**Sample Data:** 3 candidates (Ahmed, Fatima, Mohammed) + platform settings

## Future Roadmap
- Dynamic skills management (admin CRUD for skills)
- Skill proficiency levels (Beginner/Intermediate/Expert)
- Skills gap analysis and recommendations
- Consider array type for skills if >10k candidates

---

**Notes:**
- Skills stored as comma-separated TEXT: `"Chef, Waiter, Barista"`
- Trim whitespace when parsing: `.split(',').map(s => s.trim())`
- Use case-insensitive matching
- Backup config: `.env.example` (template), `.env.production` (Supabase)
