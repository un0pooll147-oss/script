/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Noto Serif JP'", "serif"],
        body: ["'Noto Sans JP'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          950: "#0a0a0f",
          900: "#111118",
          800: "#1a1a24",
          700: "#242432",
          600: "#2e2e40",
          400: "#5a5a7a",
          300: "#8888aa",
          200: "#aaaacc",
          100: "#ccccee",
        },
        gold: {
          500: "#c9a84c",
          400: "#d4b96a",
          300: "#e0cc8e",
        },
        crimson: {
          600: "#8b1a1a",
          500: "#c0392b",
          400: "#e74c3c",
        }
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
        "cursor-blink": "blink 1s step-end infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        blink: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0 } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      }
    }
  },
  plugins: []
}
