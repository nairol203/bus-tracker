/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'selector',
	content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		colors: {
			bgLight: 'hsl(var(--bg-light))',
			bg: 'hsl(var(--bg))',
			bgDark: 'hsl(var(--bg-dark))',
			text: 'hsl(var(--text))',
			textMuted: 'hsl(var(--text-muted))',
			border: 'hsl(var(--border))',
			highlight: 'hsl(var(--highlight))',
		},
	},
	plugins: [],
};
