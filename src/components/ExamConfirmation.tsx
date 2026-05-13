import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, CreditCard, BookOpen, Clock, AlertTriangle,
  ChevronLeft, PlayCircle, Loader2, AlertCircle, Building2, MapPin, Stethoscope
} from 'lucide-react';
import { useExamStore } from '../hooks/useExam';
import { BLOCK_ORDER, BLOCK_CONFIG, ENCAPS_INFO } from '../types';

export function ExamConfirmation() {
  const navigate = useNavigate();
  const { student, loadQuestions, status, error } = useExamStore();

  useEffect(() => {
    if (!student) navigate('/registro');
  }, [student, navigate]);

  if (!student) return null;

  const handleStartExam = async () => {
    await loadQuestions();
    navigate('/examen');
  };

  const instructions = [
    'El examen consta de 100 preguntas distribuidas en 5 bloques temáticos del ENCAPS',
    'Tienes 3 HORAS para completar el examen (igual que el ENCAPS oficial MINSA)',
    'Cuando el tiempo termine, el examen se cierra y muestra tus resultados',
    'Puedes navegar libremente entre las preguntas (avanzar y retroceder)',
    'NO sabrás si tu respuesta es correcta hasta que presiones "Calificar"',
    'Al finalizar, obtendrás tu NENC vigesimal (0-20) y, si ingresas tu PPP, tu Puntaje Final (PF)'
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-teal-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-navy-500 mb-2">Preparando tu examen</h2>
          <p className="text-neutral-textSoft">Cargando preguntas del ENCAPS...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg px-4">
        <div className="card-encaps max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-navy-500 mb-2">Error al cargar</h2>
          <p className="text-neutral-textSoft mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/registro')} className="btn-outline">Volver</button>
            <button onClick={handleStartExam} className="btn-primary">Reintentar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card-encaps animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-500/10 text-teal-500 rounded-2xl mb-4">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-navy-500 mb-2">
              Confirmar datos del examen
            </h1>
            <p className="text-neutral-textSoft">
              Verifica tu información antes de comenzar el {ENCAPS_INFO.name}
            </p>
          </div>

          {/* Datos del estudiante */}
          <div className="bg-neutral-bg rounded-xl p-6 mb-8">
            <h2 className="font-display font-bold text-navy-500 mb-4">Datos del estudiante</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-neutral-muted" />
                <span className="text-neutral-textSoft">DNI:</span>
                <span className="font-bold text-navy-500">{student.dni}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-neutral-muted" />
                <span className="text-neutral-textSoft">Nombre:</span>
                <span className="font-bold text-navy-500">{student.fullName}</span>
              </div>
              {student.establecimiento && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-neutral-muted mt-0.5" />
                  <span className="text-neutral-textSoft">Establecimiento:</span>
                  <span className="font-bold text-navy-500">{student.establecimiento}</span>
                </div>
              )}
              {student.region && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-neutral-muted" />
                  <span className="text-neutral-textSoft">Región:</span>
                  <span className="font-bold text-navy-500">{student.region}</span>
                </div>
              )}
            </div>
          </div>

          {/* Métricas globales */}
          <div className="bg-teal-500/5 rounded-xl p-6 mb-8">
            <h2 className="font-display font-bold text-navy-500 mb-4">Detalles del ENCAPS</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-display font-bold text-teal-500">100</p>
                <p className="text-sm text-neutral-textSoft">Preguntas</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-display font-bold text-teal-500">5</p>
                <p className="text-sm text-neutral-textSoft">Bloques</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-display font-bold text-teal-500">0-20</p>
                <p className="text-sm text-neutral-textSoft">NENC vigesimal</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-3xl font-display font-bold text-teal-500 flex items-center justify-center gap-1">
                  <Clock className="w-6 h-6" /> 3h
                </p>
                <p className="text-sm text-neutral-textSoft">Duración</p>
              </div>
            </div>
          </div>

          {/* Tabla resumen de los 5 bloques */}
          <div className="bg-neutral-bg rounded-xl p-6 mb-8">
            <h2 className="font-display font-bold text-navy-500 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Bloques evaluados
            </h2>
            <div className="overflow-hidden rounded-lg border border-neutral-border">
              <table className="w-full text-sm">
                <thead className="bg-navy-500 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left font-display uppercase text-xs">Bloque</th>
                    <th className="px-3 py-2 text-center font-display uppercase text-xs"># Preg.</th>
                    <th className="px-3 py-2 text-center font-display uppercase text-xs">Pts. est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border">
                  {BLOCK_ORDER.map((blockName) => {
                    const meta = BLOCK_CONFIG[blockName];
                    return (
                      <tr key={blockName} className="bg-white">
                        <td className="px-3 py-2 text-navy-500 font-semibold">
                          <span className="inline-block w-6 text-neutral-muted">{meta.code}.</span>
                          {blockName}
                        </td>
                        <td className="px-3 py-2 text-center text-teal-600 font-bold">{meta.questionCount}</td>
                        <td className="px-3 py-2 text-center text-neutral-textSoft">
                          {((meta.questionCount / 100) * 20).toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-teal-500/10 font-bold">
                    <td className="px-3 py-2 text-navy-500">TOTAL</td>
                    <td className="px-3 py-2 text-center text-teal-600">100</td>
                    <td className="px-3 py-2 text-center text-navy-500">20.0</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Reglas / Instrucciones */}
          <div className="bg-amber-500/10 rounded-xl p-6 mb-8 border border-amber-500/20">
            <h2 className="font-display font-bold text-navy-500 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Reglas del examen
            </h2>
            <ul className="space-y-2">
              {instructions.map((ins, i) => (
                <li key={i} className="flex items-start gap-2 text-navy-500">
                  <span className="font-bold text-amber-500">{i + 1}.</span>
                  <span>{ins}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between gap-3">
            <button onClick={() => navigate('/registro')} className="btn-outline">
              <ChevronLeft className="w-5 h-5 inline mr-1" /> Volver
            </button>
            <button onClick={handleStartExam} className="btn-primary text-lg">
              <PlayCircle className="w-6 h-6 inline mr-1" /> Iniciar examen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
