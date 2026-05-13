// ============================================
// PLANES DE PRECIOS - SimulaENCAPS
// ============================================

export interface PricingFeature {
  label: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string; // ej: "Más popular"
  price: number;
  priceOriginal?: number;
  currency: 'PEN';
  duration: string; // ej: "Hasta el examen 2026"
  highlight?: boolean;
  features: PricingFeature[];
  ctaLabel: string;
  ctaType: 'whatsapp' | 'free' | 'external';
  ctaTarget?: string; // url | mensaje WhatsApp
}

// Número editable. Reemplazar por el real en producción.
export const WHATSAPP_NUMBER = '51999999999';
export const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}?text=`;

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Prueba gratuita',
    price: 0,
    currency: 'PEN',
    duration: '1 simulacro completo',
    features: [
      { label: 'Simulacro completo (100 preguntas, 3h)', included: true },
      { label: 'Nota vigesimal NENC + cálculo PF', included: true },
      { label: 'Banqueo por bloque y sub-área', included: false },
      { label: 'Repaso de incorrectas', included: false },
      { label: 'Flashcards ENCAPS', included: false },
      { label: 'Analítica avanzada', included: false }
    ],
    ctaLabel: 'Empezar ahora',
    ctaType: 'free',
    ctaTarget: '/registro'
  },
  {
    id: 'encaps_actual',
    name: 'Plan ENCAPS 2026',
    badge: 'Más popular',
    price: 199,
    priceOriginal: 400,
    currency: 'PEN',
    duration: 'Hasta el examen ENCAPS 2026',
    highlight: true,
    features: [
      { label: 'Simulacros ilimitados', included: true },
      { label: 'Banqueo por bloque y sub-área', included: true },
      { label: 'Repaso de preguntas incorrectas', included: true },
      { label: 'Flashcards ENCAPS', included: true },
      { label: 'Analítica completa por bloque', included: true },
      { label: 'Soporte vía WhatsApp', included: true }
    ],
    ctaLabel: 'Inscribirme',
    ctaType: 'whatsapp',
    ctaTarget: 'Hola, quiero inscribirme al Plan ENCAPS 2026'
  },
  {
    id: 'encaps_extendido',
    name: 'Plan ENCAPS Extendido',
    price: 249,
    priceOriginal: 500,
    currency: 'PEN',
    duration: 'Hasta el siguiente examen ENCAPS',
    features: [
      { label: 'Todo lo del Plan ENCAPS 2026', included: true },
      { label: 'Acceso ampliado al siguiente ciclo', included: true },
      { label: 'Actualizaciones de banco prioritarias', included: true },
      { label: 'Soporte prioritario WhatsApp', included: true }
    ],
    ctaLabel: 'Inscribirme',
    ctaType: 'whatsapp',
    ctaTarget: 'Hola, quiero inscribirme al Plan ENCAPS Extendido'
  }
];

export function getWhatsAppUrl(message: string): string {
  return WHATSAPP_BASE + encodeURIComponent(message);
}
