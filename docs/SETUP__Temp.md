# WellVantage Backend Setup Guide

This guide will walk you through the steps required to set up and run the WellVantage Backend application locally.

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL**: v14.x or higher (Running locally or via Docker)
- **Git**: For version control

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd well-vantage-be
```

### 2. Install Dependencies

```bash
npm install
```

---

## ⚙️ Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory and populate it with the necessary values.

### Example `.env` File

```env
# Basic Configuration
NODE_ENV="development"
PORT=3000
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:4000"

# Database Configuration
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/wellvantage?schema=public"

# Auth Configuration
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_ACCESS_EXPIRATION="900000"     # 15 minutes
JWT_REFRESH_EXPIRATION="604800000" # 7 days

# OAuth Configuration (Google)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

# Logs Configuration
LOG_LEVEL="debug"
LOG_REQUESTS="true"
LOG_RESPONSES="true"

# Session Configuration
SESSION_SECRET="your-session-secret-key"

# Rate Limit Configuration
RATE_LIMIT_WINDOW_MS="900000" # 15 minutes
RATE_LIMIT_MAX="100"          # max 100 requests per window
```

---

## 🗄️ Database Setup

The project uses **Prisma ORM**. Follow these steps to initialize your database:

### 1. Run Migrations
This will create the necessary tables in your PostgreSQL database.

```bash
npx prisma migrate dev --name init
```

### 2. Generate Prisma Client
This step is usually handled automatically, but you can run it manually:

```bash
npx prisma generate
```

### 3. Seed the Database
Populate your database with initial data (gyms, users, etc.):

```bash
npm run seed
```

---

## 🏃 Running the Application

### Development Mode (with Hot Reload)
Uses `nodemon` to watch for file changes.

```bash
npm run dev
```

### Production Mode
Build the project and run the compiled JavaScript.

```bash
npm run build
npm run start:prod
```

---

## 🛠️ Additional Commands

- **Linting**: `npm run lint` - Fixes code style issues.
- **Formatting**: `npm run format` - Runs Prettier across the codebase.
- **Testing**:
  - `npm run test` - Run unit tests.
  - `npm run test:e2e` - Run end-to-end tests.
- **Prisma Studio**: `npx prisma studio` - A visual editor for your database.

---

## 📖 API Documentation

Once the server is running, you can refer to the [API Documentation](./API.md) for details on available endpoints.
