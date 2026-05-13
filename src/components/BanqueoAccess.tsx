import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, User, Mail, Loader2, AlertCircle, Lock, CheckCircle, MessageCircle } from 'lucide-react';
import { checkBanqueoAccess } from '../services/api';

export function BanqueoAccess() {
  const navigate = useNavigate();
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidDni = dni.length === 8 && /^\d+$/.test(dni);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = isValidDni && isValidEmail && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      const result = await checkBanqueoAccess(dni, email);
      if (result.canAccess) {
        sessionStorage.setItem('banqueo_dni', dni);
        sessionStorage.setItem('banqueo_email', email);
        navigate('/banqueo/seleccion');
      } else {
        setError(result.reason);
      }
    } catch {
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <header className="bg-navy-500 text-white p-4" style={{ background: '#16264D' }}>
        <button onClick={() => navigate('/banqueo')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="card-encaps">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 text-teal-500 rounded-2xl mb-4">
                <Brain className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-display font-bold text-navy-500 mb-2">
                Acceso al Banqueo ENCAPS
              </h1>
              <p className="text-neutral-textSoft text-sm">
                Verifica tus credenciales (DNI + correo)
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-navy-500 font-bold">
                    Banqueo exclusivo para usuarios inscritos
                  </p>
                  <p className="text-xs text-neutral-textSoft mt-1 mb-3">
                    El banqueo está disponible solo para usuarios que han confirmado su inscripción.
                  </p>
                  <a
                    href="https://wa.link/h2darz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-pill text-xs font-bold uppercase transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Inscríbete por WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="dni" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500 mb-2">
                  <User className="w-4 h-4" /> DNI
                </label>
                <input
                  type="text"
                  id="dni"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="w-full px-4 py-3 rounded-pill border-2 border-neutral-border focus:border-teal-500 focus:outline-none"
                  placeholder="8 dígitos"
                  maxLength={8}
                />
                {dni && !isValidDni && <p className="text-xs text-red-500 mt-1">El DNI debe tener 8 dígitos</p>}
              </div>

              <div>
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500 mb-2">
                  <Mail className="w-4 h-4" /> Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-pill border-2 border-neutral-border focus:border-teal-500 focus:outline-none"
                  placeholder="correo@ejemplo.com"
                />
                {email && !isValidEmail && <p className="text-xs text-red-500 mt-1">Ingresa un correo válido</p>}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-700 font-bold">{error}</p>
                      <p className="text-xs text-red-600 mt-2 mb-3">
                        Para acceder al banqueo, inscríbete por WhatsApp:
                      </p>
                      <a
                        href="https://wa.link/h2darz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-pill text-sm font-bold uppercase transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" /> Solicitar acceso
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={!canSubmit} className="btn-primary w-full disabled:opacity-50">
                {loading ? (
                  <><Loader2 className="w-5 h-5 inline mr-1 animate-spin" /> Verificando...</>
                ) : (
                  <><CheckCircle className="w-5 h-5 inline mr-1" /> Verificar acceso</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-neutral-textSoft">¿No tienes acceso? El simulacro gratuito sigue disponible.</p>
              <button onClick={() => navigate('/registro')} className="text-sm text-teal-500 hover:text-teal-600 font-bold mt-2">
                Ir al simulacro gratuito
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
