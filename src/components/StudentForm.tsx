import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, CreditCard, ChevronRight, ChevronLeft, Loader2, AlertCircle,
  Mail, Phone, MapPin, Building2, Briefcase, Stethoscope, MessageCircle, Lock
} from 'lucide-react';
import { useExamStore } from '../hooks/useExam';
import { validateDNI, validateName } from '../utils/calculations';
import { registerUser, checkAccess, AccessCheckResult } from '../services/api';
import { PERU_REGIONS, CARGOS, type EncapsStudent } from '../types';

export function StudentForm() {
  const navigate = useNavigate();
  const { setStudent, loadConfig, config, status, error } = useExamStore();

  const [dni, setDni] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [establecimiento, setEstablecimiento] = useState('');
  const [region, setRegion] = useState('');
  const [cargo, setCargo] = useState('');
  const [errors, setErrors] = useState<{
    dni?: string; name?: string; email?: string; phone?: string;
    establecimiento?: string; region?: string; cargo?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessCheck, setAccessCheck] = useState<AccessCheckResult | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  useEffect(() => {
    const checkUserAccessAsync = async () => {
      const dniValid = dni.length === 8 && validateDNI(dni);
      const emailValid = email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (dniValid && emailValid) {
        setIsCheckingAccess(true);
        try {
          const result = await checkAccess(dni, email);
          setAccessCheck(result);
        } catch {
          setAccessCheck(null);
        }
        setIsCheckingAccess(false);
      } else {
        setAccessCheck(null);
      }
    };

    const debounceTimer = setTimeout(checkUserAccessAsync, 500);
    return () => clearTimeout(debounceTimer);
  }, [dni, email]);

  useEffect(() => {
    if (!config) loadConfig();
  }, [config, loadConfig]);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePhone = (p: string) => /^9\d{8}$/.test(p);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!dni.trim()) newErrors.dni = 'El DNI es requerido';
    else if (!validateDNI(dni)) newErrors.dni = 'El DNI debe tener 8 dígitos';

    if (!fullName.trim()) newErrors.name = 'El nombre es requerido';
    else if (!validateName(fullName)) newErrors.name = 'Ingresa un nombre válido (mínimo 3 caracteres)';

    if (!email.trim()) newErrors.email = 'El correo electrónico es requerido';
    else if (!validateEmail(email)) newErrors.email = 'Ingresa un correo electrónico válido';

    if (!phone.trim()) newErrors.phone = 'El celular es requerido';
    else if (!validatePhone(phone)) newErrors.phone = 'El celular debe tener 9 dígitos y empezar con 9';

    if (!establecimiento.trim()) newErrors.establecimiento = 'Ingresa tu establecimiento de salud';
    if (!region) newErrors.region = 'Selecciona tu región';
    if (!cargo) newErrors.cargo = 'Selecciona tu cargo';

    if (accessCheck && !accessCheck.canAccess) {
      newErrors.dni = 'Necesitas inscribirte para dar más exámenes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    const studentData: EncapsStudent = {
      dni: dni.trim(),
      fullName: fullName.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      establecimiento: establecimiento.trim(),
      region,
      cargo
    };

    try {
      await registerUser(studentData);
    } catch (err) {
      console.warn('No se pudo registrar usuario:', err);
    }

    setStudent(studentData);
    setIsSubmitting(false);
    navigate('/confirmar');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-textSoft">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg px-4">
        <div className="card-encaps max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-navy-500 mb-2">Error de conexión</h2>
          <p className="text-neutral-textSoft mb-6">{error}</p>
          <button onClick={() => loadConfig()} className="btn-primary">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 text-teal-500 rounded-2xl mb-4">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-navy-500 mb-2">
            SimulaENCAPS
          </h1>
          <p className="text-neutral-textSoft">
            Ingresa tus datos para comenzar el simulacro
          </p>
        </div>

        <div className="card-encaps animate-fade-in">
          <div className="space-y-6">
            {/* DNI */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500 mb-2">
                <CreditCard className="w-4 h-4" />
                DNI <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={dni}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setDni(v);
                  if (errors.dni) setErrors({ ...errors, dni: undefined });
                }}
                placeholder="Ingresa tu DNI (8 dígitos)"
                className={`w-full px-4 py-3 rounded-pill border-2 ${errors.dni ? 'border-red-500' : 'border-neutral-border focus:border-teal-500'} focus:outline-none transition-colors`}
                maxLength={8}
              />
              {errors.dni && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.dni}
                </p>
              )}
              {isCheckingAccess && (
                <p className="text-neutral-textSoft text-sm mt-2 flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verificando acceso...
                </p>
              )}
              {accessCheck && !errors.dni && !isCheckingAccess && (
                <p className={`text-sm mt-2 flex items-center gap-1 ${accessCheck.canAccess ? 'text-teal-600' : 'text-red-500'}`}>
                  {accessCheck.canAccess ? (
                    <><span>✓</span> {accessCheck.isFirstAttempt ? 'Primer examen gratuito' : `Acceso confirmado (${accessCheck.attemptCount} intento${accessCheck.attemptCount > 1 ? 's' : ''} previo${accessCheck.attemptCount > 1 ? 's' : ''})`}</>
                  ) : accessCheck.isFraudAttempt ? (
                    <><AlertCircle className="w-4 h-4" /> {accessCheck.reason}</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Ya realizaste {accessCheck.attemptCount} intento{accessCheck.attemptCount > 1 ? 's' : ''} - Inscríbete para continuar</>
                  )}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500 mb-2">
                <User className="w-4 h-4" />
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); if (errors.name) setErrors({ ...errors, name: undefined }); }}
                placeholder="Ingresa tu nombre completo"
                className={`w-full px-4 py-3 rounded-pill border-2 ${errors.name ? 'border-red-500' : 'border-neutral-border focus:border-teal-500'} focus:outline-none transition-colors`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500 mb-2">
                <Mail className="w-4 h-4" /> Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                placeholder="ejemplo@correo.com"
                className={`w-full px-4 py-3 rounded-pill border-2 ${errors.email ? 'border-red-500' : 'border-neutral-border focus:border-teal-500'} focus:outline-none transition-colors`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.email}</p>}
            </div>

            {/* Celular */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500 mb-2">
                <Phone className="w-4 h-4" /> Celular <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 9);
                  setPhone(v);
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
                }}
                placeholder="9XXXXXXXX (9 dígitos)"
                className={`w-full px-4 py-3 rounded-pill border-2 ${errors.phone ? 'border-red-500' : 'border-neutral-border focus:border-teal-500'} focus:outline-none transition-colors`}
                maxLength={9}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.phone}</p>}
            </div>

            {/* Establecimiento */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500 mb-2">
                <Building2 className="w-4 h-4" /> Establecimiento de salud <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={establecimiento}
                onChange={(e) => { setEstablecimiento(e.target.value); if (errors.establecimiento) setErrors({ ...errors, establecimiento: undefined }); }}
                placeholder="Ej: C.S. San Juan de Lurigancho"
                className={`w-full px-4 py-3 rounded-pill border-2 ${errors.establecimiento ? 'border-red-500' : 'border-neutral-border focus:border-teal-500'} focus:outline-none transition-colors`}
              />
              {errors.establecimiento && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.establecimiento}</p>}
            </div>

            {/* Región */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500 mb-2">
                <MapPin className="w-4 h-4" /> Región <span className="text-red-500">*</span>
              </label>
              <select
                value={region}
                onChange={(e) => { setRegion(e.target.value); if (errors.region) setErrors({ ...errors, region: undefined }); }}
                className={`w-full px-4 py-3 rounded-pill border-2 bg-white ${errors.region ? 'border-red-500' : 'border-neutral-border focus:border-teal-500'} focus:outline-none transition-colors`}
              >
                <option value="">-- Selecciona tu región --</option>
                {PERU_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.region && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.region}</p>}
            </div>

            {/* Cargo */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-navy-500 mb-2">
                <Briefcase className="w-4 h-4" /> Cargo <span className="text-red-500">*</span>
              </label>
              <select
                value={cargo}
                onChange={(e) => { setCargo(e.target.value); if (errors.cargo) setErrors({ ...errors, cargo: undefined }); }}
                className={`w-full px-4 py-3 rounded-pill border-2 bg-white ${errors.cargo ? 'border-red-500' : 'border-neutral-border focus:border-teal-500'} focus:outline-none transition-colors`}
              >
                <option value="">-- Selecciona tu cargo --</option>
                {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.cargo && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errors.cargo}</p>}
            </div>
          </div>

          {accessCheck && !accessCheck.canAccess && (
            <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-start gap-3">
                {accessCheck.isFraudAttempt
                  ? <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  : <Lock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />}
                <div>
                  {accessCheck.isFraudAttempt ? (
                    <>
                      <p className="text-sm font-semibold text-red-800 mb-2">{accessCheck.reason}</p>
                      <p className="text-sm text-red-700 mb-3">Por favor utiliza los mismos datos con los que te registraste originalmente.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-red-800 mb-2">Ya realizaste tu examen gratuito</p>
                      <p className="text-sm text-red-700 mb-3">Para acceder a más simulacros, inscríbete por WhatsApp:</p>
                      <a
                        href="https://wa.link/h2darz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-pill text-sm font-bold uppercase transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" /> Solicitar acceso
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-teal-500/5 rounded-xl border border-teal-500/20">
            <p className="text-sm text-navy-500">
              <strong>Tu primer simulacro es GRATIS.</strong> Para acceder a más intentos,
              solicita tu inscripción por WhatsApp:{' '}
              <a href="https://wa.link/h2darz" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 font-semibold underline">
                Inscríbete aquí
              </a>
            </p>
          </div>

          <div className="flex justify-between mt-8 gap-3">
            <button onClick={() => navigate('/')} className="btn-outline">
              <ChevronLeft className="w-5 h-5 inline mr-1" /> Volver
            </button>
            <button
              onClick={handleSubmit}
              className={accessCheck && !accessCheck.canAccess ? 'opacity-50 cursor-not-allowed btn-primary' : 'btn-primary'}
              disabled={isSubmitting || isCheckingAccess || (accessCheck !== null && !accessCheck.canAccess)}
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 inline mr-1 animate-spin" /> Registrando...</>
              ) : isCheckingAccess ? (
                <><Loader2 className="w-5 h-5 inline mr-1 animate-spin" /> Verificando...</>
              ) : accessCheck && !accessCheck.canAccess ? (
                <><Lock className="w-5 h-5 inline mr-1" /> Acceso restringido</>
              ) : (
                <>Continuar <ChevronRight className="w-5 h-5 inline ml-1" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
