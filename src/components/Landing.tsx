import { Hero } from './landing/Hero';
import { Pillars } from './landing/Pillars';
import { FeaturesShowcase } from './landing/FeaturesShowcase';
import { Testimonials } from './landing/Testimonials';
import { PricingCards } from './landing/PricingCards';
import { FAQ } from './landing/FAQ';
import { FooterEncaps } from './landing/FooterEncaps';

export function Landing() {
  return (
    <main className="bg-neutral-bg min-h-screen">
      <Hero />
      <Pillars />
      <FeaturesShowcase />
      <Testimonials />
      <PricingCards />
      <FAQ />
      <FooterEncaps />
    </main>
  );
}
