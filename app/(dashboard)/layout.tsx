import type { ReactNode } from "react";
import DashboardShell from "../../components/DashboardShell";
import { requireAuthenticatedUser } from "../auth/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAuthenticatedUser();

  return (
    <DashboardShell user={{ name: user.name, email: user.email }}>{children}</DashboardShell>
  );
}