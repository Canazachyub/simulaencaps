# SimulaENCAPS — Simulador del Examen Nacional de Competencias para APS

Plataforma web para realizar simulacros del **Examen Nacional de Competencias para Atención Primaria de Salud (ENCAPS)** organizado por el **Ministerio de Salud del Perú (MINSA)**. Dirigida a serumistas, médicos cirujanos, internos de medicina y demás profesionales de salud que rinden el ENCAPS.

**Demo en vivo:** https://canazachyub.github.io/simulaencaps/
**Repositorio:** https://github.com/Canazachyub/simulaencaps

---

## Estado del proyecto

**Versión:** 2.0.0
**Última actualización:** mayo 2026
**Deploy:** GitHub Pages (CI/CD automático vía GitHub Actions en cada push a `main`)

| Capa | Estado | Notas |
|------|--------|-------|
| Backend Apps Script | ✅ Funcional | URL desplegada, `setupSheets()` automático |
| Tipos / Servicios / Store | ✅ Funcional | Contrato ENCAPS estable |
| Sistema de diseño (Tailwind + Diseño.md) | ✅ Funcional | Tokens navy/teal/amber aplicados |
| Landing nueva | ✅ Funcional | Hero, Pillars, Pricing, FAQ, Footer |
| Examen + Resultados con PF | ✅ Funcional | NENC + PPP + PF en vivo |
| Banqueo por bloque | ✅ Funcional | Feedback inmediato + stats |
| Modos nuevos (Flashcards / Repaso / Progreso) | ✅ Funcional | Pendiente UX en móvil |
| **Responsividad móvil/tablet** | ⚠️ Parcial | **Roadmap principal — ver §Responsividad** |
| Pasarela de pago | ❌ Pendiente | CTAs van a WhatsApp |

---

## Características del simulador

### Examen ENCAPS
- **100 preguntas** distribuidas en 5 bloques MINSA
- **3 horas de duración** con temporizador y cierre automático
- **Navegación libre** entre preguntas + navegador visual con estado
- **Sin feedback inmediato** durante el examen (modo evaluación)
- **Modo banqueo** con feedback inmediato + justificación + referencia normativa
- **Botón de WhatsApp** para reportar errores

### Bloques evaluados (5 bloques, 100 preguntas)

| # | Bloque | Preguntas | Sub-áreas principales |
|---|--------|-----------|------------------------|
| 1 | Salud Pública | 20 | Epidemiología, Promoción, Prevención, Salud ambiental |
| 2 | Atención Integral *(antes CIS)* | 25 | AIEPI, Salud materna, Salud mental, Etapas de vida |
| 3 | Ética | 15 | Bioética clínica, Código deontológico, Interculturalidad |
| 4 | Investigación | 15 | Metodología, Estadística, Lectura crítica (MBE) |
| 5 | Administración *(antes Gestión)* | 25 | Gestión de servicios, Normativa MINSA, Planificación, Aseguramiento |

### Sistema de puntuación

```
NENC = (correctas / 100) × 20            // Nota Examen Nacional (0-20)
PPP  = input del usuario (0-20)          // Promedio Ponderado Promocional
PF   = (PPP × 0.3) + (NENC × 0.7)        // Puntaje Final
```

| Nivel | NENC | Color |
|-------|------|-------|
| Aprobado destacado | ≥ 16 | Teal |
| Aprobado | ≥ 14 | Teal claro |
| En riesgo | ≥ 11 | Amber |
| Desaprobado | < 11 | Rojo |

### Registro de usuario (campos ENCAPS)
- DNI (8 dígitos), Nombre, Email, Celular
- **Establecimiento de salud**, **Región** (24 regiones del Perú), **Cargo** (Médico SERUMS, MC, IMI, EM, Enfermería, Obstetricia, etc.)

### Modos de estudio
- **Simulacro** (1 examen completo gratis, ilimitado para usuarios confirmados)
- **Banqueo por bloque** con filtro por sub-área (10 preguntas, feedback inmediato)
- **Repaso de incorrectas** (genera simulacro solo con tus fallas históricas)
- **Flashcards ENCAPS** (frente/reverso + referencia normativa)
- **Dashboard de progreso** (evolución NENC/PF, stats por bloque)

---

## Stack técnico

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.6.2 | Tipado estático |
| Vite | 5.4.10 | Build tool + dev server |
| Tailwind CSS | 3.4.14 | Estilos (tokens custom Diseño.md) |
| Zustand | 5.0.1 | Estado global |
| React Router | 6.28.0 | Navegación |
| Recharts | 2.13.3 | Gráficos (BarChart, LineChart) |
| jsPDF + autoTable | 2.5.2 | Generación de PDF |
| Lucide React | 0.460.0 | Iconos |

### Backend
| Tecnología | Uso |
|------------|-----|
| Google Sheets | Base de datos (preguntas, usuarios, historial, logs) |
| Google Apps Script | API REST (`doGet` + `doPost`) |

---

## Arquitectura

```
┌─────────────────┐    GET/POST    ┌──────────────────────┐
│   React App     │◄──────────────►│  Google Apps Script  │
│   (Frontend)    │     JSON       │      api.gs          │
└─────────────────┘                └──────────┬───────────┘
                                              │
                                              ▼
                                ┌──────────────────────────┐
                                │   Google Sheets (12)     │
                                │                          │
                                │  · Banco_SaludPublica    │
                                │  · Banco_AtencionIntegral│
                                │  · Banco_Etica           │
                                │  · Banco_Investigacion   │
                                │  · Banco_Administracion  │
                                │  · Estructura_ENCAPS     │
                                │  · flashcards            │
                                │  · testimonios           │
                                │  · usuarios              │
                                │  · historial_puntajes    │
                                │  · confirmado            │
                                │  · respuestas_log        │
                                └──────────────────────────┘
```

### Endpoints de la API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `?action=config` | GET | Configuración de bloques |
| `?action=questions` | GET | 100 preguntas aleatorias por bloque |
| `?action=register` | GET | Registrar usuario (con establecimiento/región/cargo) |
| `?action=saveScore` | GET | Guardar NENC + PPP + PF |
| `?action=getHistory&dni=X` | GET | Historial del usuario |
| `?action=checkAccess&dni=X&email=Y` | GET | Verificar acceso (anti-fraude) |
| `?action=checkBanqueoAccess&dni=X&email=Y` | GET | Verificar acceso al banqueo (solo confirmados) |
| `?action=getBanqueoQuestions&block=X[&subArea=Y]` | GET | 10 preguntas de un bloque |
| `?action=getEstructura` | GET | Estructura completa del temario |
| `?action=getFlashcards[&block=X][&subArea=Y]` | GET | Tarjetas filtradas |
| `?action=getTestimonios` | GET | Testimonios aprobados |
| `?action=logAnswers` | GET/POST | Log de respuestas (batch) |
| `?action=getIncorrectQuestions&dni=X` | GET | Preguntas falladas del usuario |
| `?action=getProgress&dni=X` | GET | Histórico + stats por bloque |
| `?action=getQuestionStats&questionId=X` | GET | % de cada alternativa elegida |
| `?action=test` | GET | Health check |

---

## Estructura del proyecto

```
simulaencaps/
├── src/
│   ├── components/
│   │   ├── landing/                    # Secciones de la landing
│   │   │   ├── Hero.tsx
│   │   │   ├── Pillars.tsx
│   │   │   ├── FeaturesShowcase.tsx
│   │   │   ├── Testimonials.tsx        # oculto si API vacía
│   │   │   ├── PricingCards.tsx        # 3 planes desde config
│   │   │   ├── FAQ.tsx
│   │   │   └── FooterEncaps.tsx
│   │   ├── learning/                   # Modos de estudio nuevos
│   │   │   ├── Flashcards.tsx
│   │   │   ├── ReviewIncorrect.tsx
│   │   │   └── ProgressDashboard.tsx
│   │   ├── Landing.tsx                 # Composición landing
│   │   ├── EstructuraENCAPS.tsx        # Vista temario
│   │   ├── StudentForm.tsx             # Registro
│   │   ├── ExamConfirmation.tsx        # Pre-examen
│   │   ├── Quiz.tsx                    # Examen con timer 3h
│   │   ├── Question.tsx                # Pregunta individual
│   │   ├── Results.tsx                 # NENC + PPP + PF
│   │   ├── PPPInput.tsx                # Slider PPP
│   │   ├── PDFGenerator.tsx            # Reporte PDF
│   │   ├── Banqueo*.tsx                # Flujo banqueo (4 archivos)
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── useExam.ts                  # Store Zustand (con ppp/setPPP)
│   │   └── useTimer.ts                 # Countdown 3h
│   │
│   ├── services/
│   │   └── api.ts                      # Cliente API + tipos auxiliares
│   │
│   ├── types/
│   │   └── index.ts                    # BlockType, BLOCK_CONFIG, EncapsStudent, etc.
│   │
│   ├── utils/
│   │   └── calculations.ts             # calculateNENC, calculatePF, blockResults
│   │
│   ├── config/
│   │   └── pricing.ts                  # Planes (S/0, S/199, S/249) + WhatsApp
│   │
│   ├── App.tsx                         # Rutas
│   ├── main.tsx
│   └── index.css                       # Tokens Diseño.md (.btn-*, .card-encaps, etc.)
│
├── google-apps-script/
│   ├── api.gs                          # Backend (pegar en Apps Script)
│   └── SHEETS_SETUP.md                 # Guía manual (también está setupSheets() en api.gs)
│
├── tailwind.config.js                  # Tokens navy/teal/amber + fonts + radii
├── vite.config.ts                      # base: '/simulaencaps/'
├── .env                                # VITE_API_URL + VITE_USE_MOCK
└── package.json
```

---

## Setup local

### 1. Clonar e instalar
```bash
git clone https://github.com/Canazachyub/simulaencaps.git
cd simulaencaps
npm install
```

### 2. Configurar `.env`
```bash
cp .env.example .env
```

Editar `.env`:
```env
VITE_API_URL=https://script.google.com/macros/s/TU_SCRIPT_ID/exec
VITE_USE_MOCK=false
```

### 3. Backend (primera vez)
1. Abrir el spreadsheet en https://sheets.google.com
2. Extensiones → Apps Script
3. Pegar el contenido de `google-apps-script/api.gs` en `Code.gs`
4. Verificar que `SPREADSHEET_ID` apunta a tu hoja
5. **Ejecutar `setupSheets()` una vez** (crea las 12 hojas con encabezados y datos seed de `Estructura_ENCAPS`)
6. Implementar → Nueva implementación → Aplicación web → Quién tiene acceso: Cualquier persona
7. Copiar la URL `/exec` y pegarla en `.env`

Ver [`google-apps-script/SHEETS_SETUP.md`](google-apps-script/SHEETS_SETUP.md) para más detalle.

### 4. Dev server
```bash
npm run dev
```
Abre http://localhost:5173/simulaencaps/

### 5. Build de producción
```bash
npm run build
npm run preview   # preview local del build
```

### Comandos
| Comando | Uso |
|---------|-----|
| `npm run dev` | Desarrollo con HMR |
| `npm run build` | TypeScript check + Vite build |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint |

---

## Sistema de diseño

Tokens definidos en `tailwind.config.js` y `src/index.css` desde el archivo `Diseño.md` (en la raíz del workspace).

### Paleta
- **Navy** (`navy.500 = #16264D`) — color de marca, headlines, footer
- **Teal** (`teal.500 = #00A99D`) — acento principal, CTAs primarios, success
- **Amber** (`amber.500 = #F5C518`) — acento secundario, badges destacados, subrayado curvo
- **Neutral** — `bg`, `surface`, `border`, `muted`, `text`, `textSoft`

### Tipografía
- **Display:** Montserrat (titulares uppercase con tracking-tight)
- **Body:** Inter

### Clases helper en `index.css`
| Clase | Propósito |
|-------|-----------|
| `.btn-primary` | Botón teal pill |
| `.btn-accent` | Botón amber pill |
| `.btn-outline` | Botón outline navy |
| `.card-encaps` | Card blanca con sombra y hover lift |
| `.badge-teal` / `.badge-amber` / `.badge-navy-outline` | Píldoras |
| `.ribbon-navy` | Ribbon horizontal navy |
| `.accent-underline` | Subrayado curvo amber bajo palabra clave |
| `.deco-dot-grid` | Patrón de puntos decorativo |

---

## 🚀 Roadmap de responsividad

**Objetivo:** que SimulaENCAPS funcione perfectamente en móvil, tablet, laptop y desktop. Hoy la mayoría de vistas funcionan en móvil pero hay puntos a pulir, especialmente el flujo de examen y el Results.

### Breakpoints Tailwind a respetar

| Breakpoint | Min width | Dispositivo objetivo |
|------------|-----------|----------------------|
| (default)  | 0px       | Móvil portrait (320–480px) |
| `sm:`      | 640px     | Móvil landscape / tablet pequeña |
| `md:`      | 768px     | Tablet portrait |
| `lg:`      | 1024px    | Tablet landscape / laptop |
| `xl:`      | 1280px    | Desktop |
| `2xl:`     | 1536px    | Desktop grande |

**Filosofía:** mobile-first. Diseñar primero para 360px y agregar `md:` / `lg:` para escalar.

### Vista por vista — qué falta

#### Landing (`Landing.tsx` y `landing/*`)
- [x] Hero stack vertical en móvil (ya implementado con `grid-cols-1 lg:grid-cols-2`)
- [ ] **PricingCards**: en móvil el plan destacado con `-mt-4` se ve mal — quitar el offset solo en `< lg`
- [ ] **FeaturesShowcase**: el zig-zag desktop debe colapsar a stack vertical limpio en móvil
- [ ] **FAQ**: padding generoso en móvil (target táctil ≥ 44px)
- [ ] **FooterEncaps**: 4 columnas → 2 columnas en `md`, 1 en móvil
- [ ] Touch targets en CTAs: mínimo 48×48px

#### Examen (`Quiz.tsx` + `Question.tsx`)
- [ ] Header con timer fijo arriba (`sticky top-0`) — no debe scrollear
- [ ] Navegador 1-100 colapsable en drawer lateral en móvil (botón hamburguesa)
- [ ] Las 5 alternativas A-E: aumentar padding vertical y target táctil
- [ ] Botones Anterior/Siguiente fijos abajo en móvil (`fixed bottom-0`)
- [ ] Tipografía de la pregunta: mínimo 16px en móvil para legibilidad
- [ ] Imagen de pregunta: `max-w-full h-auto` con tap to zoom

#### Resultados (`Results.tsx`)
- [ ] NENC grande (`text-7xl`) → reducir a `text-5xl` en móvil
- [ ] Tabs: convertir en accordion vertical en móvil
- [ ] Gráfico Recharts BarChart: dar `width="100%"` con ResponsiveContainer
- [ ] Grid 1-100 de preguntas: `grid-cols-10` en desktop, `grid-cols-5` en móvil
- [ ] Card del PF: stack vertical en móvil con fórmula en línea aparte

#### Banqueo (`Banqueo*.tsx`)
- [ ] Grid 5 cards de bloques: 1 columna en móvil, 2 en `md`, 3 en `lg`
- [ ] BanqueoPractice: barra de stats por opción debe caber en pantallas estrechas

#### Modos nuevos (`learning/*`)
- [ ] **Flashcards**: el flip 3D debe funcionar bien en touch (swipe horizontal para navegar entre tarjetas)
- [ ] **ProgressDashboard**: tabla `statsByBlock` → cards verticales en móvil
- [ ] LineChart: ResponsiveContainer + ocultar leyenda en `< md`

#### Formulario (`StudentForm.tsx`)
- [ ] Todos los inputs deben tener `font-size: 16px` mínimo (evitar zoom auto en iOS)
- [ ] Selects de Región / Cargo: usar `<select>` nativo en móvil, no dropdown custom
- [ ] Validación inline visible debajo del campo, no al lado

### Quick wins (en orden de impacto)

1. **Auditoría con DevTools** (Chrome → Device Toolbar) en 3 viewports clave: 360px, 768px, 1024px. Captura cada vista y anota qué se rompe.
2. **Sticky header en Quiz** — alta prioridad, es el flujo crítico
3. **Bottom nav fija en Quiz** — los botones de navegación deben estar siempre accesibles
4. **PricingCards en móvil** — quitar el `-mt-4` que causa overlap visual
5. **`ResponsiveContainer` en Recharts** — 5 minutos, gran mejora visual

### Testing recomendado

| Dispositivo | Cómo probarlo |
|-------------|---------------|
| iPhone SE (375px) | DevTools → Device Toolbar |
| iPhone 14 Pro (393px) | DevTools |
| iPad Mini (768px) | DevTools |
| iPad Pro (1024px) | DevTools |
| Móvil real Android | Vite con `--host` + IP local en LAN |
| Móvil real iOS | Igual que arriba (Safari iOS tiene bugs propios de scroll) |

Para servir en LAN:
```bash
npm run dev -- --host
```
Vite imprime una IP `http://192.168.x.x:5173/simulaencaps/` accesible desde tu celular en la misma red.

### Componentes/utilities sugeridos a crear

```tsx
// src/components/layout/MobileBottomBar.tsx — barra fija bottom para Quiz
// src/components/layout/QuestionsDrawer.tsx — drawer lateral con grid 1-100
// src/hooks/useMediaQuery.ts — hook simple para detectar breakpoints en JS
```

---

## 📋 Roadmap general (próximas sesiones)

### Sesión próxima — Responsividad
1. Auditoría visual en móvil/tablet (3 viewports clave)
2. Quiz mobile-first (sticky header + bottom nav + drawer preguntas)
3. Results responsive (NENC adaptativo, accordion tabs, ResponsiveContainer)
4. Landing: arreglar PricingCards `-mt-4` y FooterEncaps a 2/1 columnas
5. Touch targets mínimos 48×48px en todos los CTAs

### Backlog
- [ ] Pasarela de pago (Mercado Pago / Culqi) en lugar de WhatsApp
- [ ] Sistema de testimonios reales con moderación (flag `aprobado` en sheet ya está)
- [ ] PWA: manifest + service worker para instalación en móvil + uso offline del banqueo
- [ ] Modo oscuro (los tokens `navy` ya soportarían un dark mode invertido)
- [ ] Internacionalización: ¿inglés? (probablemente no necesario para el target peruano)
- [ ] A/B testing de copy en landing
- [ ] Analytics (Google Analytics 4 o Plausible)
- [ ] Sentry para error monitoring en producción
- [ ] Cache offline de preguntas con IndexedDB (que el examen siga si se cae internet)
- [ ] Code splitting: el bundle main.js está en 1.1MB — usar `lazy()` para Banqueo, Flashcards, etc.
- [ ] Optimización SEO: meta tags por ruta, sitemap, OpenGraph
- [ ] Página 404 personalizada con tokens del design system

### Decisiones pendientes con el dueño del producto
- [ ] Confirmar precios finales (`src/config/pricing.ts` placeholders S/199 y S/249)
- [ ] Definir número de WhatsApp real (`WHATSAPP_NUMBER` en pricing.ts)
- [ ] Decidir si el banco se mantiene en una hoja única con columna CURSO (mapeo CIS↔Atención Integral, Gestión↔Administración) o se reparte en 5 hojas separadas
- [ ] Convocatoria del próximo ENCAPS — ajustar copy de planes (`Plan ENCAPS 2026`)
- [ ] Agregar logo oficial / favicon definitivo

---

## Despliegue en GitHub Pages

El proyecto incluye GitHub Actions para despliegue automático.

1. Push a `main`
2. Settings → Pages → Source: GitHub Actions
3. URL: `https://canazachyub.github.io/simulaencib/`

> Cuando se renombre el repo, actualizar también `base: '/simulaencaps/'` en `vite.config.ts` y `basename="/simulaencaps"` en `App.tsx`.

---

## Información del ENCAPS

El **Examen Nacional de Competencias para Atención Primaria de Salud (ENCAPS)** evalúa las competencias de profesionales de salud en el contexto de la APS peruana.

### Características oficiales
- 100 preguntas en 3 horas
- 5 alternativas por pregunta
- Sin puntaje negativo
- Escala vigesimal (0–20)
- 5 bloques: Salud Pública, Atención Integral, Ética, Investigación, Administración
- Fórmula de Puntaje Final: `PF = (PPP × 0.3) + (NENC × 0.7)`

---

## Créditos

Desarrollado para la comunidad de profesionales de salud del Perú.

Plataforma: **SimulaENCAPS v2.0.0**

Basado en lineamientos del Ministerio de Salud del Perú (MINSA) para el ENCAPS.

🤖 Asistido por [Claude Code](https://claude.ai/claude-code)
