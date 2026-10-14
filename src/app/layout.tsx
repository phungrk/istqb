import type { Metadata } from "next";
import "./organic.css";
import "./app.css";
import { AppProvider, type Initial } from "@/components/AppProvider";
import { Header } from "@/components/Header";
import { Overlays } from "@/components/Overlays";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { config } from "@/server/config";
import { getStore } from "@/server/store";
import { withMissedLos } from "@/server/attemptLos";
import { getCurrentUser, isAdmin, tierOf } from "@/server/session";

const DESCRIPTION = "Free ISTQB CTFL v4.0.1 exam prep: learn the syllabus as a visual mindmap, then practise with chapter tests and timed 40-question mock exams.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Testpassed · ISTQB CTFL v4.0.1 mindmap & mock exams", template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME, title: "Testpassed · Pass the ISTQB CTFL exam", description: DESCRIPTION, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

const PASS_MARK = Number(process.env.NEXT_PUBLIC_PASS_MARK ?? 65);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const store = await getStore();
  const initial: Initial = {
    user: user && { handle: user.email ?? user.username ?? user.name, name: user.name, admin: isAdmin(user) },
    tier: tierOf(user),
    attempts: user ? await withMissedLos(store, user.id, await store.listAttempts(user.id)) : [],
    learned: user ? await store.listLearned(user.id) : [],
    flags: { google: config.google, devTools: config.devTools, pro: config.pro, payments: config.payments, passMark: PASS_MARK },
  };

  return (
    <html lang="en">
      <body>
        <AppProvider initial={initial}>
          <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)", paddingBottom: 96 }}>
            <Header />
            <main className="page-gutter" style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px" }}>{children}</main>
            <Overlays />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
