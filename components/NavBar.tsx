"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "../app/auth/actions";

interface NavBarProps {
  user: { name: string; email: string } | null;
}

export default function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const active = (path: string) => pathname === path ? "active" : undefined;

  return (
    <header className="nav">
      <Link className="brand" href="/">ADV<span>STAT</span></Link>
      <nav aria-label="Main navigation">
        <ul>
          <li><Link className={active("/")} href="/">Home</Link></li>
          <li><Link className={active("/regression")} href="/regression">Regression</Link></li>
          <li><Link className={active("/hypothesis")} href="/hypothesis">Hypothesis Testing</Link></li>
          {user ? (
            <li className="nav-account"><span title={user.email}>{user.name}</span><form action={logoutAction}><button className="logout" type="submit">Log out</button></form></li>
          ) : (
            <>
              <li><Link className={active("/login")} href="/login">Log in</Link></li>
              <li><Link className={active("/register")} href="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}