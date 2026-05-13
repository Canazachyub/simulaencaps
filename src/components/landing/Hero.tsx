import { Link } from 'react-router-dom';
import { Check, Send } from 'lucide-react';

const checklist: string[] = [
  'Banco con preguntas reales del estilo ENCAPS organizado en 5 bloques MINSA',
  'Justificación experta para cada pregunta con cita a RM/NTS',
  'Examen 100 preguntas · 3 horas · escala 0-20 (NENC + PF)',
  'Genera simulacros ilimitados',
  'Modo "repaso de incorrectas" enfocado en tus debilidades',
  'Analítica por bloque y sub-área',
  'Funciona en cualquier dispositivo, sin anuncios',
  'Bonus: Flashcards de normas técnicas y AIEPI'
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-neutral-bg py-16 md:py-24">
      {/* Decoraciones */}
      <div
        aria-hidden
        className="deco-dot-grid absolute top-8 left-4 w-40 h-40 opacity-70 pointer-events-none"
      />
      <div
        aria-hidden
        className="deco-dot-grid absolute bottom-12 right-4 w-48 h-48 opacity-60 pointer-events-none"
      />
      <Send
        aria-hidden
        className="absolute top-12 right-1/4 w-10 h-10 text-teal-500/30 -rotate-12 hidden lg:block"
      />
      <Send
        aria-hidden
        className="absolute bottom-20 left-1/4 w-8 h-8 text-amber-500/40 rotate-45 hidden lg:block"
      />

      <div className="relative container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Columna izquierda */}
          <div>
            <span className="badge-amber mb-6">ENCAPS 2026</span>

            <h1 className="font-display uppercase text-5xl md:text-6xl lg:text-[64px] leading-tight font-extrabold text-navy-500 mb-6">
              Prepárate para el{' '}
              <span className="accent-underline text-teal-500">ENCAPS</span>{' '}
              con simulacros reales del MINSA
            </h1>

            <p className="font-body text-lg md:text-xl text-neutral-textSoft mb-8 max-w-xl">
              Simulador completo del Examen Nacional de Competencias para Atención Primaria de Salud.
              100 preguntas, 3 horas, nota vigesimal NENC + PF.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/registro" className="btn-primary inline-flex items-center justify-center gap-2">
                Iniciar simulacro gratuito
              </Link>
              <Link to="/banqueo" className="btn-outline inline-flex items-center justify-center gap-2">
                Ver banqueo
              </Link>
            </div>
          </div>

          {/* Columna derecha: card de checklist */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -top-4 -right-4 w-32 h-32 bg-amber-500/15 rounded-[20px] hidden md:block"
            />
            <div
              aria-hidden
              className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-500/15 rounded-[20px] hidden md:block"
            />
            <div className="relative card-encaps p-6 md:p-8">
              <h3 className="font-display uppercase text-navy-500 text-xl font-bold mb-5">
                Lo que incluye
              </h3>
              <ul className="space-y-3">
                {checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center">
                      <Check className="w-4 h-4 text-teal-500" strokeWidth={3} />
                    </span>
                    <span className="font-body text-neutral-textSoft text-sm md:text-base leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
