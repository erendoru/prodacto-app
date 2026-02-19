"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "The backlog readiness score alone makes Prodacto worth it. No more unready stories sneaking into sprint.",
    author: "Sarah",
    role: "Startup PM",
  },
  {
    quote: "Writing user stories with voice is incredibly natural. I walk out of a meeting and add to the backlog in 2 minutes.",
    author: "Michael",
    role: "Senior PM",
  },
  {
    quote: "The market analysis feature cut hours of research down to minutes. Never generated TAM/SAM/SOM this fast.",
    author: "James",
    role: "Startup Founder",
  },
  {
    quote: "Prodacto understands product strategy. The coaching feedback is like having a CPO review every doc before it goes out.",
    author: "Emma",
    role: "Product Lead",
  },
  {
    quote: "The inline annotation is genius. I strike through, write my thoughts, and AI updates the entire document. Magic.",
    author: "David",
    role: "PM at Series B",
  },
  {
    quote: "I'm the only PM at my company. With Prodacto, I've 10x'd myself. The Jira integration saves hours every sprint.",
    author: "Lisa",
    role: "Solo PM",
  },
];

export default function Testimonials() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-14 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
            Everyone loves Prodacto
          </h2>
        </motion.div>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="mb-4 break-inside-avoid"
            >
              <div className="section-card p-5">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-text-secondary">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-text-secondary">
                    {t.author[0]}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{t.author}</span>
                    <span className="ml-2 text-xs text-text-tertiary">{t.role}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
