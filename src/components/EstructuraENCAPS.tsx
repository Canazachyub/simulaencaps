import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { BLOCK_ORDER, BLOCK_CONFIG, ENCAPS_INFO, type BlockType } from '../types';
import { getEstructura, type EstructuraNode } from '../services/api';

// ============================================
// FALLBACK ESTÁTICO (si API falla)
// Distribución estimada de sub-áreas por bloque
// basada en lineamientos MINSA / temario ENCAPS
// ============================================
type EstructuraEntry = Omit<EstructuraNode, 'block'>;

const FALLBACK_ESTRUCTURA: Record<BlockType, EstructuraEntry[]> = {
  'Salud Pública': [
    { subArea: 'Epidemiología', tema: 'Indicadores de morbi-mortalidad, vigilancia epidemiológica', preguntas: 6 },
    { subArea: 'Promoción de la salud', tema: 'Determinantes sociales, estilos de vida saludables', preguntas: 5 },
    { subArea: 'Prevención de enfermedades', tema: 'Inmunizaciones, ESNI, control de daños no transmisibles', preguntas: 5 },
    { subArea: 'Salud ambiental', tema: 'Saneamiento, calidad del agua, residuos sólidos', preguntas: 4 }
  ],
  'Atención Integral': [
    { subArea: 'AIEPI', tema: 'Atención integrada al niño y adolescente, signos de alarma', preguntas: 8 },
    { subArea: 'Salud materna', tema: 'Control prenatal, parto, puerperio, planificación familiar', preguntas: 7 },
    { subArea: 'Salud mental', tema: 'Tamizaje de depresión y ansiedad en APS, violencia familiar', preguntas: 5 },
    { subArea: 'Etapas de vida', tema: 'Adulto, adulto mayor, atención integral por etapa', preguntas: 5 }
  ],
  'Ética': [
    { subArea: 'Bioética clínica', tema: 'Principios, autonomía, consentimiento informado', preguntas: 5 },
    { subArea: 'Código deontológico', tema: 'Código de Ética del Colegio Médico del Perú', preguntas: 5 },
    { subArea: 'Interculturalidad', tema: 'Atención con pertinencia cultural, derechos del paciente', preguntas: 5 }
  ],
  'Investigación': [
    { subArea: 'Metodología', tema: 'Tipos de estudio, diseño, hipótesis y variables', preguntas: 5 },
    { subArea: 'Estadística', tema: 'Pruebas, intervalos de confianza, p-valor', preguntas: 5 },
    { subArea: 'Lectura crítica', tema: 'Validez interna/externa, sesgos, MBE', preguntas: 5 }
  ],
  'Administración': [
    { subArea: 'Gestión de servicios', tema: 'Cartera de servicios, microrredes, niveles de atención', preguntas: 7 },
    { subArea: 'Normativa MINSA', tema: 'NTS y RM vigentes para APS, organización del sector', preguntas: 7 },
    { subArea: 'Planificación', tema: 'Plan operativo, plan estratégico institucional', preguntas: 6 },
    { subArea: 'Aseguramiento', tema: 'SIS, AUS, financiamiento de la salud', preguntas: 5 }
  ]
};

interface EstructuraData {
  blocks: Record<BlockType, EstructuraEntry[]>;
  source: 'api' | 'fallback';
}

export function EstructuraENCAPS() {
  const [data, setData] = useState<EstructuraData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const apiResult = await getEstructura();
        if (!alive) return;
        if (apiResult && Array.isArray(apiResult)) {
          // Agrupar nodos por bloque (sin el campo block, que va como key)
          const grouped: Record<BlockType, EstructuraEntry[]> = {
            'Salud Pública': [],
            'Atención Integral': [],
            'Ética': [],
            'Investigación': [],
            'Administración': []
          };
          for (const node of apiResult) {
            const blk = node.block as BlockType | undefined;
            if (blk && grouped[blk]) {
              const { block: _b, ...rest } = node;
              void _b;
              grouped[blk].push(rest);
            }
          }
          // Si quedó algún bloque vacío, completar con fallback
          (Object.keys(grouped) as BlockType[]).forEach((b) => {
            if (grouped[b].length === 0) grouped[b] = FALLBACK_ESTRUCTURA[b];
          });
          setData({ blocks: grouped, source: 'api' });
        } else {
          setData({ blocks: FALLBACK_ESTRUCTURA, source: 'fallback' });
        }
      } catch {
        if (!alive) return;
        setData({ blocks: FALLBACK_ESTRUCTURA, source: 'fallback' });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="bg-neutral-bg min-h-screen">
      {/* Header */}
      <section className="bg-navy-500 text-white relative overflow-hidden">
        <div
          aria-hidden
          className="deco-dot-grid absolute top-6 right-10 w-40 h-40 opacity-30 pointer-events-none"
        />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-body font-semibold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <span className="badge-amber mb-4">Temario oficial</span>
          <h1 className="font-display uppercase text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Estructura del{' '}
            <span className="accent-underline text-amber-500">ENCAPS</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-white/85 max-w-2xl">
            {ENCAPS_INFO.totalQuestions} preguntas distribuidas en 5 bloques · escala 0-20
          </p>
        </div>
      </section>

      {/* Bloques */}
      <section className="container mx-auto px-4 py-16">
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mb-4" />
            <p className="font-body text-neutral-textSoft">Cargando temario…</p>
          </div>
        )}

        {!loading && data && (
          <div className="space-y-8 max-w-5xl mx-auto">
            {BLOCK_ORDER.map((blockName, idx) => {
              const meta = BLOCK_CONFIG[blockName];
              const subAreas = data.blocks[blockName] ?? [];
              return (
                <BlockSection
                  key={blockName}
                  number={idx + 1}
                  meta={meta}
                  subAreas={subAreas}
                />
              );
            })}
          </div>
        )}

        {/* CTA final */}
        <div className="text-center mt-16">
          <Link to="/registro" className="btn-primary inline-flex items-center gap-2">
            Iniciar simulacro
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {data?.source === 'fallback' && (
          <p className="text-center text-xs text-neutral-muted mt-6 font-body italic">
            Distribución estimada según lineamientos MINSA. La distribución oficial puede variar.
          </p>
        )}
      </section>
    </main>
  );
}

interface BlockSectionProps {
  number: number;
  meta: { code: number; name: BlockType; questionCount: number; description: string };
  subAreas: EstructuraEntry[];
}

function BlockSection({ number, meta, subAreas }: BlockSectionProps) {
  const totalPreguntas = meta.questionCount;
  const totalPuntaje = totalPreguntas; // 1 punto por pregunta

  return (
    <article className="card-encaps p-0 overflow-hidden hover:translate-y-0">
      {/* Header del bloque */}
      <header className="bg-navy-500 text-white p-6 md:p-7 flex items-center gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-full bg-amber-500 text-navy-500 font-display font-extrabold text-xl flex items-center justify-center flex-shrink-0">
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display uppercase text-xl md:text-2xl font-extrabold leading-tight">
            {meta.name}
          </h2>
          <p className="font-body text-white/80 text-sm mt-1">{meta.description}</p>
        </div>
        <span className="badge-teal flex-shrink-0">
          {totalPreguntas} preguntas · {totalPuntaje} pts
        </span>
      </header>

      {/* Tabla de sub-áreas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-bg">
            <tr>
              <th className="px-4 md:px-6 py-3 font-display uppercase tracking-wider text-xs text-navy-500">
                Sub-área
              </th>
              <th className="px-4 md:px-6 py-3 font-display uppercase tracking-wider text-xs text-navy-500">
                Tema
              </th>
              <th className="px-4 md:px-6 py-3 font-display uppercase tracking-wider text-xs text-navy-500 text-center whitespace-nowrap">
                # Preg.
              </th>
              <th className="px-4 md:px-6 py-3 font-display uppercase tracking-wider text-xs text-navy-500 text-center whitespace-nowrap">
                Puntaje est.
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            {subAreas.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center font-body text-neutral-muted text-sm">
                  Sin sub-áreas registradas para este bloque.
                </td>
              </tr>
            ) : (
              subAreas.map((sa, i) => (
                <tr key={`${sa.subArea}-${i}`} className="hover:bg-neutral-bg transition-colors">
                  <td className="px-4 md:px-6 py-3 font-body font-semibold text-navy-500 text-sm">
                    {sa.subArea}
                  </td>
                  <td className="px-4 md:px-6 py-3 font-body text-neutral-textSoft text-sm">
                    {sa.tema}
                  </td>
                  <td className="px-4 md:px-6 py-3 text-center font-display font-bold text-teal-500">
                    {sa.preguntas}
                  </td>
                  <td className="px-4 md:px-6 py-3 text-center font-display font-bold text-amber-500">
                    {sa.preguntas}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
