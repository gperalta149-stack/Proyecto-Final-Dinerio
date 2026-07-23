// frontend/src/features/home/pages/HomePage.tsx
import React from "react";
import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { CtaSection } from "../components/CtaSection";
import { Footer } from "../components/Footer";
import '../../../styles/home/homePage.css';

export const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
      <Footer />
    </div>
  );
};