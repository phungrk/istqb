import "server-only";
import Stripe from "stripe";

let stripe: Stripe | null = null;
export const getStripe = () => (stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY as string));

export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  yearly: process.env.STRIPE_PRICE_YEARLY,
};
