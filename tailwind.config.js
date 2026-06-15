/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF6E5", "cream-light": "#FFF4DC", "cream-secondary": "#F5E9D0",
        "text-primary": "#3F3528", "text-secondary": "#7A6A58", "text-muted": "#9B8A76",
        primary: "#6FAF5C", "primary-hover": "#5D9D4B", secondary: "#8FBF68",
        wood: "#6B4F3A", accent: "#F4A261", "accent-magic": "#CFA7FF", ocean: "#4AAEC4", parent: "#B98AE8",
        "island-ink": "#405448", "island-panel": "#FFF9E9", "island-green": "#75A876", "island-deep": "#244F49",
        success: "#5FAE5B", "success-bg": "#E7F5DF", warning: "#F2B84B", "warning-bg": "#FFF2CF",
        danger: "#E66B5B", "danger-bg": "#FFE0DA", border: "#E8D8B8", "border-strong": "#D8C39E",
        ink: "#3F3528",
        panel: "#FFF6E5",
        line: "#E8D8B8",
        mint: "#6FAF5C",
        violet: "#B98AE8",
      },
      fontFamily: { sans: ["Nunito", "sans-serif"], display: ["Baloo 2", "Nunito", "sans-serif"], heading: ["Baloo 2", "sans-serif"], body: ["Nunito", "sans-serif"] },
      borderRadius: { "cozy-sm": "12px", "cozy-md": "18px", "cozy-lg": "24px", "cozy-xl": "32px" },
      boxShadow: {
        panel: "0 4px 12px rgba(63,53,40,.08)",
        "cozy-sm": "0 2px 8px rgba(63, 53, 40, 0.06)",
        "cozy-md": "0 4px 12px rgba(63, 53, 40, 0.08)",
        "cozy-lg": "0 8px 24px rgba(63, 53, 40, 0.10)",
        lift: "0 14px 36px rgba(63,53,40,.16)",
      },
    },
  },
  plugins: [],
};
