import { notFound } from "next/navigation";
import { listAccounts } from "@/server/admin";
import { getCurrentUser, isAdmin } from "@/server/session";
import { AdminView } from "./AdminView";

export const dynamic = "force-dynamic";

/** Owner-only account list with password reset. Everyone else gets a 404. */
export default async function AdminPage() {
  if (!isAdmin(await getCurrentUser())) notFound();
  return <AdminView rows={await listAccounts()} />;
}
