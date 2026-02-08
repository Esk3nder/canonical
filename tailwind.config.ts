import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			/* Semantic tokens (CSS variable driven) */
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))',
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))',
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))',
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))',
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))',
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))',
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))',
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))',
  			},
  			danger: {
  				DEFAULT: 'hsl(var(--danger))',
  				foreground: 'hsl(var(--danger-foreground))',
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))',
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))',
  			},

  			/* Turquoise scale (CSS variable driven) */
  			turquoise: {
  				100: 'hsl(var(--turquoise-100))',
  				200: 'hsl(var(--turquoise-200))',
  				400: 'hsl(var(--turquoise-400))',
  				500: 'hsl(var(--turquoise-500))',
  				600: 'hsl(var(--turquoise-600))',
  				700: 'hsl(var(--turquoise-700))',
  				800: 'hsl(var(--turquoise-800))',
  				DEFAULT: '#20808D',
  			},

  			/* Named brand colors (static hex) */
  			offblack: '#091717',
  			'off-white': '#FAF9F6',
  			'inky-blue': '#13343B',
  			peacock: '#2E565E',
  			'plex-blue': '#1FB8CD',
  			sky: '#BADEDD',
  			'warm-red': '#BF505C',
  			'terra-cotta': '#A84B2F',
  			apricot: '#FFD2A6',
  			olive: '#707C36',
  			'focus-peach': '#F5C1A9',

  			/* Search flow colors (CSS variable driven) */
  			search: {
  				query: 'hsl(var(--search-query))',
  				answer: 'hsl(var(--search-answer))',
  				source: 'hsl(var(--search-source))',
  				result: 'hsl(var(--search-result))',
  			},
  		},

  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: '1rem',
  			'2xl': '1.25rem',
  		},

  		fontSize: {
  			'display-xl': ['60px', { lineHeight: '65px', letterSpacing: '-3.5px' }],
  			'display-lg': ['40px', { lineHeight: '42px', letterSpacing: '-2.5px' }],
  			'heading-2': ['30px', { lineHeight: '36px', letterSpacing: '-1.5px' }],
  			'heading-3': ['24px', { lineHeight: '32px', letterSpacing: '-0.5px' }],
  			'heading-4': ['20px', { lineHeight: '28px', letterSpacing: '-0.3px' }],
  			'body-lg': ['18px', { lineHeight: '28px' }],
  			ui: ['14px', { lineHeight: '19px' }],
  			caption: ['13px', { lineHeight: '18px' }],
  			badge: ['11px', { lineHeight: '16px', letterSpacing: '0.2px' }],
  		},

  		boxShadow: {
  			xs: '0 1px 2px rgba(0,0,0,0.05)',
  			sm: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
  			md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  			lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  			xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
  			'focus-peach': '0 0 0 2px rgba(245, 193, 169, 0.2)',
  			'focus-cyan': '0 0 0 2px rgba(32, 184, 205, 0.3)',
  			'dark-sm': '0 2px 8px rgba(0,0,0,0.3)',
  			'dark-md': '0 4px 12px rgba(0,0,0,0.4)',
  			'dark-lg': '0 16px 48px rgba(0,0,0,0.5)',
  		},

  		maxWidth: {
  			thread: '42rem',
  			search: '550px',
  			content: '768px',
  			'container-md': '960px',
  			'container-lg': '1200px',
  			'container-xl': '1440px',
  		},

  		spacing: {
  			sidebar: '260px',
  			'sidebar-collapsed': '60px',
  			'search-width': '550px',
  			'thread-max': '42rem',
  		},

  		transitionTimingFunction: {
  			DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  			in: 'cubic-bezier(0.4, 0, 1, 1)',
  			out: 'cubic-bezier(0, 0, 0.2, 1)',
  			spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  		},

  		transitionDuration: {
  			fast: '100ms',
  			DEFAULT: '150ms',
  			medium: '200ms',
  			slow: '300ms',
  			spring: '500ms',
  		},

  		keyframes: {
  			modalIn: {
  				'0%': { opacity: '0', transform: 'scale(0.95)' },
  				'100%': { opacity: '1', transform: 'scale(1)' },
  			},
  			modalOut: {
  				'0%': { opacity: '1', transform: 'scale(1)' },
  				'100%': { opacity: '0', transform: 'scale(0.95)' },
  			},
  			backdropIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			backdropOut: {
  				'0%': { opacity: '1' },
  				'100%': { opacity: '0' },
  			},
  			pulseLive: {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.5' },
  			},
  			'fade-in': {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			'slide-up': {
  				'0%': { opacity: '0', transform: 'translateY(8px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  			shimmer: {
  				'0%': { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' },
  			},
  		},

  		animation: {
  			'modal-in': 'modalIn 200ms ease-out forwards',
  			'modal-out': 'modalOut 150ms ease-in forwards',
  			'backdrop-in': 'backdropIn 200ms ease-out forwards',
  			'backdrop-out': 'backdropOut 150ms ease-in forwards',
  			'pulse-live': 'pulseLive 2s ease-in-out infinite',
  			'fade-in': 'fade-in 150ms ease-out',
  			'slide-up': 'slide-up 200ms ease-out',
  			shimmer: 'shimmer 2s infinite linear',
  		},
  	},
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
