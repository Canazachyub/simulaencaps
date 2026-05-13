import { CheckCircle, XCircle, Brain } from 'lucide-react';
import type { Question as QuestionType } from '../types';
import { indexToLetter } from '../utils/calculations';
import clsx from 'clsx';

/**
 * Soporta tags HTML simples en el texto: <b>, <i>, <u>, <mark>, <br>, <sub>, <sup>
 */
function parseFormattedText(text: unknown): string {
  if (text === null || text === undefined) return '';
  const textStr = typeof text === 'string' ? text : String(text);
  if (!textStr) return '';
  const allowedTags = ['b', 'strong', 'i', 'em', 'u', 'mark', 'br', 'sub', 'sup'];
  return textStr
    .replace(/\n/g, '<br>')
    .replace(/<mark>/gi, '<mark class="bg-amber-200 px-0.5 rounded">')
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag) =>
      allowedTags.includes(tag.toLowerCase()) ? match : ''
    );
}

function FormattedText({ text, className }: { text: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: parseFormattedText(text) }} />;
}

interface QuestionProps {
  question: QuestionType;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  onSelectAnswer: (index: number) => void;
}

function getOptionColorClasses(index: number, optionState: string): string {
  if (optionState === 'selected') return 'bg-teal-500 text-white scale-110 shadow-lg';
  if (optionState === 'correct') return 'bg-teal-500 text-white';
  if (optionState === 'incorrect') return 'bg-red-500 text-white';
  // Default: 5 colores distintos para A-E
  const colors = [
    'bg-navy-500 text-white',
    'bg-teal-500 text-white',
    'bg-amber-500 text-navy-500',
    'bg-purple-500 text-white',
    'bg-rose-500 text-white'
  ];
  return colors[index] || 'bg-neutral-muted text-white';
}

export function Question({
  question,
  questionNumber,
  selectedAnswer,
  showFeedback,
  isCorrect,
  onSelectAnswer
}: QuestionProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="card-encaps animate-slide-up">
        {/* Header con badges: bloque + sub-área + nivel */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="badge-teal">{question.block}</span>
          {question.subArea && <span className="badge-navy-outline">{question.subArea}</span>}
          {question.nivel && (
            <span className="badge-amber inline-flex items-center gap-1">
              <Brain className="w-3 h-3" /> {question.nivel}
            </span>
          )}
        </div>

        {/* Texto de la pregunta */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-display font-semibold text-navy-500 leading-relaxed">
            <span className="text-teal-500 mr-2">P{questionNumber}.</span>
            <FormattedText text={question.questionText} />
          </h2>
        </div>

        {/* Imagen */}
        {question.imageLink && (
          <div className="mb-6">
            <img
              src={question.imageLink}
              alt="Imagen de la pregunta"
              className="max-w-full h-auto rounded-lg border border-neutral-border mx-auto"
              style={{ maxHeight: '300px' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {/* Source label */}
        {question.sourceFile && (
          <div className="mb-4 flex justify-end">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-medium border border-amber-500/30">
              Tomado en: {question.sourceFile}
            </span>
          </div>
        )}

        {/* Opciones A-E (5 alternativas) */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const letter = indexToLetter(index);
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = question.correctAnswer === index;

            let optionState: 'default' | 'selected' | 'correct' | 'incorrect' = 'default';
            if (showFeedback) {
              if (isCorrectAnswer) optionState = 'correct';
              else if (isSelected && !isCorrectAnswer) optionState = 'incorrect';
            } else if (isSelected) {
              optionState = 'selected';
            }

            return (
              <button
                key={index}
                onClick={() => onSelectAnswer(index)}
                disabled={showFeedback}
                className={clsx(
                  'w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-4',
                  {
                    'border-neutral-border hover:border-teal-500 hover:bg-teal-500/5': optionState === 'default',
                    'border-teal-500 bg-teal-500/10 shadow-md': optionState === 'selected',
                    'border-teal-500 bg-teal-500/10': optionState === 'correct',
                    'border-red-500 bg-red-50': optionState === 'incorrect',
                    'cursor-not-allowed opacity-75': showFeedback && optionState === 'default'
                  }
                )}
              >
                <div className={clsx(
                  'flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-lg shadow-sm transition-transform',
                  getOptionColorClasses(index, optionState)
                )}>
                  {optionState === 'correct' ? <CheckCircle className="w-6 h-6" />
                    : optionState === 'incorrect' ? <XCircle className="w-6 h-6" />
                    : letter}
                </div>
                <span className={clsx('flex-1 pt-2.5', {
                  'text-navy-500': optionState === 'default',
                  'text-teal-700 font-medium': optionState === 'selected' || optionState === 'correct',
                  'text-red-700': optionState === 'incorrect'
                })}>
                  <FormattedText text={option} />
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback opcional (solo si showFeedback=true) */}
        {showFeedback && (
          <div className={clsx(
            'mt-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in',
            { 'bg-teal-500/10 text-teal-700': isCorrect, 'bg-red-100 text-red-800': !isCorrect }
          )}>
            {isCorrect ? (
              <>
                <CheckCircle className="w-6 h-6 text-teal-500" />
                <span className="font-medium">¡Correcto! +{question.points.toFixed(2)} puntos</span>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-600" />
                <span className="font-medium">
                  {selectedAnswer === null ? 'Tiempo agotado. ' : 'Incorrecto. '}
                  La respuesta correcta es la opción {indexToLetter(question.correctAnswer)}.
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
