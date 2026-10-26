import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class', // Enables class-based dark mode switching
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
      // Custom animations for micro-interactions
      animation: {
        'heart-pop': 'heart-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        'heart-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      // Customizing the ReactMarkdown prose styling globally
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme('colors.brand.DEFAULT'),
              textDecoration: 'none',
              '&:hover': {
                color: theme('colors.brand.dark'),
                textDecoration: 'underline',
              },
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.sans').join(', '),
              letterSpacing: '-0.025em',
            },
            p: {
              fontFamily: theme('fontFamily.serif').join(', '),
              lineHeight: '1.8',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};