import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, ArrowLeft, ChevronRight,
  Activity, HeartPulse, Scale, FlaskConical, Briefcase, BookOpen
} from 'lucide-react';
import { BLOCK_ORDER, BLOCK_CONFIG, type BlockType } from '../types';

const ICON_MAP: Record<string, typeof Activity> = {
  'activity': Activity,
  'heart-pulse': HeartPulse,
  'scale': Scale,
  'flask-conical': FlaskConical,
  'briefcase': Briefcase
};

/**
 * Selección de bloque para banqueo (antes era BanqueoCourseSelection con 8 cursos).
 * Ahora muestra los 5 bloques ENCAPS.
 */
export function BanqueoCourseSelection() {
  const navigate = useNavigate();

  useEffect(() => {
    const dni = sessionStorage.getItem('banqueo_dni');
    const email = sessionStorage.getItem('banqueo_email');
    if (!dni || !email) navigate('/banqueo/acceso');
  }, [navigate]);

  const handleSelectBlock = (block: BlockType) => {
    navigate(`/banqueo/practica/${encodeURIComponent(block)}`);
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <header className="bg-navy-500 text-white" style={{ background: '#16264D' }}>
        <div className="container mx-auto px-4 py-6">
          <button onClick={() => navigate('/banqueo')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Salir del banqueo
          </button>

          <div className="max-w-4xl mx-auto text-center py-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/20 rounded-2xl mb-3">
              <Brain className="w-7 h-7 text-amber-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Selecciona un bloque
            </h1>
            <p className="text-white/70">
              Elige el bloque que deseas practicar (10 preguntas aleatorias)
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {BLOCK_ORDER.map((block) => {
            const meta = BLOCK_CONFIG[block];
            const Icon = ICON_MAP[meta.iconName] || BookOpen;
            const accentBg = meta.accentColor === 'teal' ? 'bg-teal-500'
              : meta.accentColor === 'amber' ? 'bg-amber-500' : 'bg-navy-500';
            const accentText = meta.accentColor === 'amber' ? 'text-navy-500' : 'text-white';

            return (
              <button key={block} onClick={() => handleSelectBlock(block)} className="card-encaps text-left group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${accentBg} ${accentText} rounded-2xl flex items-center justify-center`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold uppercase text-neutral-muted">Bloque {meta.code}</span>
                </div>
                <h3 className="text-lg font-display font-bold text-navy-500 mb-2">{block}</h3>
                <p className="text-sm text-neutral-textSoft mb-4 line-clamp-3">{meta.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-neutral-border">
                  <span className="text-sm text-neutral-textSoft">10 preguntas aleatorias</span>
                  <ChevronRight className="w-5 h-5 text-teal-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-5">
            <h3 className="font-display font-bold text-navy-500 mb-2 flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal-500" /> Active Recall
            </h3>
            <p className="text-sm text-neutral-textSoft">
              Tras responder cada pregunta verás inmediatamente si fue correcta, la respuesta correcta, la justificación y la referencia normativa cuando esté disponible.
              Esta retroalimentación inmediata mejora significativamente la retención.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Alias para nueva nomenclatura (mantenemos el archivo)
export const BanqueoBlockSelection = BanqueoCourseSelection;
