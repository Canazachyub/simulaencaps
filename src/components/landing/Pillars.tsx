import { ClipboardCheck, Database, BookOpen, BarChart3, type LucideIcon } from 'lucide-react';

interface Pillar {
  icon: LucideIcon;
  title: string;
  tagline: string;
}

const PILLARS: Pillar[] = [
  {
    icon: ClipboardCheck,
    title: 'Simulador ENCAPS',
    tagline: 'Examen completo de 100 preguntas, 3 horas, formato MINSA'
  },
  {
    icon: Database,
    title: 'Banco ENCAPS',
    tagline: 'Preguntas etiquetadas por bloque, sub-área y nivel cognitivo'
  },
  {
    icon: BookOpen,
    title: 'Justificaciones',
    tagline: 'Cada pregunta cita la norma técnica o referencia oficial'
  },
  {
    icon: BarChart3,
    title: 'Analítica personal',
    tagline: 'Aciertos por bloque, evolución del PF, áreas a reforzar'
  }
];

export function Pillars() {
  return (
    <section className="relative py-20 bg-neutral-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="badge-navy-outline mb-4">Pilares</span>
          <h2 className="font-display uppercase text-4xl md:text-5xl font-extrabold text-navy-500">
            Por qué{' '}
            <span className="accent-underline text-teal-500">SimulaENCAPS</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {PILLARS.map(({ icon: Icon, title, tagline }) => (
            <div key={title} className="card-encaps flex flex-col items-start">
              <div className="w-14 h-14 rounded-[14px] bg-navy-500 flex items-center justify-center mb-5">
                <Icon className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <h3 className="font-display uppercase text-navy-500 text-lg font-bold mb-2">
                {title}
              </h3>
              <p className="font-body text-neutral-textSoft text-sm leading-relaxed">
                {tagline}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
