import type { Config } from "tailwindcss";

export default {
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
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#b0391f', // coral-700
					foreground: '#ffffff'
				},
				secondary: {
					DEFAULT: '#597393', // navy-600
					foreground: '#ffffff'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Chart colors for data visualization
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				// Refined sage palette - growth, harmony, natural balance
				sage: {
					50: '#f8faf8',
					100: '#f0f4f0',
					200: '#e2ebe2',
					300: '#c9d8c9',
					400: '#a8c0a8',
					500: '#82a182',
					600: '#5f8260',
					700: '#4a6b4b',
					800: '#3a543b',
					900: '#2d412e'
				},
				// Primary coral palette - warmth, care, human connection
				coral: {
					50: '#fef7f4',
					100: '#fdeee8',
					200: '#fad9cd',
					300: '#f5bba8',
					400: '#ee9176',
					500: '#e36749',
					600: '#d04a29',
					700: '#b0391f',
					800: '#91321e',
					900: '#772e1f'
				},
				// Secondary navy palette - trust, professionalism, stability
				navy: {
					50: '#f7f8fa',
					100: '#eef1f5',
					200: '#d9e0e8',
					300: '#b8c7d4',
					400: '#91a7bc',
					500: '#718ba6',
					600: '#597393',
					700: '#495e78',
					800: '#3e4f64',
					900: '#364354'
				},
				// Terracotta palette - warmth, earthiness, organic connection
				terracotta: {
					50: '#fdf8f6',
					100: '#f9f0ed',
					200: '#f2e0d9',
					300: '#e8c8bc',
					400: '#d9a894',
					500: '#c88a6c',
					600: '#b06d4e',
					700: '#95573d',
					800: '#7a4632',
					900: '#633a2a'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontSize: {
				'xxs': '0.625rem',
				'6xl': '3.75rem',
				'7xl': '4.5rem',
				'8xl': '6rem',
				'9xl': '8rem'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif']
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
