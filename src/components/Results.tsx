import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, Clock, Target, CheckCircle, XCircle, MinusCircle,
  User, CreditCard, Building2, MapPin, Calendar,
  Grid3X3, ChevronLeft, ChevronRight, BarChart3, History, Award,
  Stethoscope, RotateCcw, Calculator
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line
} from 'recharts';
import { useExamStore } from '../hooks/useExam';
import { PERFORMANCE_MESSAGES, BLOCK_CONFIG, ENCAPS_INFO } from '../types';
import {
  formatTimeReadable, formatDate, indexToLetter,
  formatVigesimalScore, calculatePF
} from '../utils/calculations';
import { PDFGenerator } from './PDFGenerator';
import { PPPInput } from './PPPInput';
import { saveScore, getUserHistory, logAnswers, type UserHistory } from '../services/api';
import clsx from 'clsx';

type TabId = 'block' | 'questions' | 'history';

const ACCENT_HEX: Record<'teal' | 'amber' | 'navy', string> = {
  teal: '#00A99D',
  amber: '#F5C518',
  navy: '#16264D'
};

export function Results() {
  const navigate = useNavigate();
  const { result, questions, resetExam, ppp: storePpp, setPPP } = useExamStore();
  const [localPpp, setLocalPpp] = useState<number | null>(storePpp ?? null);
  const [activeTab, setActiveTab] = useState<TabId>('block');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userHistory, setUserHistory] = useState<UserHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const initRan = useRef(false);

  // Calcular PF en vivo
  const liveNenc = result?.nenc ?? 0;
  const livePf = localPpp !== null ? calculatePF(liveNenc, localPpp) : null;
  const performanceInfo = result ? PERFORMANCE_MESSAGES[result.performanceLevel] : null;

  // Persistir PPP en el store
  useEffect(() => {
    setPPP(localPpp);
  }, [localPpp, setPPP]);

  // Mount: guardar score, fire-and-forget logAnswers, fetch history
  useEffect(() => {
    if (!result) {
      navigate('/');
      return;
    }
    if (initRan.current) return;
    initRan.current = true;

    (async () => {
      setLoadingHistory(true);
      try {
        await saveScore({
          dni: result.student.dni,
          correctAnswers: result.correctAnswers,
          totalQuestions: result.totalQuestions,
          rawScore: result.rawScore,
          nenc: result.nenc,
          ppp: localPpp ?? undefined,
          pf: livePf ?? undefined
        });
      } catch { /* fire and forget */ }

      // logAnswers (fire-and-forget)
      logAnswers(
        result.student.dni,
        result.answers.map(a => ({
          questionId: a.questionId,
          selectedOption: a.selectedOption,
          isCorrect: a.isCorrect
        }))
      );

      await new Promise(r => setTimeout(r, 400));
      const history = await getUserHistory(result.student.dni);
      setUserHistory(history);
      setLoadingHistory(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, navigate]);

  if (!result || !performanceInfo) return null;

  // Color del NENC
  const nencColorClass =
    result.nenc >= 14 ? 'text-teal-500'
    : result.nenc < 11 ? 'text-red-500'
    : 'text-amber-500';

  // Dataset bar chart por bloque
  const blockChartData = result.blockResults.map(b => ({
    name: b.name,
    shortName: b.name.length > 16 ? b.name.slice(0, 14) + '…' : b.name,
    percentage: Math.round(b.percentage * 10) / 10,
    correct: b.correctAnswers,
    total: b.totalQuestions,
    color: ACCENT_HEX[BLOCK_CONFIG[b.name].accentColor]
  }));

  // Map de respuestas
  const answerMap = useMemo(() => {
    const m = new Map<string, { selectedOption: number | null; isCorrect: boolean }>();
    result.answers.forEach(a => m.set(a.questionId, { selectedOption: a.selectedOption, isCorrect: a.isCorrect }));
    return m;
  }, [result.answers]);

  const currentQ = questions[questionIndex];
  const currentAns = currentQ ? answerMap.get(currentQ.id) : null;

  const totalCorrect = result.correctAnswers;
  const totalQuestions = result.totalQuestions;
  const totalIncorrect = totalQuestions - totalCorrect - result.answers.filter(a => a.selectedOption === null).length;
  const totalUnanswered = result.answers.filter(a => a.selectedOption === null).length;
  const averageTimePerQuestion = result.answers.length > 0
    ? result.answers.reduce((s, a) => s + a.timeSpent, 0) / result.answers.length
    : 0;

  const handleRestart = () => {
    resetExam();
    navigate('/');
  };

  const getQuestionState = (i: number): 'correct' | 'incorrect' | 'unanswered' => {
    const q = questions[i];
    const a = q ? answerMap.get(q.id) : null;
    if (!a || a.selectedOption === null) return 'unanswered';
    return a.isCorrect ? 'correct' : 'incorrect';
  };

  return (
    <div className="min-h-screen bg-neutral-bg py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER NENC */}
        <div className="card-encaps text-center animate-fade-in">
          <div className={clsx(
            'inline-flex items-center gap-2 px-4 py-2 rounded-pill mb-6 font-bold uppercase text-sm tracking-wider',
            performanceInfo.color === 'teal' && 'bg-teal-500/10 text-teal-700',
            performanceInfo.color === 'amber' && 'bg-amber-500/20 text-amber-700',
            performanceInfo.color === 'red' && 'bg-red-100 text-red-700'
          )}>
            <Trophy className="w-5 h-5" />
            {performanceInfo.title}
          </div>

          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-textSoft mb-2">
            NENC (Nota Examen Nacional)
          </h2>
          <h1 className={clsx('font-display font-extrabold leading-none', nencColorClass)} style={{ fontSize: '5rem' }}>
            {formatVigesimalScore(result.nenc)}
            <span className="text-3xl text-neutral-muted font-normal"> / 20</span>
          </h1>

          <p className="mt-4 text-neutral-textSoft">
            <span className="font-bold text-navy-500">{result.correctAnswers}</span> de {result.totalQuestions} respuestas correctas
            <span className="mx-2 text-neutral-muted">|</span>
            {result.percentage.toFixed(1)}%
          </p>

          <p className="text-base text-navy-500 max-w-xl mx-auto mt-4">
            {performanceInfo.message}
          </p>
        </div>

        {/* PPP INPUT + PF */}
        <div className="card-encaps animate-fade-in">
          <h2 className="text-lg font-display font-bold text-navy-500 mb-2 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-teal-500" />
            Calcula tu Puntaje Final (PF)
          </h2>
          <p className="text-sm text-neutral-textSoft mb-4">
            Ingresa tu Promedio Ponderado Promocional (PPP) para calcular tu Puntaje Final ENCAPS.
          </p>
          <PPPInput value={localPpp} onChange={setLocalPpp} />
        </div>

        <div className="card-encaps animate-fade-in bg-navy-500 text-white" style={{ background: '#16264D' }}>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-3">
            Puntaje Final (PF)
          </h2>
          <div className="text-center">
            <div className="font-mono text-sm text-amber-500 mb-2">
              {ENCAPS_INFO.scoreFormula}
            </div>
            {livePf !== null ? (
              <div className="font-display font-extrabold text-amber-500" style={{ fontSize: '4rem', lineHeight: 1 }}>
                {formatVigesimalScore(livePf)}
                <span className="text-2xl text-white/60 font-normal"> / 20</span>
              </div>
            ) : (
              <div className="font-display font-bold text-white/40 text-2xl py-6">
                Ingresa tu PPP para ver tu PF
              </div>
            )}
            {livePf !== null && (
              <p className="text-sm text-white/70 mt-3 font-mono">
                ({localPpp?.toFixed(2)} × 0.3) + ({result.nenc.toFixed(2)} × 0.7) = {livePf.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Datos del estudiante */}
        <div className="card-encaps animate-fade-in">
          <h2 className="text-lg font-display font-bold text-navy-500 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-500" />
            Datos del examen
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-neutral-textSoft">
              <CreditCard className="w-5 h-5 text-neutral-muted" />
              <span>DNI: <strong className="text-navy-500">{result.student.dni}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-neutral-textSoft">
              <User className="w-5 h-5 text-neutral-muted" />
              <span className="truncate">Nombre: <strong className="text-navy-500">{result.student.fullName}</strong></span>
            </div>
            {result.student.establecimiento && (
              <div className="flex items-start gap-3 text-neutral-textSoft">
                <Building2 className="w-5 h-5 text-neutral-muted mt-0.5" />
                <span className="truncate">Establecimiento: <strong className="text-navy-500">{result.student.establecimiento}</strong></span>
              </div>
            )}
            {result.student.region && (
              <div className="flex items-center gap-3 text-neutral-textSoft">
                <MapPin className="w-5 h-5 text-neutral-muted" />
                <span>Región: <strong className="text-navy-500">{result.student.region}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-3 text-neutral-textSoft">
              <Calendar className="w-5 h-5 text-neutral-muted" />
              <span className="text-sm">{formatDate(result.date)}</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <div className="card-encaps text-center">
            <CheckCircle className="w-8 h-8 text-teal-500 mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-navy-500">{totalCorrect}</p>
            <p className="text-sm text-neutral-textSoft">Correctas</p>
          </div>
          <div className="card-encaps text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-navy-500">{totalIncorrect}</p>
            <p className="text-sm text-neutral-textSoft">Incorrectas</p>
          </div>
          <div className="card-encaps text-center">
            <MinusCircle className="w-8 h-8 text-neutral-muted mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-navy-500">{totalUnanswered}</p>
            <p className="text-sm text-neutral-textSoft">Sin responder</p>
          </div>
          <div className="card-encaps text-center">
            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-navy-500">{formatTimeReadable(result.totalTime)}</p>
            <p className="text-sm text-neutral-textSoft">Tiempo total</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="card-encaps p-2 animate-fade-in">
          <div className="flex gap-1">
            {([
              { id: 'block' as const, icon: BarChart3, label: 'Por bloque' },
              { id: 'questions' as const, icon: Grid3X3, label: 'Detalle de preguntas' },
              { id: 'history' as const, icon: History, label: 'Histórico' }
            ]).map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-pill text-sm font-bold uppercase transition-all',
                  activeTab === t.id ? 'bg-teal-500 text-white shadow-md' : 'bg-neutral-bg text-navy-500 hover:bg-neutral-border'
                )}
              >
                <t.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Por bloque */}
        {activeTab === 'block' && (
          <div className="card-encaps animate-fade-in">
            <h2 className="text-lg font-display font-bold text-navy-500 mb-4">Aciertos por bloque</h2>
            <div style={{ height: Math.max(280, blockChartData.length * 56) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={blockChartData} layout="vertical" margin={{ top: 10, right: 40, left: 130, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#6B7280" fontSize={12} />
                  <YAxis type="category" dataKey="shortName" stroke="#16264D" tick={{ fontSize: 11, fill: '#16264D' }} width={125} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const d = payload[0].payload as typeof blockChartData[number];
                      return (
                        <div className="bg-white border border-neutral-border rounded-lg px-4 py-3 shadow-xl">
                          <p className="font-display font-bold text-navy-500 mb-1">{d.name}</p>
                          <p className="text-neutral-textSoft">
                            <span className="font-semibold" style={{ color: d.color }}>{d.percentage.toFixed(1)}%</span>
                            {' '}({d.correct}/{d.total})
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="percentage" radius={[0, 6, 6, 0]} barSize={30} background={{ fill: '#F3F4F6' }}>
                    {blockChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla por bloque */}
            <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-border">
              <table className="w-full text-sm">
                <thead className="bg-navy-500 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left font-display uppercase text-xs">Bloque</th>
                    <th className="px-3 py-2 text-center font-display uppercase text-xs">Correctas</th>
                    <th className="px-3 py-2 text-center font-display uppercase text-xs">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border">
                  {result.blockResults.map(b => (
                    <tr key={b.name}>
                      <td className="px-3 py-2 text-navy-500 font-semibold">{b.name}</td>
                      <td className="px-3 py-2 text-center">{b.correctAnswers} / {b.totalQuestions}</td>
                      <td className="px-3 py-2 text-center font-bold" style={{ color: ACCENT_HEX[BLOCK_CONFIG[b.name].accentColor] }}>
                        {b.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Detalle de preguntas */}
        {activeTab === 'questions' && (
          <div className="card-encaps animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-navy-500">Detalle de preguntas</h2>
              <span className="text-sm text-neutral-textSoft">
                {questionIndex + 1} de {questions.length}
              </span>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-neutral-border text-sm">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-teal-500"></div><span className="text-neutral-textSoft">Correcta</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500"></div><span className="text-neutral-textSoft">Incorrecta</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-neutral-muted"></div><span className="text-neutral-textSoft">No respondida</span></div>
            </div>

            {/* Grid 1-100 */}
            <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 gap-1.5 mb-6" style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}>
              {questions.map((_, i) => {
                const state = getQuestionState(i);
                return (
                  <button
                    key={i}
                    onClick={() => setQuestionIndex(i)}
                    className={clsx(
                      'h-9 rounded text-xs font-bold transition-all',
                      i === questionIndex ? 'ring-2 ring-amber-500 scale-110 z-10' : '',
                      state === 'correct' && 'bg-teal-500 text-white hover:bg-teal-600',
                      state === 'incorrect' && 'bg-red-500 text-white hover:bg-red-600',
                      state === 'unanswered' && 'bg-neutral-muted/40 text-navy-500 hover:bg-neutral-muted/60'
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Detalle pregunta */}
            {currentQ && (
              <div className="border-t border-neutral-border pt-4">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="badge-teal">{currentQ.block}</span>
                  {currentQ.subArea && <span className="badge-navy-outline">{currentQ.subArea}</span>}
                  {currentQ.nivel && <span className="badge-amber">{currentQ.nivel}</span>}
                </div>
                <div className="text-navy-500 leading-relaxed mb-4">
                  <span className="font-display font-bold text-teal-500">P{questionIndex + 1}.</span>{' '}
                  <span dangerouslySetInnerHTML={{ __html: currentQ.questionText }} />
                </div>

                <div className="space-y-2 mb-4">
                  {currentQ.options.map((opt, i) => {
                    const isSel = currentAns?.selectedOption === i;
                    const isCorrect = currentQ.correctAnswer === i;
                    let cls = 'border-neutral-border bg-white';
                    if (isCorrect) cls = 'border-teal-500 bg-teal-500/10';
                    else if (isSel) cls = 'border-red-500 bg-red-50';
                    return (
                      <div key={i} className={clsx('p-3 rounded-lg border-2 flex items-start gap-3', cls)}>
                        <div className={clsx(
                          'flex-shrink-0 w-8 h-8 rounded flex items-center justify-center font-bold text-sm',
                          isCorrect ? 'bg-teal-500 text-white'
                            : isSel ? 'bg-red-500 text-white'
                            : 'bg-neutral-border text-navy-500'
                        )}>
                          {isCorrect ? <CheckCircle className="w-5 h-5" /> : isSel ? <XCircle className="w-5 h-5" /> : indexToLetter(i)}
                        </div>
                        <span className={clsx('flex-1 pt-1 text-sm',
                          isCorrect ? 'text-teal-700 font-medium' : isSel ? 'text-red-700' : 'text-neutral-textSoft'
                        )} dangerouslySetInnerHTML={{ __html: opt }} />
                      </div>
                    );
                  })}
                </div>

                {/* Resultado */}
                <div className={clsx('p-3 rounded-lg flex items-center gap-2 mb-4',
                  currentAns?.isCorrect ? 'bg-teal-500/10 text-teal-700'
                  : currentAns?.selectedOption === null ? 'bg-neutral-bg text-neutral-textSoft'
                  : 'bg-red-100 text-red-800'
                )}>
                  {currentAns?.isCorrect ? (
                    <><CheckCircle className="w-5 h-5" /><span className="font-medium">Respuesta correcta</span></>
                  ) : currentAns?.selectedOption === null ? (
                    <><MinusCircle className="w-5 h-5" /><span className="font-medium">No respondiste — La correcta es la opción {indexToLetter(currentQ.correctAnswer)}</span></>
                  ) : (
                    <><XCircle className="w-5 h-5" /><span className="font-medium">Respuesta incorrecta — La correcta es la opción {indexToLetter(currentQ.correctAnswer)}</span></>
                  )}
                </div>

                {/* Justificación */}
                {currentQ.justification && (
                  <div className="mb-3 p-4 bg-teal-500/5 border border-teal-500/20 rounded-lg">
                    <p className="text-sm font-bold text-teal-700 mb-2">Justificación:</p>
                    <div className="text-sm text-navy-500" dangerouslySetInnerHTML={{ __html: currentQ.justification }} />
                  </div>
                )}

                {/* Referencia normativa */}
                {currentQ.referenciaNormativa && (
                  <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-sm font-bold text-amber-700 mb-2">Referencia normativa:</p>
                    <div className="text-sm text-navy-500">{currentQ.referenciaNormativa}</div>
                  </div>
                )}

                {/* Navegación */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setQuestionIndex(Math.max(0, questionIndex - 1))}
                    disabled={questionIndex === 0}
                    className="btn-outline flex-1 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 inline" /> Anterior
                  </button>
                  <button
                    onClick={() => setQuestionIndex(Math.min(questions.length - 1, questionIndex + 1))}
                    disabled={questionIndex === questions.length - 1}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    Siguiente <ChevronRight className="w-4 h-4 inline" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Histórico */}
        {activeTab === 'history' && (
          <div className="card-encaps animate-fade-in">
            <h2 className="text-lg font-display font-bold text-navy-500 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-teal-500" />
              Tu historial de simulacros
            </h2>
            {loadingHistory ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-neutral-textSoft">Cargando historial...</p>
              </div>
            ) : userHistory && userHistory.history.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-teal-500/10 rounded-xl p-4 text-center">
                    <Award className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                    <p className="text-2xl font-display font-bold text-teal-700">{userHistory.totalIntentos}</p>
                    <p className="text-xs text-teal-600">Simulacros</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-xl p-4 text-center">
                    <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-display font-bold text-amber-700">{formatVigesimalScore(userHistory.mejorNenc)}</p>
                    <p className="text-xs text-amber-600">Mejor NENC</p>
                  </div>
                  <div className="bg-navy-500/10 rounded-xl p-4 text-center">
                    <Target className="w-8 h-8 text-navy-500 mx-auto mb-2" />
                    <p className="text-2xl font-display font-bold text-navy-500">
                      {userHistory.ultimoPf !== undefined ? formatVigesimalScore(userHistory.ultimoPf) : '—'}
                    </p>
                    <p className="text-xs text-navy-500">Último PF</p>
                  </div>
                </div>

                {userHistory.history.length >= 2 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase text-neutral-textSoft mb-3">Evolución</h3>
                    <div style={{ height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[...userHistory.history].reverse().map((h, idx) => ({
                            intento: `#${idx + 1}`,
                            nenc: h.nenc,
                            pf: h.pf
                          }))}
                          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="intento" stroke="#6B7280" fontSize={12} />
                          <YAxis stroke="#6B7280" fontSize={12} domain={[0, 20]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="nenc" name="NENC" stroke="#00A99D" strokeWidth={3} dot={{ fill: '#00A99D', r: 5 }} />
                          <Line type="monotone" dataKey="pf" name="PF" stroke="#F5C518" strokeWidth={3} dot={{ fill: '#F5C518', r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto rounded-lg border border-neutral-border">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-bg">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-500">#</th>
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-500">Fecha</th>
                        <th className="px-3 py-2 text-center text-xs font-bold uppercase text-navy-500">NENC</th>
                        <th className="px-3 py-2 text-center text-xs font-bold uppercase text-navy-500">PF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-border">
                      {userHistory.history.map((entry, i) => {
                        const isLatest = i === 0;
                        const isBest = entry.nenc === userHistory.mejorNenc;
                        return (
                          <tr key={i} className={isLatest ? 'bg-teal-500/5' : ''}>
                            <td className="px-3 py-2 text-neutral-textSoft">
                              {userHistory.totalIntentos - i}
                              {isLatest && <span className="ml-1 text-xs text-teal-600">(actual)</span>}
                            </td>
                            <td className="px-3 py-2 text-neutral-textSoft">
                              {new Date(entry.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-3 py-2 text-center font-bold">
                              <span className={isBest ? 'text-amber-600' : 'text-navy-500'}>
                                {isBest && <Trophy className="w-3.5 h-3.5 inline mr-1" />}
                                {formatVigesimalScore(entry.nenc)}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center text-navy-500">
                              {entry.pf !== undefined ? formatVigesimalScore(entry.pf) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-neutral-muted mx-auto mb-3" />
                <p className="text-neutral-textSoft">Este es tu primer simulacro</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
          <PDFGenerator result={{ ...result, ppp: localPpp ?? undefined, pf: livePf ?? undefined }} />
          <button onClick={handleRestart} className="btn-outline">
            <RotateCcw className="w-5 h-5 inline mr-1" /> Volver al inicio
          </button>
        </div>

        <p className="text-center text-neutral-muted text-sm flex items-center justify-center gap-2">
          <Stethoscope className="w-4 h-4" />
          {ENCAPS_INFO.name} — {ENCAPS_INFO.fullName}
        </p>
      </div>
    </div>
  );
}
