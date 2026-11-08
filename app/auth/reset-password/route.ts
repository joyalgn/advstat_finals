import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const scryptAsync = promisify(scrypt) as (password: string, salt: string, keyLength: number) => Promise<Buffer>;
const PASSWORD_KEY_LENGTH = 64;

// Same format as hashPassword in app/auth/actions.ts
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const key = await scryptAsync(password, salt, PASSWORD_KEY_LENGTH);
  return `scrypt$${salt}$${key.toString("base64url")}`;
}

const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !name.trim()) {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 12) {
    return NextResponse.json({ error: "Password must be between 8 and 12 characters." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Same message whether the email or the name is wrong
    if (!user || norm(user.name) !== norm(name)) {
      return NextResponse.json({ error: "The email and name don't match an account." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password) },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Password reset failed", error);
    return NextResponse.json({ error: "Unable to reset your password right now." }, { status: 500 });
  }
}