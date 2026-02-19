import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustedBy from "@/components/landing/TrustedBy";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import Compare from "@/components/landing/Compare";
import Testimonials from "@/components/landing/Testimonials";
import Waitlist from "@/components/landing/Waitlist";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <FeatureShowcase />
        <HowItWorks />
        <Pricing />
        <Compare />
        <Testimonials />
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
