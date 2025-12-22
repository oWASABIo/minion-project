/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        // Dynamic color injected by PageRenderer
        primary: "var(--accent)",
      },
      fontFamily: {
        sans: ["var(--font-primary)", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        wiggle: "wiggle 3s ease-in-out infinite",
        breathe: "breathe 4s ease-in-out infinite",
        "bounce-slow": "bounce 3s infinite",
      },
    },
  },
  plugins: [],
};
