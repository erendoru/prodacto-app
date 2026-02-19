import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await request.json() as { plan: string };

  if (plan !== "PRO" && plan !== "TEAM") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planConfig = PLANS[plan as "PRO" | "TEAM"];
  if (!planConfig.priceId) {
    return NextResponse.json({ error: "Stripe price not configured" }, { status: 500 });
  }

  let customerId = user.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.full_name || undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    const supabase = await createClient();
    await supabase
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?cancelled=true`,
    metadata: { userId: user.id, plan },
  });

  return NextResponse.json({ url: session.url });
}
