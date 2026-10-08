import { demoSignIn } from "@/server/session";

export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email || !/^[^@\s]+@[^@\s]+$/.test(email)) return Response.json({ error: "Enter an email address" }, { status: 400 });
  try {
    await demoSignIn(email);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
