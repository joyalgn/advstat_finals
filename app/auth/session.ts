import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";

const COOKIE_NAME = "advstat_session";
const SESSION_DURATION = 60 * 60 * 24 * 7;

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  return secret;
}

export function assertSessionSecret(): void {
  sessionSecret();
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export async function createSession(userId: string): Promise<void> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_DURATION;
  const value = `${userId}.${expires}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${value}.${sign(value)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresText, signature] = parts;
  const expires = Number(expiresText);
  if (!userId || !Number.isSafeInteger(expires) || expires <= Date.now() / 1000) return null;

  const expected = Buffer.from(sign(`${userId}.${expiresText}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
}

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}