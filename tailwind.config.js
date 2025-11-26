/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background, #ffffff)",
        foreground: "var(--color-foreground, #0f172a)",
        "dark-grey": "var(--color-dark-grey, #475569)",
        "light-grey": "var(--color-light-grey, #f3f4f6)",
        primary: "var(--color-primary, #0ea5a4)",
        "primary-foreground": "var(--color-primary-foreground, #ffffff)",
        "teal-accent": "var(--color-teal-accent, #7dd3fc)",
      },
      fontFamily: {
        heading: ["Inter", "ui-sans-serif", "system-ui"],
        paragraph: ["Inter", "ui-sans-serif", "system-ui"],
      },
      maxWidth: { "100rem": "100rem" }
    },
  },
  plugins: [
    // if you use typography (prose) uncomment the next line and run `npm i -D @tailwindcss/typography`
    // require('@tailwindcss/typography')
  ],
};
