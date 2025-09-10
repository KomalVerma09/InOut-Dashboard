/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: "500px", // 👈 custom breakpoint
        xxs: "388px",
      },
      // fontFamily: {
      //   'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      // },
      // animation: {
      //   'float': 'float 3s ease-in-out infinite',
      //   'pulse-blue': 'pulse-blue 2s ease-in-out infinite',
      //   'gradient-shift': 'gradient-shift 4s ease infinite',
      //   'shimmer': 'shimmer 2s infinite',
      //   'bounce-slow': 'bounce 2s infinite',
      //   'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      // },
      // keyframes: {
      //   float: {
      //     '0%, 100%': { transform: 'translateY(0px)' },
      //     '50%': { transform: 'translateY(-8px)' },
      //   },
      //   'pulse-blue': {
      //     '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
      //     '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' },
      //   },
      //   'gradient-shift': {
      //     '0%': { backgroundPosition: '0% 50%' },
      //     '50%': { backgroundPosition: '100% 50%' },
      //     '100%': { backgroundPosition: '0% 50%' },
      //   },
      //   shimmer: {
      //     '0%': { transform: 'translateX(-100%)' },
      //     '100%': { transform: 'translateX(100%)' },
      //   },
      // },
      // backdropBlur: {
      //   'xs': '2px',
      // },
      // backgroundImage: {
      //   'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      //   'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      //   'gradient-orion': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
      //   'gradient-orion-light': 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
      // },
      // boxShadow: {
      //   'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      //   'orion': '0 0 20px rgba(59, 130, 246, 0.4)',
      //   'orion-lg': '0 0 40px rgba(59, 130, 246, 0.3)',
      //   'mobile': '0 4px 20px rgba(0, 0, 0, 0.1)',
      //   'mobile-lg': '0 8px 30px rgba(0, 0, 0, 0.15)',
      // },
      // colors: {
      //   'glass': 'rgba(255, 255, 255, 0.1)',
      //   'orion': {
      //     50: '#eff6ff',
      //     100: '#dbeafe',
      //     200: '#bfdbfe',
      //     300: '#93c5fd',
      //     400: '#60a5fa',
      //     500: '#3b82f6',
      //     600: '#2563eb',
      //     700: '#1d4ed8',
      //     800: '#1e40af',
      //     900: '#1e3a8a',
      //   },
      // },
      // spacing: {
      //   '18': '4.5rem',
      //   '88': '22rem',
      //   '128': '32rem',
      // },
      // borderRadius: {
      //   '4xl': '2rem',
      //   '5xl': '2.5rem',
      // },
      // fontSize: {
      //   '2xs': '0.625rem',
      // },
      // zIndex: {
      //   '60': '60',
      //   '70': '70',
      //   '80': '80',
      //   '90': '90',
      //   '100': '100',
      // },
    },
  },
  plugins: [],
};