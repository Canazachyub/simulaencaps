/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Safelist para colores dinamicos (opciones A-E + clases dinamicas de bloque)
  safelist: [
    // Opciones A-E (legado)
    'bg-blue-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-200',
    'text-white',
    // Clases generadas dinamicamente desde props de bloque (SimulaENCAPS)
    'bg-teal-500',
    'bg-teal-600',
    'bg-amber-500',
    'bg-amber-600',
    'bg-navy-500',
    'bg-navy-600',
    'text-teal-500',
    'text-amber-500',
    'text-navy-500',
    'text-navy-700',
    'border-teal-500',
    'border-amber-500',
    'border-navy-500',
  ],
  theme: {
    extend: {
      colors: {
        // ===== PALETA SimulaENCAPS =====
        navy: {
          50:  '#EAEDF5',
          100: '#C6CDE0',
          200: '#8E9BC0',
          300: '#5567A0',
          400: '#2D3E7A',
          500: '#16264D', // base
          600: '#121F40',
          700: '#0E1833',
          800: '#0A1226',
          900: '#060B19',
        },
        teal: {
          50:  '#E0F7F4',
          100: '#B3EAE3',
          200: '#80DCD0',
          300: '#4DCEBD',
          400: '#26C3AE',
          500: '#00A99D', // base
          600: '#009488',
          700: '#007F73',
          800: '#00695E',
          900: '#004A42',
        },
        amber: {
          50:  '#FFF8DD',
          100: '#FFEFB0',
          200: '#FFE680',
          300: '#FFDC50',
          400: '#FFD42E',
          500: '#F5C518', // base
          600: '#D9AC0E',
          700: '#B89106',
          800: '#967600',
          900: '#6B5300',
        },
        neutral: {
          bg:       '#F2F3F5',
          surface:  '#FFFFFF',
          border:   '#E2E5EA',
          muted:    '#A0A6B0',
          text:     '#16264D',
          textSoft: '#3D4B6E',
        },
        // ===== Aliases de compatibilidad =====
        primary: {
          50:  '#EAEDF5',
          100: '#C6CDE0',
          200: '#8E9BC0',
          300: '#5567A0',
          400: '#2D3E7A',
          500: '#16264D',
          600: '#121F40',
          700: '#0E1833',
          800: '#0A1226',
          900: '#060B19',
        },
        success: {
          50:  '#E0F7F4',
          500: '#00A99D',
          600: '#009488',
        },
        error: {
          50:  '#FEF2F2',
          500: '#DC2626',
          600: '#B91C1C',
        },
      },
      fontFamily: {
        display: ['Montserrat', 'Poppins', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'Open Sans', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'Open Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '3xl': '3.75rem',
        'hero': ['5rem', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        md:   '14px',
        lg:   '20px',
        xl:   '28px',
        pill: '999px',
      },
      boxShadow: {
        card:      '0 6px 18px rgba(22,38,77,0.08)',
        cardHover: '0 12px 28px rgba(22,38,77,0.14)',
        pill:      '0 3px 10px rgba(22,38,77,0.10)',
        glow:      '0 0 0 4px rgba(0,169,157,0.25)',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce:   'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'fade-in':         'fadeIn 0.3s ease-out',
        'slide-up':        'slideUp 0.4s ease-out',
        'pulse-slow':      'pulse 3s infinite',
        'float':           'float 3s ease-in-out infinite',
        'underline-grow':  'underlineGrow 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        underlineGrow: {
          '0%':   { transform: 'scaleX(0)', transformOrigin: 'left center' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left center' },
        },
      },
    },
  },
  plugins: [],
}
