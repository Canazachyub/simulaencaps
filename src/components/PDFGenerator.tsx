import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExamResult } from '../types';
import { PERFORMANCE_MESSAGES, ENCAPS_INFO } from '../types';
import { formatDate, formatTimeReadable, formatVigesimalScore, indexToLetter } from '../utils/calculations';
import { useExamStore } from '../hooks/useExam';

interface PDFGeneratorProps {
  result: ExamResult;
}

// Strip HTML tags from text used inside PDF
function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export function PDFGenerator({ result }: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { questions } = useExamStore();

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;

      // ====== HEADER (navy bar) ======
      doc.setFillColor(22, 38, 77); // navy-500 SimulaENCAPS
      doc.rect(0, 0, pageWidth, 38, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('SimulaENCAPS', pageWidth / 2, 16, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(ENCAPS_INFO.fullName, pageWidth / 2, 24, { align: 'center' });
      doc.text(`Fecha: ${formatDate(result.date)}`, pageWidth / 2, 31, { align: 'center' });

      yPos = 48;

      // ====== DATOS DEL ESTUDIANTE ======
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(margin, yPos, pageWidth - margin * 2, 38, 3, 3, 'F');
      doc.setTextColor(22, 38, 77);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL ESTUDIANTE', margin + 4, yPos + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(40, 50, 70);
      doc.text(`DNI: ${result.student.dni}`, margin + 4, yPos + 15);
      doc.text(`Nombre: ${result.student.fullName}`, margin + 4, yPos + 22);
      doc.text(`Establecimiento: ${result.student.establecimiento ?? '—'}`, margin + 4, yPos + 29);
      doc.text(`Region: ${result.student.region ?? '—'}`, pageWidth / 2 + 4, yPos + 22);
      doc.text(`Cargo: ${result.student.cargo ?? '—'}`, pageWidth / 2 + 4, yPos + 29);
      doc.text(`Tiempo total: ${formatTimeReadable(result.totalTime)}`, pageWidth / 2 + 4, yPos + 15);

      yPos += 46;

      // ====== TABLA NENC / PPP / PF / % ======
      const performanceInfo = PERFORMANCE_MESSAGES[result.performanceLevel];
      const pf = result.pf;
      const ppp = result.ppp;

      autoTable(doc, {
        startY: yPos,
        head: [['NENC', 'PPP', 'PF', '% Aciertos', 'Nivel']],
        body: [[
          `${formatVigesimalScore(result.nenc)} / 20`,
          ppp !== undefined ? `${formatVigesimalScore(ppp)} / 20` : '—',
          pf !== undefined ? `${formatVigesimalScore(pf)} / 20` : '—',
          `${result.percentage.toFixed(1)}%`,
          performanceInfo.title
        ]],
        theme: 'grid',
        headStyles: { fillColor: [0, 169, 157], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
        bodyStyles: { halign: 'center', fontSize: 11, fontStyle: 'bold', textColor: [22, 38, 77] },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      // Fórmula
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120, 120, 130);
      doc.text(`Formula: ${ENCAPS_INFO.scoreFormula}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      // ====== TABLA POR BLOQUE ======
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 38, 77);
      doc.text('RESULTADOS POR BLOQUE', margin, yPos);
      yPos += 4;

      autoTable(doc, {
        startY: yPos,
        head: [['Bloque', 'Correctas', 'Total', '%']],
        body: result.blockResults.map(b => [
          b.name,
          String(b.correctAnswers),
          String(b.totalQuestions),
          `${b.percentage.toFixed(1)}%`
        ]),
        foot: [['TOTAL', String(result.correctAnswers), String(result.totalQuestions), `${result.percentage.toFixed(1)}%`]],
        theme: 'striped',
        headStyles: { fillColor: [22, 38, 77], textColor: [255, 255, 255], fontStyle: 'bold' },
        footStyles: { fillColor: [0, 169, 157], textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { fontSize: 9, textColor: [22, 38, 77] },
        columnStyles: { 0: { halign: 'left' }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' } },
        margin: { left: margin, right: margin }
      });

      yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

      // ====== PREGUNTAS FALLADAS ======
      const incorrectAnswers = result.answers.filter(a => !a.isCorrect && a.selectedOption !== null);
      if (incorrectAnswers.length > 0 && questions.length > 0) {
        // Nueva página si es necesario
        if (yPos > 230) { doc.addPage(); yPos = 20; }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38);
        doc.text(`PREGUNTAS FALLADAS (${incorrectAnswers.length})`, margin, yPos);
        yPos += 6;

        const failedRows = incorrectAnswers.slice(0, 30).map(ans => {
          const q = questions.find(qq => qq.id === ans.questionId);
          if (!q) return null;
          return [
            String(q.number),
            q.block,
            stripHtml(q.questionText).slice(0, 80) + (q.questionText.length > 80 ? '...' : ''),
            indexToLetter(q.correctAnswer),
            stripHtml(q.justification).slice(0, 100) || '—'
          ];
        }).filter(Boolean) as string[][];

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Bloque', 'Pregunta', 'Resp.', 'Justificación']],
          body: failedRows,
          theme: 'grid',
          headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
          bodyStyles: { fontSize: 7, textColor: [40, 50, 70], cellPadding: 2 },
          columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 30 },
            2: { cellWidth: 65 },
            3: { halign: 'center', cellWidth: 12, fontStyle: 'bold' },
            4: { cellWidth: 'auto' }
          },
          margin: { left: margin, right: margin }
        });
      }

      // ====== FOOTER en cada página ======
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        const ph = doc.internal.pageSize.getHeight();
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 160);
        doc.text(`SimulaENCAPS — Pag. ${p}/${totalPages} — ${ENCAPS_INFO.scoreFormula}`, pageWidth / 2, ph - 8, { align: 'center' });
      }

      const fileName = `SimulaENCAPS_${result.student.dni}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button onClick={generatePDF} disabled={isGenerating} className="btn-accent">
      {isGenerating ? (
        <><Loader2 className="w-5 h-5 inline mr-1 animate-spin" /> Generando...</>
      ) : (
        <><Download className="w-5 h-5 inline mr-1" /> Descargar PDF</>
      )}
    </button>
  );
}
