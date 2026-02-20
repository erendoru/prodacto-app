"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Settings, User, CreditCard, Shield, Loader2, Save, LogOut,
  Check, Crown, Zap, Star, ExternalLink,
} from "lucide-react";
import clsx from "clsx";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: string;
  stripe_customer_id: string | null;
  created_at: string;
}

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "/forever",
    icon: Zap,
    color: "border-border",
    features: ["5 projects", "50 AI queries/month", "Basic backlog scoring", "Community support"],
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$19",
    period: "/month",
    icon: Star,
    color: "border-primary",
    popular: true,
    features: ["Unlimited projects", "Unlimited AI queries", "PRD Generator & AI Review", "Voice Studio", "Business Case Builder", "Priority support"],
  },
  {
    id: "TEAM",
    name: "Team",
    price: "$49",
    period: "/month",
    icon: Crown,
    color: "border-amber-400",
    features: ["Everything in Pro", "Team collaboration", "Custom templates", "Admin dashboard", "SSO & audit logs", "Dedicated support"],
  },
];

type Tab = "profile" | "billing" | "account";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setProfile(data);
          setFullName(data.full_name || "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!profile?.email) return;
    setChangingPassword(true);
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (!error) setPasswordSent(true);
    setChangingPassword(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleManageBilling = async () => {
    if (!profile?.stripe_customer_id) return;
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (res.ok) {
        const { url } = await res.json();
        window.open(url, "_blank");
      }
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "profile", label: "Profile", icon: User },
    { key: "billing", label: "Plan & Billing", icon: CreditCard },
    { key: "account", label: "Account", icon: Shield },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />Settings
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Manage your profile, plan, and account preferences</p>
      </div>

      <div className="flex gap-2 border-b border-border pb-px">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={clsx("flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.key ? "border-primary text-primary" : "border-transparent text-text-tertiary hover:text-foreground")}>
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {(fullName || profile?.email || "?")[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{fullName || "No name set"}</h3>
                <p className="text-xs text-text-tertiary">{profile?.email}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
                </p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full max-w-md rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Your full name" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Email</label>
              <input value={profile?.email || ""} disabled
                className="w-full max-w-md rounded-lg border border-border bg-muted px-3.5 py-2.5 text-sm text-text-tertiary" />
              <p className="mt-1 text-[10px] text-text-tertiary">Email cannot be changed directly. Contact support if needed.</p>
            </div>

            <button onClick={handleSaveProfile} disabled={saving || fullName === (profile?.full_name || "")}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {tab === "billing" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-tertiary">Current Plan</p>
                <p className="text-lg font-bold text-foreground">{profile?.plan || "FREE"}</p>
              </div>
              {profile?.stripe_customer_id && (
                <button onClick={handleManageBilling}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-hover">
                  <ExternalLink className="h-3.5 w-3.5" />Manage Billing
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => {
              const isCurrent = profile?.plan === plan.id;
              return (
                <div key={plan.id}
                  className={clsx("relative rounded-xl border-2 bg-surface p-5 transition-all",
                    isCurrent ? "border-primary shadow-sm" : plan.color, plan.popular && !isCurrent && "border-primary/30")}>
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white">
                      Popular
                    </span>
                  )}
                  <div className="mb-3 flex items-center gap-2">
                    <plan.icon className={clsx("h-5 w-5", isCurrent ? "text-primary" : "text-text-tertiary")} />
                    <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-black text-foreground">{plan.price}</span>
                    <span className="text-xs text-text-tertiary">{plan.period}</span>
                  </div>
                  <ul className="mb-4 space-y-1.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-text-secondary">
                        <Check className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <div className="rounded-lg bg-primary/10 py-2 text-center text-xs font-semibold text-primary">Current Plan</div>
                  ) : (
                    <button className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-white hover:bg-primary-dark">
                      {plan.id === "FREE" ? "Downgrade" : "Upgrade"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "account" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-1 text-sm font-bold text-foreground">Change Password</h3>
            <p className="mb-3 text-xs text-text-tertiary">We&apos;ll send a password reset link to your email.</p>
            {passwordSent ? (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
                <Check className="h-3.5 w-3.5" />Password reset email sent! Check your inbox.
              </div>
            ) : (
              <button onClick={handleResetPassword} disabled={changingPassword}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-hover disabled:opacity-50">
                {changingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
                Send Reset Email
              </button>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-1 text-sm font-bold text-foreground">Sign Out</h3>
            <p className="mb-3 text-xs text-text-tertiary">Sign out of your Prodacto account on this device.</p>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100">
              <LogOut className="h-3.5 w-3.5" />Sign Out
            </button>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
            <h3 className="mb-1 text-sm font-bold text-red-600">Danger Zone</h3>
            <p className="mb-3 text-xs text-text-tertiary">Permanently delete your account and all associated data. This action cannot be undone.</p>
            <button disabled className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-medium text-red-600 opacity-50 cursor-not-allowed">
              Delete Account (Coming Soon)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
