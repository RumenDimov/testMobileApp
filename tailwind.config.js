const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        'primary-light': '#EDE9FE',
        surface: '#FFFFFF',
        background: '#FDFBFE',
        'text-primary': '#1E1B1E',
        'text-secondary': '#6B6570',
        correct: '#16A34A',
        incorrect: '#DC4C4C',
        'free-tier': '#7C3AED',
        locked: '#9E9CA6',
        divider: '#E8E5EC',
        'correct-light': '#F0FDF4',
        'incorrect-light': '#FEF2F2',
        'explanation-bg': '#F5F3FA',
      },
      fontFamily: {
        sans: ['System'],
      },
      fontSize: {
        display: ['28px', { lineHeight: '36px', fontWeight: '700' }],
        title: ['22px', { lineHeight: '30px', fontWeight: '600' }],
        heading: ['18px', { lineHeight: '26px', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        caption: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        button: ['16px', { lineHeight: '24px', fontWeight: '600' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      borderRadius: {
        card: '12px',
        button: '8px',
      },
    },
  },
};
