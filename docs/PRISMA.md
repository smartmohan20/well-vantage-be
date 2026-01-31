# 💎 Prisma ORM Guide

This guide provides a comprehensive list of Prisma commands and workflows tailored for the WellVantage project. Prisma is used as our primary ORM for database schema management and type-safe database access.

---

## 🛠️ Core Commands

### 1. Schema Management
- **Validate Schema**: Check for syntax errors or relationship inconsistencies.
  ```bash
  npx prisma validate
  ```
- **Format Schema**: Automatically format the `schema.prisma` file.
  ```bash
  npx prisma format
  ```
- **Generate Client**: Generate the Prisma Client based on the current schema. Run this after any schema change.
  ```bash
  npx prisma generate
  ```

---

## 🔄 Migrations & Database Sync

### 2. Development Migrations
- **Create & Apply Migration**: Use this when you make changes to `schema.prisma`.
  ```bash
  npx prisma migrate dev --name <migration_name>
  ```
- **Reset Database**: **[DANGEROUS]** Deletes all data, drops all tables, and re-runs migrations and seeds.
  ```bash
  npx prisma migrate reset
  ```
- **Force Reset (Non-interactive)**:
  ```bash
  npx prisma migrate reset --force
  ```

### 3. Direct DB Sync (No Migrations)
- **Push Schema**: Sync the database with your schema without creating migration files. Useful for rapid prototyping or local testing.
  ```bash
  npx prisma db push
  ```
- **Force Push**:
  ```bash
  npx prisma db push --accept-data-loss
  ```

---

## 📊 Exploration & Seeding

### 4. Prisma Studio
Open the visual database editor in your browser.
```bash
npx prisma studio
```

### 5. Seeding Data
Populate the database with initial data using the script defined in `package.json`.
```bash
# Using npm script
npm run seed

# Or using Prisma directly (if configured in package.json)
npx prisma db seed
```

---

## 🚀 Production Workflows

### 6. Apply Pending Migrations
Apply migrations in a production environment without creating new ones.
```bash
npx prisma migrate deploy
```

### 7. Check Migration Status
```bash
npx prisma migrate status
```

---

## 💡 Pro Tips & Troubleshooting

- **Introspect (Pull from DB)**: If you manually changed the database, pull the changes into your schema.
  ```bash
  npx prisma db pull
  ```
- **Debug Logging**: To see the exact SQL Prisma is executing, set the `DEBUG` environment variable:
  ```bash
  # Windows (PowerShell)
  $env:DEBUG="prisma:*" ; npm run dev

  # Linux/macOS
  DEBUG="prisma:*" npm run dev
  ```
- **Common Error: "Prisma Client is out of sync"**: 
  Simply run `npx prisma generate` to fix it.

---

## 📂 Project Schema
Your main schema file is located at:
`prisma/schema.prisma`
