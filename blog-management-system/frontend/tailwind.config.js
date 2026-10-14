import typography from '@tailwindcss/typography';
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#14202B', soft: '#4A5864', faint: '#7B8791' },
        paper: '#F4F6F7',
        line: '#DCE2E6',
        brand: { DEFAULT: '#2B4FD8', dark: '#1F3BB0', tint: '#E7ECFC' },
        mark: '#F2C94C',
        danger: { DEFAULT: '#B93A2E', tint: '#FBEAE8' },
        ok: { DEFAULT: '#1E7F54', tint: '#E3F4EC' },
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [typography],
};
