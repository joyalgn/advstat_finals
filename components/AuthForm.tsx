"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState, type MouseEvent } from "react";
import { loginAction, registerAction } from "../app/auth/actions";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, {});
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const registering = mode === "register";
  const authPath = registering ? "/login" : "/register";

  function navigateWithTransition(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => { finished: Promise<void> };
    };
    if (!transitionDocument.startViewTransition) return;

    event.preventDefault();
    document.documentElement.dataset.authTransition = registering ? "login" : "register";
    const transition = transitionDocument.startViewTransition(() => router.push(authPath));
    const clearTransitionDirection = () => {
      delete document.documentElement.dataset.authTransition;
    };
    void transition.finished.then(clearTransitionDirection, clearTransitionDirection);
  }

  return (
    <main className="container auth-container">
      <div className="auth-layout">
        <section className="auth-graph-panel" aria-label="Normal distribution illustration">
          <div className="auth-graph-heading">
            <span className="auth-graph-eyebrow">Probability, beautifully balanced</span>
            <h2>FAITH COLLEGES</h2>
            <p>A curve for finding clarity in the data.</p>
          </div>
          <p className="auth-developer-credit">Developed by BSIT 3B</p>
        </section>
        <section className={`panel auth-panel${registering ? " is-registering" : ""}`} style={{ viewTransitionName: "auth-card" }}>
          <header className="auth-header">
            <div className="auth-mark" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M9 37V25h7v12M21 37V17h7v20M33 37V9h7v28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 40h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12.5" cy="21.5" r="2.5" fill="var(--gold)" />
                <circle cx="24.5" cy="13.5" r="2.5" fill="var(--gold)" />
                <circle cx="36.5" cy="5.5" r="2.5" fill="var(--gold)" />
              </svg>
            </div>
            <h1>{registering ? "Create your ADVSTAT account" : "Log in to ADVSTAT"}</h1>
            <p>{registering ? "Create a personal account to access ADVSTAT." : "Your next insight starts here."}</p>
          </header>
          <form action={formAction}>
            {registering && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <div className="auth-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.4 3.1-5 7-5s6.3 1.6 7 5" /></svg>
                <input id="name" name="name" type="text" autoComplete="name" minLength={2} maxLength={80} required />
              </div>
            </div>
            )}
            <div className="field">
              <label htmlFor="email">Email</label>
              <div className="auth-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><path d="m5 7 7 5.5L19 7" /></svg>
                <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrap auth-password-wrap">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4.5" y="10" width="15" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></svg>
                <input id="password" className="auth-password-input" name="password" type={showPassword ? "text" : "password"} autoComplete={registering ? "new-password" : "current-password"} minLength={registering ? 12 : undefined} maxLength={256} required />
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 8.5 4.7 9.5 6.5a1 1 0 010 1c-.4.7-1.3 2-2.7 3.2M6.2 6.3C3.9 7.8 2.8 9.8 2.5 11.5a1 1 0 000 1C3.5 14.3 6.8 19 12 19c1 0 1.9-.2 2.7-.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>
              {registering && <p className="hint">Use at least 12 characters.</p>}
            </div>
            {state.error && <p className="error" role="alert">{state.error}</p>}
            <button className="btn primary block auth-submit" type="submit" disabled={pending}>{pending ? "Please wait..." : registering ? "Create account" : "Log in"}</button>
          </form>
          <p className="auth-switch">
            {registering ? "Already registered?" : "New to ADVSTAT?"}{" "}
            <Link href={authPath} onClick={navigateWithTransition}>{registering ? "Log in" : "Create an account"}</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
