import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Add xs breakpoint; keep all Tailwind defaults (sm=640, md=768, lg=1024…)
      screens: {
        xs: '360px',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        arabic: ["Cairo", "Arial", "sans-serif"],
      },
      colors: {
        // Core design system tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--bg))",
        foreground: "hsl(var(--fg))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-fg))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-fg))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-fg))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-fg))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-fg))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-fg))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-fg))",
        },
        
        // Pharaonic heritage colors (preserved for brand consistency)
        'pharaoh-gold': 'hsl(var(--pharaoh-gold))',
        'hieroglyph-stone': 'hsl(var(--hieroglyph-stone))',
        'oasis-blue': 'hsl(var(--oasis-blue))',
        'pyramid-limestone': 'hsl(var(--pyramid-limestone))',
        'lapis-blue': {
          DEFAULT: '#1E3A8A',
          50: '#EBF0FF',
          100: '#D6E2FF',
          200: '#B3CCFF',
          300: '#80B0FF',
          400: '#4D8AFF',
          500: '#1E3A8A',
          600: '#1A3078',
          700: '#152666',
          800: '#111C54',
          900: '#0D1342',
        },
        'nile-teal': {
          DEFAULT: '#0E7490',
          50: '#E6F7F9',
          100: '#CCF0F3',
          200: '#99E1E7',
          300: '#66D2DB',
          400: '#33C3CF',
          500: '#0E7490',
          600: '#0B5D73',
          700: '#084656',
          800: '#062F39',
          900: '#03171C',
        },
        'desert-sand': {
          DEFAULT: '#EBD5A7',
          50: '#FEFCF7',
          100: '#FDF9EF',
          200: '#F8F0D7',
          300: '#F3E7BF',
          400: '#EFDEA7',
          500: '#EBD5A7',
          600: '#E0C68A',
          700: '#D5B76D',
          800: '#CAA850',
          900: '#BF9933',
        },
        'royal-gold': {
          DEFAULT: '#CBA135',
          50: '#FBF8ED',
          100: '#F7F1DB',
          200: '#EFE3B7',
          300: '#E7D593',
          400: '#DFC76F',
          500: '#CBA135',
          600: '#B8912F',
          700: '#A58129',
          800: '#927123',
          900: '#7F611D',
        },
        'obsidian': {
          DEFAULT: '#0E0E10',
          50: '#F7F7F8',
          100: '#EFEFEF',
          200: '#DFDFDF',
          300: '#CFCFCF',
          400: '#BFBFBF',
          500: '#9F9F9F',
          600: '#7F7F7F',
          700: '#5F5F5F',
          800: '#3F3F3F',
          900: '#0E0E10',
        },
      },
      fontWeight: {
        'display': '700',
        'display-bold': '800',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'temple': '16px',
        'pyramid': '24px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pyramid-glow": "pyramid-glow 3s ease-in-out infinite alternate",
        "papyrus-shimmer": "papyrus-shimmer 2s ease-in-out infinite",
        "nefertiti-draw": "nefertiti-draw 1.2s ease-out forwards",
        "sun-arc": "sun-arc 20s linear infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pyramid-glow": {
          "0%": { boxShadow: "0 0 20px rgba(203, 161, 53, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(203, 161, 53, 0.6)" },
        },
        "papyrus-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "nefertiti-draw": {
          "0%": { strokeDasharray: "0 1000" },
          "100%": { strokeDasharray: "1000 0" },
        },
        "sun-arc": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      backgroundImage: {
        'papyrus-texture': `linear-gradient(45deg, 
          transparent 25%, 
          rgba(235, 213, 167, 0.1) 25%, 
          rgba(235, 213, 167, 0.1) 50%, 
          transparent 50%, 
          transparent 75%, 
          rgba(235, 213, 167, 0.1) 75%)`,
        'pyramid-gradient': 'linear-gradient(135deg, #CBA135 0%, #A58129 50%, #7F611D 100%)',
        'nile-gradient': 'linear-gradient(135deg, #0E7490 0%, #0B5D73 50%, #084656 100%)',
        'desert-gradient': 'linear-gradient(135deg, #EBD5A7 0%, #E0C68A 50%, #D5B76D 100%)',
      },
      boxShadow: {
        'pyramid': '0 4px 20px rgba(203, 161, 53, 0.15)',
        'pyramid-lg': '0 8px 40px rgba(203, 161, 53, 0.2)',
        'nile': '0 4px 20px rgba(14, 116, 144, 0.15)',
        'temple': '0 2px 10px rgba(14, 14, 16, 0.1)',
        'assistant': '0 2px 8px rgba(99, 102, 241, 0.1)',
        'message': '0 1px 4px rgba(0, 0, 0, 0.05)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: '#1E3A8A',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            code: {
              color: '#DC2626',
              backgroundColor: '#F3F4F6',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
      scrollbar: {
        'thin': {
          size: '4px',
        },
        'thumb': {
          'gray-300': '#D1D5DB',
          'gray-600': '#4B5563',
        },
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    // Safe-area inset utilities (iOS notch / home indicator)
    function({ addUtilities }: any) {
      addUtilities({
        '.pb-safe': { paddingBottom: 'env(safe-area-inset-bottom, 0px)' },
        '.pt-safe': { paddingTop:    'env(safe-area-inset-top, 0px)'    },
        '.pl-safe': { paddingLeft:   'env(safe-area-inset-left, 0px)'   },
        '.pr-safe': { paddingRight:  'env(safe-area-inset-right, 0px)'  },
        '.mb-safe': { marginBottom:  'env(safe-area-inset-bottom, 0px)' },
        '.mt-safe': { marginTop:     'env(safe-area-inset-top, 0px)'    },
      });
    },
    // Custom scrollbar utilities
    function({ addUtilities }: any) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '4px',
            height: '4px',
          },
        },
        '.scrollbar-thumb-gray-300': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#D1D5DB',
            borderRadius: '2px',
          },
        },
        '.scrollbar-thumb-gray-600': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#4B5563',
            borderRadius: '2px',
          },
        },
        '.line-clamp-2': {
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
        '.line-clamp-3': {
          display: '-webkit-box',
          '-webkit-line-clamp': '3',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;
