"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { logoutAction } from "../app/auth/actions";

interface DashboardShellProps {
  children: ReactNode;
  user: { name: string; email: string };
}

const THEME_KEY = "stataxis-theme";
const LEGACY_THEME_KEY = "advstat-theme";

export default function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY) ?? window.localStorage.getItem(LEGACY_THEME_KEY);
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
    window.dispatchEvent(new Event("stataxis-theme-change"));
  }, [theme, themeReady]);

  const linkClass = (path: string) => `sidebar-link${pathname === path ? " active" : ""}`;

  return (
    <div className={`dashboard-shell${collapsed ? " is-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-brand-row">
          <Link className="sidebar-brand" href="/">STAT<span>AXIS</span></Link>
          <button className="sidebar-collapse" type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <span aria-hidden="true">{collapsed ? "›" : "‹"}</span>
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          <Link className={linkClass("/dashboard")} href="/dashboard" title="Dashboard"><span className="sidebar-icon" aria-hidden="true">⌂</span><span className="sidebar-label">Dashboard</span></Link>
          <Link className={linkClass("/regression")} href="/regression" title="Regression"><span className="sidebar-icon" aria-hidden="true">R</span><span className="sidebar-label">Regression</span></Link>
          <Link className={linkClass("/hypothesis")} href="/hypothesis" title="Hypothesis Testing"><span className="sidebar-icon" aria-hidden="true">H₀</span><span className="sidebar-label">Hypothesis Testing</span></Link>
          <Link className={linkClass("/history")} href="/history" title="History"><span className="sidebar-icon" aria-hidden="true">◷</span><span className="sidebar-label">History</span></Link>
          <Link className={linkClass("/guide")} href="/guide" title="Stats Guide"><span className="sidebar-icon" aria-hidden="true">?</span><span className="sidebar-label">Stats Guide</span></Link>
        </nav>

        <div className="sidebar-bottom">
          <button className="theme-toggle" type="button" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} aria-pressed={theme === "light"} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            <span className="sidebar-icon" aria-hidden="true">{theme === "dark" ? "☼" : "◐"}</span>
            <span className="sidebar-label">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
          <div className="sidebar-profile">
            <div className="profile-avatar" aria-hidden="true">{user.name.trim().charAt(0).toUpperCase()}</div>
            <div className="profile-summary"><span className="profile-name">{user.name}</span><span className="profile-email">{user.email}</span></div>
          </div>
          <Link className={linkClass("/about")} href="/about" title="About Us">
            <span className="sidebar-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}>
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6z" />
                <circle cx="17" cy="9" r="2.8" />
                <path d="M17 14c2.8 0 5 1.9 5 4.5V20h-4.2c0-2.2-.8-4.2-2.3-5.5.4-.3.9-.5 1.5-.5z" />
              </svg>
            </span>
            <span className="sidebar-label">About Us</span>
          </Link>
          <Link className={linkClass("/profile")} href="/profile" title="Profile Settings"><span className="sidebar-icon" aria-hidden="true">⚙</span><span className="sidebar-label">Profile Settings</span></Link>
          <form action={logoutAction}>
            <button className="sidebar-link sidebar-logout" type="submit" title="Logout"><span className="sidebar-icon" aria-hidden="true">↪</span><span className="sidebar-label">Logout</span></button>
          </form>
        </div>
      </aside>
      <div className="dashboard-content">
        <header className="dashboard-topbar">
          <div className="topbar-heading"><span className="topbar-brand">STATAXIS</span><span className="topbar-divider" aria-hidden="true" /><span className="topbar-context">Statistical Workspace</span></div>
          <details className="profile-menu">
            <summary><span className="profile-avatar topbar-avatar" aria-hidden="true">{user.name.trim().charAt(0).toUpperCase()}</span><span className="topbar-user-name">{user.name}</span><span className="menu-caret" aria-hidden="true">⌄</span></summary>
            <div className="profile-menu-panel">
              <span className="profile-menu-email">{user.email}</span>
              <Link href="/profile">Profile Settings</Link>
              <form action={logoutAction}><button type="submit">Logout</button></form>
            </div>
          </details>
        </header>
        {children}
      </div>
    </div>
  );
}