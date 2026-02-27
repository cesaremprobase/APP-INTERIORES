import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        epoxy: {
          deep: '#0B1120',      // Fondo principal (casi negro azulado)
          surface: '#151E32',   // Fondo de tarjetas/paneles
          primary: '#0ea5e9',   // Azul eléctrico vibrante (Representa resina líquida)
          accent: '#06b6d4',    // Cyan para gradientes
          gold: '#fbbf24',      // Dorado para detalles premium
          glass: 'rgba(255, 255, 255, 0.05)', // Efecto cristal
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #0ea5e9 0deg, #06b6d4 180deg, #0ea5e9 360deg)',
      },
      animation: {
        'flow': 'flow 8s ease infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        flow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
