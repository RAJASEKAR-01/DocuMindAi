/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#B6FF3B", // electric lime/green
          dark: "#92E620",
          light: "#D4FF8A",
        },
        ink: {
          DEFAULT: "#0A0A0A",
          soft: "#1A1A1A",
          muted: "#4A4A4A",
        },
        paper: {
          DEFAULT: "#FFFFFF",
          soft: "#F5F5F5",
          border: "#E5E5E5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        accent: "0 0 0 3px rgba(182, 255, 59, 0.35)",
      },
    },
  },
  plugins: [],
};
