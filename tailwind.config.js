/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['System'],
        mono: ['SpaceMono'],
      },
      colors: {
        // Brand Colors
        'acid-green': '#FFEE32',
        'hot-pink': '#ff00ff',
        'safety-orange': '#ff5f00',
        'punch-blue': '#0033ff',
        'off-white': '#f8f8f8',
        
        // Vote Colors
        'vote-red': '#b91c1c',
        'vote-orange': '#FF6B00',
        'vote-ice': '#60A5FA',
        
        // System Colors (iOS-inspired)
        'system-gray': {
          1: '#8e8e93',
          2: '#aeaeb2',
          3: '#c7c7cc',
          4: '#d1d1d6',
          5: '#e5e5ea',
          6: '#f2f2f7',
        },
        'system-bg': '#f2f2f7',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
};
