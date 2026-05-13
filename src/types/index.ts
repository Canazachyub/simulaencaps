// ============================================
// TIPOS PRINCIPALES DEL SISTEMA - SimulaENCAPS
// Examen Nacional de Competencias para Atención Primaria de Salud (MINSA)
// ============================================

// ============================================
// BLOQUES DEL ENCAPS (5 bloques, 100 preguntas)
// ============================================
export type BlockType =
  | 'Salud Pública'
  | 'Atención Integral'
  | 'Ética'
  | 'Investigación'
  | 'Administración';

export const BLOCK_ORDER: BlockType[] = [
  'Salud Pública',
  'Atención Integral',
  'Ética',
  'Investigación',
  'Administración'
];

export interface BlockMeta {
  code: number;
  name: BlockType;
  questionCount: number;
  description: string;
  // color tag para UI (referencia tokens Tailwind)
  accentColor: 'teal' | 'amber' | 'navy';
  iconName: string; // ej: 'activity', 'heart-pulse', 'scale', 'flask-conical', 'briefcase'
}

export const BLOCK_CONFIG: Record<BlockType, BlockMeta> = {
  'Salud Pública':     { code: 1, name: 'Salud Pública',     questionCount: 20, description: 'Epidemiología, vigilancia, promoción y determinantes sociales de la salud', accentColor: 'teal',  iconName: 'activity' },
  'Atención Integral': { code: 2, name: 'Atención Integral', questionCount: 25, description: 'AIEPI, salud materna, salud mental, atención por etapas de vida',           accentColor: 'amber', iconName: 'heart-pulse' },
  'Ética':             { code: 3, name: 'Ética',             questionCount: 15, description: 'Bioética, código deontológico, interculturalidad y derechos del paciente',   accentColor: 'navy',  iconName: 'scale' },
  'Investigación':     { code: 4, name: 'Investigación',     questionCount: 15, description: 'Metodología, estadística, lectura crítica y medicina basada en evidencia',   accentColor: 'teal',  iconName: 'flask-conical' },
  'Administración':    { code: 5, name: 'Administración',    questionCount: 25, description: 'Gestión de servicios, normativa MINSA, planificación y aseguramiento',       accentColor: 'amber', iconName: 'briefcase' }
};

// ============================================
// ESTADOS DEL EXAMEN
// ============================================
export type ExamStatus = 'idle' | 'loading' | 'ready' | 'in_progress' | 'completed' | 'error';

// ============================================
// DATOS DEL ESTUDIANTE
// ============================================
export interface EncapsStudent {
  dni: string;
  fullName: string;
  email?: string;
  phone?: string;
  establecimiento?: string;
  region?: string;
  cargo?: string;
}

// Mantener alias `Student = EncapsStudent` por compatibilidad
export type Student = EncapsStudent;

// ============================================
// SUB-ÁREAS Y CONFIGURACIÓN
// ============================================
export interface SubArea {
  name: string;
  questionCount: number;
  topics: string[];
}

export interface ExamConfig {
  blocks: BlockMeta[];
  totalQuestions: number; // 100
  maxScore: number;       // 100
}

// ============================================
// PREGUNTAS Y OPCIONES
// ============================================
export interface QuestionMetadata {
  numero?: string | number;
  tema?: string;
  subtema?: string;
}

export interface Question {
  id: string;
  number: number; // Número de pregunta global (1-100)
  questionText: string;
  questionType: string; // "Caso Clínico", "Problema", etc.
  options: string[];
  correctAnswer: number; // 0-based
  timeSeconds: number;
  imageLink: string | null;
  block: BlockType;            // ANTES era "subject"
  subArea?: string;            // NUEVO
  points: 1;
  sourceFile?: string | null;
  justification?: string | null;
  referenciaNormativa?: string | null;                  // NUEVO
  nivel?: 'Recordar' | 'Aplicar' | 'Analizar' | null;  // NUEVO
  metadata?: QuestionMetadata;
}

// ============================================
// RESPUESTAS DEL ESTUDIANTE
// ============================================
export interface Answer {
  questionId: string;
  selectedOption: number | null; // null si no respondió
  isCorrect: boolean;
  timeSpent: number; // segundos
}

// ============================================
// RESULTADOS POR BLOQUE
// ============================================
export interface BlockResult {
  name: BlockType;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
}

// ============================================
// NIVEL DE RENDIMIENTO (basado en NENC vigesimal)
// ============================================
export type PerformanceLevel =
  | 'aprobado_destacado'  // NENC ≥ 16
  | 'aprobado'            // NENC ≥ 14
  | 'en_riesgo'           // NENC ≥ 11
  | 'desaprobado';        // NENC < 11

// ============================================
// RESULTADO COMPLETO DEL EXAMEN
// ============================================
export interface ExamResult {
  student: EncapsStudent;
  date: Date;
  correctAnswers: number;     // 0-100
  totalQuestions: number;     // 100
  rawScore: number;           // = correctAnswers (0-100)
  nenc: number;               // 0-20 (vigesimal del examen)
  ppp?: number;               // 0-20 (input opcional del estudiante)
  pf?: number;                // 0-20 (calculado si hay ppp)
  vigesimalScore: number;     // alias = nenc para compatibilidad
  percentage: number;         // 0-100
  blockResults: BlockResult[];
  answers: Answer[];
  totalTime: number;          // segundos
  performanceLevel: PerformanceLevel;
}

// ============================================
// INFORMACIÓN GENERAL DEL EXAMEN
// ============================================
export const ENCAPS_INFO = {
  name: 'ENCAPS',
  fullName: 'Examen Nacional de Competencias para Atención Primaria de Salud',
  organization: 'Ministerio de Salud del Perú (MINSA)',
  totalQuestions: 100,
  maxScore: 100,
  vigesimalMax: 20,
  durationHours: 3,
  scoreFormula: 'PF = (PPP × 0.3) + (NENC × 0.7)'
};

// ============================================
// UMBRALES DE RENDIMIENTO (basado en NENC vigesimal)
// ============================================
export const PERFORMANCE_THRESHOLDS = {
  aprobado_destacado: 16,
  aprobado: 14,
  en_riesgo: 11
};

export const PERFORMANCE_MESSAGES: Record<PerformanceLevel, { title: string; message: string; color: string }> = {
  aprobado_destacado: {
    title: '¡Aprobado destacado!',
    message: 'Estás muy bien preparado para el ENCAPS.',
    color: 'teal'
  },
  aprobado: {
    title: '¡Aprobado!',
    message: 'Buena base. Refuerza los bloques con menor desempeño para subir tu nota.',
    color: 'teal'
  },
  en_riesgo: {
    title: 'En riesgo',
    message: 'Identifica tus bloques débiles y enfoca tu estudio. Aún puedes mejorar.',
    color: 'amber'
  },
  desaprobado: {
    title: 'Necesitas más práctica',
    message: 'Revisa cada bloque con calma y vuelve a intentarlo. Cada simulacro suma.',
    color: 'red'
  }
};

// ============================================
// REGIONES DEL PERÚ Y CARGOS PROFESIONALES
// ============================================
export const PERU_REGIONS: string[] = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco',
  'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto',
  'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
];

export const CARGOS: string[] = [
  'Médico SERUMS',
  'Médico Cirujano',
  'Interno de Medicina',
  'Estudiante de Medicina',
  'Enfermero/a',
  'Obstetra',
  'Odontólogo/a',
  'Otro profesional de salud'
];

// ============================================
// ESTADO DEL STORE (ZUSTAND)
// ============================================
export interface SavedAnswer {
  questionId: string;
  selectedOption: number | null;
}

export interface ExamStore {
  // Estado
  status: ExamStatus;
  student: EncapsStudent | null;
  config: ExamConfig | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Answer[];
  savedAnswers: Map<string, number | null>;
  result: ExamResult | null;
  error: string | null;
  startTime: Date | null;
  ppp: number | null; // NUEVO

  // Acciones
  setStudent: (student: EncapsStudent) => void;
  setPPP: (ppp: number | null) => void; // NUEVO
  loadConfig: () => Promise<void>;
  loadQuestions: () => Promise<void>;
  startExam: () => void;
  saveAnswer: (questionId: string, selectedOption: number | null) => void;
  answerQuestion: (questionId: string, selectedOption: number | null, timeSpent: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  finishExam: () => void;
  resetExam: () => void;
  setError: (error: string) => void;
}

// ============================================
// RESPUESTAS DE LA API
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// PROPS DE COMPONENTES (referencia)
// ============================================
export interface QuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedOption: number | null) => void;
  timeRemaining: number;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  percentage?: number;
}

export interface TimerProps {
  seconds: number;
  isWarning?: boolean;
  onTimeout?: () => void;
}

export interface ResultCardProps {
  result: BlockResult;
}
