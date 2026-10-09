import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { config } from "@/server/config";
import { getStore } from "@/server/store";
import { nameFromHandle } from "@/lib/names";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: { signIn: "/", error: "/" },
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email || profile?.email_verified === false) return false;
      const domain = config.allowedEmailDomain;
      if (domain && !email.endsWith("@" + domain)) return "/?signin=domain";
      const store = await getStore();
      await store.upsertUser(email, profile?.name || nameFromHandle(email));
      return true;
    },
  },
});
