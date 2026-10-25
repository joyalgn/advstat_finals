"use client";

import Link from "next/link";
import { useActionState } from "react";
import HomeCanvas from "./HomeCanvas";
import { loginAction, registerAction } from "../app/auth/actions";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, {});
  const registering = mode === "register";

  return (
    <main className="container auth-container">
      <HomeCanvas />
      <section className="panel auth-panel reveal">
        <h1>{registering ? "Create your ADVSTAT account" : "Log in to ADVSTAT"}</h1>
        <p>{registering ? "Create a personal account to access ADVSTAT." : "Enter your account credentials to continue."}</p>
        <form action={formAction}>
          {registering && <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" type="text" autoComplete="name" minLength={2} maxLength={80} required /></div>}
          <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
          <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} minLength={registering ? 12 : undefined} maxLength={256} required />{registering && <p className="hint">Use at least 12 characters.</p>}</div>
          {state.error && <p className="error" role="alert">{state.error}</p>}
          <button className="btn primary block auth-submit" type="submit" disabled={pending}>{pending ? "Please wait..." : registering ? "Create account" : "Log in"}</button>
        </form>
        <p className="auth-switch">{registering ? "Already registered?" : "New to ADVSTAT?"} <Link href={registering ? "/login" : "/register"}>{registering ? "Log in" : "Create an account"}</Link></p>
      </section>
    </main>
  );
}