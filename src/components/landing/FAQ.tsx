import { useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FaqItem {
  question: string;
  answer: ReactNode;
}

const FAQS: FaqItem[] = [
  {
    question: '¿Cuántas preguntas tiene el simulador?',
    answer:
      'Usa el banco completo de Google Sheets, equivalente al examen ENCAPS oficial: 100 preguntas distribuidas en 5 bloques MINSA.'
  },
  {
    question: '¿Cómo se calcula el Puntaje Final (PF)?',
    answer:
      'PF = (PPP × 0.3) + (NENC × 0.7). El NENC viene de tu simulacro (0-20) y el PPP es tu Promedio Ponderado Promocional (lo ingresas tú).'
  },
  {
    question: '¿La nota es realmente equivalente al ENCAPS oficial?',
    answer:
      'Usamos la misma fórmula y la misma escala vigesimal (0-20). El simulacro es referencial, pero entrena el formato y el ritmo del examen real.'
  },
  {
    question: '¿Cuánto dura mi acceso después de pagar?',
    answer:
      'Depende del plan: el Plan ENCAPS 2026 dura hasta la fecha del examen 2026; el Plan Extendido cubre el siguiente ciclo.'
  },
  {
    question: '¿Funciona en celular?',
    answer:
      'Sí, totalmente responsive. Recomendamos tablet o laptop para el simulacro completo de 3 horas.'
  },
  {
    question: '¿Qué bloques cubre?',
    answer: (
      <>
        Salud Pública, Atención Integral, Ética, Investigación y Administración. Ver el{' '}
        <Link to="/estructura" className="text-teal-500 font-semibold underline hover:text-teal-600">
          temario completo
        </Link>
        .
      </>
    )
  },
  {
    question: '¿Cómo se actualizan las preguntas?',
    answer:
      'Revisamos las RM y NTS vigentes del MINSA y actualizamos el banco antes de cada convocatoria.'
  },
  {
    question: '¿Puedo reportar errores en preguntas?',
    answer:
      'Sí, hay un botón de WhatsApp en cada pregunta para reportar erratas o discrepancias.'
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="py-20 bg-neutral-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="badge-navy-outline mb-4">FAQ</span>
          <h2 className="font-display uppercase text-4xl md:text-5xl font-extrabold text-navy-500">
            Preguntas{' '}
            <span className="accent-underline text-teal-500">frecuentes</span>
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="card-encaps p-0 overflow-hidden hover:translate-y-0">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left p-6 md:p-7 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-[20px]"
                >
                  <span className="font-display font-bold text-navy-500 text-base md:text-lg">
                    {item.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-9 h-9 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center transition-transform duration-300 ${
                      isOpen ? 'rotate-45' : 'rotate-0'
                    }`}
                  >
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-standard ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 md:px-7 pb-6 md:pb-7 font-body text-neutral-textSoft leading-relaxed">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
