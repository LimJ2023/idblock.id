import tailwindcssAnimate from "tailwindcss-animate";

import type { Config } from "tailwindcss";

const config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF5520",
        secondary: "#050306",
        background: "#F5F5F5",
        toast: {
          text: "#FE4F18",
          background: "#D8F1DB",
        },
      },
    },
    fontFamily: {
      pretendard: ["Pretendard Variable"],
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
