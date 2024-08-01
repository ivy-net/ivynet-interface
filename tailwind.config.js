/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        contentBg: "#111114",
        appBg: "#030303",
        sidebarHoverBg: "#1D1D20",
        sidebarColor: "#707078",
        sidebarIconHighlightColor: "#7E7BF5",
        sidebarTextHighlightColor: "#F1F1F1",
        iconBorderColor: "#484848",
        accent: "#7E7BF5",
        widgetBg: "#18181B",
        widgetHoverBg: "#1D1D20",
        textPrimary: "#D6D6DA",
        textSecondary: "#A1A1A9",
        textGrey: "#484848",
        textWarning: "#FF453B",
        bgButton: "#242427",
      },
      width: {
        sidebarWith: "240px"
      }
    },
  },
  plugins: [],
}

