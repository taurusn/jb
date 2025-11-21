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
- **Employers Management:** View, search, filter, and manage all employer accounts with status badges
- **✅ Employer Approval Workflow** (Fully Implemented):
  - **Pending Employers Page** (`/adminofjb/employers/pending`) - Accessible via "⏳ Pending Approvals" in admin navbar
  - View Commercial Registration (CR) documents using full-page document viewer (`/view-document`)
  - **Approve** employers → Status changes to APPROVED, can login
  - **Reject** employers with optional reason → Status changes to REJECTED, blocked from login
  - Auto-removes from pending list after approval/rejection
  - Contact integration (WhatsApp, phone) for each employer
  - View CR Document button opens documents in consistent viewer with download option
- **Platform Settings:** Configure and enforce maintenance mode, registrations, and platform-wide settings
  - ✅ **Fully Enforced** - Settings actively control platform behavior
  - Maintenance mode redirects non-admin users to `/maintenance`
  - Toggle employee applications on/off
  - Toggle employer registrations on/off
- **Audit Logging:** Complete audit trail of all admin actions (including approve/reject) with timestamps and details
- **Contact Information:** Click-to-call and WhatsApp integration for all phone numbers

**Database Models:**
- `AuditLog` - Tracks all admin actions (DELETE, UPDATE, APPROVE_EMPLOYER, REJECT_EMPLOYER, etc.)
- `PlatformSettings` - Stores platform configuration (maintenance mode, registration toggles, etc.)
- `User.role` - ADMIN / EMPLOYER enums for authentication
- `User.status` - EmployerStatus enum (PENDING / APPROVED / REJECTED) for employer approval workflow
- `User.commercialRegistrationNumber` - Required CR number for all employers
- `User.commercialRegistrationImageUrl` - Required CR document (PDF/image) for all employers

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
- **Advanced Skills System** (✅ Fully Implemented):
  - Predefined Skills Selection - Custom SkillSelector component for restaurant/hospitality roles
  - Multi-select skill filtering with OR/AND logic for employers
  - Color-coded skill badges by category (Kitchen/Service/Management)
  - Skills matching indicator with animated yellow glow
  - Comprehensive skills analytics in admin dashboard
  - List/Grid view toggle with localStorage persistence
- Dedicated Arabic employer landing page at `/employers` with IBM Plex Sans Arabic font
- Secure employer dashboard with JWT authentication
- **Full admin dashboard** with platform oversight, audit logging, and skills analytics
- Google Calendar integration for interview scheduling
- Automated meeting cleanup via background tasks
- CV upload with Supabase Storage (primary) and Cloudinary (fallback) integration
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
│   ├── layout.tsx             # Admin layout with navigation (Dashboard, Pending Approvals, Requests, Candidates, Employers, Settings)
│   ├── candidates/            # Candidate management pages
│   ├── dashboard/             # Admin dashboard homepage
│   ├── employers/             # Employer management pages
│   │   └── pending/           # Pending employer approvals page
│   ├── login/                 # Admin login page
│   ├── requests/              # Request management pages
│   └── settings/              # Platform settings page
├── view-document/             # Full-page document viewer for resumes and CR documents
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
├── SkillSelector.tsx          # Multi-select skill picker for predefined hospitality skills
├── Button.tsx                 # Primary button component
├── Input.tsx                  # Form input component
├── FileUpload.tsx             # File upload component
├── Navbar.tsx                 # Main navigation bar
└── index.ts                   # Component exports
features/                      # Feature-specific React hooks
lib/                           # Utility libraries
├── db.ts                      # Prisma client singleton
├── auth.ts                    # JWT helpers (Node.js runtime)
├── auth-edge.ts               # JWT helpers (Edge runtime for middleware)
├── upload.ts                  # File upload handling (auto-detects storage provider)
├── supabase-storage.ts        # Supabase Storage integration (Priority #1)
├── cloudinary.ts              # Cloudinary integration (Priority #2)
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

**2. Authentication Flow & Employer Approval Workflow**
- JWT tokens stored in httpOnly cookies (secure, not accessible via JS)
- `lib/auth.ts` handles token generation/verification for Node.js runtime
- `lib/auth-edge.ts` handles JWT verification for Edge runtime (used in middleware)
- `middleware.ts` protects `/employer/*`, `/api/employer/*`, and `/adminofjb/*` routes
- Token payload: `{ userId, email, role }`
- Middleware injects user info into request headers: `x-user-id`, `x-user-email`, `x-user-role`

**✅ Employer Registration & Approval Workflow:**
1. **Registration** (`/register`):
   - Employer fills form including **Commercial Registration (CR) Number** and uploads **CR Document** (PDF/image)
   - CR document uploaded to `commercial-registrations/` folder in storage (Supabase/Cloudinary/Local)
   - Account created with `status: PENDING`
   - **No JWT token generated** - cannot login until approved
   - Success message: "Your account is pending approval. We will review and contact you once approved."
   - Redirects to `/login` page

2. **Login Attempt (PENDING status)**:
   - `auth.service.ts` checks `user.status` before generating token
   - If `status === PENDING`: Returns error "Your account is pending approval. Please wait for admin review."
   - If `status === REJECTED`: Returns error "Your account has been rejected. Contact support for more information."
   - If `status === APPROVED`: Login successful, generates JWT token ✅

3. **Admin Approval** (`/adminofjb/employers/pending`):
   - Admin views all PENDING employers with company details and CR documents
   - Can **Approve** → Changes `status` to `APPROVED`, logs action in `AuditLog`
   - Can **Reject** (with reason) → Changes `status` to `REJECTED`, logs action with reason
   - Employer auto-removed from pending list after action

4. **Post-Approval Login**:
   - Employer can now login successfully
   - Full access to `/employer/dashboard` and all employer features

**3. Database Schema (Prisma)**
```
User (employer/admin accounts)
  ├─ Required fields: email, passwordHash, role (EMPLOYER/ADMIN)
  ├─ Employer-specific required fields:
  │  ├─ commercialRegistrationNumber (CR number)
  │  ├─ commercialRegistrationImageUrl (CR document URL)
  │  └─ status (PENDING/APPROVED/REJECTED - default: PENDING)
  └─ EmployerProfile (1:1 - company details)
      └─ EmployeeRequest[] (1:many - requests for candidates)

EmployeeApplication (job applications)
  ├─ Required fields: fullName, phone, city, nationality, skills, experience
  ├─ Required documents: resumeUrl, iqamaNumber, iqamaExpiryDate, kafeelNumber
  ├─ Optional fields: email, profilePictureUrl, availableTimeSlots
  └─ EmployeeRequest[] (1:many - employers who requested this candidate)
```

Key constraint: `@@unique([employeeId, employerId])` prevents duplicate requests

**EmployeeApplication Field Details:**
- `nationality`: Candidate's nationality (replaces deprecated `education` field)
- `iqamaNumber`: Required - Saudi residency permit number (min 10 characters)
- `iqamaExpiryDate`: Required - Expiry date of the Iqama
- `kafeelNumber`: Required - Sponsor/Kafeel identification number
- `resumeUrl`: Required - URL to uploaded resume/CV file

**4. File Upload Strategy**
- **Supabase Storage** (Priority #1) - Recommended for production and development
- **Cloudinary** (Priority #2) - Alternative cloud storage if Supabase not configured
- **Local filesystem** (Priority #3) - Fallback for development (`UPLOAD_DIR` environment variable)
- Handled by `lib/upload.ts` (auto-detects available storage)
- File types: CV (PDF, DOC, DOCX), Profile Pictures (JPEG, PNG), CR Documents (PDF, images)
- Bucket name: `JB` (configured in Supabase Dashboard)
- Files organized in folders: `resumes/`, `profiles/`, and `commercial-registrations/`

**5. Document Viewer**
- **Full-page viewer** at `/view-document` for consistent document viewing experience
- **Features:**
  - Iframe-based PDF/document display with proper headers
  - Download functionality with candidate/company name in filename
  - Loading states and error handling
  - Responsive design (mobile-optimized)
- **Backend:** `/api/files/view` proxies files with proper authentication
  - Supports Supabase private files, Cloudinary URLs, and local files
  - Only authenticated employers and admins can access
  - Admins have unrestricted access to all documents
- **Usage:**
  - Resumes: `/view-document?file=<url>&name=<candidate-name>`
  - CR Documents: `/view-document?file=<url>&name=<company-name> - CR Document`
- **Security:** Files are validated before serving, proper content-type headers prevent XSS

**6. Interview Scheduling**
- Google Calendar API integration (`lib/google-calendar.ts`)
- OAuth2 flow for admin authorization (`/api/google/auth/*`)
- Automatically creates Google Meet links
- Sends email invitations to both parties
- Meeting data stored in `EmployeeRequest` model: `meetingLink`, `meetingDate`, `meetingDuration`, `meetingEndsAt`

**7. Background Tasks**
- Initiated via `instrumentation.ts` (runs once on server startup)
- Weekly cleanup of expired meetings (removes old meeting links from DB)
- Self-contained - no external cron service needed

**8. Email System**
- Resend API for transactional emails (`lib/email.ts`)
- MX record validation for email addresses (`lib/email-validator.ts`)
- Templates for: employer invitations, interview confirmations

**9. Validation Strategy**
- Zod schemas in `backend/validators/*.ts`
- Validation happens in controllers before passing to services
- Type-safe runtime validation
- **Important:** Date fields like `iqamaExpiryDate` should be passed as strings to validators, which then transform them to Date objects

**10. Skills System** (✅ Fully Implemented)

### A. Skills Selection (`components/SkillSelector.tsx`)
- Multi-select checkbox interface for candidate applications
- **Predefined Skills** (Restaurant/Hospitality Industry):
  1. Barista / Coffee Maker (Kitchen)
  2. Chef / Cook (Kitchen)
  3. Kitchen Assistant (Kitchen)
  4. Baker / Pastry (Kitchen)
  5. Waiter / Customer Service (Service)
  6. Cashier (Service)
  7. Cleaner / Steward (Service)
  8. Restaurant Supervisor / Manager (Management)
- **Features:**
  - Visual checkbox grid with yellow glow on selection
  - Selection counter and "Clear all" functionality
  - Responsive layout (1 column mobile, 2 columns desktop)
  - Validation: Minimum 1 skill required
- **Implementation Notes:**
  - Uses controlled state pattern with `onChange` callback
  - State updates and parent notifications happen sequentially (not inside setState)
  - Accepts both string (comma-separated) and array formats for initial value

### B. Skills Filtering (`components/employer/SkillFilter.tsx`)
- **Multi-select filter** for employer dashboard
- **Match Modes:**
  - **Match Any (OR)** - Show candidates with at least one selected skill
  - **Match All (AND)** - Show only candidates with all selected skills
- **Features:**
  - Expandable/collapsible interface
  - Select All / Clear All functionality
  - Active filters summary with removable chips
  - Backend support in `backend/services/employee.service.ts`

### C. Skills Categorization (`lib/skill-categories.ts`)
- **Color-Coded Categories:**
  - **Kitchen** (Orange/Red): Chef, Barista, Baker, Kitchen Assistant
  - **Service** (Blue): Waiter, Cashier, Cleaner/Steward
  - **Management** (Purple): Restaurant Supervisor/Manager
- **Features:**
  - Category-specific color schemes with glow effects
  - Utility functions for grouping skills by category
  - Tooltip shows skill category on hover

### D. Skills Matching Indicator
- **Visual highlighting** of matched skills on employer dashboard
- **Features:**
  - Yellow glow and pulsing animation on matched skills
  - Animated ping indicator
  - "Matches" label when filters are active

### E. Skills Analytics (Admin Dashboard)
- **Location:** `app/adminofjb/dashboard/page.tsx`
- **Charts:**
  - Top Skills Bar Chart (horizontal) - Top 8 most in-demand skills
  - Skills Distribution - Full overview with progress bars
  - Skills Insights Summary - 3 key metrics
- **Backend:** `backend/services/admin.service.ts`
  - `getSkillsDistribution()` - Parse all candidate skills
  - `getTopSkills()` - Get most popular skills

### F. View Modes (Employer Dashboard)
- **List View** (default) - Compact vertical layout, 4-column skill grid
- **Grid View** - 2-column card layout, 2-column skill grid
- **localStorage persistence** - Preference saved across sessions
- Smooth transitions between view modes

### G. Data Flow
- **Frontend:** Skills stored as array (`string[]`)
- **API:** Converted to comma-separated string
- **Database:** Stored as TEXT field in `EmployeeApplication.skills`
- **Display:** Parsed back to array for filtering and display

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

Optional (but recommended):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (e.g., https://xxx.supabase.co)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for server-side storage operations
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Alternative cloud storage (Cloudinary)
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

### Setting Up Supabase Storage

**Creating the Storage Bucket:**
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `JB` (already created)
3. Set bucket to **Private** (recommended for sensitive data like resumes)
   - ✅ **Private bucket** - More secure, files require authentication to access
   - ⚠️ **Public bucket** - Less secure, anyone with URL can access files
4. The system automatically handles both private and public buckets

**Getting Supabase Credentials:**
1. Go to Supabase Dashboard → Settings → API
2. Copy **Project URL** → Add to `.env` as `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **Service Role Key** (secret!) → Add to `.env` as `SUPABASE_SERVICE_ROLE_KEY`
4. ⚠️ **Never commit Service Role Key to git** - keep it in `.env.local`

**Folder Structure in Bucket:**
- `resumes/` - Stores candidate resume files (PDF, DOC, DOCX)
- `profiles/` - Stores candidate profile pictures (JPG, PNG, etc.)

**Storage Priority:**
The upload system automatically detects and uses storage in this order:
1. **Supabase Storage** (if `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set)
2. **Cloudinary** (if Cloudinary credentials are set)
3. **Local filesystem** (fallback - files saved to `public/uploads/`)

**Private Bucket Security:**
When using a private Supabase bucket (recommended):
- Files are stored with private reference: `supabase-private://JB/path/to/file.pdf`
- Only authenticated employers can view files through `/api/files/view` endpoint
- Backend uses service role key to download files securely
- No direct public URLs - files cannot be accessed without going through your API
- Configure in `lib/supabase-storage.ts` by setting `IS_PRIVATE_BUCKET = true` (default)

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

## ✅ Completed Features (Previously Planned)

The following features from the roadmap have been **fully implemented**:

### 1. ✅ Enhanced Skill-Based Filtering (Employer Dashboard)

**Implementation Status: COMPLETE**

**Implemented Features:**

**A. ✅ Backend Implementation:**
- **Location:** `backend/services/employee.service.ts`
- **Implemented:**
  ```typescript
  // Full OR/AND logic support
  if (matchMode === 'all') {
    // Match ALL skills (AND logic)
    where.AND = filters.skills.map((skill) => ({
      skills: { contains: skill, mode: 'insensitive' },
    }));
  } else {
    // Match ANY skill (OR logic)
    where.OR = filters.skills.map((skill) => ({
      skills: { contains: skill, mode: 'insensitive' },
    }));
  }
  ```
- **Files Modified:**
  - `backend/services/employee.service.ts` - Added filtering logic
  - `backend/types.ts` - Added `skillMatchMode: 'any' | 'all'`

**B. ✅ Frontend Implementation:**
- **Component Created:** `components/employer/SkillFilter.tsx`
- **Features Implemented:**
  - Multi-select checkbox interface with all 8 predefined skills
  - "Match Any (OR)" vs "Match All (AND)" toggle
  - Select All / Clear All buttons
  - Active filters summary with removable chips
  - Expandable/collapsible interface
- **Integration:** Fully integrated into `app/employer/dashboard/page.tsx`

**C. ✅ API Route Updates:**
- **Locations:**
  - `app/api/employer/applicants/route.ts`
  - `app/api/employer/applicants/requested/route.ts`
- **Implemented:**
  - Skills parsing from comma-separated string to array
  - `skillMatchMode` parameter support
  - Example: `/api/employer/applicants?skills=Chef,Waiter&skillMatchMode=any`

**D. ✅ Database Approach:**
- **Current Implementation:** Option 1 (TEXT field with LIKE queries)
  - ✅ No migration required
  - ✅ Working efficiently with current data volume
  - Performance is acceptable for expected scale

### 2. ✅ Enhanced Candidate Card Display

**Implementation Status: COMPLETE**

**Implemented Features:**

**A. ✅ Candidate Card Enhancement:**
- **Location:** `app/employer/dashboard/page.tsx` (lines 272-320)
- **Implemented:**
  - Skills displayed as prominent pill badges in responsive grid
  - Color-coded by category using `lib/skill-categories.ts`:
    - Kitchen roles: Orange/Red badges
    - Service roles: Blue badges
    - Management: Purple badges
  - Skills section positioned prominently below candidate name
  - Responsive grid: 2 cols mobile, 3 cols tablet, 4 cols desktop

**B. ✅ Skill Matching Indicator:**
- **Implemented:** Full visual matching system
- **Features:**
  - Yellow glow and border-2 on matched skills
  - Animated pulse effect
  - Animated ping indicator (dot with expanding ring)
  - "Matches" label with fire icon when filters active
  - Helper function `isSkillMatched()` for matching logic

**C. ✅ Card Layout:**
- **Implemented Priority Order:**
  1. Candidate name + profile photo
  2. Location + Nationality (icons)
  3. **Skills badges** (prominent, color-coded, with match indicators)
  4. Experience section (expandable)
  5. Availability (for unrequested candidates)
  6. Meeting details (for requested candidates)
  7. Action buttons (View Resume, Request/Approve/Reject)

**D. ✅ Detailed View:**
- Skills displayed in full grid with category colors
- No truncation - all skills visible
- Hover tooltips show skill category

**E. ✅ List vs Grid View Toggle:**
- **Implemented:** Full view mode system
- **List View:** Compact vertical layout, 4-column skill grid
- **Grid View:** 2-column card layout, 2-column skill grid
- **localStorage persistence:** Key `employer-dashboard-view-mode`
- Toggle buttons with icons at top of dashboard

### 3. ✅ Skills Analytics

**Implementation Status: COMPLETE**

**Implemented in Admin Dashboard:**
- **Location:** `app/adminofjb/dashboard/page.tsx`
- **Backend:** `backend/services/admin.service.ts`
  - `getSkillsDistribution()` - Parse and count all skills
  - `getTopSkills(limit)` - Get most popular skills

**Charts Implemented:**
1. **Top Skills Bar Chart** (Horizontal)
   - Shows top 8 most in-demand skills
   - Yellow bars with dark background
   - Responsive container

2. **Skills Distribution Overview**
   - Full list with progress bars
   - Shows count for each skill
   - Scrollable with custom yellow scrollbar
   - Hover effects on bars

3. **Skills Insights Summary Cards**
   - Most Popular Skill (with count)
   - Total Skills Available
   - Average Skills per Candidate

**Data Flow:**
- Backend fetches all candidates' skills
- Parses comma-separated values
- Aggregates counts per skill
- Returns sorted by popularity

### Implementation Status Summary

**✅ Phase 1 (High Priority) - COMPLETE:**
1. ✅ SkillSelector component
2. ✅ Enhanced candidate card display with skill badges
3. ✅ Employer skill-based filtering UI

**✅ Phase 2 (Medium Priority) - COMPLETE:**
4. ✅ Skills matching indicator
5. ✅ Detailed view enhancements (color categorization)
6. ✅ List/Grid toggle for candidate browsing

**✅ Phase 3 (Partially Complete):**
7. ✅ Skills analytics dashboard
8. ⏳ Dynamic skills management system (Future)
9. ⏳ Convert database field to array type (Not needed - current performance acceptable)

## Future Development Roadmap

### 1. Dynamic Skills Management (Admin Feature)

**Status: Planned for Future**

**Long-term Enhancement:**
- Allow admins to add/edit/remove predefined skills via admin UI
- Store skills in `PlatformSettings` or new `Skills` table
- Update SkillSelector to fetch from database instead of hardcoded array
- **Benefits:** Adaptable to different industries without code changes

**Implementation Considerations:**
- Migration script to seed current 8 skills into database
- Admin UI page at `/adminofjb/skills`
- API endpoints for CRUD operations on skills
- Update both SkillSelector and SkillFilter to use dynamic data

### 2. Advanced Skills Features

**Potential Enhancements:**
- **Skill Proficiency Levels:** Allow candidates to rate their skill level (Beginner/Intermediate/Expert)
- **Skill Certifications:** Attach certificates or proof to specific skills
- **Skills Gap Analysis:** Show employers what skills are lacking in their area
- **Skills Recommendations:** Suggest related skills to candidates based on their selections
- **Skills Endorsements:** Allow employers to endorse candidate skills after hiring

### Technical Notes for Future Developers

**When Implementing Skill Filters:**
- Remember skills are currently stored as `"Skill1, Skill2, Skill3"` format
- Always trim whitespace when parsing: `skills.split(',').map(s => s.trim())`
- Use case-insensitive matching for robustness
- Consider partial matching (e.g., "Chef" matches "Chef / Cook")

**When Updating Candidate Cards:**
- Maintain responsive design (mobile-first)
- Keep yellow (#FEE715) for skill highlights to match brand
- Use glassmorphism effect for skill badges consistency
- Test with long skill names (e.g., "Restaurant Supervisor / Manager")

**Database Query Performance:**
- If candidate count exceeds 10,000, consider migrating to array type
- Add database index on skills field if filtering is slow
- Use pagination effectively (keep limit at 10-20 per page)

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
