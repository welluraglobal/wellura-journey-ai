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
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				md: '2rem',
			},
			screens: {
				'xs': '375px',
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			screens: {
				'xs': '375px',
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px',
				'iphone-se': '320px',
				'iphone-xr': '414px',
				'iphone-12': '390px',
				'iphone-13': '428px',
				'pixel': '393px',
				'samsung-s8': '360px',
				'samsung-s20': '412px',
				'ipad-mini': '768px',
				'ipad-pro': '1024px',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
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
				wellura: {
					50: '#F5F3FF',
					100: '#EDE9FE',
					200: '#DDD6FE',
					300: '#C4B5FD',
					400: '#6E59A5',
					500: '#5B46A2',
					600: '#4C3899',
					700: '#3C2A80',
					800: '#2C1C66',
					900: '#1A1F2C',
				},
			},
			backgroundImage: {
				'gradient-wellura': 'linear-gradient(135deg, #5B46A2 0%, #1976D2 100%)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'pulse-slow': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.8'
					}
				},
				'slide-in-from-bottom': {
					'0%': {
						transform: 'translateY(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'slide-out-to-bottom': {
					'0%': {
						transform: 'translateY(0)',
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(100%)',
						opacity: '0'
					}
				},
				'slide-in-from-top': {
					'0%': {
						transform: 'translateY(-100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'zoom-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'pulse-slow': 'pulse-slow 3s infinite',
				'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
				'slide-out-to-bottom': 'slide-out-to-bottom 0.3s ease-out',
				'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
				'zoom-in': 'zoom-in 0.2s ease-out',
			},
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }) {
			const newUtilities = {
				'.pt-safe': {
					paddingTop: 'env(safe-area-inset-top)'
				},
				'.pr-safe': {
					paddingRight: 'env(safe-area-inset-right)'
				},
				'.pb-safe': {
					paddingBottom: 'env(safe-area-inset-bottom)'
				},
				'.pl-safe': {
					paddingLeft: 'env(safe-area-inset-left)'
				},
				'.ios-device .fixed-ios-bottom': {
					paddingBottom: 'env(safe-area-inset-bottom)',
					marginBottom: 'env(safe-area-inset-bottom)'
				},
				'.swipe-container': {
					overscrollBehavior: 'contain',
					WebkitOverflowScrolling: 'touch'
				},
				'.no-tap-highlight': {
					WebkitTapHighlightColor: 'transparent'
				},
			};
			addUtilities(newUtilities);
		}
	],
} satisfies Config;
