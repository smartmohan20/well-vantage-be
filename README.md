# WellVantage Backend

[![Development Status](https://img.shields.io/badge/status-in--development-yellow)](https://github.com/smartmohan20/well-vantage-be)
[![NestJS](https://img.shields.io/badge/framework-NestJS-E0234E?logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/orm-Prisma-2D3748?logo=prisma)](https://www.prisma.io/)

The core backend services for **WellVantage**, providing robust APIs for member management, gym operations, and session scheduling.

---

## 🚀 Status
This project is currently in the **Development Stage**. Features and API structures are subject to change as we build out the core functionality.

## 🛠️ Technology Stack
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Passport.js (JWT & Google OAuth 2.0)
- **Utilities:** Class Validator, Helmet, Winston Logging, Compression

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
