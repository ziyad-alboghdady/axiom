/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0D4A35",
          secondary: "#1D7A54",
          accent: "#C9A96E",
          success: "#2CA06E",
          danger: "#C0482E",
        },
        surface: {
          card: "#1A3D2B",
          overlay: "#0A2E1F",
        },
        text: {
          primary: "#F5F0E8",
          secondary: "#D9CEB5",
        },
      },
      fontFamily: {
        "dm-sans": ["DMSans_400Regular"],
        "dm-sans-medium": ["DMSans_500Medium"],
        "dm-sans-bold": ["DMSans_700Bold"],
        "dm-serif": ["DMSerifDisplay_400Regular"],
      },
    },
  },
  plugins: [],
};
