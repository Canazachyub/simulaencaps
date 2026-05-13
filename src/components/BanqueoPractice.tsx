import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Brain, ArrowLeft, Loader2, CheckCircle, XCircle, ChevronRight,
  RefreshCw, Home, AlertCircle, BookOpen
} from 'lucide-react';
import {
  getBanqueoQuestions, getQuestionStats,
  type BanqueoQuestion, type QuestionStats
} from '../services/api';
import { BLOCK_ORDER, type BlockType } from '../types';
import clsx from 'clsx';

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

interface QuestionState {
  answered: boolean;
  selectedOption: number | null;
  isCorrect: boolean;
}

export function BanqueoPractice() {
  const navigate = useNavigate();
  const { block: rawBlock } = useParams<{ block: string }>();
  const blockName = decodeURIComponent(rawBlock || '');
  const isValidBlock = BLOCK_ORDER.includes(blockName as BlockType);

  const [questions, setQuestions] = useState<BanqueoQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const dni = sessionStorage.getItem('banqueo_dni');
    const email = sessionStorage.getItem('banqueo_email');
    if (!dni || !email) {
      navigate('/banqueo/acceso');
      return;
    }
    if (!isValidBlock) {
      navigate('/banqueo/seleccion');
      return;
    }
    loadQuestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockName, navigate]);

  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getBanqueoQuestions(blockName as BlockType);
      if (result.error) {
        setError(result.error);
      } else {
        setQuestions(result.questions);
        setQuestionStates(result.questions.map(() => ({ answered: false, selectedOption: null, isCorrect: false })));
        setCurrentIndex(0);
        setShowSummary(false);
        setQuestionStats(null);
      }
    } catch {
      setError('Error al cargar las preguntas. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = async (optionIndex: number) => {
    if (questionStates[currentIndex]?.answered) return;
    const isCorrect = optionIndex === questions[currentIndex].correctAnswer;

    setQuestionStates(prev => {
      const next = [...prev];
      next[currentIndex] = { answered: true, selectedOption: optionIndex, isCorrect };
      return next;
    });

    // Cargar stats de la pregunta
    setLoadingStats(true);
    try {
      const stats = await getQuestionStats(questions[currentIndex].id);
      setQuestionStats(stats);
    } catch {
      setQuestionStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleNext = () => {
    setQuestionStats(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const getAnswerState = (optionIndex: number): AnswerState => {
    const state = questionStates[currentIndex];
    if (!state?.answered) return 'unanswered';
    const correctAnswer = questions[currentIndex].correctAnswer;
    if (optionIndex === correctAnswer) return 'correct';
    if (optionIndex === state.selectedOption) return 'incorrect';
    return 'unanswered';
  };

  const getOptionClasses = (optionIndex: number): string => {
    const state = getAnswerState(optionIndex);
    const base = 'w-full p-4 rounded-xl text-left transition-all duration-200 border-2';
    switch (state) {
      case 'correct': return `${base} bg-teal-500/10 border-teal-500 text-teal-700`;
      case 'incorrect': return `${base} bg-red-50 border-red-500 text-red-800`;
      default:
        if (questionStates[currentIndex]?.answered) return `${base} bg-neutral-bg border-neutral-border text-neutral-textSoft`;
        return `${base} bg-white border-neutral-border hover:border-teal-500 hover:bg-teal-500/5 cursor-pointer`;
    }
  };

  const correctCount = questionStates.filter(s => s.isCorrect).length;
  const incorrectCount = questionStates.filter(s => s.answered && !s.isCorrect).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-textSoft">Cargando preguntas de {blockName}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center p-4">
        <div className="card-encaps max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-navy-500 mb-2">Error</h2>
          <p className="text-neutral-textSoft mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/banqueo/seleccion')} className="btn-outline">Volver</button>
            <button onClick={loadQuestions} className="btn-primary">Reintentar</button>
          </div>
        </div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="min-h-screen bg-navy-500 flex items-center justify-center p-4" style={{ background: '#16264D' }}>
        <div className="card-encaps max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 text-teal-500 rounded-2xl mb-4">
            <Brain className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-navy-500 mb-2">¡Práctica completada!</h2>
          <p className="text-neutral-textSoft mb-6">{blockName}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-teal-500/10 rounded-xl p-4">
              <CheckCircle className="w-5 h-5 text-teal-500 inline mr-2" />
              <span className="text-2xl font-display font-bold text-teal-700">{correctCount}</span>
              <p className="text-sm text-teal-600">Correctas</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <XCircle className="w-5 h-5 text-red-500 inline mr-2" />
              <span className="text-2xl font-display font-bold text-red-700">{incorrectCount}</span>
              <p className="text-sm text-red-600">Incorrectas</p>
            </div>
          </div>

          <div className="bg-amber-500/10 rounded-xl p-4 mb-6">
            <p className="text-3xl font-display font-bold text-amber-700">
              {Math.round((correctCount / questions.length) * 100)}%
            </p>
            <p className="text-sm text-amber-600">Aciertos</p>
          </div>

          <div className="space-y-3">
            <button onClick={loadQuestions} className="btn-primary w-full">
              <RefreshCw className="w-5 h-5 inline mr-1" /> Generar 10 más
            </button>
            <button onClick={() => navigate('/banqueo/seleccion')} className="btn-outline w-full">
              <Home className="w-5 h-5 inline mr-1" /> Elegir otro bloque
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentState = questionStates[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center p-4">
        <div className="card-encaps max-w-md w-full text-center">
          <BookOpen className="w-12 h-12 text-neutral-muted mx-auto mb-4" />
          <p className="text-neutral-textSoft mb-4">No hay preguntas disponibles para este bloque.</p>
          <button onClick={() => navigate('/banqueo/seleccion')} className="btn-outline">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Header */}
      <header className="bg-white border-b border-neutral-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/banqueo/seleccion')} className="flex items-center gap-2 text-neutral-textSoft hover:text-navy-500 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
            <div className="text-center">
              <p className="text-sm text-neutral-textSoft">{blockName}</p>
              <p className="font-display font-bold text-navy-500">
                Pregunta {currentIndex + 1} de {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-teal-500/10 text-teal-700 rounded-pill text-sm">
                <CheckCircle className="w-4 h-4" /> {correctCount}
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-pill text-sm">
                <XCircle className="w-4 h-4" /> {incorrectCount}
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-neutral-border rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="card-encaps mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="badge-teal">{currentQuestion.block}</span>
            {currentQuestion.subArea && <span className="badge-navy-outline">{currentQuestion.subArea}</span>}
            {currentQuestion.nivel && <span className="badge-amber">{currentQuestion.nivel}</span>}
            {currentQuestion.metadata?.tema && (
              <span className="px-3 py-1 bg-neutral-bg text-neutral-textSoft rounded-pill text-xs">{currentQuestion.metadata.tema}</span>
            )}
          </div>

          <div className="text-navy-500 text-lg leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: currentQuestion.questionText }} />

          {currentQuestion.imageLink && (
            <div className="mb-6">
              <img src={currentQuestion.imageLink} alt="Imagen" className="max-w-full h-auto rounded-xl border border-neutral-border" />
            </div>
          )}

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const answerState = getAnswerState(index);
              const pct = questionStats?.pctOption?.[index];
              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  disabled={currentState?.answered}
                  className={getOptionClasses(index)}
                >
                  <div className="flex items-start gap-3">
                    <span className={clsx('flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm',
                      answerState === 'correct' ? 'bg-teal-500 text-white' :
                      answerState === 'incorrect' ? 'bg-red-500 text-white' :
                      currentState?.answered ? 'bg-neutral-border text-neutral-textSoft' :
                      'bg-teal-500/10 text-teal-700'
                    )}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <div className="flex-1 text-left">
                      <span dangerouslySetInnerHTML={{ __html: option }} />
                      {answerState === 'correct' && <span className="ml-2 text-teal-600 font-bold"><CheckCircle className="w-4 h-4 inline" /> Correcto</span>}
                      {answerState === 'incorrect' && <span className="ml-2 text-red-600 font-bold"><XCircle className="w-4 h-4 inline" /> Incorrecto</span>}

                      {/* % usuarios que eligió esta opción */}
                      {currentState?.answered && pct !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-xs text-neutral-textSoft">
                            <div className="flex-1 h-1.5 bg-neutral-border rounded-full overflow-hidden">
                              <div
                                className={clsx('h-full',
                                  index === currentQuestion.correctAnswer ? 'bg-teal-500' : 'bg-neutral-muted'
                                )}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                            <span className="font-mono">{pct.toFixed(0)}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback inmediato */}
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
                    {currentState.isCorrect ? '¡Correcto!' : 'Incorrecto'}
                  </p>
                  <p className="text-sm text-navy-500 mt-1">
                    La respuesta correcta es la opción <strong>{String.fromCharCode(65 + currentQuestion.correctAnswer)}</strong>
                  </p>
                  {currentQuestion.justification && (
                    <div className="mt-3 pt-3 border-t border-white/40">
                      <p className="text-sm font-bold text-navy-500 mb-1">Justificación:</p>
                      <div className="text-sm text-navy-500" dangerouslySetInnerHTML={{ __html: currentQuestion.justification }} />
                    </div>
                  )}
                  {currentQuestion.referenciaNormativa && (
                    <div className="mt-3 pt-3 border-t border-white/40">
                      <p className="text-sm font-bold text-navy-500 mb-1">Referencia normativa:</p>
                      <p className="text-sm text-navy-500">{currentQuestion.referenciaNormativa}</p>
                    </div>
                  )}
                  {loadingStats && (
                    <p className="text-xs text-neutral-textSoft mt-3">
                      <Loader2 className="w-3 h-3 inline animate-spin mr-1" /> Cargando estadísticas...
                    </p>
                  )}
                  {questionStats && questionStats.totalRespuestas > 0 && (
                    <p className="text-xs text-neutral-textSoft mt-3">
                      Estadística basada en <strong>{questionStats.totalRespuestas}</strong> respuestas previas.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button onClick={handleNext} className="btn-primary w-full text-lg">
              {currentIndex < questions.length - 1
                ? <>Siguiente pregunta <ChevronRight className="w-5 h-5 inline ml-1" /></>
                : <>Ver resumen <ChevronRight className="w-5 h-5 inline ml-1" /></>}
            </button>
          </div>
        )}

        {!currentState?.answered && (
          <div className="text-center text-neutral-textSoft text-sm">
            Selecciona una opción para ver la respuesta y la justificación.
          </div>
        )}
      </main>
    </div>
  );
}
