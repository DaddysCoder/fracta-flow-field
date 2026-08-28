/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#FAFAF9',
        surface: '#F5F4F1',
        ink: '#18181B',
        'ink-soft': '#33322E',
        secondary: '#6B6B70',
        muted: '#57554F',
        tertiary: '#A3A19C',
        border: '#E7E5E2',
        'border-soft': '#ECEAE6',
        accent: '#1B6E5C',
        'accent-hover': '#154F41',
        'accent-tint': '#D9EAE4',
        success: '#5FD9AE',
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        'card-lg': '16px',
        btn: '8px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(24,24,27,0.04), 0 6px 16px rgba(24,24,27,0.05)',
        mech: '0 4px 14px rgba(27,110,92,0.08)',
      },
      transitionTimingFunction: {
        overshoot: 'cubic-bezier(0.34,1.56,0.64,1)',
      },
    },
  },
  plugins: [],
};
