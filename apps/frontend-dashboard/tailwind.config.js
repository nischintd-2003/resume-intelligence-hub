/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          sidebar: '#0f172a', // slate-900
          'sidebar-border': '#1e293b', // slate-800
          'sidebar-hover': '#1e293b', // slate-800
          primary: '#1e293b', // slate-800  (buttons, active states)
          'primary-hover': '#334155', // slate-700
          'primary-ring': '#475569', // slate-600
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
