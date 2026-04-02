/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#003366',
        'primary-2': '#00509e',
        'primary-light': '#e6f2ff',
        accent: '#ff6b35',
        'accent-light': '#ffe6d9',
        success: '#10b981',
        danger: '#ef4444',
        bg: '#f4f7fc',
        card: '#fff',
        muted: '#6b7280',
        'muted-light': '#9ca3af',
      },
      borderRadius: {
        base: '12px',
        lg: '16px',
      },
      boxShadow: {
        base: '0 8px 28px rgba(15, 23, 42, 0.08)',
        lg: '0 12px 40px rgba(15, 23, 42, 0.12)',
        hover: '0 16px 48px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
}
