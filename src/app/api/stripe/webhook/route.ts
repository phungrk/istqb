import type Stripe from "stripe";
import { getStore } from "@/server/store";
import { getStripe } from "@/server/stripe";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return new Response("Webhook not configured", { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return new Response("Bad signature", { status: 400 });
  }

  const store = await getStore();
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      const email = s.metadata?.email ?? s.customer_details?.email;
      const user = email ? await store.getUserByEmail(email.toLowerCase()) : null;
      if (user) {
        const customer = typeof s.customer === "string" ? s.customer : (s.customer?.id ?? null);
        await store.updateUser(user.id, { plan: "pro", proUntil: null, stripeCustomerId: customer });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const user = await store.getUserByStripeCustomer(customer);
      const active = event.type === "customer.subscription.updated" && ["active", "trialing", "past_due"].includes(sub.status);
      if (user) await store.updateUser(user.id, { plan: active ? "pro" : "member", proUntil: null });
      break;
    }
  }
  return Response.json({ received: true });
}
