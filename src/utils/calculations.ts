import type {
  Question,
  Answer,
  BlockResult,
  BlockType,
  ExamResult,
  EncapsStudent,
  PerformanceLevel
} from '../types';
import { PERFORMANCE_THRESHOLDS, BLOCK_ORDER } from '../types';

// ============================================
// CÁLCULO DE PUNTAJES ENCAPS
// ============================================

/**
 * Calcula la Nota Examen Nacional (NENC) en escala vigesimal (0-20).
 * Fórmula: NENC = (correctas / 100) × 20
 */
export function calculateNENC(correctAnswers: number, totalQuestions: number = 100): number {
  if (totalQuestions <= 0) return 0;
  const nenc = (correctAnswers / totalQuestions) * 20;
  return Math.round(nenc * 100) / 100; // 2 decimales
}

/**
 * Calcula el Puntaje Final (PF) ENCAPS en escala vigesimal (0-20).
 * Fórmula: PF = (PPP × 0.3) + (NENC × 0.7)
 */
export function calculatePF(nenc: number, ppp: number): number {
  const pf = (ppp * 0.3) + (nenc * 0.7);
  return Math.round(pf * 100) / 100;
}

// ============================================
// RESULTADOS POR BLOQUE
// ============================================

/**
 * Calcula los resultados desglosados por cada uno de los 5 bloques ENCAPS.
 * El resultado se ordena según `BLOCK_ORDER`.
 */
export function calculateBlockResults(
  questions: Question[],
  answers: Answer[]
): BlockResult[] {
  // Inicializar todos los bloques (incluso si no hay preguntas) para mantener orden
  const blockGroups = new Map<BlockType, { questions: Question[]; answers: Answer[] }>();
  BLOCK_ORDER.forEach((b) => blockGroups.set(b, { questions: [], answers: [] }));

  questions.forEach((question) => {
    if (!blockGroups.has(question.block)) {
      blockGroups.set(question.block, { questions: [], answers: [] });
    }
    blockGroups.get(question.block)!.questions.push(question);
  });

  answers.forEach((answer) => {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && blockGroups.has(question.block)) {
      blockGroups.get(question.block)!.answers.push(answer);
    }
  });

  const results: BlockResult[] = [];
  blockGroups.forEach((data, blockName) => {
    const totalQuestions = data.questions.length;
    if (totalQuestions === 0) return; // omitir bloques vacíos
    const correctAnswers = data.answers.filter(a => a.isCorrect).length;
    const percentage = (correctAnswers / totalQuestions) * 100;

    results.push({
      name: blockName,
      correctAnswers,
      totalQuestions,
      percentage: Math.round(percentage * 100) / 100
    });
  });

  // Ordenar según BLOCK_ORDER
  return results.sort((a, b) => {
    const ia = BLOCK_ORDER.indexOf(a.name);
    const ib = BLOCK_ORDER.indexOf(b.name);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

// ============================================
// NIVEL DE RENDIMIENTO
// ============================================

/**
 * Determina el nivel de rendimiento a partir de la NENC vigesimal (0-20).
 * Umbrales:
 *  - aprobado_destacado: NENC ≥ 16
 *  - aprobado:           NENC ≥ 14
 *  - en_riesgo:          NENC ≥ 11
 *  - desaprobado:        NENC < 11
 */
export function getPerformanceLevel(nenc: number): PerformanceLevel {
  if (nenc >= PERFORMANCE_THRESHOLDS.aprobado_destacado) return 'aprobado_destacado';
  if (nenc >= PERFORMANCE_THRESHOLDS.aprobado) return 'aprobado';
  if (nenc >= PERFORMANCE_THRESHOLDS.en_riesgo) return 'en_riesgo';
  return 'desaprobado';
}

// ============================================
// RESULTADO COMPLETO DEL EXAMEN
// ============================================

/**
 * Calcula el resultado completo del examen ENCAPS.
 * Si se proporciona `ppp`, también calcula `pf`.
 */
export function calculateExamResult(
  student: EncapsStudent,
  questions: Question[],
  answers: Answer[],
  startTime: Date,
  ppp?: number | null
): ExamResult {
  const blockResults = calculateBlockResults(questions, answers);

  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const totalQuestions = questions.length;
  const rawScore = correctAnswers;
  const nenc = calculateNENC(correctAnswers, totalQuestions);
  const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const totalTime = Math.max(
    0,
    Math.round((new Date().getTime() - startTime.getTime()) / 1000)
  );

  const hasPPP = typeof ppp === 'number' && !Number.isNaN(ppp);
  const pf = hasPPP ? calculatePF(nenc, ppp as number) : undefined;

  return {
    student,
    date: new Date(),
    correctAnswers,
    totalQuestions,
    rawScore,
    nenc,
    ppp: hasPPP ? (ppp as number) : undefined,
    pf,
    vigesimalScore: nenc, // alias para compatibilidad
    percentage: Math.round(percentage * 100) / 100,
    blockResults,
    answers,
    totalTime,
    performanceLevel: getPerformanceLevel(nenc)
  };
}

// ============================================
// FORMATEADORES Y HELPERS DE UI
// ============================================

/** Formatea segundos como MM:SS */
export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/** Formatea segundos en formato legible (ej: "1h 30min 45s") */
export function formatTimeReadable(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}min`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/** Formatea un número con separador de miles (locale es-PE) */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/** Formatea una fecha en español */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Devuelve color hex según porcentaje (0-100) usando umbrales NENC equivalentes:
 *  - ≥ 80% (≈ NENC 16) → teal
 *  - ≥ 70% (≈ NENC 14) → teal
 *  - ≥ 55% (≈ NENC 11) → amber
 *  - < 55% → red
 */
export function getColorForPercentage(percentage: number): string {
  if (percentage >= 70) return '#0D9488'; // teal-600
  if (percentage >= 55) return '#D97706'; // amber-600
  return '#DC2626'; // red-600
}

/** Convierte índice a letra: 0 -> A, 1 -> B, ... */
export function indexToLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

/** Valida un DNI peruano (8 dígitos) */
export function validateDNI(dni: string): boolean {
  return /^\d{8}$/.test(dni);
}

/** Valida un nombre (3-100 chars, letras/espacios) */
export function validateName(name: string): boolean {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,100}$/.test(name.trim());
}

/** Formatea una nota vigesimal (0-20) con 2 decimales */
export function formatVigesimalScore(score: number): string {
  return score.toFixed(2);
}

/** Texto descriptivo del nivel de rendimiento */
export function getPerformanceLevelText(level: PerformanceLevel): string {
  const texts: Record<PerformanceLevel, string> = {
    aprobado_destacado: 'Aprobado destacado',
    aprobado: 'Aprobado',
    en_riesgo: 'En riesgo',
    desaprobado: 'Desaprobado'
  };
  return texts[level];
}
