# Admin Dashboard - Implementation Plan

**Status:** 📋 Planned for Future Release
**Access Path:** `/adminofjb/*`
**Last Updated:** 2025-01-10

---

## Table of Contents
1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Database Schema Changes](#database-schema-changes)
4. [File Structure](#file-structure)
5. [Feature Specifications](#feature-specifications)
6. [API Endpoints](#api-endpoints)
7. [UI/UX Design](#uiux-design)
8. [Security & Access Control](#security--access-control)
9. [Implementation Checklist](#implementation-checklist)

---

## Overview

A comprehensive admin dashboard for platform oversight and management. Provides full visibility into candidates, employers, and requests with analytics and audit logging.

**Key Objectives:**
- Monitor all platform activity
- Manage employer-to-candidate requests
- Access contact information for facilitation
- Track admin actions via audit logs
- Configure platform settings

---

## Requirements

### Admin Permissions (Full Control)
- ✅ View all data (candidates, employers, requests)
- ✅ Change request status (PENDING → APPROVED/REJECTED)
- ✅ Delete requests
- ✅ Delete candidates (with cascade)
- ✅ Delete employers (with cascade)
- ✅ Add admin notes to requests
- ✅ Audit log all actions

### Contact Information Display
- ✅ Simple display of phone numbers and emails
- ✅ Click-to-call links (`tel:`)
- ✅ WhatsApp integration (`https://wa.me/`)

### Analytics & Reporting
- ✅ Dashboard with charts and graphs
- ✅ Platform statistics (candidates, employers, requests)
- ✅ Trends over time
- ✅ Export capabilities (CSV)

### Platform Settings Management
- ✅ Maintenance mode toggle
- ✅ Registration controls
- ✅ Platform configuration

### Excluded Features
- ❌ Google Calendar OAuth management (stays manual)
- ❌ Email/notification sending (not needed)
- ❌ Access to employer dashboard interface (separate)

---

## Database Schema Changes

### New Models

#### 1. AuditLog
Tracks all admin actions for accountability and security.

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  adminId     String   @map("admin_id")
  action      String   // "DELETE_CANDIDATE", "UPDATE_REQUEST_STATUS", etc.
  entityType  String   @map("entity_type") // "CANDIDATE", "EMPLOYER", "REQUEST"
  entityId    String   @map("entity_id")
  details     String?  @db.Text // JSON string with action details
  ipAddress   String?  @map("ip_address")
  createdAt   DateTime @default(now()) @map("created_at")

  admin       User     @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@map("audit_logs")
}
```

**Action Types:**
- `DELETE_CANDIDATE`
- `DELETE_EMPLOYER`
- `DELETE_REQUEST`
- `UPDATE_REQUEST_STATUS`
- `ADD_ADMIN_NOTE`
- `UPDATE_SETTINGS`

#### 2. PlatformSettings
Stores platform-wide configuration.

```prisma
model PlatformSettings {
  id                    String   @id @default(uuid())
  maintenanceMode       Boolean  @default(false) @map("maintenance_mode")
  allowNewRegistrations Boolean  @default(true) @map("allow_new_registrations")
  allowNewApplications  Boolean  @default(true) @map("allow_new_applications")
  platformName          String   @default("Job Platform") @map("platform_name")
  supportEmail          String?  @map("support_email")
  supportPhone          String?  @map("support_phone")
  updatedAt             DateTime @updatedAt @map("updated_at")
  updatedBy             String?  @map("updated_by") // Admin user ID

  @@map("platform_settings")
}
```

#### 3. Update User Model
```prisma
model User {
  // ... existing fields
  auditLogs   AuditLog[]  // Add this relation
}
```

### Migration Command
```bash
npx prisma migrate dev --name add-admin-models
```

---

## File Structure

```
app/
├── adminofjb/                           # Admin section (separate from employer)
│   ├── login/
│   │   └── page.tsx                    # Admin login page
│   ├── dashboard/
│   │   └── page.tsx                    # Dashboard with analytics
│   ├── requests/
│   │   ├── page.tsx                    # All requests list
│   │   └── [id]/page.tsx               # Request details
│   ├── candidates/
│   │   ├── page.tsx                    # All candidates list
│   │   └── [id]/page.tsx               # Candidate details
│   ├── employers/
│   │   ├── page.tsx                    # All employers list
│   │   └── [id]/page.tsx               # Employer details
│   ├── settings/
│   │   └── page.tsx                    # Platform settings
│   └── layout.tsx                       # Admin layout (navbar, sidebar)

backend/
├── services/
│   ├── admin.service.ts                # Admin-specific database operations
│   └── audit.service.ts                # Audit logging service
├── controllers/
│   └── admin.controller.ts             # Admin request handlers

app/api/
└── adminofjb/                          # Admin API endpoints
    ├── stats/route.ts                  # Dashboard statistics
    ├── requests/
    │   ├── route.ts                    # List/create requests
    │   └── [id]/route.ts               # Get/update/delete request
    ├── candidates/
    │   ├── route.ts                    # List candidates
    │   └── [id]/route.ts               # Get/delete candidate
    ├── employers/
    │   ├── route.ts                    # List employers
    │   └── [id]/route.ts               # Get/delete employer
    ├── audit/route.ts                  # Audit logs
    └── settings/route.ts               # Platform settings

components/admin/
├── AdminNavbar.tsx                     # Navigation bar
├── AdminSidebar.tsx                    # Sidebar menu
├── StatCard.tsx                        # Statistics cards
├── RequestsTable.tsx                   # Requests data table
├── CandidatesTable.tsx                 # Candidates table
├── EmployersTable.tsx                  # Employers table
├── ContactCard.tsx                     # Contact info with click-to-call
├── StatusBadge.tsx                     # Status badges
├── AdminNotes.tsx                      # Admin notes section
├── AuditLog.tsx                        # Audit log display
├── AnalyticsChart.tsx                  # Charts component
├── ConfirmDialog.tsx                   # Delete confirmation
└── index.ts                            # Component exports

features/admin/
├── useAdminAuth.ts                     # Admin authentication
├── useAdminStats.ts                    # Dashboard stats
├── useRequests.ts                      # Requests operations
├── useCandidates.ts                    # Candidates operations
├── useEmployers.ts                     # Employers operations
├── useAuditLog.ts                      # Audit logs
└── useSettings.ts                      # Settings management
```

---

## Feature Specifications

### 1. Admin Dashboard (`/adminofjb/dashboard`)

**Statistics Overview:**
- Total Candidates (with growth % from last month)
- Total Employers (with growth % from last month)
- Total Requests (breakdown by status)
- Active Interviews Today

**Charts & Analytics:**
- **Requests Over Time** - Line chart showing last 30 days
- **Requests by Status** - Pie chart (Pending/Approved/Rejected)
- **Top Cities** - Bar chart of candidate locations
- **Candidates by Education** - Bar chart
- **Recent Activity Feed** - Last 10 admin actions

**Quick Actions:**
- View All Requests button
- View All Candidates button
- View Audit Logs button
- Platform Settings button

---

### 2. Requests Management (`/adminofjb/requests`)

**Table Columns:**
- Request ID (short UUID, e.g., REQ-1234)
- Candidate Name + Phone (clickable)
- Employer Company + Phone (clickable)
- Status Badge (color-coded: yellow=PENDING, green=APPROVED, red=REJECTED)
- Meeting Date (if scheduled)
- Requested Date
- Actions (View 👁️, Delete 🗑️)

**Filters & Search:**
- Status dropdown: All / Pending / Approved / Rejected
- Date range picker (from/to)
- Search box (searches candidate name, employer company)
- Sort by: Date ↕️, Status ↕️, Candidate ↕️, Employer ↕️

**Bulk Actions:**
- Export to CSV button
- Delete selected (checkbox selection)

**Pagination:**
- 20 items per page (configurable in settings)
- Page numbers + Next/Previous

---

### 3. Request Details Page (`/adminofjb/requests/[id]`)

**Layout: 3-Column Design**

#### Left Column - Candidate Information
```
┌───────────────────────────────┐
│  [Profile Picture]            │
│  ═══════════════════════════  │
│  👤 John Doe                  │
│  📱 +966 50 123 4567          │
│     [📞 Call] [💬 WhatsApp]  │
│  📧 john@example.com          │
│     [✉️ Email]                │
│  ═══════════════════════════  │
│  📍 City: Riyadh              │
│  🎓 Education: Bachelor's     │
│  💼 Experience: 5 years       │
│  ═══════════════════════════  │
│  📄 [Download CV]             │
│  ═══════════════════════════  │
│  Skills:                      │
│  • JavaScript                 │
│  • React                      │
│  • Node.js                    │
└───────────────────────────────┘
```

#### Center Column - Request Details
```
┌───────────────────────────────┐
│  Request #REQ-5678            │
│  [Badge] PENDING              │
│  ═══════════════════════════  │
│  📅 Requested: 2 days ago     │
│  ═══════════════════════════  │
│  Meeting Information:         │
│  📅 Date: Jan 15, 2025        │
│  🕐 Time: 10:00 AM            │
│  ⏱️  Duration: 45 minutes     │
│  🔗 [Google Meet Link]        │
│  ═══════════════════════════  │
│  Employer Notes:              │
│  "Excellent candidate with    │
│   strong technical skills..." │
│  ═══════════════════════════  │
│  Admin Actions:               │
│  [Change Status ▼]            │
│    ├─ PENDING                 │
│    ├─ APPROVED                │
│    └─ REJECTED                │
│  [🗑️ Delete Request]          │
└───────────────────────────────┘
```

#### Right Column - Employer Information + Admin Notes
```
┌───────────────────────────────┐
│  [Company Logo]               │
│  ═══════════════════════════  │
│  🏢 ABC Corporation           │
│  👤 Contact: Jane Smith       │
│  📱 +966 50 987 6543          │
│     [📞 Call] [💬 WhatsApp]  │
│  📧 employer@abc.com          │
│     [✉️ Email]                │
│  🌐 www.abc.com               │
│  🏭 Industry: Technology      │
│  👥 Size: 50-100 employees    │
└───────────────────────────────┘

┌───────────────────────────────┐
│  📝 Admin Notes               │
│  ═══════════════════════════  │
│  [+ Add Note]                 │
│  ─────────────────────────    │
│  • Called candidate           │
│    confirmed availability     │
│    ⏰ 2 hours ago              │
│  ─────────────────────────    │
│  • Employer confirmed         │
│    interest                   │
│    ⏰ 1 day ago                │
└───────────────────────────────┘
```

**Status Change Flow:**
1. Admin clicks "Change Status" dropdown
2. Selects new status (APPROVED/REJECTED)
3. Confirmation dialog: "Change status to APPROVED?"
4. On confirm:
   - Update database
   - Log to AuditLog
   - Show success notification

**Delete Request Flow:**
1. Admin clicks "Delete Request"
2. Confirmation dialog: "Are you sure? This action cannot be undone."
3. On confirm:
   - Delete from database
   - Log to AuditLog
   - Redirect to requests list

---

### 4. Candidates Management (`/adminofjb/candidates`)

**Table View:**
- [Profile Pic] | Name | Phone | Email | City | Education | Requests | Submitted | Actions

**Filters:**
- Search: Name, email, city, skills
- Education: Dropdown (All, High School, Bachelor's, Master's, PhD)
- City: Dropdown (populated from database)
- Date Range: From/To date pickers
- Has CV: Yes/No toggle

**Export:** CSV download with all filtered data

**Individual Candidate Page (`/adminofjb/candidates/[id]`):**
- Full profile display (same as request detail left column)
- **All Requests Section:**
  - List of all employer requests for this candidate
  - Table: Employer | Status | Date | Actions
- **Timeline:**
  - Application submitted
  - Requests received
  - Status changes
- **Danger Zone:**
  - [🗑️ Delete Candidate] button
  - Warning: "This will delete the candidate and ALL associated requests"

---

### 5. Employers Management (`/adminofjb/employers`)

**Table View:**
- Company | Contact Person | Phone | Email | Industry | Size | Requests | Registered | Actions

**Filters:**
- Search: Company name, contact person, email
- Industry: Dropdown
- Company Size: Dropdown
- Date Range: Registration date filter

**Individual Employer Page (`/adminofjb/employers/[id]`):**
- Full company profile
- Contact information with click-to-call
- **All Requests Section:**
  - List of all requests made by this employer
  - Table: Candidate | Status | Date | Actions
- **Statistics:**
  - Total requests made
  - Pending/Approved/Rejected counts
  - Active interviews
- **Danger Zone:**
  - [🗑️ Delete Employer] button
  - Warning: "This will delete the employer account and ALL associated requests"

---

### 6. Platform Settings (`/adminofjb/settings`)

**Sections:**

#### General Settings
```
Platform Name:        [Job Platform                    ]
Support Email:        [support@jobplatform.com         ]
Support Phone:        [+966 50 123 4567                ]
```

#### Feature Toggles
```
☑ Maintenance Mode
  Platform is currently in maintenance mode.
  New registrations and applications are disabled.

☑ Allow New Employer Registrations
  Employers can register new accounts.

☑ Allow New Candidate Applications
  Candidates can submit applications.
```

#### Display Settings
```
Items per page:       [20  ▼]
Date format:          [MM/DD/YYYY  ▼]
Time zone:            [Asia/Riyadh  ▼]
```

**Save Changes Button** - Logs to AuditLog

---

### 7. Audit Log (`/adminofjb/audit`)

**Display Table:**
| Admin | Action | Entity | Details | IP Address | Timestamp |

**Row Example:**
```
admin@jobplatform.com | DELETE_REQUEST | Request #REQ-1234 |
Deleted request for John Doe | 192.168.1.1 | Jan 10, 2025 10:30 AM
```

**Filters:**
- Date range picker
- Admin user dropdown
- Action type: Dropdown (All, Delete, Update, Add Note, etc.)
- Entity type: Dropdown (All, Request, Candidate, Employer, Settings)

**Export:** CSV download

**Details Column** (expandable):
```json
{
  "candidateName": "John Doe",
  "employerCompany": "ABC Corp",
  "previousStatus": "PENDING",
  "reason": "Duplicate request"
}
```

---

## API Endpoints

### Admin Statistics
```
GET /api/adminofjb/stats

Response:
{
  "totalCandidates": 150,
  "candidatesGrowth": 15, // % from last month
  "totalEmployers": 45,
  "employersGrowth": 8,
  "totalRequests": 320,
  "pendingRequests": 25,
  "approvedRequests": 280,
  "rejectedRequests": 15,
  "activeInterviewsToday": 5,
  "requestsOverTime": [
    { "date": "2025-01-01", "count": 10 },
    { "date": "2025-01-02", "count": 12 },
    ...
  ],
  "requestsByStatus": {
    "PENDING": 25,
    "APPROVED": 280,
    "REJECTED": 15
  },
  "topCities": [
    { "city": "Riyadh", "count": 50 },
    { "city": "Jeddah", "count": 35 },
    ...
  ]
}
```

### Requests Management
```
GET /api/adminofjb/requests
Query params: ?status=PENDING&search=john&page=1&limit=20

GET /api/adminofjb/requests/[id]
PATCH /api/adminofjb/requests/[id]
Body: { status: "APPROVED", notes: "..." }
DELETE /api/adminofjb/requests/[id]
```

### Candidates Management
```
GET /api/adminofjb/candidates
Query params: ?search=john&city=Riyadh&education=Bachelor&page=1

GET /api/adminofjb/candidates/[id]
DELETE /api/adminofjb/candidates/[id]
```

### Employers Management
```
GET /api/adminofjb/employers
Query params: ?search=abc&industry=Tech&page=1

GET /api/adminofjb/employers/[id]
DELETE /api/adminofjb/employers/[id]
```

### Audit Logs
```
GET /api/adminofjb/audit
Query params: ?action=DELETE_REQUEST&from=2025-01-01&to=2025-01-31
```

### Platform Settings
```
GET /api/adminofjb/settings
PATCH /api/adminofjb/settings
Body: { maintenanceMode: true, platformName: "New Name", ... }
```

**All endpoints:**
- Require `ADMIN` role (checked by middleware)
- Return 403 if role is not ADMIN
- Log actions to AuditLog (except GET requests)
- Include IP address in audit logs

---

## UI/UX Design

### Color Scheme (Consistent with Platform)
- **Background:** Dark Navy (#101820)
- **Primary Accent:** Electric Yellow (#FEE715)
- **Text:** White / Light Gray
- **Status Colors:**
  - Pending: Yellow (#FEE715)
  - Approved: Green (#10B981)
  - Rejected: Red (#EF4444)

### Typography
- **Headings:** Space Grotesk
- **Body:** Inter

### Admin-Specific Design Elements

#### Admin Navbar
```
┌─────────────────────────────────────────────────────┐
│ 🛡️ Admin Panel    Dashboard  Requests  Candidates   │
│                   Employers   Settings   Logout     │
└─────────────────────────────────────────────────────┘
```

#### Admin Sidebar (Optional, for dashboard)
```
┌────────────────┐
│ 📊 Dashboard   │
│ 📋 Requests    │
│ 👥 Candidates  │
│ 🏢 Employers   │
│ ⚙️  Settings   │
│ 📜 Audit Log   │
└────────────────┘
```

### Component Specifications

#### StatCard Component
```tsx
<StatCard
  title="Total Candidates"
  value={150}
  growth={15}
  icon={<UsersIcon />}
  color="yellow"
/>
```
Renders:
```
┌─────────────────────┐
│ 👥                  │
│ Total Candidates    │
│ 150                 │
│ ↑ 15% from last mo. │
└─────────────────────┘
```

#### ContactCard Component
```tsx
<ContactCard
  name="John Doe"
  phone="+966501234567"
  email="john@example.com"
  showWhatsApp={true}
  showEmail={true}
/>
```
Renders:
```
┌─────────────────────────────┐
│ 👤 John Doe                 │
│ 📱 +966 50 123 4567         │
│    [📞 Call] [💬 WhatsApp] │
│ 📧 john@example.com         │
│    [✉️ Email]               │
└─────────────────────────────┘
```

Links:
- Call: `tel:+966501234567`
- WhatsApp: `https://wa.me/966501234567`
- Email: `mailto:john@example.com`

#### StatusBadge Component
```tsx
<StatusBadge status="PENDING" />
<StatusBadge status="APPROVED" />
<StatusBadge status="REJECTED" />
```
Renders: Colored pills with status text

#### ConfirmDialog Component
```tsx
<ConfirmDialog
  title="Delete Request?"
  message="This action cannot be undone."
  confirmText="Delete"
  onConfirm={handleDelete}
  onCancel={handleCancel}
  danger={true}
/>
```

### Charts (Using Chart.js or Recharts)
- Line Chart: Requests over time
- Pie Chart: Requests by status
- Bar Chart: Top cities, Education levels

---

## Security & Access Control

### Authentication
- Admin login at `/adminofjb/login`
- Separate from employer login (`/login`)
- Uses same JWT system, checks for `ADMIN` role
- httpOnly cookies for token storage

### Middleware Protection
Update `middleware.ts`:
```typescript
export const config = {
  matcher: [
    '/employer/:path*',
    '/api/employer/:path*',
    '/adminofjb/:path*',      // Add this
    '/api/adminofjb/:path*',  // Add this
  ],
};

// In middleware logic:
if (pathname.startsWith('/adminofjb') || pathname.startsWith('/api/adminofjb')) {
  // Check for ADMIN role specifically
  if (decoded.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }
}
```

### IP Address Logging
All admin actions log IP address:
```typescript
const ipAddress = request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip') ||
                  'unknown';
```

### Audit Logging
Automatic audit log creation for:
- All DELETE operations
- All PATCH/PUT operations
- Settings changes
- Admin note additions

**Not logged:**
- GET requests (read-only)
- Login attempts (handled separately if needed)

### Admin Account Creation

**Via Seed Script** (`prisma/seed.ts`):
```typescript
const adminPassword = await bcrypt.hash('Admin@123456', 10);
const admin = await prisma.user.create({
  data: {
    email: 'admin@jobplatform.com',
    passwordHash: adminPassword,
    role: 'ADMIN',
  },
});
```

**Default Admin Credentials:**
- Email: `admin@jobplatform.com`
- Password: `Admin@123456`
- **⚠️ Change after first login!**

**Future Enhancement:**
- Add "Change Password" feature in settings
- Add ability to create additional admin users

---

## Implementation Checklist

### Phase 1: Database & Backend Foundation
- [ ] Update Prisma schema with `AuditLog` and `PlatformSettings` models
- [ ] Create and run migration: `npx prisma migrate dev --name add-admin-models`
- [ ] Update seed script with admin user and default settings
- [ ] Run seed: `npm run deploy:db` (or `npx prisma db seed`)
- [ ] Create `backend/services/audit.service.ts`
- [ ] Create `backend/services/admin.service.ts`
- [ ] Create `backend/controllers/admin.controller.ts`
- [ ] Update `middleware.ts` for `/adminofjb/*` routes

### Phase 2: API Endpoints
- [ ] `app/api/adminofjb/stats/route.ts`
- [ ] `app/api/adminofjb/requests/route.ts`
- [ ] `app/api/adminofjb/requests/[id]/route.ts`
- [ ] `app/api/adminofjb/candidates/route.ts`
- [ ] `app/api/adminofjb/candidates/[id]/route.ts`
- [ ] `app/api/adminofjb/employers/route.ts`
- [ ] `app/api/adminofjb/employers/[id]/route.ts`
- [ ] `app/api/adminofjb/audit/route.ts`
- [ ] `app/api/adminofjb/settings/route.ts`

### Phase 3: UI Components
- [ ] `components/admin/AdminNavbar.tsx`
- [ ] `components/admin/AdminSidebar.tsx`
- [ ] `components/admin/StatCard.tsx`
- [ ] `components/admin/RequestsTable.tsx`
- [ ] `components/admin/CandidatesTable.tsx`
- [ ] `components/admin/EmployersTable.tsx`
- [ ] `components/admin/ContactCard.tsx`
- [ ] `components/admin/StatusBadge.tsx`
- [ ] `components/admin/AdminNotes.tsx`
- [ ] `components/admin/AuditLog.tsx`
- [ ] `components/admin/AnalyticsChart.tsx`
- [ ] `components/admin/ConfirmDialog.tsx`
- [ ] `components/admin/index.ts`

### Phase 4: React Hooks
- [ ] `features/admin/useAdminAuth.ts`
- [ ] `features/admin/useAdminStats.ts`
- [ ] `features/admin/useRequests.ts`
- [ ] `features/admin/useCandidates.ts`
- [ ] `features/admin/useEmployers.ts`
- [ ] `features/admin/useAuditLog.ts`
- [ ] `features/admin/useSettings.ts`

### Phase 5: Pages
- [ ] `app/adminofjb/layout.tsx` (admin layout wrapper)
- [ ] `app/adminofjb/login/page.tsx`
- [ ] `app/adminofjb/dashboard/page.tsx`
- [ ] `app/adminofjb/requests/page.tsx`
- [ ] `app/adminofjb/requests/[id]/page.tsx`
- [ ] `app/adminofjb/candidates/page.tsx`
- [ ] `app/adminofjb/candidates/[id]/page.tsx`
- [ ] `app/adminofjb/employers/page.tsx`
- [ ] `app/adminofjb/employers/[id]/page.tsx`
- [ ] `app/adminofjb/settings/page.tsx`

### Phase 6: Testing & Polish
- [ ] Test admin login flow
- [ ] Test dashboard statistics and charts
- [ ] Test request CRUD operations
- [ ] Test candidate management and deletion
- [ ] Test employer management and deletion
- [ ] Test audit logging for all actions
- [ ] Test click-to-call and WhatsApp links
- [ ] Test platform settings updates
- [ ] Test export functionality (CSV)
- [ ] Test all filters and search
- [ ] Verify middleware protection
- [ ] Test mobile responsiveness
- [ ] Update CLAUDE.md with admin documentation

### Phase 7: Documentation
- [ ] Update CLAUDE.md with admin routes and features
- [ ] Document admin credentials in secure location
- [ ] Create admin user guide (optional)
- [ ] Update README.md with admin information

---

## Open Questions / Decisions Needed

### Chart Library
**Question:** Which charting library to use?
**Options:**
- **Chart.js** - Simple, lightweight, good documentation
- **Recharts** - React-native, flexible, composable
- **Victory** - Feature-rich, mobile-friendly

**Recommendation:** Recharts (better React integration)

### Admin Notes Storage
**Question:** How to store admin notes on requests?
**Options:**
- **Option A:** Add `adminNotes` JSON field to `EmployeeRequest` model
- **Option B:** Create separate `AdminNote` model with relation to requests
- **Option C:** Store only in AuditLog with action type `ADD_ADMIN_NOTE`

**Recommendation:** Option A (simpler, fits use case)

### Export Format
**Question:** What export formats to support?
**Options:**
- CSV only
- CSV + Excel (XLSX)
- CSV + PDF

**Recommendation:** CSV only for MVP, add others later

### Delete Confirmations
**Question:** Should sensitive deletes require password re-entry?
**Options:**
- Simple confirmation dialog only
- Require password for candidate/employer deletion
- Require special confirmation phrase (type "DELETE" to confirm)

**Recommendation:** Simple confirmation for MVP, add password later if needed

### Time Zone
**Question:** Default timezone for the platform?
**Current:** Asia/Riyadh (from google-calendar.ts)
**Confirm:** Is this correct for the entire platform?

---

## Estimated Timeline

**Phase 1 (Database & Backend):** 2-3 hours
**Phase 2 (API Endpoints):** 3-4 hours
**Phase 3 (UI Components):** 4-5 hours
**Phase 4 (React Hooks):** 2-3 hours
**Phase 5 (Pages):** 5-6 hours
**Phase 6 (Testing):** 3-4 hours
**Phase 7 (Documentation):** 1-2 hours

**Total Estimated Time:** 20-27 hours

---

## Future Enhancements

**Post-MVP Features:**
- Admin user management (create/edit/delete admin accounts)
- Role-based permissions (super admin vs regular admin)
- Two-factor authentication for admin login
- Email notifications to admins on critical events
- Advanced analytics with custom date ranges
- Bulk operations (bulk approve/reject requests)
- Admin activity dashboard (who did what when)
- API rate limiting for admin endpoints
- Admin mobile app
- Scheduled reports (weekly summary emails)

---

## Notes

- This plan is based on requirements gathered on 2025-01-10
- Admin path `/adminofjb/*` chosen for security through obscurity
- Full control permissions granted to admin (delete candidates, employers, requests)
- Audit logging enabled for all destructive/modifying actions
- Separate interface from employer dashboard (no shared navigation)
- Charts and analytics included as requested
- Click-to-call and WhatsApp integration included
- Platform settings management included

---

**Last Updated:** 2025-01-10
**Status:** 📋 Awaiting Implementation Approval
