import { redirect } from "next/navigation";
import { config } from "@/server/config";
import { PricingView } from "./PricingView";

/** Pricing is hidden until ENABLE_PRO=1. */
export default function PricingPage() {
  if (!config.pro) redirect("/");
  return <PricingView />;
}
