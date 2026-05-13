import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle, Mail, Stethoscope } from 'lucide-react';
import { getWhatsAppUrl, WHATSAPP_NUMBER } from '../../config/pricing';

const TIKTOK_PATH =
  'M232.3 76.2v40.7a91.7 91.7 0 0 1-50.5-15.1V197a82.5 82.5 0 1 1-82.5-82.5q5.7 0 11.2.7v41.4a41.5 41.5 0 1 0 30.4 39.9V0h41.7a91.6 91.6 0 0 0 49.7 76.2z';

function TikTokIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 256 256"
      className={className}
      fill="currentColor"
      aria-hidden
      role="img"
    >
      <path d={TIKTOK_PATH} />
    </svg>
  );
}

export function FooterEncaps() {
  return (
    <footer className="bg-navy-700 text-neutral-surface">
      <div className="container mx-auto px-4 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Columna 1: Marca */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-[14px] bg-teal-500 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-display uppercase font-extrabold text-lg tracking-wide">
                SimulaENCAPS
              </span>
            </div>
            <p className="font-body text-sm text-neutral-surface/80 leading-relaxed mb-5">
              Simulador del Examen Nacional de Competencias para Atención Primaria de Salud (MINSA).
              100 preguntas, 3 horas, escala vigesimal 0-20.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-navy-500 hover:bg-teal-500 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-navy-500 hover:bg-teal-500 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="w-9 h-9 rounded-full bg-navy-500 hover:bg-teal-500 flex items-center justify-center transition-colors"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Columna 2: Recursos */}
          <div>
            <h4 className="font-display uppercase font-bold text-amber-500 text-sm tracking-wider mb-4">
              Recursos
            </h4>
            <ul className="space-y-3 font-body text-sm">
              <li>
                <a href="#" className="text-neutral-surface/80 hover:text-white transition-colors">
                  Guía del ENCAPS
                </a>
              </li>
              <li>
                <Link to="/estructura" className="text-neutral-surface/80 hover:text-white transition-colors">
                  Estructura del examen
                </Link>
              </li>
              <li>
                <Link to="/banqueo" className="text-neutral-surface/80 hover:text-white transition-colors">
                  Banqueo de preguntas
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información */}
          <div>
            <h4 className="font-display uppercase font-bold text-amber-500 text-sm tracking-wider mb-4">
              Información
            </h4>
            <ul className="space-y-3 font-body text-sm">
              <li>
                <a href="#" className="text-neutral-surface/80 hover:text-white transition-colors">
                  Sobre nosotros
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-surface/80 hover:text-white transition-colors">
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-surface/80 hover:text-white transition-colors">
                  Política de privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-surface/80 hover:text-white transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h4 className="font-display uppercase font-bold text-amber-500 text-sm tracking-wider mb-4">
              Contacto
            </h4>
            <a
              href={getWhatsAppUrl('Hola, tengo una consulta sobre SimulaENCAPS')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold uppercase tracking-wide rounded-pill px-5 py-2.5 text-sm shadow-pill mb-4 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <p className="font-body text-xs text-neutral-surface/70 mb-2">
              +{WHATSAPP_NUMBER.slice(0, 2)} {WHATSAPP_NUMBER.slice(2)}
            </p>
            <a
              href="mailto:contacto@simulaencaps.pe"
              className="inline-flex items-center gap-2 text-sm text-neutral-surface/80 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              contacto@simulaencaps.pe
            </a>
          </div>
        </div>

        <hr className="border-navy-600 my-8" />

        <p className="text-center font-body text-xs text-neutral-surface/70">
          © 2026 SimulaENCAPS · Hecho en Perú
        </p>
      </div>
    </footer>
  );
}
