import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getTestimonios, type Testimonio } from '../../services/api';

export function Testimonials() {
  const [items, setItems] = useState<Testimonio[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getTestimonios();
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Si está cargando, ocultar (no flash)
  if (loading) return null;
  // Si no hay testimonios, NO renderizar la sección
  if (!items || items.length === 0) return null;

  // Mostrar máximo 3 (o un múltiplo según diseño)
  const visible = items.slice(0, 3);

  return (
    <section className="py-20 bg-neutral-bg relative overflow-hidden">
      <div
        aria-hidden
        className="deco-dot-grid absolute top-8 left-8 w-40 h-40 opacity-50 pointer-events-none"
      />
      <div
        aria-hidden
        className="deco-dot-grid absolute bottom-8 right-8 w-40 h-40 opacity-50 pointer-events-none"
      />

      <div className="container mx-auto px-4">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="badge-amber mb-4">Comunidad</span>
          <h2 className="font-display uppercase text-4xl md:text-5xl font-extrabold text-navy-500">
            Lo que dicen{' '}
            <span className="accent-underline text-teal-500">nuestros usuarios</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {visible.map((t, idx) => (
            <TestimonialCard key={idx} testimonio={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface TestimonialCardProps {
  testimonio: Testimonio;
}

function TestimonialCard({ testimonio }: TestimonialCardProps) {
  const initial = (testimonio.nombre || '?').trim().charAt(0).toUpperCase();
  const subtitleParts = [testimonio.establecimiento, testimonio.region].filter(Boolean);

  return (
    <div className="card-encaps relative flex flex-col h-full">
      <Star
        className="absolute top-5 right-5 w-5 h-5 text-amber-500 fill-amber-500"
        aria-hidden
      />

      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-amber-500 text-navy-500 font-display font-extrabold text-xl flex items-center justify-center shadow-pill">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-navy-500 truncate">
            {testimonio.nombre}
          </p>
          {subtitleParts.length > 0 && (
            <p className="font-body text-xs text-neutral-textSoft truncate">
              {subtitleParts.join(' · ')}
            </p>
          )}
        </div>
      </div>

      <blockquote className="font-body italic text-neutral-textSoft text-sm leading-relaxed flex-1">
        “{testimonio.texto}”
      </blockquote>
    </div>
  );
}
