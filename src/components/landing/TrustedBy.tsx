"use client";

const companies = [
  "Param",
  "Armut",
  "Modanisa",
  "Miro",
  "Loom",
  "Notion",
  "Linear",
  "Figma",
];

export default function TrustedBy() {
  return (
    <section className="trusted-bar py-8">
      <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-text-tertiary">
        Trusted by product teams everywhere
      </p>
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />

        <div className="marquee-track">
          {companies.map((name, i) => (
            <span key={`a-${i}`} className="text-3xl font-bold text-text-tertiary/40">
              {name}
            </span>
          ))}
          {companies.map((name, i) => (
            <span key={`b-${i}`} className="text-3xl font-bold text-text-tertiary/40">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
