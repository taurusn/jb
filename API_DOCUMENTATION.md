# API Documentation

This document describes the RESTful API endpoints for the Job Recruitment Platform following OpenAPI 3.0 standards.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most employer endpoints require JWT authentication via httpOnly cookies.

---

## 📋 API Endpoints

### **Authentication**

#### POST `/api/auth/register`
Register a new employer account.

**Request Body:**
```json
{
  "email": "employer@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "companyName": "Tech Corp",
  "contactPerson": "John Doe",
  "companyWebsite": "https://techcorp.com",
  "phone": "+1234567890"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "employer@example.com",
      "role": "EMPLOYER"
    }
  },
  "message": "Registration successful"
}
```

---

#### POST `/api/auth/login`
Login as an employer.

**Request Body:**
```json
{
  "email": "employer@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "employer@example.com",
      "role": "EMPLOYER"
    }
  },
  "message": "Login successful"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Validation error

---

#### POST `/api/auth/logout`
Logout the current user.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### **Employee (Job Seekers)**

#### POST `/api/employee/submit`
Submit a job application with optional file uploads.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `fullName` (required): string
- `phone` (required): string
- `email` (optional): string
- `city` (required): string
- `education` (required): string
- `skills` (required): string (text description)
- `experience` (required): string (text description)
- `resume` (optional): file (PDF, DOC, DOCX)
- `profilePicture` (optional): file (JPG, PNG, GIF, WEBP)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Jane Smith",
    "phone": "+1234567890",
    "email": "jane@example.com",
    "city": "New York",
    "education": "Bachelor's in Computer Science",
    "skills": "JavaScript, React, Node.js",
    "experience": "3 years as a frontend developer",
    "resumeUrl": "/uploads/resumes/resume_123.pdf",
    "profilePictureUrl": "/uploads/profiles/photo_123.jpg",
    "submittedAt": "2025-10-30T12:00:00.000Z"
  },
  "message": "Application submitted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Upload or server error

---

### **Employer (Protected Routes)**

#### GET `/api/employer/applicants`
Get paginated list of all job applicants with optional filters.

**Authentication:** Required (JWT Cookie)

**Query Parameters:**
- `page` (optional): integer, default: 1
- `limit` (optional): integer, default: 10, max: 100
- `city` (optional): string - Filter by city
- `education` (optional): string - Filter by education
- `skills` (optional): string - Comma-separated skills
- `experience` (optional): string - Filter by experience
- `search` (optional): string - General search across multiple fields

**Example Request:**
```
GET /api/employer/applicants?page=1&limit=10&city=New York&search=developer
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "fullName": "Jane Smith",
        "phone": "+1234567890",
        "email": "jane@example.com",
        "city": "New York",
        "education": "Bachelor's in Computer Science",
        "skills": "JavaScript, React, Node.js",
        "experience": "3 years as a frontend developer",
        "resumeUrl": "/uploads/resumes/resume_123.pdf",
        "profilePictureUrl": "/uploads/profiles/photo_123.jpg",
        "submittedAt": "2025-10-30T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `400 Bad Request` - Invalid query parameters

---

#### POST `/api/employer/request`
Create a request for a specific employee (employer demands employee).

**Authentication:** Required (JWT Cookie)

**Request Body:**
```json
{
  "employeeId": "uuid",
  "notes": "Interested in hiring for senior developer position"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeId": "uuid",
    "employerId": "uuid",
    "status": "PENDING",
    "notes": "Interested in hiring for senior developer position",
    "requestedAt": "2025-10-30T12:00:00.000Z",
    "updatedAt": "2025-10-30T12:00:00.000Z"
  },
  "message": "Request created successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Duplicate request or validation error
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Employee or employer profile not found

---

#### GET `/api/employer/request`
Get all requests made by the authenticated employer.

**Authentication:** Required (JWT Cookie)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "employerId": "uuid",
      "status": "PENDING",
      "notes": "Interested in hiring",
      "requestedAt": "2025-10-30T12:00:00.000Z",
      "updatedAt": "2025-10-30T12:00:00.000Z",
      "employee": {
        "id": "uuid",
        "fullName": "Jane Smith",
        "phone": "+1234567890",
        "city": "New York",
        ...
      },
      "employer": {
        "id": "uuid",
        "companyName": "Tech Corp",
        ...
      }
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Employer profile not found

---

#### GET `/api/employer/stats`
Get statistics about employer's requests.

**Authentication:** Required (JWT Cookie)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalRequests": 25,
    "pendingRequests": 10,
    "approvedRequests": 12,
    "rejectedRequests": 3
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Employer profile not found

---

## 🔒 Security

### Authentication Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns JWT token stored in httpOnly cookie
3. Client includes cookie automatically in subsequent requests
4. Middleware validates JWT for protected routes
5. User logs out via `/api/auth/logout` to clear cookie

### Protected Routes
- All `/employer/*` pages
- All `/api/employer/*` endpoints

### Middleware Protection
Routes are protected by middleware that:
- Validates JWT token from httpOnly cookie
- Checks user role (EMPLOYER or ADMIN)
- Returns 401 for invalid/missing tokens
- Returns 403 for insufficient permissions
- Redirects to login page for protected pages

---

## 📊 Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Validation error or invalid input |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## 🎯 Request Status Values

Employee request status can be:
- `PENDING` - Request awaiting review
- `APPROVED` - Request approved
- `REJECTED` - Request rejected

---

## 📝 Validation Rules

### Email
- Must be valid email format
- Required for registration and login

### Password
- Minimum 6 characters
- Required for registration and login

### Phone
- Minimum 10 digits
- Must contain only numbers, +, -, spaces, and parentheses

### Files
- **Resume:** PDF, DOC, DOCX (max 5MB)
- **Profile Picture:** JPG, JPEG, PNG, GIF, WEBP (max 5MB)

---

## 🔄 Rate Limiting
(To be implemented in production)

---

## 🌐 CORS
Configured for same-origin requests. Update in production for cross-origin requests.

---

## 📖 OpenAPI Specification
Full OpenAPI 3.0 spec can be generated from JSDoc comments in route files.
