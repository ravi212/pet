import designTokens from '../design-tokens.json';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: designTokens.colors.primary.light,
          light: designTokens.colors.primary.light,
          dark: designTokens.colors.primary.dark,
        },
        secondary: {
          DEFAULT: designTokens.colors.secondary.light,
          light: designTokens.colors.secondary.light,
          dark: designTokens.colors.secondary.dark,
        },
        accent: {
          DEFAULT: designTokens.colors.accent.light,
          light: designTokens.colors.accent.light,
          dark: designTokens.colors.accent.dark,
        },
        danger: {
          DEFAULT: designTokens.colors.danger.light,
          light: designTokens.colors.danger.light,
          dark: designTokens.colors.danger.dark,
        },
        warning: {
          DEFAULT: designTokens.colors.warning.light,
          light: designTokens.colors.warning.light,
          dark: designTokens.colors.warning.dark,
        },
        success: {
          DEFAULT: designTokens.colors.success.light,
          light: designTokens.colors.success.light,
          dark: designTokens.colors.success.dark,
        },
        info: {
          DEFAULT: designTokens.colors.info.light,
          light: designTokens.colors.info.light,
          dark: designTokens.colors.info.dark,
        },
        gray: designTokens.colors.light,
      },
      fontFamily: {
        sans: designTokens.typography.fontFamily,
      },
      fontSize: designTokens.typography.fontSize,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.shadows,
      transitionDuration: {
        fast: designTokens.transitions.fast,
        base: designTokens.transitions.base,
        slow: designTokens.transitions.slow,
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(120%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      slideUp: {
        '0%': {
          transform: 'translateY(16px)',
          opacity: '0',
        },
        '100%': {
          transform: 'translateY(0)',
          opacity: '1',
        },
      },
      animation: {
        'slide-in': 'slideIn 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
