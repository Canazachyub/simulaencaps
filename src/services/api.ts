import type {
  ApiResponse,
  ExamConfig,
  Question,
  BlockType,
  BlockMeta
} from '../types';
import { BLOCK_CONFIG, BLOCK_ORDER } from '../types';

// ============================================
// CONFIGURACIÓN DE LA API - SimulaENCAPS
// ============================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://script.google.com/macros/s/TU_SCRIPT_ID_ENCAPS/exec';

const REQUEST_TIMEOUT = 30000;

// ============================================
// TIPOS AUXILIARES EXPORTADOS
// ============================================

export interface Flashcard {
  id: string;
  block: BlockType;
  subArea?: string;
  tema?: string;
  frente: string;
  reverso: string;
  referencia?: string;
}

export interface Testimonio {
  nombre: string;
  establecimiento?: string;
  region?: string;
  texto: string;
  fecha?: string;
}

export interface ProgressData {
  history: Array<{ fecha: string; nenc: number; pf?: number; porcentaje: number }>;
  statsByBlock: Array<{
    block: BlockType;
    totalRespuestas: number;
    correctas: number;
    porcentaje: number;
  }>;
}

export interface QuestionStats {
  totalRespuestas: number;
  pctOption: number[];
}

export interface EstructuraNode {
  block: BlockType;
  subArea: string;
  tema: string;
  preguntas: number;
  puntajeEst?: number;
}

// ============================================
// FETCH CON TIMEOUT
// ============================================

async function fetchWithTimeout(
  url: string,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado tiempo. Por favor, intenta de nuevo.');
    }
    throw error;
  }
}

// ============================================
// CONFIGURACIÓN Y PREGUNTAS
// ============================================

export async function getConfig(): Promise<ExamConfig> {
  try {
    const url = `${API_BASE_URL}?action=config`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const result: ApiResponse<ExamConfig> = await response.json();
    if (!result.success) throw new Error(result.error || 'Error al obtener la configuración');
    return result.data!;
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
    );
  }
}

export async function getQuestions(): Promise<Question[]> {
  try {
    const url = `${API_BASE_URL}?action=questions`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const result: ApiResponse<Question[]> = await response.json();
    if (!result.success) throw new Error(result.error || 'Error al obtener las preguntas');
    return result.data!;
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'No se pudo cargar el examen. Por favor, intenta de nuevo.'
    );
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const url = `${API_BASE_URL}?action=test`;
    const response = await fetchWithTimeout(url, 10000);
    if (!response.ok) return false;
    const result = await response.json();
    return result.success === true;
  } catch {
    return false;
  }
}

// ============================================
// REGISTRO DE USUARIO
// ============================================

export interface UserRegistration {
  dni: string;
  fullName: string;
  email?: string;
  phone?: string;
  establecimiento?: string;
  region?: string;
  cargo?: string;
}

export async function registerUser(user: UserRegistration): Promise<void> {
  try {
    const params = new URLSearchParams({
      action: 'register',
      dni: user.dni,
      fullName: user.fullName,
      email: user.email ?? '',
      phone: user.phone ?? '',
      establecimiento: user.establecimiento ?? '',
      region: user.region ?? '',
      cargo: user.cargo ?? ''
    });
    const url = `${API_BASE_URL}?${params.toString()}`;
    const response = await fetchWithTimeout(url, 15000);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Error al registrar usuario');
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
}

// ============================================
// HISTORIAL DE PUNTAJES (ENCAPS: NENC, PPP, PF)
// ============================================

export interface ScoreData {
  dni: string;
  correctAnswers: number;
  totalQuestions: number;
  rawScore: number; // 0-100
  nenc: number;     // 0-20
  ppp?: number;     // 0-20
  pf?: number;      // 0-20
}

export interface HistoryEntry {
  fecha: string;
  correctas: number;
  total: number;
  puntaje: number;     // rawScore
  nenc: number;        // 0-20
  ppp?: number;        // 0-20
  pf?: number;         // 0-20
  porcentaje: number;
}

export interface UserHistory {
  dni: string;
  totalIntentos: number;
  history: HistoryEntry[];
  mejorNenc: number;
  mejorPf?: number;
  ultimoNenc: number;
  ultimoPf?: number;
}

export async function saveScore(data: ScoreData): Promise<void> {
  try {
    const params = new URLSearchParams({
      action: 'saveScore',
      dni: data.dni,
      correctAnswers: data.correctAnswers.toString(),
      totalQuestions: data.totalQuestions.toString(),
      rawScore: data.rawScore.toString(),
      nenc: data.nenc.toFixed(2)
    });
    if (typeof data.ppp === 'number') params.append('ppp', data.ppp.toFixed(2));
    if (typeof data.pf === 'number') params.append('pf', data.pf.toFixed(2));

    const url = `${API_BASE_URL}?${params.toString()}`;
    const response = await fetchWithTimeout(url, 15000);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Error al guardar puntaje');
  } catch (error) {
    console.error('Error al guardar puntaje:', error);
    // No relanzar para no bloquear la experiencia del usuario.
  }
}

export async function getUserHistory(dni: string): Promise<UserHistory | null> {
  try {
    const params = new URLSearchParams({ action: 'getHistory', dni });
    const url = `${API_BASE_URL}?${params.toString()}`;
    const response = await fetchWithTimeout(url, 15000);
    if (!response.ok) return null;
    const result = await response.json();
    if (!result.success) return null;
    return result.data as UserHistory;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return null;
  }
}

// ============================================
// VERIFICACIÓN DE ACCESO
// ============================================

export interface AccessCheckResult {
  canAccess: boolean;
  reason: string;
  attemptCount: number;
  isFirstAttempt?: boolean;
  isConfirmed?: boolean;
  isFraudAttempt?: boolean;
}

export async function checkAccess(dni: string, email: string): Promise<AccessCheckResult> {
  try {
    const params = new URLSearchParams({
      action: 'checkAccess',
      dni,
      email: email.toLowerCase().trim()
    });
    const url = `${API_BASE_URL}?${params.toString()}`;
    const response = await fetchWithTimeout(url, 20000);
    if (!response.ok) {
      return { canAccess: false, reason: 'Error de conexión - intenta de nuevo', attemptCount: 0 };
    }
    const result = await response.json();
    if (!result.success) {
      return { canAccess: false, reason: 'Error de verificación - intenta de nuevo', attemptCount: 0 };
    }
    return result.data as AccessCheckResult;
  } catch (error) {
    console.error('Error al verificar acceso:', error);
    return { canAccess: false, reason: 'No se pudo verificar - intenta de nuevo', attemptCount: 0 };
  }
}

// ============================================
// BANQUEO (PREGUNTAS POR BLOQUE/SUB-ÁREA)
// ============================================

export interface BanqueoAccessResult {
  canAccess: boolean;
  reason: string;
  isConfirmed?: boolean;
}

export interface BanqueoQuestion {
  id: string;
  number: number;
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswer: number;
  imageLink: string | null;
  block: BlockType;
  subArea?: string;
  sourceFile: string | null;
  justification: string | null;
  referenciaNormativa?: string | null;
  nivel?: 'Recordar' | 'Aplicar' | 'Analizar' | null;
  metadata: {
    numero: number;
    tema: string;
    subtema: string;
  };
}

export interface BanqueoQuestionsResult {
  block: BlockType | string;
  subArea?: string;
  totalQuestions: number;
  questions: BanqueoQuestion[];
  error?: string;
}

export async function checkBanqueoAccess(
  dni: string,
  email: string
): Promise<BanqueoAccessResult> {
  try {
    const params = new URLSearchParams({
      action: 'checkBanqueoAccess',
      dni,
      email: email.toLowerCase().trim()
    });
    const url = `${API_BASE_URL}?${params.toString()}`;
    const response = await fetchWithTimeout(url, 20000);
    if (!response.ok) return { canAccess: false, reason: 'Error de conexión - intenta de nuevo' };
    const result = await response.json();
    if (!result.success) return { canAccess: false, reason: 'Error de verificación' };
    return result.data as BanqueoAccessResult;
  } catch (error) {
    console.error('Error al verificar acceso a banqueo:', error);
    return { canAccess: false, reason: 'No se pudo verificar - intenta de nuevo' };
  }
}

export async function getBanqueoQuestions(
  block: BlockType,
  subArea?: string
): Promise<BanqueoQuestionsResult> {
  try {
    const params = new URLSearchParams({
      action: 'getBanqueoQuestions',
      block
    });
    if (subArea) params.append('subArea', subArea);

    const url = `${API_BASE_URL}?${params.toString()}`;
    const response = await fetchWithTimeout(url, 20000);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Error al obtener preguntas');
    return result.data as BanqueoQuestionsResult;
  } catch (error) {
    console.error('Error al obtener preguntas del banqueo:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'No se pudo cargar las preguntas. Por favor, intenta de nuevo.'
    );
  }
}

// Lista de bloques disponibles para el banqueo
export const BANQUEO_BLOCKS: Array<{ code: number; name: BlockType }> = BLOCK_ORDER.map((b) => ({
  code: BLOCK_CONFIG[b].code,
  name: b
}));

// ============================================
// ESTRUCTURA, FLASHCARDS, TESTIMONIOS, PROGRESO
// ============================================

interface RawEstructuraRow {
  bloque?: string;
  subArea?: string;
  tema?: string;
  numPreguntas?: number;
  puntajeEst?: number;
}

export async function getEstructura(): Promise<EstructuraNode[]> {
  try {
    const url = `${API_BASE_URL}?action=getEstructura`;
    const response = await fetchWithTimeout(url, 20000);
    if (!response.ok) return [];
    const result = await response.json();
    if (!result.success) return [];
    // Apps Script returns { estructura: [...], grouped: {...} } with fields
    // bloque/subArea/tema/numPreguntas/puntajeEst. Normalize to EstructuraNode.
    const raw: RawEstructuraRow[] = result.data?.estructura ?? result.data ?? [];
    return raw
      .filter((r) => !!r.bloque)
      .map((r) => ({
        block: r.bloque as BlockType,
        subArea: r.subArea ?? '',
        tema: r.tema ?? '',
        preguntas: r.numPreguntas ?? 0,
        puntajeEst: r.puntajeEst
      }));
  } catch (error) {
    console.error('Error al obtener estructura:', error);
    return [];
  }
}

export async function getFlashcards(
  block?: BlockType,
  subArea?: string
): Promise<Flashcard[]> {
  try {
    const params = new URLSearchParams({ action: 'getFlashcards' });
    if (block) params.append('block', block);
    if (subArea) params.append('subArea', subArea);

    const url = `${API_BASE_URL}?${params.toString()}`;
    const response = await fetchWithTimeout(url, 20000);
    if (!response.ok) return [];
    const result = await response.json();
    if (!result.success) return [];
    return (result.data as Flashcard[]) ?? [];
  } catch (error) {
    console.error('Error al obtener flashcards:', error);
    return [];
  }
}

export async function getTestimonios(): Promise<Testimonio[]> {
  try {
    const url = `${API_BASE_URL}?action=getTestimonios`;
    const response = await fetchWithTimeout(url, 15000);
    if (!response.ok) return [];
    const result = await response.json();
    if (!result.success) return [];
    return (result.data as Testimonio[]) ?? [];
  } catch (error) {
    console.error('Error al obtener testimonios:', error);
    return [];
  }
}

export async function getProgress(dni: string): Promise<ProgressData | null> {
  try {
    const params = new URLSearchParams({ action: 'getProgress', dni });
    const url = `${API_BASE_URL}?${params.toString()}`;
    const response = await fetchWithTimeout(url, 20000);
    if (!response.ok) return null;
    const result = await response.json();
    if (!result.success) return null;
    return result.data as ProgressData;
  } catch (error) {
    console.error('Error al obtener progreso:', error);
    return null;
  }
}

export async function getIncorrectQuestions(dni: string): Promise<Question[]> {
  try {
    const params = new URLSearchParams({ action: 'getIncorrectQuestions', dni });
    const url = `${API_BASE_URL}?${params.toString()}`;
    const response = await fetchWithTimeout(url, 20000);
    if (!response.ok) return [];
    const result = await response.json();
    if (!result.success) return [];
    return (result.data as Question[]) ?? [];
  } catch (error) {
    console.error('Error al obtener preguntas incorrectas:', error);
    return [];
  }
}

/**
 * Envía respuestas para análisis (fire-and-forget). No bloquea ni lanza errores.
 */
export function logAnswers(
  dni: string,
  answers: Array<{ questionId: string; selectedOption: number | null; isCorrect: boolean }>
): void {
  try {
    const payload = encodeURIComponent(JSON.stringify(answers));
    const params = new URLSearchParams({ action: 'logAnswers', dni });
    const url = `${API_BASE_URL}?${params.toString()}&payload=${payload}`;
    // No await: fire-and-forget
    fetchWithTimeout(url, 10000).catch(() => {
      /* ignorar errores */
    });
  } catch (error) {
    // Silencioso intencional
    console.warn('logAnswers fallo silencioso:', error);
  }
}

export async function getQuestionStats(questionId: string): Promise<QuestionStats | null> {
  try {
    const params = new URLSearchParams({ action: 'getQuestionStats', questionId });
    const url = `${API_BASE_URL}?${params.toString()}`;
    const response = await fetchWithTimeout(url, 15000);
    if (!response.ok) return null;
    const result = await response.json();
    if (!result.success) return null;
    return result.data as QuestionStats;
  } catch (error) {
    console.error('Error al obtener estadísticas de pregunta:', error);
    return null;
  }
}

// ============================================
// DATOS MOCK PARA DESARROLLO (ENCAPS)
// ============================================

export const MOCK_CONFIG: ExamConfig = {
  totalQuestions: 100,
  maxScore: 100,
  blocks: BLOCK_ORDER.map<BlockMeta>((b) => BLOCK_CONFIG[b])
};

// Sub-áreas plausibles por bloque
const MOCK_SUBAREAS: Record<BlockType, string[]> = {
  'Salud Pública': [
    'Epidemiología básica',
    'Vigilancia epidemiológica',
    'Promoción de la salud',
    'Determinantes sociales',
    'Inmunizaciones'
  ],
  'Atención Integral': [
    'AIEPI niño',
    'Salud materna y perinatal',
    'Salud mental comunitaria',
    'Adulto mayor',
    'Adolescente'
  ],
  'Ética': [
    'Bioética clínica',
    'Código deontológico',
    'Interculturalidad',
    'Derechos del paciente'
  ],
  'Investigación': [
    'Metodología de investigación',
    'Estadística aplicada',
    'Lectura crítica',
    'Medicina basada en evidencia'
  ],
  'Administración': [
    'Gestión de servicios de salud',
    'Normativa MINSA',
    'Planificación estratégica',
    'Aseguramiento universal'
  ]
};

// Tipos de pregunta ENCAPS
const QUESTION_TYPES: string[] = ['Caso Clínico', 'Problema'];
const NIVELES: Array<'Recordar' | 'Aplicar' | 'Analizar'> = ['Recordar', 'Aplicar', 'Analizar'];

/**
 * Genera 100 preguntas mock distribuidas por bloque manteniendo el orden de BLOCK_ORDER.
 */
export function generateMockQuestions(): Question[] {
  const questions: Question[] = [];
  let questionNumber = 1;

  MOCK_CONFIG.blocks.forEach((blockMeta) => {
    const blockName = blockMeta.name;
    const subAreas = MOCK_SUBAREAS[blockName] || ['Sub-área general'];

    for (let i = 0; i < blockMeta.questionCount; i++) {
      const subArea = subAreas[i % subAreas.length];
      const isCaso = i < blockMeta.questionCount * 0.7;
      const questionType = isCaso ? QUESTION_TYPES[0] : QUESTION_TYPES[1];
      const nivel = NIVELES[i % NIVELES.length];

      questions.push({
        id: `${blockName}-${i + 1}`,
        number: questionNumber++,
        questionText: generateMockQuestionText(blockName, subArea, questionType, i + 1),
        questionType,
        options: generateMockOptions(blockName),
        correctAnswer: Math.floor(Math.random() * 5),
        timeSeconds: 108, // ~3h / 100 preguntas
        imageLink: null,
        block: blockName,
        subArea,
        points: 1,
        sourceFile: `ENCAPS_${new Date().getFullYear()}.pdf`,
        justification: null,
        referenciaNormativa: null,
        nivel,
        metadata: {
          numero: i + 1,
          tema: subArea,
          subtema: `Tema ${i + 1} de ${subArea}`
        }
      });
    }
  });

  return questions;
}

function generateMockQuestionText(
  block: BlockType,
  subArea: string,
  type: string,
  num: number
): string {
  if (type === 'Caso Clínico') {
    const casos: Record<BlockType, string> = {
      'Salud Pública':
        'En un centro de salud del primer nivel se reportan 12 casos de EDA acuosa en niños menores de 5 años durante la última semana en un asentamiento humano sin agua potable continua.',
      'Atención Integral':
        'Lactante de 11 meses acude por tos de 3 días. Frecuencia respiratoria 52/min, tiraje subcostal leve, saturación 94% al aire ambiente. Madre primigesta refiere lactancia mixta.',
      'Ética':
        'Una gestante de 22 semanas, quechuahablante, rechaza un procedimiento indicado por el equipo médico apelando a sus creencias culturales. El equipo discute cómo proceder.',
      'Investigación':
        'Se desea evaluar el efecto de una intervención educativa sobre adherencia a TARGA en pacientes de un establecimiento del primer nivel durante 6 meses.',
      'Administración':
        'Como jefe de un Centro de Salud I-3, recibe el reporte de programación operativa anual con un déficit de cobertura de CRED en menores de 1 año.'
    };
    return `<b>Caso ${num} — ${block}:</b> ${casos[block]}<br><br>Respecto al subtema "${subArea}", ¿cuál es la conducta más apropiada?`;
  }
  return `<b>Pregunta ${num} — ${block}:</b> En relación a "${subArea}", ¿cuál de las siguientes afirmaciones es CORRECTA según la normativa vigente del MINSA?`;
}

function generateMockOptions(block: BlockType): string[] {
  const baseOptions: Record<BlockType, string[]> = {
    'Salud Pública': [
      'Notificar inmediatamente al sistema de vigilancia (NotiSP) y activar respuesta',
      'Indicar tratamiento sintomático y observar evolución por 72 horas',
      'Solicitar coprocultivo a todos los casos antes de cualquier acción',
      'Derivar a hospital de mayor complejidad sin investigación local',
      'Esperar confirmación del laboratorio referencial antes de actuar'
    ],
    'Atención Integral': [
      'Clasificar como neumonía y manejar según AIEPI con antibiótico oral y reevaluación',
      'Indicar broncodilatador inhalado y alta con consejería',
      'Hospitalizar inmediatamente para oxigenoterapia con saturación objetivo 100%',
      'Solicitar radiografía de tórax antes de iniciar cualquier tratamiento',
      'Referir a tercer nivel sin medidas iniciales'
    ],
    'Ética': [
      'Respetar la autonomía con consentimiento informado intercultural y mediación',
      'Imponer el procedimiento por estado de necesidad médica',
      'Derivar el caso al comité de ética sin diálogo previo con la paciente',
      'Aceptar la decisión sin documentar ni ofrecer alternativas',
      'Solicitar a la familia que decida en lugar de la gestante'
    ],
    'Investigación': [
      'Ensayo cuasi-experimental antes-después con grupo comparador',
      'Estudio de casos y controles con muestreo por conveniencia',
      'Serie de casos descriptiva sin control',
      'Revisión narrativa de la literatura',
      'Encuesta transversal única sin seguimiento'
    ],
    'Administración': [
      'Reformular el POA priorizando estrategias para CRED y trabajo extramural',
      'Solicitar más presupuesto sin reasignar actividades existentes',
      'Reducir las metas de CRED para alcanzar la cobertura formal',
      'Trasladar la responsabilidad al nivel regional',
      'Mantener el plan original sin ajustes'
    ]
  };
  return baseOptions[block];
}
