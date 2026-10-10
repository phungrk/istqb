"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";

export function AdminLogin({ configured, signedInAs }: { configured: boolean; signedInAs: string | null }) {
  const { loginPassword, signOut, toast } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <section style={{ display: "flex", justifyContent: "center", paddingTop: 48 }}>
      <div className="card" style={{ width: "min(420px, 100%)", padding: 32, gap: 14, background: "var(--color-neutral-100)" }}>
        <span className="card-kicker" style={{ color: "var(--color-accent-700)" }}>Admin</span>
        <h1 style={{ margin: 0, fontSize: 28 }}>Sign in to manage accounts</h1>
        {!configured ? (
          <p style={{ margin: 0, fontSize: 14, color: "var(--color-neutral-800)" }}>
            Admin isn&apos;t set up on this deployment. Add <code>ADMIN_USERNAME</code> and <code>ADMIN_PASSWORD</code> to the
            environment variables (Production), then redeploy.
          </p>
        ) : signedInAs ? (
          <>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color-neutral-800)" }}>
              You&apos;re signed in as <strong>{signedInAs}</strong>, which isn&apos;t the admin account. Sign out first, then sign in as admin.
            </p>
            <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={() => void signOut()}>Sign out</button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!username.trim() || !password) return toast("Enter the admin username and password");
              void loginPassword(username.trim(), password);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div className="field">
              <label htmlFor="admin-user">Username</label>
              <input id="admin-user" className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" style={{ minHeight: 44 }} />
            </div>
            <div className="field">
              <label htmlFor="admin-pass">Password</label>
              <input id="admin-pass" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" style={{ minHeight: 44 }} />
            </div>
            <button className="btn btn-primary" type="submit" style={{ alignSelf: "flex-start", marginTop: 4 }}>Sign in</button>
          </form>
        )}
      </div>
    </section>
  );
}
