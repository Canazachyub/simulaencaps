import {
  BookOpen,
  RotateCcw,
  Layers,
  LineChart,
  TrendingUp,
  Users,
  Target,
  type LucideIcon
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  iconBg: 'teal' | 'amber';
}

const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    title: 'Justificaciones comprensibles',
    description:
      'Al calificar, cada pregunta muestra el razonamiento y por qué cada distractor es incorrecto, con cita de la NTS/RM correspondiente.',
    bullets: [
      'Cita oficial a la norma técnica MINSA',
      'Explicación de por qué cada distractor falla',
      'Razonamiento paso a paso del experto'
    ],
    iconBg: 'teal'
  },
  {
    icon: RotateCcw,
    title: 'Repaso de incorrectas',
    description:
      'El sistema guarda tu historial y genera simulacros solo con las preguntas que fallaste, para que enfoques tu estudio donde más lo necesitas.',
    bullets: [
      'Historial automático de errores',
      'Mini-simulacros enfocados en debilidades',
      'Reintenta hasta dominar cada concepto'
    ],
    iconBg: 'amber'
  },
  {
    icon: Layers,
    title: 'Flashcards ENCAPS',
    description:
      'Tarjetas para memorizar normas técnicas, esquemas de AIEPI, indicadores epidemiológicos y artículos del Código de Ética.',
    bullets: [
      'AIEPI: signos de alarma y manejo',
      'Indicadores epidemiológicos clave',
      'Código de Ética del Colegio Médico'
    ],
    iconBg: 'teal'
  },
  {
    icon: LineChart,
    title: 'Análisis post-examen',
    description:
      'Al terminar, ves tu NENC, PPP y PF con interpretación de nivel y comparativa frente al promedio histórico.',
    bullets: [
      'NENC y PF en escala vigesimal 0-20',
      'Nivel: aprobado destacado / aprobado / en riesgo',
      'Comparativa con tus intentos anteriores'
    ],
    iconBg: 'amber'
  },
  {
    icon: TrendingUp,
    title: 'Progreso histórico',
    description:
      'Gráfico de evolución de NENC en tus intentos. Mira de un vistazo si estás mejorando o estancándote.',
    bullets: [
      'Gráfico de NENC por fecha',
      'Mejor nota y promedio personal',
      'Detecta plateau y reactiva tu plan'
    ],
    iconBg: 'teal'
  },
  {
    icon: Users,
    title: 'Comparación con la comunidad',
    description:
      'Para cada pregunta, el porcentaje de usuarios que eligió cada alternativa. Sabe qué tan común es tu confusión.',
    bullets: [
      '% de selección por alternativa',
      'Identifica preguntas trampa de la comunidad',
      'Sentido de comparación realista'
    ],
    iconBg: 'amber'
  },
  {
    icon: Target,
    title: 'Estadísticas por bloque y sub-área',
    description:
      'Ranking de tus mejores y peores sub-áreas. Sabe exactamente qué temas reforzar antes del día del examen.',
    bullets: [
      'Top 3 fortalezas y top 3 debilidades',
      'Aciertos por bloque MINSA',
      'Detalle por sub-área dentro de cada bloque'
    ],
    iconBg: 'teal'
  }
];

export function FeaturesShowcase() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="badge-teal mb-4">Funcionalidades</span>
          <h2 className="font-display uppercase text-4xl md:text-5xl font-extrabold text-navy-500">
            Todo lo que{' '}
            <span className="accent-underline text-teal-500">necesitas</span>{' '}
            para el ENCAPS
          </h2>
        </div>

        <div className="space-y-20 max-w-6xl mx-auto">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            const isReversed = idx % 2 === 1;
            const bgClass = feature.iconBg === 'teal' ? 'bg-teal-50' : 'bg-amber-50';
            const accentClass = feature.iconBg === 'teal' ? 'text-teal-500' : 'text-amber-500';

            return (
              <div
                key={feature.title}
                className={`grid md:grid-cols-2 gap-10 items-center ${
                  isReversed ? 'md:[&>:first-child]:order-2' : ''
                }`}
              >
                {/* Ilustración */}
                <div className="flex justify-center">
                  <div
                    className={`${bgClass} w-[200px] h-[200px] md:w-[240px] md:h-[240px] rounded-full flex items-center justify-center relative`}
                  >
                    <Icon className={`w-24 h-24 md:w-28 md:h-28 ${accentClass}`} strokeWidth={1.5} />
                    <div className="deco-dot-grid absolute -top-3 -right-3 w-16 h-16 opacity-60 rounded-full" />
                  </div>
                </div>

                {/* Texto */}
                <div>
                  <span className="badge-navy-outline mb-3">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display uppercase text-3xl md:text-4xl font-extrabold text-navy-500 mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="font-body text-neutral-textSoft text-base md:text-lg mb-5 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-3 font-body text-neutral-text text-sm md:text-base"
                      >
                        <span
                          className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${
                            feature.iconBg === 'teal' ? 'bg-teal-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
