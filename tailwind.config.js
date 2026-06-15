/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#3F3528",
        panel: "#FFF6E5",
        line: "#E8D8B8",
        mint: "#6FAF5C",
        violet: "#B98AE8",
      },
      fontFamily: { sans: ["Nunito", "sans-serif"], display: ["Baloo 2", "Nunito", "sans-serif"] },
      boxShadow: { panel: "0 4px 12px rgba(63,53,40,.08)" },
    },
  },
  plugins: [],
};
