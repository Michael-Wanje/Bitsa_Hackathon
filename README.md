# BITSA Website - Development Setup Guide
# ---------------------------------------------
# BITSA Website - Project Summary & Team
# ---------------------------------------------

## Project Overview
This is the official website for the Bachelor of Information Technology Students Association (BITSA) at UEAB. The platform connects tech enthusiasts, showcases events, blogs, and galleries, and provides a secure dashboard for members and admins.

## Key Features
- Modern, responsive UI with Next.js and Tailwind CSS
- Real-time stats for active members, events, and blogs
- Authentication and protected routes
- Admin dashboard for event and blog management
- Dynamic gallery and blog sections
- Mobile-friendly navigation with drawer sidebar
- RESTful backend integration

## Team Members
- **Masaba Michael** (Core Developer)
- Thabita Jeptoo (Collaboration)
- Victorious Chepchirchir (Collaboration)


A modern full-stack web application for the British Institute Technology Students Association built with Next.js and Express.js.

## 🏗️ Project Structure

```
bitsa_website/
├── app/                    # Next.js 16 frontend (TypeScript)
├── backend/               # Express.js API server (TypeScript)
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS
- Radix UI Components
- React Hook Form
- Zod validation

**Backend:**
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs for password hashing

## 📋 Prerequisites

Before getting started, ensure you have:

1. **Node.js** (v18+ recommended) - ✅ Already installed (v22.17.0)
2. **pnpm** package manager - ✅ Installed
3. **PostgreSQL** database server
4. **Git** (for version control)

### Installing PostgreSQL

**Option 1: Local Installation**
```powershell
# Download and install from: https://www.postgresql.org/download/windows/
winget install PostgreSQL.PostgreSQL
```

**Option 2: Docker (Recommended for development)**
```powershell
# Pull and run PostgreSQL container
docker run --name bitsa-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=bitsa_db -p 5432:5432 -d postgres:15
```

## 🚀 Quick Start

### 1. Clone and Setup Dependencies

```powershell
# Navigate to project directory
cd C:\Projects\bitsa_website

# Run the setup script (installs all dependencies)
.\setup.ps1

# Or manually install dependencies:
pnpm install
cd backend
pnpm install
cd ..
```

### 2. Environment Configuration

Update the environment variables in both files:

**Frontend (`.env.local`):**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bitsa_db"

# Authentication
NEXTAUTH_SECRET="your-super-secret-nextauth-key-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# Backend API
NEXT_PUBLIC_API_URL="http://localhost:8000/api"

# JWT Secret (must match backend)
JWT_SECRET="your-super-secret-jwt-key-32-characters-long"
```

**Backend (`backend/.env`):**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bitsa_db"

# Server
PORT=8000
NODE_ENV=development

# JWT
JWT_SECRET="your-super-secret-jwt-key-32-characters-long"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

### 3. Database Setup

```powershell
# Generate Prisma client and run migrations
pnpm run db:setup

# Or run individually:
cd backend
pnpm run prisma:generate
pnpm run prisma:migrate
```

### 4. Start Development Servers

**Option A: Run both servers simultaneously**
```powershell
pnpm run dev:all
```

**Option B: Run servers separately**
```powershell
# Terminal 1 - Frontend (http://localhost:3000)
pnpm run dev:frontend

# Terminal 2 - Backend API (http://localhost:8000)
pnpm run dev:backend
```

## 📝 Available Scripts

**Root Package Scripts:**
```powershell
pnpm run dev                # Start frontend only
pnpm run dev:all           # Start both frontend and backend
pnpm run dev:frontend      # Start Next.js frontend
pnpm run dev:backend       # Start Express.js backend
pnpm run setup             # Install all dependencies
pnpm run db:setup          # Setup database (generate + migrate)
pnpm run db:studio         # Open Prisma Studio
pnpm run build:all         # Build both frontend and backend
```

**Backend-Specific Scripts:**
```powershell
cd backend
pnpm run dev               # Start development server
pnpm run build             # Build for production
pnpm run start             # Start production server
pnpm run prisma:generate   # Generate Prisma client
pnpm run prisma:migrate    # Run database migrations
pnpm run prisma:studio     # Open Prisma Studio GUI
```

## 🗄️ Database Management

### Viewing Database
```powershell
# Open Prisma Studio (Database GUI)
pnpm run db:studio
# Access at: http://localhost:5555
```

### Schema Changes
```powershell
cd backend

# After modifying schema.prisma:
pnpm run prisma:migrate   # Create and apply migration
pnpm run prisma:generate  # Update Prisma client
```

## 🔧 Development Workflow

1. **Make changes** to your code
2. **Hot reload** is enabled for both frontend and backend
3. **Database changes:** Update `backend/prisma/schema.prisma` → Run migration
4. **New environment variables:** Update `.env` files → Restart servers

## 📱 Access Points

Once running, you can access:

- **Frontend Application:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Database Studio:** http://localhost:5555 (when running `pnpm run db:studio`)

## 🔍 Project Features

The BITSA website includes:

- **Authentication System** (Register, Login, JWT-based auth)
- **User Dashboard** with profile management
- **Blog System** with admin panel
- **Events Management** with registration
- **Photo Gallery** with image uploads
- **Contact Forms** with email notifications
- **Admin Panel** for content management

## 🚨 Troubleshooting

### Common Issues

**Port conflicts:**
```powershell
# Check what's running on ports
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <PID_NUMBER> /F
```

**Database connection issues:**
- Verify PostgreSQL is running
- Check DATABASE_URL in environment files
- Ensure database `bitsa_db` exists

**Prisma issues:**
```powershell
cd backend
pnpm run prisma:generate  # Regenerate client
pnpm run prisma:migrate   # Re-run migrations
```

**Dependencies issues:**
```powershell
# Clear node_modules and reinstall
Remove-Item node_modules -Recurse -Force
Remove-Item backend/node_modules -Recurse -Force
pnpm run setup
```

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets for JWT_SECRET and NEXTAUTH_SECRET
- Change default passwords in production
- Keep dependencies updated

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test thoroughly
3. Commit: `git commit -m "Add new feature"`
4. Push: `git push origin feature/new-feature`
5. Create Pull Request

## 📦 Deployment

For production deployment:

```powershell
# Build both frontend and backend
pnpm run build:all

# Frontend: Deploy to Vercel/Netlify
# Backend: Deploy to Railway/Render/AWS

# Update environment variables for production
```

---

**Need help?** Check the troubleshooting section or create an issue in the repository.