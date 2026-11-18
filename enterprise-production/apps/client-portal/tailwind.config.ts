import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Royal Cinema ERP Rich Orange Brand Palette (No Navy Blue)
        richOrange: '#F97316',
        deepOrange: '#EA580C',
        burntOrange: '#C2410C',
        warmCream: '#FFF7ED',
        white: '#FFFFFF',
        darkBrown: '#24170F',

        // Semantic bindings
        primary: {
          DEFAULT: '#EA580C', // Deep Orange
          hover: '#C2410C',   // Burnt Orange
          light: '#F97316',   // Rich Orange
          cream: '#FFF7ED',   // Warm Cream
        },
        surface: '#FFFFFF',
        background: '#FFF7ED',
        text: {
          main: '#24170F',    // Dark Brown
          muted: '#806B5B',   // Warm Muted Brown
        },
        border: '#F1E4D8',    // Soft Warm Border
        danger: '#DC6262',
        success: '#398765',
      },
      borderRadius: {
        DEFAULT: '12px',
        md: '10px',
        lg: '12px',
        xl: '14px',
        '2xl': '18px',
        '3xl': '22px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 4px 14px rgba(154, 52, 18, 0.05)',
        orange: '0 9px 22px rgba(234, 88, 12, 0.28)',
      },
    },
  },
  plugins: [],
};

export default config;
