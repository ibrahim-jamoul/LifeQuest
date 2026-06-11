/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080b12",
        panel: "#10151f",
        line: "#202938",
        mint: "#65e6a6",
        violet: "#8b7cf6",
      },
      boxShadow: { panel: "0 16px 50px rgba(0,0,0,.24)" },
    },
  },
  plugins: [],
};
