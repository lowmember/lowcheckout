import type { CheckoutSection } from "../types/checkout-schema";
import { SectionScopeProvider } from "./renderer-context";
import { BenefitsSection } from "./sections/benefits-section";
import { CheckoutFormSection } from "./sections/checkout-form-section";
import { FaqSection } from "./sections/faq-section";
import { FooterSection } from "./sections/footer-section";
import { GuaranteeSection } from "./sections/guarantee-section";
import { HeroSection } from "./sections/hero-section";
import { PaymentCtaSection } from "./sections/payment-cta-section";
import { ProductSection } from "./sections/product-section";
import { SocialProofSection } from "./sections/social-proof-section";

interface SectionRendererProps {
  section: CheckoutSection;
}

/**
 * Único ponto que liga `section.type` a um componente. A união discriminada
 * garante em compilação que toda seção do schema tem um renderizador.
 */
export function SectionRenderer({ section }: SectionRendererProps) {
  return (
    <SectionScopeProvider sectionId={section.id}>{renderSection(section)}</SectionScopeProvider>
  );
}

function renderSection(section: CheckoutSection) {
  switch (section.type) {
    case "hero":
      return <HeroSection props={section.props} />;
    case "product":
      return <ProductSection props={section.props} />;
    case "benefits":
      return <BenefitsSection props={section.props} />;
    case "social-proof":
      return <SocialProofSection props={section.props} />;
    case "guarantee":
      return <GuaranteeSection props={section.props} />;
    case "faq":
      return <FaqSection props={section.props} />;
    case "checkout-form":
      return <CheckoutFormSection props={section.props} />;
    case "payment-cta":
      return <PaymentCtaSection props={section.props} />;
    case "footer":
      return <FooterSection props={section.props} />;
  }
}
