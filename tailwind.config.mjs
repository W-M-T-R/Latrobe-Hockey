/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        wildcat: {
          orange: '#F26522',
          'orange-dark': '#D14E12',
          'orange-light': '#FF8A4C',
          black: '#0E0E10',
          ink: '#1A1A1F',
          ice: '#E8F4FF',
          'ice-blue': '#7DD3FC',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Oswald"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 4px rgba(242, 101, 34, 0.25), 0 10px 30px rgba(242, 101, 34, 0.35)',
      },
      backgroundImage: {
        'ice-grain': "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
