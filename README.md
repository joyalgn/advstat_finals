# ADVSTAT

ADVSTAT is a Next.js App Router application for simple linear regression and z-/t-based hypothesis testing. It uses TypeScript, React, the original canvas charts and CSS, and Prisma for account storage.

## Requirements

- Node.js 20.9 or newer
- A local SQLite database (included through Prisma's SQLite connector)

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Replace `SESSION_SECRET` with a random value of at least 32 characters. For example, run `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"` and use the output.
4. Create/update the local database with `npm run db:push`.
5. Start the app with `npm run dev` and open the URL printed by Next.js.

The `postinstall` script generates the Prisma client. If you need to regenerate it later, run `npm run db:generate`.

## Authentication and data

Registration stores a unique, normalized email and a scrypt password hash. Login verifies credentials on the server and issues a signed, HTTP-only, same-site cookie. Do not commit `.env`; use a separate strong `SESSION_SECRET` for each deployment environment. The default database is a local SQLite file. SQLite is intended for local use here; for a hosted database, update the Prisma datasource provider and connection configuration for your chosen database before deployment.

## Production build

Run `npm run build`, then start the production server with `npm run start`. Configure `DATABASE_URL` and `SESSION_SECRET` in the deployment environment before running the app.
