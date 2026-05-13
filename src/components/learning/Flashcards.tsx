import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowLeft, ChevronLeft, ChevronRight, RotateCw,
  Loader2, BookOpen, CheckCircle, RefreshCw
} from 'lucide-react';
import { BLOCK_ORDER, type BlockType } from '../../types';
import { getFlashcards, type Flashcard } from '../../services/api';
import clsx from 'clsx';

export function Flashcards() {
  const navigate = useNavigate();
  const [block, setBlock] = useState<BlockType | ''>('');
  const [subArea, setSubArea] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [domSet, setDomSet] = useState<Set<string>>(new Set());
  const [reviewSet, setReviewSet] = useState<Set<string>>(new Set());

  // Verificación simple de acceso (DNI guardado)
  useEffect(() => {
    const dni = sessionStorage.getItem('banqueo_dni') || localStorage.getItem('encaps_dni');
    if (!dni) navigate('/banqueo/acceso');
  }, [navigate]);

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFlashcards(block || undefined, subArea || undefined);
      setCards(data);
      setIndex(0);
      setFlipped(false);
    } finally {
      setLoading(false);
    }
  }, [block, subArea]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const next = useCallback(() => {
    setFlipped(false);
    setIndex(i => Math.min(cards.length - 1, i + 1));
  }, [cards.length]);

  const prev = useCallback(() => {
    setFlipped(false);
    setIndex(i => Math.max(0, i - 1));
  }, []);

  // Atajos de teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === ' ') {
        e.preventDefault();
        setFlipped(f => !f);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const current = cards[index];

  const markDominated = () => {
    if (!current) return;
    setDomSet(prev => new Set(prev).add(current.id));
  };
  const markReview = () => {
    if (!current) return;
    setReviewSet(prev => new Set(prev).add(current.id));
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <header className="bg-navy-500 text-white py-4 px-4" style={{ background: '#16264D' }}>
        <div className="container mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Inicio
          </button>
          <h1 className="font-display font-bold text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Flashcards ENCAPS
          </h1>
          <div />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Selectores */}
        <div className="card-encaps mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-navy-500 mb-2 block">Bloque</label>
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value as BlockType | '')}
                className="w-full px-4 py-2 rounded-pill border-2 border-neutral-border focus:border-teal-500 focus:outline-none bg-white"
              >
                <option value="">Todos los bloques</option>
                {BLOCK_ORDER.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-navy-500 mb-2 block">Sub-área (opcional)</label>
              <input
                type="text"
                value={subArea}
                onChange={(e) => setSubArea(e.target.value)}
                placeholder="Ej: Epidemiología"
                className="w-full px-4 py-2 rounded-pill border-2 border-neutral-border focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={loadCards} className="btn-primary text-sm">
              <RefreshCw className="w-4 h-4 inline mr-1" /> Actualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-3" />
            <p className="text-neutral-textSoft">Cargando flashcards...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="card-encaps text-center py-12">
            <BookOpen className="w-12 h-12 text-neutral-muted mx-auto mb-4" />
            <p className="text-neutral-textSoft">No hay flashcards disponibles para esta selección.</p>
          </div>
        ) : (
          <>
            {/* Indicador */}
            <div className="text-center text-sm text-neutral-textSoft mb-3">
              Tarjeta <strong className="text-teal-500">{index + 1}</strong> / {cards.length}
              {domSet.has(current?.id ?? '') && <span className="ml-2 badge-teal">Dominada</span>}
              {reviewSet.has(current?.id ?? '') && <span className="ml-2 badge-amber">Revisar</span>}
            </div>

            {/* Tarjeta flip */}
            <div className="perspective" style={{ perspective: '1500px' }}>
              <div
                onClick={() => setFlipped(f => !f)}
                className={clsx(
                  'relative w-full cursor-pointer transition-transform duration-500',
                  flipped && 'flipped'
                )}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  minHeight: '320px'
                }}
              >
                {/* Frente */}
                <div
                  className="card-encaps absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="badge-teal mb-4">{current.block}</div>
                  {current.subArea && <div className="badge-navy-outline mb-4">{current.subArea}</div>}
                  <h2 className="text-xl md:text-2xl font-display font-bold text-navy-500">
                    {current.frente}
                  </h2>
                  <p className="text-xs text-neutral-textSoft mt-6">
                    <RotateCw className="w-3 h-3 inline mr-1" /> Click o ESPACIO para voltear
                  </p>
                </div>

                {/* Reverso */}
                <div
                  className="card-encaps absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-teal-500/5"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="badge-amber mb-4">Respuesta</div>
                  <p className="text-base md:text-lg text-navy-500 leading-relaxed">
                    {current.reverso}
                  </p>
                  {current.referencia && (
                    <p className="text-xs text-neutral-textSoft mt-4 italic">
                      Ref.: {current.referencia}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={markDominated} className="btn-primary text-sm">
                <CheckCircle className="w-4 h-4 inline mr-1" /> Dominada
              </button>
              <button onClick={markReview} className="btn-accent text-sm">
                <RotateCw className="w-4 h-4 inline mr-1" /> Revisar luego
              </button>
            </div>

            <div className="flex gap-3 mt-3">
              <button onClick={prev} disabled={index === 0} className="btn-outline flex-1 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4 inline mr-1" /> Anterior
              </button>
              <button onClick={next} disabled={index === cards.length - 1} className="btn-outline flex-1 disabled:opacity-50">
                Siguiente <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>

            <p className="text-center text-xs text-neutral-muted mt-4">
              Atajos: ← → para navegar · ESPACIO para voltear
            </p>
          </>
        )}
      </main>
    </div>
  );
}
