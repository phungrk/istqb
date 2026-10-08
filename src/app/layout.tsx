import type { Metadata } from "next";
import "./organic.css";
import "./app.css";
import { AppProvider, type Initial } from "@/components/AppProvider";
import { Header } from "@/components/Header";
import { Overlays } from "@/components/Overlays";
import { config } from "@/server/config";
import { getStore } from "@/server/store";
import { getCurrentUser, tierOf } from "@/server/session";

export const metadata: Metadata = {
  title: "Testpath · ISTQB CTFL study",
  description: "Study the ISTQB CTFL v4.0.1 syllabus as a mindmap, then practise with sets and timed mock exams.",
};

const PASS_MARK = Number(process.env.NEXT_PUBLIC_PASS_MARK ?? 65);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const store = await getStore();
  const initial: Initial = {
    user: user && { email: user.email, name: user.name },
    tier: tierOf(user),
    attempts: user ? await store.listAttempts(user.id) : [],
    learned: user ? await store.listLearned(user.id) : [],
    flags: { auth: config.auth, payments: config.payments, passMark: PASS_MARK },
  };

  return (
    <html lang="en">
      <body>
        <AppProvider initial={initial}>
          <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)", paddingBottom: 96 }}>
            <Header />
            <main style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px" }}>{children}</main>
            <Overlays />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
