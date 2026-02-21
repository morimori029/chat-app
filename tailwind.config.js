/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          main: "#1e1e2e",
          sidebar: "#2a2a3e",
          input: "#252536",
          bubble: "#3a3a4e",
        },
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        pulse: "pulse 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
