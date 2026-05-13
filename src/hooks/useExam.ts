import { create } from 'zustand';
import type {
  ExamStore,
  EncapsStudent,
  ExamConfig,
  Question,
  Answer,
  ExamResult
} from '../types';
import {
  getConfig,
  getQuestions,
  MOCK_CONFIG,
  generateMockQuestions
} from '../services/api';
import { calculateExamResult } from '../utils/calculations';

// Determinar si usar mock o API real
const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL;

export const useExamStore = create<ExamStore>((set, get) => ({
  // Estado inicial
  status: 'idle',
  student: null,
  config: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  savedAnswers: new Map(),
  result: null,
  error: null,
  startTime: null,
  ppp: null,

  // Establecer datos del estudiante
  setStudent: (student: EncapsStudent) => {
    set({ student });
  },

  // Establecer Promedio Ponderado Promocional (PPP)
  setPPP: (ppp: number | null) => {
    set({ ppp });
  },

  // Cargar configuración del examen ENCAPS
  loadConfig: async () => {
    set({ status: 'loading', error: null });

    try {
      let config: ExamConfig;

      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        config = MOCK_CONFIG;
      } else {
        config = await getConfig();
      }

      set({ config, status: 'idle' });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Error al cargar configuración'
      });
    }
  },

  // Cargar preguntas del examen ENCAPS (100 preguntas, 5 bloques)
  loadQuestions: async () => {
    set({ status: 'loading', error: null });

    try {
      let questions: Question[];

      if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        questions = generateMockQuestions();
      } else {
        questions = await getQuestions();
      }

      set({ questions, status: 'ready' });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Error al cargar preguntas'
      });
    }
  },

  // Iniciar el examen
  startExam: () => {
    set({
      status: 'in_progress',
      currentQuestionIndex: 0,
      answers: [],
      savedAnswers: new Map(),
      startTime: new Date()
    });
  },

  // Guardar respuesta sin evaluar (durante el examen)
  saveAnswer: (questionId: string, selectedOption: number | null) => {
    const { savedAnswers } = get();
    const newSavedAnswers = new Map(savedAnswers);
    newSavedAnswers.set(questionId, selectedOption);
    set({ savedAnswers: newSavedAnswers });
  },

  // Registrar respuesta evaluada
  answerQuestion: (questionId: string, selectedOption: number | null, timeSpent: number) => {
    const { questions, answers } = get();
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const isCorrect =
      selectedOption !== null && selectedOption === question.correctAnswer;

    const newAnswer: Answer = {
      questionId,
      selectedOption,
      isCorrect,
      timeSpent
    };

    set({ answers: [...answers, newAnswer] });
  },

  // Avanzar a la siguiente pregunta
  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  // Retroceder a la pregunta anterior
  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  // Ir a una pregunta específica
  goToQuestion: (index: number) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  // Finalizar el examen y calcular resultados
  finishExam: () => {
    const { student, questions, savedAnswers, startTime, ppp } = get();
    if (!student || !startTime) return;

    const totalTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const timePerQuestion = questions.length > 0 ? totalTime / questions.length : 0;

    const evaluatedAnswers: Answer[] = questions.map((question) => {
      const selectedOption = savedAnswers.get(question.id) ?? null;
      const isCorrect =
        selectedOption !== null && selectedOption === question.correctAnswer;
      return {
        questionId: question.id,
        selectedOption,
        isCorrect,
        timeSpent: timePerQuestion
      };
    });

    const result: ExamResult = calculateExamResult(
      student,
      questions,
      evaluatedAnswers,
      startTime,
      ppp
    );

    set({ status: 'completed', result, answers: evaluatedAnswers });
  },

  // Reiniciar el examen
  resetExam: () => {
    set({
      status: 'idle',
      student: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      savedAnswers: new Map(),
      result: null,
      error: null,
      startTime: null,
      ppp: null
    });
  },

  // Establecer error
  setError: (error: string) => {
    set({ status: 'error', error });
  }
}));

// ============================================
// HOOKS DERIVADOS
// ============================================

export function useCurrentQuestion(): Question | null {
  const questions = useExamStore((state) => state.questions);
  const currentIndex = useExamStore((state) => state.currentQuestionIndex);
  return questions[currentIndex] || null;
}

export function useProgress() {
  const currentIndex = useExamStore((state) => state.currentQuestionIndex);
  const totalQuestions = useExamStore((state) => state.questions.length);
  const savedAnswers = useExamStore((state) => state.savedAnswers);

  return {
    current: currentIndex + 1,
    total: totalQuestions,
    answered: savedAnswers.size,
    percentage:
      totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0
  };
}

export function useIsLastQuestion(): boolean {
  const currentIndex = useExamStore((state) => state.currentQuestionIndex);
  const totalQuestions = useExamStore((state) => state.questions.length);
  return currentIndex === totalQuestions - 1;
}

export function useIsFirstQuestion(): boolean {
  const currentIndex = useExamStore((state) => state.currentQuestionIndex);
  return currentIndex === 0;
}

export function useSavedAnswer(questionId: string): number | null {
  const savedAnswers = useExamStore((state) => state.savedAnswers);
  return savedAnswers.get(questionId) ?? null;
}
