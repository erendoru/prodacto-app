"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Mail } from "lucide-react";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section id="waitlist" className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl bg-primary px-6 py-16 text-center sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="mb-6 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <Mail className="h-6 w-6 text-white" />
              </div>
            </div>

            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Stay in the loop
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-base text-white/70">
              We&apos;re building something special for product teams. Leave your
              email and be the first to know when we launch new features.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto max-w-sm rounded-xl bg-white/10 p-6 backdrop-blur-sm"
              >
                <div className="mb-3 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">
                  You&apos;re on the list!
                </h3>
                <p className="text-sm text-white/70">
                  We&apos;ve added <span className="font-medium text-white">{email}</span> to
                  our early access list. We&apos;ll reach out as soon as there&apos;s
                  something exciting to share.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 rounded-full bg-white/10 px-6 py-3 text-sm text-white placeholder:text-white/40 focus:bg-white/15 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
                <button
                  type="submit"
                  className="group flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-primary transition-opacity hover:opacity-90"
                >
                  Keep me posted
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>
            )}

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/40">
              <span>No spam, ever</span>
              <span>Unsubscribe anytime</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
