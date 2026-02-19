import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    queries: 20,
    projects: 1,
    features: [
      "1 Project",
      "20 AI queries/month",
      "Basic backlog scoring",
      "Community support",
    ],
  },
  PRO: {
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    queries: -1, // unlimited
    projects: -1, // unlimited
    features: [
      "Unlimited projects",
      "Unlimited AI queries",
      "Advanced readiness scoring",
      "Voice commands",
      "Market analysis",
      "Priority support",
      "Export to Jira/CSV",
    ],
  },
  TEAM: {
    name: "Team",
    price: 79,
    priceId: process.env.STRIPE_TEAM_PRICE_ID || "",
    queries: -1,
    projects: -1,
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Shared projects & backlogs",
      "Admin dashboard",
      "SSO / SAML",
      "Dedicated support",
      "Custom AI training",
    ],
  },
} as const;
