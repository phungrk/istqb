import { z } from "zod";
import { config, notFound } from "@/server/config";
import { getStore } from "@/server/store";
import { requireTier } from "@/server/session";
import { getStripe, PRICE_IDS } from "@/server/stripe";

const Body = z.object({ billing: z.enum(["monthly", "yearly"]) });

/**
 * Stripe mode: returns a Checkout URL; the webhook turns the plan to Pro.
 * Demo mode: upgrades immediately, no payment taken.
 */
export async function POST(req: Request) {
  if (!config.pro) return notFound(); // Pricing and the AI coach are switched off (ENABLE_PRO=1 turns them on)
  const gate = await requireTier("member");
  if ("error" in gate) return gate.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Choose monthly or yearly" }, { status: 400 });
  const { user } = gate;

  if (config.payments === "demo") {
    await (await getStore()).updateUser(user.id, { plan: "pro", proUntil: null });
    return Response.json({ ok: true });
  }

  const price = PRICE_IDS[parsed.data.billing];
  if (!price) return Response.json({ error: "Price not configured" }, { status: 500 });
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    ...(user.stripeCustomerId ? { customer: user.stripeCustomerId } : user.email ? { customer_email: user.email } : {}),
    client_reference_id: user.id,
    metadata: { userId: user.id },
    success_url: `${config.appUrl}/coach?upgraded=1`,
    cancel_url: `${config.appUrl}/pricing`,
  });
  return Response.json({ url: session.url });
}
