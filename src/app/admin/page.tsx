import type { Metadata } from "next";
import { config } from "@/server/config";
import { listAccounts } from "@/server/admin";
import { getCurrentUser, isAdmin } from "@/server/session";
import { AdminView } from "./AdminView";
import { AdminLogin } from "./AdminLogin";

export const metadata: Metadata = { title: "Admin · Testpath", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Owner-only account list with password reset. Anyone else sees the admin sign-in form. */
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (isAdmin(user)) return <AdminView rows={await listAccounts()} />;
  return <AdminLogin configured={!!config.admin} signedInAs={user ? (user.username ?? user.email) : null} />;
}
