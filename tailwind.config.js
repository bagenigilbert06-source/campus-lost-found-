/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zetech-primary': '#10b981',     // Emerald Green
        'zetech-secondary': '#059669',   // Deep Green
        'zetech-accent': '#6ee7b7',      // Light Mint
        'zetech-dark': '#064e3b',        // Dark Forest
        'zetech-light': '#f0fdf4'        // Very Light Green
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      }
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          'primary': '#10b981',      // Emerald Green
          'secondary': '#059669',    // Deep Green
          'accent': '#6ee7b7',       // Light Mint
          'neutral': '#064e3b',      // Dark Forest
          'base-100': '#ffffff',     // White background
          'base-200': '#f0fdf4',     // Very Light Green
          'base-300': '#e0f2fe',     // Light background
          'success': '#10b981',      // Emerald (primary)
          'warning': '#f59e0b',      // Amber
          'error': '#ef4444',        // Red
          'info': '#06b6d4',         // Cyan
        }
      }
    ]
  },
  plugins: [
    require('daisyui'),
  ],
}

