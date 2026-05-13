import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Repeat, ArrowLeft, Loader2, CheckCircle, XCircle, ChevronRight,
  Sparkles, Trophy, AlertCircle
} from 'lucide-react';
import { getIncorrectQuestions } from '../../services/api';
import { type Question } from '../../types';
import { indexToLetter } from '../../utils/calculations';
import clsx from 'clsx';

interface QState {
  answered: boolean;
  selectedOption: number | null;
  isCorrect: boolean;
}

export function ReviewIncorrect() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [states, setStates] = useState<QState[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const dni = sessionStorage.getItem('banqueo_dni') || localStorage.getItem('encaps_dni');
    if (!dni) {
      navigate('/banqueo/acceso');
      return;
    }

    (async () => {
      setLoading(true);
      const qs = await getIncorrectQuestions(dni);
      setQuestions(qs);
      setStates(qs.map(() => ({ answered: false, selectedOption: null, isCorrect: false })));
      setLoading(false);
    })();
  }, [navigate]);

  const current = questions[index];
  const currentState = states[index];

  const handleSelect = (optIdx: number) => {
    if (!current || currentState?.answered) return;
    const isCorrect = optIdx === current.correctAnswer;
    setStates(prev => {
      const next = [...prev];
      next[index] = { answered: true, selectedOption: optIdx, isCorrect };
      return next;
    });
  };

  const handleNext = () => {
    if (index < questions.length - 1) setIndex(i => i + 1);
    else setDone(true);
  };

  const correctCount = states.filter(s => s.isCorrect).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-textSoft">Recuperando tus preguntas falladas...</p>
        </div>
      </div>
    );
  }

  // Caso 1: pocas preguntas falladas
  if (questions.length < 5) {
    return (
      <div className="min-h-screen bg-neutral-bg flex flex-col">
        <header className="bg-navy-500 text-white py-4 px-4" style={{ background: '#16264D' }}>
          <div className="container mx-auto flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/70 hover:text-white">
              <ArrowLeft className="w-4 h-4" /> Inicio
            </button>
            <h1 className="font-display font-bold text-xl flex items-center gap-2">
              <Repeat className="w-5 h-5 text-amber-500" /> Repaso de incorrectas
            </h1>
            <div />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="card-encaps max-w-md w-full text-center">
            <Trophy className="w-16 h-16 text-teal-500 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-navy-500 mb-2">¡Buen trabajo!</h2>
            <p className="text-neutral-textSoft mb-6">
              No tienes preguntas falladas pendientes
              {questions.length > 0 && ` (solo ${questions.length}, necesitas al menos 5 para este modo)`}.
              Haz más simulacros o practica en el banqueo para acumular preguntas a repasar.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/banqueo')} className="btn-primary">
                <Sparkles className="w-5 h-5 inline mr-1" /> Ir al banqueo
              </button>
              <button onClick={() => navigate('/registro')} className="btn-outline">
                Hacer un nuevo simulacro
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Caso 2: terminó la sesión
  if (done) {
    return (
      <div className="min-h-screen bg-navy-500 flex items-center justify-center p-4" style={{ background: '#16264D' }}>
        <div className="card-encaps max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 text-teal-500 rounded-2xl mb-4">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-navy-500 mb-2">¡Sesión completada!</h2>
          <p className="text-3xl font-display font-bold text-teal-500 mb-2">
            {correctCount} / {questions.length}
          </p>
          <p className="text-sm text-neutral-textSoft mb-6">
            {Math.round((correctCount / questions.length) * 100)}% de aciertos
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/repaso')} className="btn-primary">Practicar de nuevo</button>
            <button onClick={() => navigate('/')} className="btn-outline">Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="min-h-screen bg-neutral-bg">
      <header className="bg-white border-b border-neutral-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-neutral-textSoft hover:text-navy-500">
              <ArrowLeft className="w-4 h-4" /> Salir
            </button>
            <div className="text-center">
              <p className="text-sm text-neutral-textSoft flex items-center gap-1 justify-center">
                <Repeat className="w-4 h-4 text-amber-500" /> Repaso de incorrectas
              </p>
              <p className="font-display font-bold text-navy-500">
                Pregunta {index + 1} de {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-teal-500/10 text-teal-700 rounded-pill text-sm">
              <CheckCircle className="w-4 h-4" /> {correctCount}
            </div>
          </div>
          <div className="mt-3 h-2 bg-neutral-border rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="card-encaps mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="badge-teal">{current.block}</span>
            {current.subArea && <span className="badge-navy-outline">{current.subArea}</span>}
            {current.nivel && <span className="badge-amber">{current.nivel}</span>}
          </div>
          <div className="text-navy-500 text-lg leading-relaxed mb-6"
            dangerouslySetInnerHTML={{ __html: current.questionText }} />

          <div className="space-y-3">
            {current.options.map((opt, i) => {
              const isCorrect = i === current.correctAnswer;
              const isSelected = currentState?.selectedOption === i;
              const showResult = currentState?.answered;

              let cls = 'border-neutral-border bg-white hover:border-teal-500 hover:bg-teal-500/5 cursor-pointer';
              if (showResult) {
                if (isCorrect) cls = 'border-teal-500 bg-teal-500/10';
                else if (isSelected) cls = 'border-red-500 bg-red-50';
                else cls = 'border-neutral-border bg-neutral-bg';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={currentState?.answered}
                  className={clsx('w-full p-4 rounded-xl text-left transition-all border-2', cls)}
                >
                  <div className="flex items-start gap-3">
                    <span className={clsx('flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                      showResult && isCorrect ? 'bg-teal-500 text-white' :
                      showResult && isSelected ? 'bg-red-500 text-white' :
                      'bg-teal-500/10 text-teal-700'
                    )}>
                      {indexToLetter(i)}
                    </span>
                    <span className="flex-1 text-navy-500" dangerouslySetInnerHTML={{ __html: opt }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {currentState?.answered && (
          <div className="space-y-4">
            <div className={clsx('rounded-xl p-4 border',
              currentState.isCorrect ? 'bg-teal-500/10 border-teal-500/30' : 'bg-amber-500/10 border-amber-500/30'
            )}>
              <div className="flex items-start gap-3">
                {currentState.isCorrect
                  ? <CheckCircle className="w-6 h-6 text-teal-500 flex-shrink-0" />
                  : <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />}
                <div className="flex-1">
                  <p className={clsx('font-display font-bold', currentState.isCorrect ? 'text-teal-700' : 'text-amber-700')}>
                    {currentState.isCorrect ? '¡Esta vez sí!' : 'Incorrecto'}
                  </p>
                  <p className="text-sm text-navy-500 mt-1">
                    Respuesta correcta: <strong>{indexToLetter(current.correctAnswer)}</strong>
                  </p>
                  {current.justification && (
                    <div className="mt-3 pt-3 border-t border-white/40">
                      <p className="text-sm font-bold text-navy-500 mb-1">Justificación:</p>
                      <div className="text-sm text-navy-500" dangerouslySetInnerHTML={{ __html: current.justification }} />
                    </div>
                  )}
                  {current.referenciaNormativa && (
                    <p className="text-xs text-neutral-textSoft mt-3">
                      <strong>Referencia:</strong> {current.referenciaNormativa}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button onClick={handleNext} className="btn-primary w-full">
              {index < questions.length - 1
                ? <>Siguiente pregunta <ChevronRight className="w-5 h-5 inline ml-1" /></>
                : <>Ver resumen <ChevronRight className="w-5 h-5 inline ml-1" /></>}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
