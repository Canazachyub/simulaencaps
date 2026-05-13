import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, ArrowLeft, Loader2, Trophy, Award, Target, BarChart3,
  ChevronUp, ChevronDown
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getProgress, type ProgressData } from '../../services/api';
import { BLOCK_CONFIG } from '../../types';
import clsx from 'clsx';

const ACCENT_HEX: Record<'teal' | 'amber' | 'navy', string> = {
  teal: '#00A99D',
  amber: '#F5C518',
  navy: '#16264D'
};

type SortKey = 'block' | 'percentage' | 'totalRespuestas';
type SortDir = 'asc' | 'desc';

export function ProgressDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('percentage');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    const dni = sessionStorage.getItem('banqueo_dni') || localStorage.getItem('encaps_dni');
    if (!dni) {
      navigate('/banqueo/acceso');
      return;
    }
    (async () => {
      setLoading(true);
      const res = await getProgress(dni);
      setData(res);
      setLoading(false);
    })();
  }, [navigate]);

  const totals = useMemo(() => {
    if (!data) return { intentos: 0, mejorNenc: 0, ultimoPf: 0 };
    const intentos = data.history.length;
    const mejorNenc = data.history.reduce((max, h) => Math.max(max, h.nenc), 0);
    const ultimoPf = data.history[0]?.pf ?? 0;
    return { intentos, mejorNenc, ultimoPf };
  }, [data]);

  const sortedStats = useMemo(() => {
    if (!data) return [];
    const arr = [...data.statsByBlock];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'block') cmp = a.block.localeCompare(b.block);
      else if (sortKey === 'percentage') cmp = a.porcentaje - b.porcentaje;
      else cmp = a.totalRespuestas - b.totalRespuestas;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [data, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-textSoft">Cargando tu progreso...</p>
        </div>
      </div>
    );
  }

  if (!data || data.history.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-bg flex flex-col">
        <header className="bg-navy-500 text-white py-4 px-4" style={{ background: '#16264D' }}>
          <div className="container mx-auto flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/70 hover:text-white">
              <ArrowLeft className="w-4 h-4" /> Inicio
            </button>
            <h1 className="font-display font-bold text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" /> Mi progreso
            </h1>
            <div />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="card-encaps max-w-md w-full text-center">
            <BarChart3 className="w-16 h-16 text-neutral-muted mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-navy-500 mb-2">Sin datos todavía</h2>
            <p className="text-neutral-textSoft mb-6">
              Aún no tienes simulacros registrados. Completa al menos uno para ver tu progreso.
            </p>
            <button onClick={() => navigate('/registro')} className="btn-primary">
              Hacer un simulacro
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Datos del LineChart
  const chartData = [...data.history].reverse().map((h, i) => ({
    intento: `#${i + 1}`,
    NENC: h.nenc,
    PF: h.pf ?? null,
    porcentaje: h.porcentaje
  }));

  return (
    <div className="min-h-screen bg-neutral-bg">
      <header className="bg-navy-500 text-white py-4 px-4" style={{ background: '#16264D' }}>
        <div className="container mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Inicio
          </button>
          <h1 className="font-display font-bold text-xl flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" /> Mi progreso
          </h1>
          <div />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-encaps text-center">
            <Award className="w-10 h-10 text-teal-500 mx-auto mb-2" />
            <p className="text-3xl font-display font-bold text-teal-700">{totals.intentos}</p>
            <p className="text-sm text-neutral-textSoft">Total intentos</p>
          </div>
          <div className="card-encaps text-center">
            <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <p className="text-3xl font-display font-bold text-amber-700">{totals.mejorNenc.toFixed(2)}</p>
            <p className="text-sm text-neutral-textSoft">Mejor NENC</p>
          </div>
          <div className="card-encaps text-center">
            <Target className="w-10 h-10 text-navy-500 mx-auto mb-2" />
            <p className="text-3xl font-display font-bold text-navy-500">
              {totals.ultimoPf > 0 ? totals.ultimoPf.toFixed(2) : '—'}
            </p>
            <p className="text-sm text-neutral-textSoft">Último PF</p>
          </div>
        </div>

        {/* Evolución NENC/PF */}
        <div className="card-encaps">
          <h2 className="text-lg font-display font-bold text-navy-500 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-500" /> Evolución de tus notas
          </h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="intento" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} domain={[0, 20]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="NENC" stroke="#00A99D" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="PF" stroke="#F5C518" strokeWidth={3} dot={{ r: 5 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla por bloque */}
        <div className="card-encaps">
          <h2 className="text-lg font-display font-bold text-navy-500 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-500" /> Estadísticas por bloque
          </h2>
          {data.statsByBlock.length === 0 ? (
            <p className="text-sm text-neutral-textSoft text-center py-6">No hay datos por bloque todavía.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-neutral-border">
              <table className="w-full text-sm">
                <thead className="bg-navy-500 text-white">
                  <tr>
                    <SortHeader label="Bloque" active={sortKey === 'block'} dir={sortDir} onClick={() => toggleSort('block')} align="left" />
                    <SortHeader label="Respuestas" active={sortKey === 'totalRespuestas'} dir={sortDir} onClick={() => toggleSort('totalRespuestas')} align="center" />
                    <SortHeader label="% aciertos" active={sortKey === 'percentage'} dir={sortDir} onClick={() => toggleSort('percentage')} align="center" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-border">
                  {sortedStats.map(s => {
                    const meta = BLOCK_CONFIG[s.block];
                    const color = meta ? ACCENT_HEX[meta.accentColor] : '#16264D';
                    return (
                      <tr key={s.block}>
                        <td className="px-3 py-2 text-navy-500 font-semibold">{s.block}</td>
                        <td className="px-3 py-2 text-center text-neutral-textSoft">
                          {s.correctas} / {s.totalRespuestas}
                        </td>
                        <td className="px-3 py-2 text-center font-bold" style={{ color }}>
                          {s.porcentaje.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SortHeader({
  label, active, dir, onClick, align
}: { label: string; active: boolean; dir: 'asc' | 'desc'; onClick: () => void; align: 'left' | 'center' }) {
  return (
    <th className={clsx('px-3 py-2 text-xs font-display uppercase cursor-pointer select-none', align === 'left' ? 'text-left' : 'text-center')} onClick={onClick}>
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </span>
    </th>
  );
}
