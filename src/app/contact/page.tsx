import type { Metadata } from "next";
import { config } from "@/server/config";
import { getCurrentUser } from "@/server/session";
import { ContactView } from "./ContactView";

export const metadata: Metadata = { title: "Contact · Testpath" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const user = await getCurrentUser();
  return <ContactView email={config.contactEmail} username={user?.username ?? null} />;
}
