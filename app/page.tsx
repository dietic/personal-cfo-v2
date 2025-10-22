import { Cta } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { SiteFooter } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import Navbar from "@/components/landing/navbar";
import { Pricing } from "@/components/landing/pricing";

export default function Page() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Cta />
      <SiteFooter />
    </main>
  );
}
