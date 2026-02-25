import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*. {js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: '#000000',
          card: '#0d1117',
          border: '#30363d',
          text: '#00ff41',
          textDim: '#58a6ff',
          highlight: '#ffff00',
          link: '#58a6ff',
          warning: '#ff6b6b',
        },
      },
      fontFamily: {
        mono: ['Courier New', 'Courier', 'monospace'],
      },
      animation: {
        'blink':  'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity:  '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
export default config