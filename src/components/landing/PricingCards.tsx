import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { PRICING_PLANS, getWhatsAppUrl, type PricingPlan } from '../../config/pricing';

export function PricingCards() {
  return (
    <section className="py-20 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="badge-teal mb-4">Planes</span>
          <h2 className="font-display uppercase text-4xl md:text-5xl font-extrabold text-navy-500">
            Elige tu{' '}
            <span className="accent-underline text-teal-500">plan ENCAPS</span>
          </h2>
          <p className="font-body text-neutral-textSoft mt-5">
            Empieza gratis con 1 simulacro. Cuando estés listo, accede al banco completo y a todas las herramientas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch">
          {PRICING_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface PlanCardProps {
  plan: PricingPlan;
}

function PlanCard({ plan }: PlanCardProps) {
  const isHighlight = !!plan.highlight;

  const cardClass = isHighlight
    ? 'relative bg-white rounded-[20px] border-4 border-teal-500 shadow-cardHover p-8 md:-mt-4 md:mb-4 transition-all duration-300 hover:-translate-y-1 flex flex-col'
    : 'card-encaps p-8 flex flex-col';

  return (
    <div className={cardClass}>
      {plan.badge && (
        <span className="badge-amber absolute -top-3 left-1/2 -translate-x-1/2 shadow-pill">
          {plan.badge}
        </span>
      )}

      <h3 className="font-display uppercase text-navy-500 text-xl font-extrabold mb-4">
        {plan.name}
      </h3>

      <div className="mb-2">
        {plan.priceOriginal !== undefined && plan.priceOriginal > plan.price && (
          <p className="text-neutral-muted line-through font-body text-base mb-1">
            S/ {plan.priceOriginal}
          </p>
        )}
        <p className="font-display text-5xl font-extrabold text-navy-500 leading-none">
          <span className="text-2xl align-top mr-1">S/</span>
          {plan.price}
        </p>
      </div>

      <p className="font-display uppercase tracking-wider text-xs text-neutral-textSoft mb-6">
        {plan.duration}
      </p>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="flex-shrink-0 mt-0.5">
              {feature.included ? (
                <Check className="w-5 h-5 text-teal-500" strokeWidth={3} />
              ) : (
                <X className="w-5 h-5 text-neutral-muted" strokeWidth={2} />
              )}
            </span>
            <span
              className={`font-body text-sm leading-snug ${
                feature.included ? 'text-neutral-text' : 'text-neutral-muted line-through'
              }`}
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      <PlanCTA plan={plan} />
    </div>
  );
}

function PlanCTA({ plan }: PlanCardProps) {
  if (plan.ctaType === 'free' && plan.ctaTarget) {
    return (
      <Link to={plan.ctaTarget} className="btn-primary w-full text-center justify-center inline-flex">
        {plan.ctaLabel}
      </Link>
    );
  }
  if (plan.ctaType === 'whatsapp' && plan.ctaTarget) {
    return (
      <a
        href={getWhatsAppUrl(plan.ctaTarget)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-accent w-full text-center justify-center inline-flex"
      >
        {plan.ctaLabel}
      </a>
    );
  }
  if (plan.ctaType === 'external' && plan.ctaTarget) {
    return (
      <a
        href={plan.ctaTarget}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline w-full text-center justify-center inline-flex"
      >
        {plan.ctaLabel}
      </a>
    );
  }
  return null;
}
