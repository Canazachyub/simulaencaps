import { useEffect, useState } from 'react';
import { Calculator, AlertCircle } from 'lucide-react';

interface PPPInputProps {
  value: number | null;
  onChange: (ppp: number | null) => void;
}

/**
 * Input controlado del Promedio Ponderado Promocional (PPP).
 * - Slider 0..20 con step 0.01 + input numérico al lado.
 * - Devuelve null si el campo está vacío.
 * - Track teal, thumb amber (estilizado vía CSS inline + tokens de diseño).
 */
export function PPPInput({ value, onChange }: PPPInputProps) {
  const [text, setText] = useState<string>(value !== null ? String(value) : '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(value !== null ? String(value) : '');
  }, [value]);

  const commit = (raw: string) => {
    setText(raw);
    if (raw.trim() === '') {
      setError(null);
      onChange(null);
      return;
    }
    const normalized = raw.replace(',', '.');
    const num = Number(normalized);
    if (Number.isNaN(num)) {
      setError('Ingresa un número válido');
      return;
    }
    if (num < 0 || num > 20) {
      setError('El PPP debe estar entre 0 y 20');
      return;
    }
    setError(null);
    onChange(Math.round(num * 100) / 100);
  };

  const sliderValue = value === null ? 0 : value;

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500">
        <Calculator className="w-4 h-4 text-teal-500" />
        Promedio Ponderado Promocional (PPP)
      </label>

      <div className="flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={20}
          step={0.01}
          value={sliderValue}
          onChange={(e) => commit(e.target.value)}
          className="flex-1 ppp-slider"
          aria-label="PPP slider"
        />
        <input
          type="number"
          min={0}
          max={20}
          step={0.01}
          value={text}
          onChange={(e) => commit(e.target.value)}
          placeholder="—"
          className="w-24 px-3 py-2 rounded-pill border-2 border-neutral-border focus:border-teal-500 focus:outline-none text-center font-display font-bold text-navy-500"
          aria-label="PPP valor"
        />
        <span className="text-sm text-neutral-textSoft font-semibold">/ 20</span>
      </div>

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}

      {/* Estilos del slider con tokens (track teal, thumb amber) */}
      <style>{`
        .ppp-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          background: linear-gradient(to right,
            #00A99D 0%,
            #00A99D ${(sliderValue / 20) * 100}%,
            #E5E7EB ${(sliderValue / 20) * 100}%,
            #E5E7EB 100%);
          border-radius: 999px;
          outline: none;
        }
        .ppp-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          background: #F5C518;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .ppp-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          background: #F5C518;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
