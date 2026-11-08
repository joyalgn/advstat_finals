"use client";

import { useState } from "react";
import Link from "next/link";

const GOLD = "#d6a548";

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", marginBottom: "16px" }}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <div style={{ ...styles.inputWrap, borderColor: focused ? GOLD : "#3a3a3e" }}>
        <input
          id={id}
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
        />
      </div>
      {hint && <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#a1a1a6" }}>{hint}</p>}
    </div>
  );
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8 || password.length > 12) {
      setError("Password must be 8–12 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setDone(true);
      else setError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <main style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.topLine} />

        <div style={styles.iconBox}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="13" width="3" height="7" />
            <rect x="8" y="9" width="3" height="11" />
            <rect x="13" y="11" width="3" height="9" />
            <rect x="18" y="5" width="3" height="15" />
            <path d="M2 21h20" />
          </svg>
        </div>

        <h1 style={styles.title}>Reset your password</h1>
        <p style={styles.subtitle}>Confirm your account details, then set a new password.</p>

        {done ? (
          <>
            <p style={styles.message}>Your password has been updated. You can now log in.</p>
            <p style={styles.footer}>
              <Link href="/login" style={styles.link}>Go to log in</Link>
            </p>
          </>
        ) : (
          <>
            <Field id="email" label="Email" type="email" value={email} onChange={setEmail} />
            <Field id="name" label="Full name" value={name} onChange={setName} hint="The name you used when you registered." />
            <Field id="password" label="New password" type="password" value={password} onChange={setPassword} hint="Use 8–12 characters." />
            <Field id="confirm" label="Confirm password" type="password" value={confirm} onChange={setConfirm} />

            <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Saving..." : "Reset password"}
            </button>

            {error && <p style={styles.error}>{error}</p>}

            <p style={styles.footer}>
              Remembered it? <Link href="/login" style={styles.link}>Back to log in</Link>
            </p>
          </>
        )}
      </form>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "#1e1e20",
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    color: "#e8e8ea",
    overflowY: "auto",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    display: "flex",
    flexDirection: "column",
    padding: "40px",
    borderRadius: "20px",
    background: "#2c2c2f",
    border: "1px solid #38383c",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    overflow: "hidden",
  },
  topLine: {
    position: "absolute",
    top: 0,
    left: "15%",
    right: "15%",
    height: "2px",
    background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
  },
  iconBox: {
    alignSelf: "center",
    width: "58px",
    height: "58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    background: "#4a3f27",
    border: "1px solid #6b5a30",
    marginBottom: "16px",
  },
  title: { margin: 0, textAlign: "center", fontSize: "28px", fontWeight: 700, color: "#e8e8ea" },
  subtitle: { margin: "6px 0 28px", textAlign: "center", fontSize: "15px", color: "#a1a1a6" },
  label: { fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "#e8e8ea" },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 16px",
    height: "56px",
    borderRadius: "12px",
    background: "#1f1f21",
    border: "1px solid #3a3a3e",
    transition: "border-color 0.15s",
  },
  input: {
    flex: 1,
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#e8e8ea",
    fontSize: "15px",
  },
  button: {
    marginTop: "8px",
    height: "58px",
    borderRadius: "12px",
    border: "none",
    background: GOLD,
    color: "#2a2108",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(214,165,72,0.2)",
  },
  message: {
    margin: "16px 0 0",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "rgba(214,165,72,0.1)",
    border: "1px solid rgba(214,165,72,0.3)",
    color: GOLD,
    fontSize: "13px",
    lineHeight: 1.5,
  },
  error: {
    margin: "16px 0 0",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.35)",
    color: "#f87171",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  footer: { margin: "24px 0 0", textAlign: "center", fontSize: "15px", color: "#a1a1a6" },
  link: { color: GOLD, fontWeight: 700, textDecoration: "none" },
};