import { useNavigate } from 'react-router-dom';
import {
  Brain, ChevronRight, ArrowLeft, Lock, MessageCircle,
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

export function BanqueoLanding() {
  const navigate = useNavigate();

  const goToBlock = (block: BlockType) => {
    // Acceso requerido — primero verifica
    const dni = sessionStorage.getItem('banqueo_dni');
    if (!dni) {
      navigate('/banqueo/acceso');
      return;
    }
    navigate(`/banqueo/practica/${encodeURIComponent(block)}`);
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Hero */}
      <header className="bg-navy-500 text-white" style={{ background: '#16264D' }}>
        <div className="container mx-auto px-4 py-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </button>

          <div className="max-w-4xl mx-auto text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-2xl mb-4">
              <Brain className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Banqueo ENCAPS
            </h1>
            <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
              Practica con preguntas de los 5 bloques del ENCAPS usando <strong className="text-amber-500">Active Recall</strong>
              {' '}— retroalimentación inmediata después de cada pregunta.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-navy-500 rounded-pill text-sm font-bold uppercase">
              <Lock className="w-4 h-4" /> Banqueo exclusivo para usuarios inscritos
            </div>
          </div>
        </div>
      </header>

      {/* Banner CTA inscripción */}
      <section className="bg-amber-500/10 border-b border-amber-500/30 py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-navy-500">
            <strong>¿Aún no estás inscrito?</strong> Solicita tu acceso por WhatsApp para desbloquear el banqueo completo.
          </p>
          <a
            href="https://wa.link/h2darz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-pill text-sm font-bold uppercase transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Inscribirme
          </a>
        </div>
      </section>

      {/* Grid de 5 bloques */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-navy-500 mb-3">
              Elige un bloque para practicar
            </h2>
            <p className="text-neutral-textSoft">
              5 bloques temáticos · 10 preguntas aleatorias por sesión · feedback inmediato
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {BLOCK_ORDER.map((block) => {
              const meta = BLOCK_CONFIG[block];
              const Icon = ICON_MAP[meta.iconName] || BookOpen;
              const accentBg = meta.accentColor === 'teal' ? 'bg-teal-500'
                : meta.accentColor === 'amber' ? 'bg-amber-500' : 'bg-navy-500';
              const accentText = meta.accentColor === 'amber' ? 'text-navy-500' : 'text-white';

              return (
                <button
                  key={block}
                  onClick={() => goToBlock(block)}
                  className="card-encaps text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 ${accentBg} ${accentText} rounded-2xl flex items-center justify-center`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold uppercase text-neutral-muted">
                      Bloque {meta.code}
                    </span>
                  </div>

                  <h3 className="text-lg font-display font-bold text-navy-500 mb-2">
                    {block}
                  </h3>
                  <p className="text-sm text-neutral-textSoft mb-4 line-clamp-3">
                    {meta.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-border">
                    <span className="text-sm text-neutral-textSoft">
                      <strong className="text-teal-500">{meta.questionCount}</strong> preguntas disponibles
                    </span>
                    <span className="text-teal-500 group-hover:translate-x-1 transition-transform">
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA inferior */}
      <section className="py-12 bg-navy-500 text-white" style={{ background: '#16264D' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">¿Listo para practicar?</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Verifica tu acceso y comienza a reforzar los bloques que más necesitas
          </p>
          <button onClick={() => navigate('/banqueo/acceso')} className="btn-accent text-lg">
            Acceder al banqueo <ChevronRight className="w-5 h-5 inline ml-1" />
          </button>
        </div>
      </section>
    </div>
  );
}
