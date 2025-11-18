import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors - Vibrant & Safe Theme
        brand: {
          dark: '#101820',      // Deep charcoal - Professional & Safe
          yellow: '#FEE715',    // Electric yellow - Energy & Movement
          light: '#FFFFFF',     // Pure white
        },
        // Extended palette for vibrant UI
        primary: {
          50: '#FFFEF0',
          100: '#FFFCD6',
          200: '#FEF9AD',
          300: '#FEF584',
          400: '#FEF15B',
          500: '#FEE715',  // Main brand yellow
          600: '#E5D013',
          700: '#C5B011',
          800: '#A5900E',
          900: '#85700C',
        },
        dark: {
          50: '#6B7280',
          100: '#4B5563',
          200: '#374151',
          300: '#2A3340',
          400: '#1F2937',
          500: '#101820',  // Main brand dark
          600: '#0D1419',
          700: '#0A1013',
          800: '#070C0D',
          900: '#040607',
        },
        // Accent colors for interactions
        accent: {
          blue: '#2563EB',
          green: '#10B981',
          red: '#EF4444',
          orange: '#F97316',
          purple: '#8B5CF6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        arabic: ['var(--font-ibm-plex-arabic)', 'system-ui', 'sans-serif'],
      },
      animation: {
        // Vibrant animations for movement
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-right': 'slideRight 0.4s ease-out',
        'slide-left': 'slideLeft 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'shimmer': 'shimmer 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(254, 231, 21, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(254, 231, 21, 0.8)' },
        },
      },
      boxShadow: {
        'yellow-glow': '0 0 20px rgba(254, 231, 21, 0.3)',
        'yellow-glow-lg': '0 0 40px rgba(254, 231, 21, 0.4)',
        'dark-elevation': '0 10px 40px rgba(16, 24, 32, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #FEE715 0%, #101820 100%)',
        'gradient-yellow': 'linear-gradient(135deg, #FEF15B 0%, #FEE715 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(254, 231, 21, 0.3), transparent)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
};

export default config;
