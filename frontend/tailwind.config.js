/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        foreground: 'var(--color-fg)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        card: 'var(--color-card)',
        cardBorder: 'var(--color-card-border)',
        success: 'var(--color-success)',
        error: 'var(--color-error)'
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
