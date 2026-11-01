import type { Config } from 'tailwindcss';
// Couleurs extraites du logo ASES : bleu nuit, bleu royal, rouge, blanc
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0A1450', 900: '#050B2E', 800: '#0A1450', 700: '#12206E' },
        royal: { DEFAULT: '#1F4FD8', 400: '#4C77EE', 100: '#E6EDFC' },
        ases: { red: '#E3263B' },
      },
      fontFamily: { display: ['var(--font-display)', 'sans-serif'], sans: ['var(--font-body)', 'sans-serif'] },
      backgroundImage: {
        'ases-night': 'radial-gradient(circle at 20% 10%, #1F4FD8 0%, #0A1450 45%, #050B2E 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
