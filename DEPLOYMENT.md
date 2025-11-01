# 🚀 Job Platform Deployment Guide

## ✅ Pre-Deployment Checklist

### 🔧 **Environment Setup**
- [ ] Create production PostgreSQL database
- [ ] Update environment variables in `.env.production`
- [ ] Generate secure JWT and NextAuth secrets
- [ ] Configure file upload storage (local or Cloudinary)

### 🗄️ **Database Setup**
```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run database migrations
npx prisma migrate deploy

# 4. Seed database with test data (optional)
npx prisma db seed
```

### 🔐 **Security Configuration**

#### **Required Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/job_platform"

# JWT (Generate with: openssl rand -base64 32)
JWT_SECRET="your-32-character-secret"
JWT_EXPIRES_IN="7d"

# NextAuth (Generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-32-character-secret"
NEXTAUTH_URL="https://your-domain.com"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR="public/uploads"
```

## 🚀 Deployment Options

### **Option 1: Vercel (Recommended)**
1. Push to GitHub repository
2. Connect Vercel to your GitHub repo
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your Vercel domain (set after first deployment)
4. Deploy automatically - database will be initialized automatically during build

### **Option 2: Railway**
1. Connect Railway to your GitHub repo
2. Add PostgreSQL database service
3. Configure environment variables
4. Deploy

### **Option 3: DigitalOcean App Platform**
1. Connect to GitHub repository
2. Add managed PostgreSQL database
3. Configure environment variables
4. Deploy

## 📋 **Test Accounts (After Seeding)**
- **Email:** employer@test.com
- **Password:** password123
- **Email:** hr@company.com  
- **Password:** password123

## 🔍 **Post-Deployment Verification**
- [ ] Test user registration and login
- [ ] Test file upload functionality
- [ ] Test employer dashboard features
- [ ] Test PDF viewer functionality
- [ ] Verify database connections
- [ ] Check API endpoints

## 🛠️ **Production Considerations**

### **File Storage**
- **Development:** Local storage in `public/uploads`
- **Production:** Use Cloudinary or AWS S3 for scalability

### **Database**
- Ensure PostgreSQL version compatibility
- Set up database backups
- Configure connection pooling for high traffic

### **Security**
- Use HTTPS only
- Implement rate limiting
- Regular security updates
- Monitor for vulnerabilities

## 🐛 **Troubleshooting**

### **Common Issues:**
1. **Database Connection:** Check DATABASE_URL format
2. **File Upload:** Verify upload directory permissions
3. **Authentication:** Ensure JWT_SECRET is set
4. **CORS Issues:** Check NEXTAUTH_URL configuration

### **Logs to Check:**
- Application logs for errors
- Database connection logs
- File upload logs
- Authentication errors

## 📱 **Mobile Responsiveness**
✅ Fully responsive design implemented
✅ Touch-friendly interactions
✅ Optimized for all screen sizes
✅ Progressive Web App ready