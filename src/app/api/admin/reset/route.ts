import { z } from "zod";
import { notFound } from "@/server/config";
import { getCurrentUser, isAdmin, resetPassword } from "@/server/session";

const Body = z.object({ username: z.string().trim().toLowerCase().min(1).max(64) });

/** Admin only: gives an account a new 8-digit password and returns it once. */
export async function POST(req: Request) {
  if (!isAdmin(await getCurrentUser())) return notFound();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Missing username" }, { status: 400 });
  const password = await resetPassword(parsed.data.username);
  if (!password) return Response.json({ error: "No such account" }, { status: 404 });
  return Response.json({ username: parsed.data.username, password });
}
