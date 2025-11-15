# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack recruitment platform built with Next.js 15, TypeScript, Prisma, and PostgreSQL. The platform connects job seekers (employees) with employers through a secure application and interview scheduling system.

**Current User Roles:**
- **Employees** (job seekers) - Public access, no authentication required
- **Employers** - Authenticated users with dashboard access at `/employer/dashboard`
- **Admins** - Platform administrators with full oversight at `/adminofjb/*`

## ✅ Admin Dashboard (Implemented)

A comprehensive admin dashboard is now fully implemented at `/adminofjb/*`. This is a separate interface from the employer dashboard with complete platform oversight capabilities.

**Admin Features:**
- **Dashboard Analytics:** Platform statistics with real-time counts and activity feeds
- **Requests Management:** View, update status, and delete all employer-to-candidate requests
- **Candidates Management:** Full CRUD operations for candidate applications with search and filtering
- **Employers Management:** View, search, filter, and manage all employer accounts
- **Platform Settings:** Configure maintenance mode, registrations, and platform-wide settings
- **Audit Logging:** Complete audit trail of all admin actions with timestamps and details
- **Contact Information:** Click-to-call and WhatsApp integration for all phone numbers

**Database Models:**
- `AuditLog` - Tracks all admin actions (DELETE, UPDATE, etc.)
- `PlatformSettings` - Stores platform configuration (maintenance mode, registration toggles, etc.)
- `User.role` - ADMIN enum for admin authentication

**Admin Access:**
- Login at `/adminofjb/login`
- Default admin account (created via seed):
  - Email: `admin@jobplatform.com`
  - Password: `Admin@123456`
  - ⚠️ **Change password immediately after first login**
- Protected by middleware with ADMIN role check
- Full platform oversight without access to employer-specific dashboards

**Key Features:**
- Public employee application submission (no auth required)
- Dedicated Arabic employer landing page at `/employers` with IBM Plex Sans Arabic font
- Secure employer dashboard with JWT authentication
- **Full admin dashboard** with platform oversight and audit logging
- Google Calendar integration for interview scheduling
- Automated meeting cleanup via background tasks
- CV upload with Cloudinary integration
- Email notifications via Resend
- Click-to-call and WhatsApp integration for contact information

## Database Configuration

The project supports **flexible database configuration** with easy toggling between local PostgreSQL and Supabase:

### Current Setup
- **Development**: Toggle between local PostgreSQL and Supabase via `.env`
- **Testing**: Supabase PostgreSQL (test deployment before production)
- **Production**: Supabase PostgreSQL (configured in Vercel)

### Supabase Integration
- **Database**: `postgres` database at `db.dnqytwjcdobhwiyyqdwe.supabase.co`
- **Connection Type**:
  - **Local Development**: Direct connection (IPv6) at `db.dnqytwjcdobhwiyyqdwe.supabase.co:5432`
  - **Production/Vercel**: Session Pooler (IPv4) at `aws-1-us-east-1.pooler.supabase.com:5432`
- **ORM**: Prisma (no Supabase client library needed)
- **Schema**: Fully migrated and matches local development
- **Seeding**: Test accounts and sample data available

**Important:** Vercel and other serverless platforms require IPv4 connectivity. Use the **Session Pooler** connection string for production deployments.

### Switching Between Databases

**To use Local PostgreSQL** (default for development):
Edit `.env` and ensure local DATABASE_URL is uncommented:
```env
# LOCAL DATABASE (for development)
DATABASE_URL="postgresql://postgres:password@localhost:5432/job_platform?schema=public"

# SUPABASE DATABASE (for testing deployment before production)
# DATABASE_URL="postgresql://postgres:password@db.dnqytwjcdobhwiyyqdwe.supabase.co:5432/postgres"
```

**To use Supabase** (for testing):
Edit `.env` and swap the comments:
```env
# LOCAL DATABASE (for development)
# DATABASE_URL="postgresql://postgres:password@localhost:5432/job_platform?schema=public"

# SUPABASE DATABASE (for testing deployment before production)
# Direct connection (works locally, IPv6)
DATABASE_URL="postgresql://postgres:password@db.dnqytwjcdobhwiyyqdwe.supabase.co:5432/postgres"

# OR use Session Pooler (recommended for testing Vercel-like environment, IPv4)
# DATABASE_URL="postgresql://postgres.dnqytwjcdobhwiyyqdwe:password@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

**After switching databases:**
1. Restart dev server: `npm run dev`
2. If needed, run migrations: `npx prisma migrate deploy`
3. If database is empty, seed it: `npx prisma db seed`

### Seeded Test Accounts (Supabase)
When seeding, the following test accounts are created:

**Employers:**
- Email: `employer@test.com` / Password: `password123`
- Email: `hr@company.com` / Password: `password123`

**Admin:**
- Email: `admin@jobplatform.com` / Password: `Admin@123456`
- Access: `/adminofjb/login` (planned feature)

**Sample Data:**
- 3 job seeker applications (Ahmed, Fatima, Mohammed)
- Platform settings configured

## Development Commands

### Development
```bash
npm run dev                    # Start development server (localhost:3000)
npm run build                  # Build for production (includes DB deployment)
npm run start                  # Start production server
npm run lint                   # Run ESLint
```

### Database Operations
```bash
npm run deploy:db              # Deploy database (checks connection, runs migrations, seeds if empty)
npx prisma generate            # Generate Prisma Client (run after schema changes)
npx prisma migrate dev         # Create and apply new migration in development
npx prisma migrate deploy      # Apply migrations in production
npx prisma db seed             # Manually seed database
npx prisma studio              # Open Prisma Studio GUI
```

**Note:** When running `npm run deploy:db`, make sure no dev server is running to avoid file locking issues. Stop the dev server first with Ctrl+C.

### Testing
The project has Jest configured with Testing Library but no test scripts are currently defined in package.json. To run tests, you would use:
```bash
npx jest                       # Run all tests
npx jest --watch               # Run tests in watch mode
npx jest path/to/test          # Run specific test file
```

## Architecture

### Directory Structure

```
app/                           # Next.js App Router
├── api/                       # API Routes (Route Handlers)
│   ├── adminofjb/             # Admin API endpoints (protected by middleware)
│   │   ├── audit/             # Audit log retrieval
│   │   ├── candidates/        # Candidate CRUD operations
│   │   ├── employers/         # Employer management
│   │   ├── requests/          # Request management
│   │   ├── settings/          # Platform settings
│   │   └── stats/             # Admin dashboard statistics
│   ├── auth/                  # Authentication endpoints (register, login, logout, check)
│   ├── employee/              # Employee submission (public, no auth)
│   ├── employer/              # Employer endpoints (protected by middleware)
│   ├── google/                # Google Calendar OAuth flow
│   └── files/                 # File viewing endpoint
├── adminofjb/                 # Admin dashboard pages (protected by middleware)
│   ├── candidates/            # Candidate management pages
│   ├── dashboard/             # Admin dashboard homepage
│   ├── employers/             # Employer management pages
│   ├── login/                 # Admin login page
│   ├── requests/              # Request management pages
│   └── settings/              # Platform settings page
├── employer/dashboard/        # Protected employer dashboard page
├── employers/                 # Public employer landing page (Arabic, RTL)
├── login/                     # Login page
├── thank-you/                 # Success page after employee submission
└── page.tsx                   # Homepage (employee application form)

backend/                       # Backend logic (service/controller pattern)
├── controllers/               # Request handlers (thin layer)
│   ├── admin.controller.ts
│   ├── auth.controller.ts
│   ├── employee.controller.ts
│   └── employer.controller.ts
├── services/                  # Business logic (database operations)
│   ├── admin.service.ts
│   ├── audit.service.ts
│   ├── auth.service.ts
│   ├── employee.service.ts
│   └── employer.service.ts
├── validators/                # Zod validation schemas
│   ├── auth.schema.ts
│   └── employee.schema.ts
└── types.ts                   # Shared TypeScript types

components/                    # Reusable UI components
├── admin/                     # Admin-specific components
│   ├── AdminNavbar.tsx        # Admin navigation
│   ├── ContactCard.tsx        # Contact info with WhatsApp/call buttons
│   ├── ConfirmDialog.tsx      # Confirmation modal
│   ├── StatCard.tsx           # Statistics display
│   └── StatusBadge.tsx        # Status indicators
features/                      # Feature-specific React hooks
lib/                           # Utility libraries
├── db.ts                      # Prisma client singleton
├── auth.ts                    # JWT helpers (Node.js runtime)
├── auth-edge.ts               # JWT helpers (Edge runtime for middleware)
├── upload.ts                  # File upload handling
├── cloudinary.ts              # Cloudinary integration
├── google-calendar.ts         # Google Calendar/Meet integration
├── email.ts                   # Email sending via Resend
├── email-validator.ts         # MX record validation
├── cleanup-expired-meetings.ts # Meeting cleanup logic
└── background-tasks.ts        # Background task scheduler

prisma/
├── schema.prisma              # Database schema
└── seed.ts                    # Database seeding script

scripts/
├── deploy-db.js               # Smart DB deployment (checks connection, migrates, seeds)
└── check-and-seed.js          # Vercel deployment helper

middleware.ts                  # JWT authentication for /employer/* and /api/employer/*
instrumentation.ts             # Next.js hook to start background tasks on server startup
```

### Core Architectural Patterns

**1. Service/Controller Pattern**
- Controllers handle HTTP requests/responses (`app/api/**/route.ts`)
- Services contain business logic and database operations (`backend/services/*.ts`)
- Controllers are thin wrappers that call services and format responses

**2. Authentication Flow**
- JWT tokens stored in httpOnly cookies (secure, not accessible via JS)
- `lib/auth.ts` handles token generation/verification for Node.js runtime
- `lib/auth-edge.ts` handles JWT verification for Edge runtime (used in middleware)
- `middleware.ts` protects `/employer/*` and `/api/employer/*` routes
- Token payload: `{ userId, email, role }`
- Middleware injects user info into request headers: `x-user-id`, `x-user-email`, `x-user-role`
- **Important:** Only `EMPLOYER` role is currently used. While middleware checks for `EMPLOYER` or `ADMIN`, there are no admin-specific routes or features

**3. Database Schema (Prisma)**
```
User (employer accounts)
  └─ EmployerProfile (1:1 - company details)
      └─ EmployeeRequest[] (1:many - requests for candidates)

EmployeeApplication (job applications)
  └─ EmployeeRequest[] (1:many - employers who requested this candidate)
```

Key constraint: `@@unique([employeeId, employerId])` prevents duplicate requests

**4. File Upload Strategy**
- Local filesystem in development (`UPLOAD_DIR` environment variable)
- Cloudinary in production (if credentials provided)
- Handled by `lib/upload.ts` (auto-detects available storage)
- File types: CV (PDF, DOC, DOCX), Profile Pictures (JPEG, PNG)

**5. Interview Scheduling**
- Google Calendar API integration (`lib/google-calendar.ts`)
- OAuth2 flow for admin authorization (`/api/google/auth/*`)
- Automatically creates Google Meet links
- Sends email invitations to both parties
- Meeting data stored in `EmployeeRequest` model: `meetingLink`, `meetingDate`, `meetingDuration`, `meetingEndsAt`

**6. Background Tasks**
- Initiated via `instrumentation.ts` (runs once on server startup)
- Weekly cleanup of expired meetings (removes old meeting links from DB)
- Self-contained - no external cron service needed

**7. Email System**
- Resend API for transactional emails (`lib/email.ts`)
- MX record validation for email addresses (`lib/email-validator.ts`)
- Templates for: employer invitations, interview confirmations

**8. Validation Strategy**
- Zod schemas in `backend/validators/*.ts`
- Validation happens in controllers before passing to services
- Type-safe runtime validation

### Important Implementation Details

**JWT Middleware:**
- Runs on Edge runtime (lightweight, fast)
- Protects employer routes automatically
- Returns 401 for API routes, redirects to /login for pages
- No need to manually check auth in protected route handlers

**Database Deployment:**
- `npm run build` triggers `deploy:db` script
- `deploy:db` is intelligent: checks connection, detects if migration needed, only seeds if empty
- Safe to run multiple times (idempotent)
- Vercel-specific build: `build:vercel` uses `check-and-seed.js`

**Prisma Client:**
- Singleton pattern in `lib/db.ts` prevents multiple instances
- Auto-generated after `npm install` (postinstall hook)
- Must run `prisma generate` after schema changes

**TypeScript Paths:**
- `@/*` alias maps to root directory
- Example: `import { db } from '@/lib/db'`
- Configured in `tsconfig.json` paths

**Environment Variables:**
Required:
- `DATABASE_URL` - PostgreSQL connection string (local or Supabase)
  - Local: `postgresql://postgres:password@localhost:5432/job_platform?schema=public`
  - Supabase Direct (IPv6, local dev): `postgresql://postgres:password@db.dnqytwjcdobhwiyyqdwe.supabase.co:5432/postgres`
  - **Supabase Pooler (IPv4, Vercel/Production)**: `postgresql://postgres.dnqytwjcdobhwiyyqdwe:password@aws-1-us-east-1.pooler.supabase.com:5432/postgres`
- `DATABASE_URL_DIRECT` - Direct connection for migrations (optional, if using connection pooling)
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)

**Note:** For Vercel and serverless platforms, **always use the Session Pooler URL** (IPv4-compatible). Direct connections won't work on Vercel.

Optional:
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - For production file uploads
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_REFRESH_TOKEN` - For Google Calendar integration
- `RESEND_API_KEY` - For email notifications
- `UPLOAD_DIR` - Local file storage directory (default: ./public/uploads)
- `MAX_FILE_SIZE` - Max upload size in bytes (default: 5MB)

**Database Environment Files:**
- `.env` - Local development (toggle between local/Supabase here)
- `.env.production` - Production config (uses Supabase)
- `.env.example` - Template with placeholder values

## Common Development Workflows

### Adding a New Protected Employer API Route
1. Create route file: `app/api/employer/new-feature/route.ts`
2. Import controller from `backend/controllers/`
3. Extract user from headers: `request.headers.get('x-user-id')`
4. Call service function with user context
5. Middleware automatically protects the route (no manual auth check needed)

### Adding a New Database Model
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive-name`
3. Update types in `backend/types.ts` if needed
4. Create service functions in appropriate `backend/services/*.ts`

### Adding a New Feature Hook
1. Create hook in `features/<feature-name>/use<FeatureName>.ts`
2. Use `apiClient` from `lib/apiClient.ts` for API calls
3. Follow React Hook conventions (useState, useEffect, etc.)
4. Return loading states, data, error, and action functions

### Working with File Uploads
1. Use `FormData` for file submissions
2. Handle in route with `request.formData()`
3. Call `uploadFile()` from `lib/upload.ts`
4. Store returned URL in database
5. Files auto-route to Cloudinary if configured, otherwise local filesystem

### Testing Database Changes Locally
1. Modify schema
2. Run `npx prisma migrate dev --name test-change`
3. Check Prisma Studio: `npx prisma studio`
4. Rollback: delete migration file and run `npx prisma migrate reset` (CAUTION: deletes all data)

### Switching Database for Testing
1. Stop dev server (Ctrl+C)
2. Edit `.env` to toggle DATABASE_URL (comment/uncomment)
3. Run `npx prisma migrate deploy` (if switching to fresh database)
4. Run `npx prisma db seed` (if database is empty)
5. Start dev server: `npm run dev`

### Deploying to Vercel with Supabase

**Important:** Vercel requires IPv4 connectivity. Use Supabase's **Session Pooler** connection string.

#### Getting the Pooler URL from Supabase:
1. Go to Supabase Dashboard → Project Settings → Database
2. In "Connection String" section, select **"Session pooler"** (not "Direct connection")
3. Copy the pooler URL (format: `postgresql://postgres.PROJECT_REF:PASSWORD@aws-X-REGION.pooler.supabase.com:5432/postgres`)

#### Configuring Vercel:
1. Go to Vercel project → Settings → Environment Variables
2. Add `DATABASE_URL`:
   ```
   postgresql://postgres.dnqytwjcdobhwiyyqdwe:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres
   ```
   *Replace `PASSWORD` with your actual Supabase database password*
3. Add other required variables (JWT_SECRET, etc.)
4. Select all environments: Production, Preview, Development
5. Deploy - migrations run automatically via `build:vercel` script
6. Database seeds automatically if empty

**Common Issues:**
- ❌ **Error: "Can't reach database server"** → You're using direct connection instead of pooler
- ✅ **Solution:** Use the Session Pooler URL (ends with `pooler.supabase.com`)

## Design System

**Theme:**
- Primary: Electric Yellow (#FEE715)
- Background: Dark Navy (#101820)
- Typography:
  - English: Inter (body), Space Grotesk (headings)
  - Arabic: IBM Plex Sans Arabic (all weights 100-700)
- Effects: Glassmorphism, glow effects, smooth animations
- Tailwind CSS with custom theme in `tailwind.config.ts`
- RTL support for Arabic pages with `dir="rtl"` and `font-arabic` utility class

**Component Variants:**
- Buttons: primary, secondary, outline, ghost, danger
- Inputs: default, filled, outline
- All components support loading states and disabled states

**Pages:**
- `/` - Job seeker homepage (English, LTR)
- `/employers` - Employer landing page (Arabic, RTL with IBM Plex Sans Arabic)
- Navbar remains LTR with English fonts across all pages
