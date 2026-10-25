"use server";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { assertSessionSecret, clearSession, createSession, requireAuthenticatedUser } from "./session";
import type { AuthActionState } from "../../types/auth";

const scryptAsync = promisify(scrypt) as (password: string, salt: string, keyLength: number) => Promise<Buffer>;
const PASSWORD_KEY_LENGTH = 64;

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const key = await scryptAsync(password, salt, PASSWORD_KEY_LENGTH);
  return `scrypt$${salt}$${key.toString("base64url")}`;
}

async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, salt, expectedText] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedText) return false;
  const expected = Buffer.from(expectedText, "base64url");
  const actual = await scryptAsync(password, salt, PASSWORD_KEY_LENGTH);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function registerAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (name.length < 2 || name.length > 80) return { error: "Name must be between 2 and 80 characters." };
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 12 || password.length > 256) return { error: "Password must be between 12 and 256 characters." };
  try {
    assertSessionSecret();
  } catch {
    return { error: "Authentication is not configured. Set SESSION_SECRET and restart the app." };
  }

  try {
    await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { error: "An account with this email already exists." };
    }
    console.error("Registration failed", error);
    return { error: "Unable to create your account right now." };
  }
  redirect("/login");
}

export async function loginAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length > 256) {
    return { error: "Email or password is incorrect." };
  }
  try {
    assertSessionSecret();
  } catch {
    return { error: "Authentication is not configured. Set SESSION_SECRET and restart the app." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) return { error: "Email or password is incorrect." };
    await createSession(user.id);
  } catch (error) {
    console.error("Login failed", error);
    return { error: "Unable to sign in right now." };
  }
  redirect("/dashboard");
}

export async function updateProfileAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 80) return { error: "Name must be between 2 and 80 characters." };
  const user = await requireAuthenticatedUser();

  try {
    await prisma.user.update({ where: { id: user.id }, data: { name } });
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Profile update failed", error);
    return { error: "Unable to update your profile right now." };
  }
  return { success: "Profile updated." };
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}