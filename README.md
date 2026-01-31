# WellVantage Backend

[![Development Status](https://img.shields.io/badge/status-in--development-yellow)](https://github.com/smartmohan20/well-vantage-be)
[![NestJS](https://img.shields.io/badge/framework-NestJS-E0234E?logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/orm-Prisma-2D3748?logo=prisma)](https://www.prisma.io/)

The core backend services for **WellVantage**, providing robust APIs for member management, gym operations, and session scheduling.

---

## 🚀 Project Status

<p align="left">
  <img src="https://img.shields.io/badge/Status-Active%20Development-success?style=for-the-badge&logo=github" alt="Active Development" />
</p>

| Category | Status |
| :--- | :--- |
| **Development** | ✅ Active |
| **API Version** | 🏗️ v1.0.0 |

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white) | Enterprise-grade backend architecture |
| **ORM** | ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white) | Type-safe database modeling & queries |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) | Reliable relational data storage |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | Productive & safe developer experience |
| **Security** | ![Passport](https://img.shields.io/badge/Passport-34E27A?style=flat-square&logo=passport&logoColor=white) | Strategic Auth guards & strategies |
| **Middlewares** | ![Helmet](https://img.shields.io/badge/Helmet-000000?style=flat-square&logo=helmet&logoColor=white) ![Compression](https://img.shields.io/badge/Compression-gray?style=flat-square) | Performance & Security hardening |
| **Validation** | ![Class Validator](https://img.shields.io/badge/Class%20Validator-D0021B?style=flat-square) | Schema-based payload validation |
| **Logging** | ![Winston](https://img.shields.io/badge/Winston-5A6366?style=flat-square) | Comprehensive application telemetry |


## 📖 Documentation
Detailed documentation for specific modules can be found in the `docs/` folder:

| Documentation | Description |
| :--- | :--- |
| [**Setup Guide**](./docs/setup.md) | Initial environment setup and installation steps. |
| [**API Specification**](./docs/api.md) | Detailed endpoint documentation and request/response formats. |
| [**Prisma Schema**](./docs/prisma.md) | Database models, migrations, and relationship diagrams. |

## ⚡ Quick Start

### Prerequisites
Ensure you have the following installed:
- Node.js (v18+)
- PostgreSQL
- npm / yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd well-vantage-be
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (refer to `.env.example` or [Setup](./docs/setup.md)):
   ```bash
   cp .env.example .env
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start in development mode:
   ```bash
   npm run dev
   ```

## 📜 Available Scripts
- `npm run dev` - Start the application in watch mode (Nodemon)
- `npm run build` - Build the application for production
- `npm run start:prod` - Run the compiled product
- `npm run lint` - Lint the codebase
- `npm run test` - Run unit tests
- `npm run seed` - Seed the database with initial data

---
*Created and maintained by the WellVantage Team.*
