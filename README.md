# STATAXIS

STATAXIS is a Next.js App Router application for simple linear regression and z-/t-based hypothesis testing. It uses TypeScript, React, the original canvas charts and CSS, and Prisma for account and analysis-history storage.

## Requirements

- Node.js 20.9 or newer
- A database supported by the configured Prisma datasource

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Replace `SESSION_SECRET` with a random value of at least 32 characters. For example, run `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"` and use the output.
4. Create/update the configured database schema with `npm run db:push`.
5. Start the app with `npm run dev` and open the URL printed by Next.js.

The `postinstall` script generates the Prisma client. If you need to regenerate it later, run `npm run db:generate`.

## Authentication and data

Registration stores a unique, normalized email and a scrypt password hash. Passwords must be 8–12 characters. Login verifies credentials on the server and issues a signed, HTTP-only, same-site cookie. Completed analyses are saved to the configured database and associated with the signed-in user. Do not commit `.env`; use a separate strong `SESSION_SECRET` for each deployment environment. Configure `DATABASE_URL` to match the PostgreSQL datasource in `prisma/schema.prisma`.

## Production build

Run `npm run build`, then start the production server with `npm run start`. Configure `DATABASE_URL` and `SESSION_SECRET` in the deployment environment before running the app.
