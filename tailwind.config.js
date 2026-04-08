/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#1a5c3a',
          'green-dark': '#0d3d28',
          'green-light': '#2a7a50',
          'green-muted': '#e8f2ec',
          gold: '#c9a84c',
          'gold-dark': '#a88835',
          'gold-light': '#e8c96e',
          cream: '#f5ede0',
          'cream-light': '#faf6ef',
          'cream-dark': '#e8dcc8',
          'cream-border': '#d4c5a9',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
