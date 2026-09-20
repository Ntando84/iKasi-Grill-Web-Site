import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: "#171310",
        "charcoal-soft": "#221b16",
        "charcoal-deep": "#0d0a08",
        cream: "#f6ead9",
        ash: "#a99686",
        ember: "#e8792f",
        chilli: "#d8432f",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
