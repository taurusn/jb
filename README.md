# 🎯 Ready HR - Full-Stack Recruitment Application

A modern, vibrant full-stack job recruitment platform built with Next.js 15, TypeScript, Prisma, and PostgreSQL. Features a stunning dark theme with electric yellow accents, smooth animations, and a complete employer-employee workflow.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### For Job Seekers (No Login Required)
- 📝 **Easy Application** - Submit applications with personal and professional details
- 📎 **CV Upload** - Drag-and-drop CV upload with validation (PDF, DOC, DOCX)
- ✅ **Instant Confirmation** - Beautiful thank-you page with next steps
- 📧 **Direct Contact** - Get contacted directly by interested employers

### For Employers (Login Required)
- 🔐 **Secure Authentication** - JWT-based authentication with httpOnly cookies
- 📊 **Dashboard Analytics** - Real-time stats (total applicants, pending/approved/rejected requests)
- 🔍 **Advanced Filtering** - Filter by position, experience level, and search
- 👥 **Applicant Management** - View detailed profiles, download CVs, request candidates
- 🚫 **Duplicate Prevention** - System prevents duplicate requests for the same candidate
- 📄 **Pagination** - Smooth pagination for large applicant lists

### Technical Highlights
- ⚡ **Server-Side Rendering** - Fast page loads with Next.js 15 App Router
- 🎨 **Vibrant Design System** - Custom Tailwind theme with animations and effects
- 🔒 **Secure API** - RESTful endpoints with OpenAPI documentation
- ✅ **Validation** - Zod schemas on both client and server
- 📦 **Clean Architecture** - Organized service/controller pattern
- 🎭 **Animations** - Smooth transitions, hover effects, and loading states

## 🎨 Design Theme

**"Vibration, Movement, and Safety"**

- **Colors**: Dark Navy (#101820) + Electric Yellow (#FEE715)
- **Typography**: Inter & Space Grotesk
- **Effects**: Glass morphism, glow effects, vibration animations, smooth transitions
- **Accessibility**: High contrast, focus states, keyboard navigation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ready-hr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/ready_hr"
   
   # JWT Authentication
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   
   # File Upload
   UPLOAD_DIR="./public/uploads"
   MAX_FILE_SIZE=5242880
   
   # Optional: Cloudinary (for production file storage)
   # CLOUDINARY_CLOUD_NAME="your-cloud-name"
   # CLOUDINARY_API_KEY="your-api-key"
   # CLOUDINARY_API_SECRET="your-api-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ready-hr/
├── app/                      # Next.js 15 App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── employee/        # Employee application endpoints
│   │   └── employer/        # Employer management endpoints
│   ├── employer/
│   │   └── dashboard/       # Protected employer dashboard
│   ├── login/               # Login page
│   ├── thank-you/           # Success page
│   ├── globals.css          # Global styles with custom theme
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage (employee form)
├── backend/
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic
│   ├── validators/          # Zod validation schemas
│   └── types.ts             # TypeScript type definitions
├── components/              # Reusable UI components
│   ├── AuthGuard.tsx       # Route protection
│   ├── Button.tsx          # Styled button component
│   ├── FileUpload.tsx      # Drag-and-drop file upload
│   ├── Input.tsx           # Form input component
│   ├── Navbar.tsx          # Navigation bar
│   └── index.ts            # Component exports
├── features/                # Feature-specific hooks
│   ├── auth/               # Authentication hooks
│   ├── employee/           # Employee form hooks
│   └── employer/           # Employer dashboard hooks
├── lib/                     # Utility libraries
│   ├── apiClient.ts        # Axios configuration
│   ├── auth.ts             # JWT helpers
│   ├── db.ts               # Prisma client
│   └── upload.ts           # File upload utilities
├── prisma/
│   └── schema.prisma       # Database schema
├── middleware.ts            # JWT route protection
└── tailwind.config.ts      # Tailwind configuration
```

## 🗄️ Database Schema

### Models

- **User** - Employer accounts (email, password hash)
- **EmployerProfile** - Extended employer information (company name, contact person, phone)
- **EmployeeApplication** - Job applications from employees (name, email, phone, CV, etc.)
- **EmployeeRequest** - Employer requests for specific candidates (with status tracking)

### Relations

- User → EmployerProfile (1:1)
- EmployeeApplication → EmployeeRequest (1:many)
- Unique constraint on (employeeId, employerId) to prevent duplicate requests

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new employer
- `POST /api/auth/login` - Login employer
- `POST /api/auth/logout` - Logout employer

### Employee
- `POST /api/employee/submit` - Submit job application (with file upload)

### Employer (Protected)
- `GET /api/employer/applicants` - Get all applicants (with pagination & filters)
- `POST /api/employer/request` - Request a specific candidate
- `GET /api/employer/request` - Get all employer requests
- `GET /api/employer/stats` - Get dashboard statistics

📖 **Full API documentation available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

## 🎨 Components

### UI Components
- **Button** - 5 variants (primary, secondary, outline, ghost, danger), 4 sizes, loading states, glow/vibrate effects
- **Input** - 3 variants (default, filled, outline), icon support, validation states
- **FileUpload** - Drag-and-drop, file preview, size/type validation
- **Navbar** - Responsive navigation with mobile menu, auth-aware
- **AuthGuard** - Client-side route protection with loading states

### Feature Hooks
- **useLogin, useRegister, useLogout** - Authentication management
- **useEmployeeForm** - Application submission with file upload
- **useApplicants** - Fetch and filter applicants with pagination
- **useRequest** - Create candidate requests
- **useDashboard** - Fetch dashboard stats and requests

## 🔒 Security

- JWT tokens stored in httpOnly cookies
- Password hashing with bcryptjs
- Server-side validation with Zod
- File upload validation (type, size)
- Protected API routes with middleware
- CSRF protection via SameSite cookies

## 🎯 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate   # Create/run migrations
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy!

### Database
- Use Vercel Postgres, Supabase, or any PostgreSQL provider
- Run migrations: `npx prisma migrate deploy`

### File Storage
- For production, configure Cloudinary or S3
- Update `lib/upload.ts` with your provider

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database with [Prisma](https://www.prisma.io/)
- Icons from [Heroicons](https://heroicons.com/)

---

**Made with ❤️ and ⚡ vibrant energy**
