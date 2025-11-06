import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        pongYellow: '#f7da62',
        pongOrange: '#fdb048',
        pongTangarine: '#eb8958',
        pongWhite: '#f2f2f0',
        pongBrown: '#61544b',
        pongGray: '#303030',
        pongBlack: '#252525',
      },
    },
  },
  plugins: [],
};

export default config;
