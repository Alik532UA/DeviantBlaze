/**
 * Icons library containing both Classic Minimalist and Gothic Rock versions
 */

export const ICONS = {
	classic: {
		gallery: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<rect x="3" y="3" width="18" height="18" rx="3" ry="3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				<circle cx="8.5" cy="8.5" r="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
				<polyline points="21 15 16 10 5 21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
			`
		},
		theme_dark: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
			`
		},
		theme_light: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/>
				<line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
				<line x1="12" y1="20" x2="12" y2="22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
				<line x1="4.93" y1="4.93" x2="6.34" y2="6.34" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
				<line x1="17.66" y1="17.66" x2="19.07" y2="19.07" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
				<line x1="2" y1="12" x2="4" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
				<line x1="20" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
				<line x1="4.93" y1="19.07" x2="6.34" y2="17.66" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
				<line x1="17.66" y1="6.34" x2="19.07" y2="4.93" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
			`
		},
		style_toggle: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<path d="M12 3c0 4.5-3.5 8-8 8 4.5 0 8 3.5 8 8 0-4.5 3.5-8 8-8-4.5 0-8-3.5-8-8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
			`
		},
		instagram: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				<circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.8"/>
				<circle cx="17.5" cy="6.5" r="1.1" fill="currentColor"/>
			`
		},
		message: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
			`
		},
		ytm: {
			viewBox: '0 0 24 24',
			type: 'fill',
			svg: `
				<path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z" fill="currentColor"/>
			`
		},
		spotify: {
			viewBox: '0 0 24 24',
			type: 'fill',
			svg: `
				<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" fill="currentColor"/>
			`
		},
		apple: {
			viewBox: '0 0 384 512',
			type: 'fill',
			svg: `
				<path d="M381.9 388.2c-6.4 27.4-27.2 42.8-55.1 48-24.5 4.5-44.9 5.6-64.5-10.2-23.9-20.1-24.2-53.4-2.7-74.4 17-16.2 40.9-19.5 76.8-25.8 6-1.1 11.2-2.5 15.6-7.4 6.4-7.2 4.4-4.1 4.4-163.2 0-11.2-5.5-14.3-17-12.3-8.2 1.4-185.7 34.6-185.7 34.6-10.2 2.2-13.4 5.2-13.4 16.7 0 234.7 1.1 223.9-2.5 239.5-4.2 18.2-15.4 31.9-30.2 39.5-16.8 9.3-47.2 13.4-63.4 10.4-43.2-8.1-58.4-58-29.1-86.6 17-16.2 40.9-19.5 76.8-25.8 6-1.1 11.2-2.5 15.6-7.4 10.1-11.5 1.8-256.6 5.2-270.2 .8-5.2 3-9.6 7.1-12.9 4.2-3.5 11.8-5.5 13.4-5.5 204-38.2 228.9-43.1 232.4-43.1 11.5-.8 18.1 6 18.1 17.6 .2 344.5 1.1 326-1.8 338.5z" fill="currentColor"/>
			`
		},
		gallery_close: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
				<line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
			`
		},
		gallery_prev: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
			`
		},
		gallery_next: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
			`
		},
		visualizer: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<path d="M12 2v20M17 6v12M7 6v12M22 10v4M2 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
			`
		},
		piano: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
				<path d="M6 4v8h2V4M10 4v8h1V4M14 4v8h2V4M18 4v8h1V4" fill="currentColor" stroke="currentColor" stroke-width="1.5"/>
				<line x1="6" y1="12" x2="6" y2="20" stroke="currentColor" stroke-width="1"/>
				<line x1="10" y1="12" x2="10" y2="20" stroke="currentColor" stroke-width="1"/>
				<line x1="14" y1="12" x2="14" y2="20" stroke="currentColor" stroke-width="1"/>
				<line x1="18" y1="12" x2="18" y2="20" stroke="currentColor" stroke-width="1"/>
			`
		},
		fullscreen: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
			`
		},
		fullscreen_exit: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<path d="M4 14h6v6m10-10h-6V4m0 6 7-7M10 14l-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
			`
		},
		order_site: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
			`
		},
		lang: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/>
				<path d="M3.6 9h16.8M3.6 15h16.8" fill="none" stroke="currentColor" stroke-width="1.8"/>
				<path d="M12 3a14 14 0 0 0 0 18 14 14 0 0 0 0-18Z" fill="none" stroke="currentColor" stroke-width="1.8"/>
			`
		},
		mic: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
			`
		},
		speakers: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9.5 9.5 0 0 1 0 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
			`
		},
		palette: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				<circle cx="13.5" cy="6.5" r="1.2" fill="currentColor"/>
				<circle cx="17.5" cy="10.5" r="1.2" fill="currentColor"/>
				<circle cx="8.5" cy="7.5" r="1.2" fill="currentColor"/>
				<circle cx="6.5" cy="12.5" r="1.2" fill="currentColor"/>
			`
		},
		settings: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/>
			`
		},
		close: {
			viewBox: '0 0 24 24',
			type: 'stroke',
			svg: `
				<line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
				<line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
			`
		}
	},

	gothic: {
		// 1. Gallery: Thorn-framed gothic aperture with barbed corner spires and cyber-thorn flourishes
		gallery: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Outer Barbed Spikes on 4 corners -->
				<path d="M50 8 L54 20 L66 14 L58 24 L76 24 L64 32 L86 36 L70 42 L92 50 L70 58 L86 64 L64 68 L76 76 L58 76 L66 86 L54 80 L50 92 L46 80 L34 86 L42 76 L24 76 L36 68 L14 64 L30 58 L8 50 L30 42 L14 36 L36 32 L24 24 L42 24 L34 14 L46 20 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="miter"/>
				<!-- Inner Spiked Frame -->
				<rect x="26" y="26" width="48" height="48" rx="2" fill="none" stroke="currentColor" stroke-width="3"/>
				<!-- Central Cat-Eye / Diamond Aperture -->
				<path d="M50 36 C59 43 65 50 65 50 C65 50 59 57 50 64 C41 57 35 50 35 50 C35 50 41 43 50 36 Z" fill="none" stroke="currentColor" stroke-width="2.5"/>
				<circle cx="50" cy="50" r="4.5" fill="currentColor"/>
				<polygon points="50,30 53,35 50,34 47,35" fill="currentColor"/>
				<polygon points="50,70 53,65 50,66 47,65" fill="currentColor"/>
			`
		},

		// 2. Theme Dark: Razor-sharp Gothic Crescent Scythe Moon with barbed thorns
		theme_dark: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Gothic Scythe Moon with sharp serrations & thorn extensions -->
				<path d="M54 10 C51 18 49 26 49 35 C49 58 67 76 90 76 C85 81 78 86 70 89 C48 97 23 85 15 63 C7 41 19 16 41 8 C45 6 50 7 54 10 Z" fill="currentColor"/>
				<!-- Barbed spine thorns -->
				<polygon points="26,24 16,14 22,27" fill="currentColor"/>
				<polygon points="12,46 0,42 10,52" fill="currentColor"/>
				<polygon points="22,74 12,84 27,80" fill="currentColor"/>
				<!-- 4-point Gothic Star inside crescent -->
				<path d="M68 28 L71 38 L81 41 L71 44 L68 54 L65 44 L55 41 L65 38 Z" fill="currentColor"/>
			`
		},

		// 3. Theme Light: Eclipsed Gothic Sun with 8 barbed dagger/flame rays
		theme_light: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Central Dark Core -->
				<circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" stroke-width="3"/>
				<circle cx="50" cy="50" r="6" fill="currentColor"/>
				<!-- 8 Gothic Dagger Rays with barbs -->
				<!-- Top -->
				<path d="M50 4 L54 24 L50 20 L46 24 Z" fill="currentColor"/>
				<!-- Bottom -->
				<path d="M50 96 L46 76 L50 80 L54 76 Z" fill="currentColor"/>
				<!-- Right -->
				<path d="M96 50 L76 54 L80 50 L76 46 Z" fill="currentColor"/>
				<!-- Left -->
				<path d="M4 50 L24 46 L20 50 L24 54 Z" fill="currentColor"/>
				<!-- Diagonal NE -->
				<path d="M83 17 L67 31 L71 29 L69 25 Z" fill="currentColor"/>
				<!-- Diagonal NW -->
				<path d="M17 17 L25 25 L29 29 L31 25 Z" fill="currentColor"/>
				<!-- Diagonal SE -->
				<path d="M83 83 L69 75 L71 71 L67 69 Z" fill="currentColor"/>
				<!-- Diagonal SW -->
				<path d="M17 83 L31 69 L29 71 L25 75 Z" fill="currentColor"/>
			`
		},

		// 3b. Style Toggle: 8-pointed Gothic Thorn Sigil Star
		style_toggle: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- 8-pointed Gothic Thorn Sigil Star -->
				<path d="M50 4 L55 35 L78 16 L65 38 L96 50 L65 62 L78 84 L55 65 L50 96 L45 65 L22 84 L35 62 L4 50 L35 38 L22 16 L45 35 Z" fill="currentColor"/>
				<circle cx="50" cy="50" r="9" fill="var(--bg-primary, #070709)"/>
				<circle cx="50" cy="50" r="4" fill="currentColor"/>
			`
		},

		// 4. Instagram: Cyber-sigil spiked camera with gothic thorn corners & diamond flash
		instagram: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Outer Spiked Outline with Extended Razor Corners -->
				<path d="M28 20 L50 16 L72 20 L80 28 L84 50 L80 72 L72 80 L50 84 L28 80 L20 72 L16 50 L20 28 Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="miter"/>
				<!-- 4 Corner Spike Fins -->
				<polygon points="20,28 6,14 28,20" fill="currentColor"/>
				<polygon points="72,20 94,14 80,28" fill="currentColor"/>
				<polygon points="80,72 94,86 72,80" fill="currentColor"/>
				<polygon points="28,80 6,86 20,72" fill="currentColor"/>
				<!-- Inner Spiked Lens -->
				<circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" stroke-width="3"/>
				<circle cx="50" cy="50" r="5" fill="currentColor"/>
				<!-- Gothic 4-point Diamond Flash -->
				<path d="M72 32 L75 36 L79 37 L75 38 L72 42 L69 38 L65 37 L69 36 Z" fill="currentColor"/>
			`
		},

		// 5. Message: Gothic Sigil Envelope sealed with thorned cross & dagger fold lines
		message: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Envelope Base Body with Sharp Gothic Wings -->
				<path d="M14 26 L50 12 L86 26 L92 74 L50 88 L8 74 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="miter"/>
				<!-- Upper Flap Fold -->
				<path d="M14 26 L50 56 L86 26" fill="none" stroke="currentColor" stroke-width="2.8"/>
				<!-- Lower Inner Seams -->
				<path d="M8 74 L42 48" fill="none" stroke="currentColor" stroke-width="2.2"/>
				<path d="M92 74 L58 48" fill="none" stroke="currentColor" stroke-width="2.2"/>
				<!-- Central Gothic Thorn Cross Seal -->
				<polygon points="50,46 54,54 62,54 55,59 58,67 50,62 42,67 45,59 38,54 46,54" fill="currentColor"/>
				<!-- Flap Tip Dagger Spike -->
				<polygon points="50,56 46,70 50,66 54,70" fill="currentColor"/>
			`
		},

		// 6. YouTube Music: Concentric Iron Barbed Rings with Gothic Spearhead Play Button
		ytm: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Outer Spiked Halo Ring with 8 Gothic Barbs -->
				<circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="3"/>
				<!-- 4 Cardinal Spikes -->
				<polygon points="50,2 45,10 55,10" fill="currentColor"/>
				<polygon points="50,98 45,90 55,90" fill="currentColor"/>
				<polygon points="2,50 10,45 10,55" fill="currentColor"/>
				<polygon points="98,50 90,45 90,55" fill="currentColor"/>
				<!-- Diagonal Barbs -->
				<polygon points="16,16 24,19 19,24" fill="currentColor"/>
				<polygon points="84,16 76,19 81,24" fill="currentColor"/>
				<polygon points="84,84 76,81 81,76" fill="currentColor"/>
				<polygon points="16,84 24,81 19,76" fill="currentColor"/>
				<!-- Inner Spiked Ring -->
				<circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" stroke-width="2.5"/>
				<!-- Sharp Gothic Arrowhead / Dagger Play Glyph -->
				<path d="M44 34 L66 50 L44 66 L47 50 Z" fill="currentColor"/>
			`
		},

		// 7. Spotify: 3 Curved Gothic Cyber-Scythe Sound Blades
		spotify: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Outer Iron Ring with Gothic Notches -->
				<path d="M50 6 C25.7 6 6 25.7 6 50 C6 74.3 25.7 94 50 94 C74.3 94 94 74.3 94 50 C94 25.7 74.3 6 50 6 Z" fill="none" stroke="currentColor" stroke-width="3"/>
				<polygon points="50,2 46,6 54,6" fill="currentColor"/>
				<polygon points="50,98 46,94 54,94" fill="currentColor"/>
				<polygon points="2,50 6,46 6,54" fill="currentColor"/>
				<polygon points="98,50 94,46 94,54" fill="currentColor"/>
				<!-- Wave 1 (Top): Gothic Scythe Blade with Serifs -->
				<path d="M26 38 C42 32 62 33 76 43 C74 46 68 45 66 43 C54 36 38 36 28 41 L26 38 Z" fill="currentColor"/>
				<polygon points="26,38 21,35 29,36" fill="currentColor"/>
				<polygon points="76,43 81,46 74,45" fill="currentColor"/>
				<!-- Wave 2 (Middle): Razor Sound Arc -->
				<path d="M30 52 C44 47 59 48 71 56 C69 58 64 57 62 55 C52 49 40 49 32 54 L30 52 Z" fill="currentColor"/>
				<polygon points="30,52 25,50 32,50" fill="currentColor"/>
				<polygon points="71,56 76,59 70,58" fill="currentColor"/>
				<!-- Wave 3 (Bottom): Small Sharp Arc -->
				<path d="M34 66 C44 62 55 63 65 69 C63 71 59 70 57 68 C49 64 41 64 35 68 L34 66 Z" fill="currentColor"/>
				<polygon points="34,66 30,64 36,64" fill="currentColor"/>
				<polygon points="65,69 70,72 64,71" fill="currentColor"/>
			`
		},

		// 8. Apple Music: Gothic Double Note with Crown Spikes & Thorn Tails
		apple: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Upper Barbed Connecting Beam with Crown Spikes -->
				<path d="M30 26 L80 14 L80 26 L30 38 Z" fill="currentColor"/>
				<!-- Crown Thorns on top beam -->
				<polygon points="30,26 24,18 34,24" fill="currentColor"/>
				<polygon points="80,14 86,6 76,13" fill="currentColor"/>
				<polygon points="55,20 55,10 59,19" fill="currentColor"/>
				<!-- Left Stem with Gothic Facets -->
				<path d="M30 26 L34 26 L34 68 L30 68 Z" fill="currentColor"/>
				<!-- Right Stem with Gothic Facets -->
				<path d="M76 14 L80 14 L80 58 L76 58 Z" fill="currentColor"/>
				<!-- Left Notehead: Angled Sharp Oval with Sweeping Thorn Tail -->
				<path d="M34 68 C34 76 24 82 15 80 C6 78 4 69 11 64 C18 59 28 61 34 68 Z" fill="currentColor"/>
				<polygon points="11,64 2,62 10,70" fill="currentColor"/>
				<!-- Right Notehead: Angled Sharp Oval with Sweeping Thorn Tail -->
				<path d="M80 58 C80 66 70 72 61 70 C52 68 50 59 57 54 C64 49 74 51 80 58 Z" fill="currentColor"/>
				<polygon points="57,54 48,52 56,60" fill="currentColor"/>
			`
		},

		// 9. Gallery Close: Crossed Gothic Dagger Blades with Barbed Thorn Finials & Center Diamond
		gallery_close: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Crossed Gothic Dagger Blades (NW-SE & NE-SW) -->
				<path d="M14 14 L20 28 L27 24 L45 42 L50 38 L55 42 L73 24 L80 28 L86 14 L72 20 L76 27 L58 45 L62 50 L58 55 L76 73 L72 80 L86 86 L80 72 L73 76 L55 58 L50 62 L45 58 L27 76 L20 72 L14 86 L28 80 L24 73 L42 55 L38 50 L42 45 L24 27 L28 20 Z" fill="currentColor"/>
				<!-- Central 4-point Gothic Core Diamond -->
				<polygon points="50,44 56,50 50,56 44,50" fill="none" stroke="currentColor" stroke-width="2"/>
				<circle cx="50" cy="50" r="2.5" fill="currentColor"/>
				<!-- 4 Corner Spike Fins -->
				<polygon points="14,14 6,8 18,10" fill="currentColor"/>
				<polygon points="86,14 94,8 82,10" fill="currentColor"/>
				<polygon points="86,86 94,92 82,90" fill="currentColor"/>
				<polygon points="14,86 6,92 18,90" fill="currentColor"/>
			`
		},

		// 10. Gallery Prev: Gothic Spearhead Arrow pointing Left with Barbed Fins
		gallery_prev: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Gothic Spearhead Arrow pointing Left with Barbed Fins -->
				<path d="M16 50 L42 32 L37 28 L48 26 L68 14 L78 10 L71 23 L62 31 L42 50 L62 69 L71 77 L78 90 L68 86 L48 74 L37 72 L42 68 Z" fill="currentColor"/>
				<!-- Inner Gothic Thorn Barb -->
				<polygon points="50,50 64,40 58,50 64,60" fill="currentColor"/>
				<!-- Leading Tip Barbs -->
				<polygon points="26,43 12,46 22,48" fill="currentColor"/>
				<polygon points="26,57 22,52 12,54" fill="currentColor"/>
			`
		},

		// 11. Gallery Next: Gothic Spearhead Arrow pointing Right with Barbed Fins
		gallery_next: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Gothic Spearhead Arrow pointing Right with Barbed Fins -->
				<path d="M84 50 L58 32 L63 28 L52 26 L32 14 L22 10 L29 23 L38 31 L58 50 L38 69 L29 77 L22 90 L32 86 L52 74 L63 72 L58 68 Z" fill="currentColor"/>
				<!-- Inner Gothic Thorn Barb -->
				<polygon points="50,50 36,40 42,50 36,60" fill="currentColor"/>
				<!-- Leading Tip Barbs -->
				<polygon points="74,43 78,48 88,46" fill="currentColor"/>
				<polygon points="74,57 88,54 78,52" fill="currentColor"/>
			`
		},

		// 12. Visualizer: Gothic Soundwave Spires with Thorn Barbs
		visualizer: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- 5 Gothic Audio Spires -->
				<!-- Center tall spire -->
				<path d="M50 8 L54 46 L57 44 L54 50 L57 56 L54 54 L50 92 L46 54 L43 56 L46 50 L43 44 L46 46 Z" fill="currentColor"/>
				<!-- Inner Left spire -->
				<path d="M34 22 L37 46 L40 45 L37 50 L40 55 L37 54 L34 78 L31 54 L28 55 L31 50 L28 45 L31 46 Z" fill="currentColor"/>
				<!-- Inner Right spire -->
				<path d="M66 22 L69 46 L72 45 L69 50 L72 55 L69 54 L66 78 L63 54 L60 55 L63 50 L60 45 L63 46 Z" fill="currentColor"/>
				<!-- Outer Left spire -->
				<path d="M18 38 L21 48 L23 47 L21 50 L23 53 L21 52 L18 62 L15 52 L13 53 L15 50 L13 47 L15 48 Z" fill="currentColor"/>
				<!-- Outer Right spire -->
				<path d="M82 38 L85 48 L87 47 L85 50 L87 53 L85 52 L82 62 L79 52 L77 53 L79 50 L77 47 L79 48 Z" fill="currentColor"/>
			`
		},

		// 13. Piano: Gothic Keyboard with Barbed Spire Keys
		piano: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Outer Gothic Keyboard Frame -->
				<path d="M10 20 L50 14 L90 20 L94 80 L50 86 L6 80 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="miter"/>
				<!-- 3 Gothic Black Key Daggers -->
				<path d="M26 22 L34 22 L34 54 L30 62 L26 54 Z" fill="currentColor"/>
				<path d="M46 20 L54 20 L54 54 L50 62 L46 54 Z" fill="currentColor"/>
				<path d="M66 22 L74 22 L74 54 L70 62 L66 54 Z" fill="currentColor"/>
				<!-- Vertical key divider lines -->
				<line x1="20" y1="22" x2="20" y2="78" stroke="currentColor" stroke-width="2"/>
				<line x1="40" y1="20" x2="40" y2="80" stroke="currentColor" stroke-width="2"/>
				<line x1="60" y1="20" x2="60" y2="80" stroke="currentColor" stroke-width="2"/>
				<line x1="80" y1="22" x2="80" y2="78" stroke="currentColor" stroke-width="2"/>
				<!-- Bottom barb sills -->
				<polygon points="50,86 46,94 54,94" fill="currentColor"/>
			`
		},

		// 14. Fullscreen: 4 Outward Barbed Corner Scepters
		fullscreen: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Top-Left Barbed Corner -->
				<path d="M14 36 L14 14 L36 14 L30 20 L20 20 L20 30 Z" fill="currentColor"/>
				<polygon points="14,14 6,6 18,10" fill="currentColor"/>
				<!-- Top-Right Barbed Corner -->
				<path d="M86 36 L86 14 L64 14 L70 20 L80 20 L80 30 Z" fill="currentColor"/>
				<polygon points="86,14 94,6 82,10" fill="currentColor"/>
				<!-- Bottom-Right Barbed Corner -->
				<path d="M86 64 L86 86 L64 86 L70 80 L80 80 L80 70 Z" fill="currentColor"/>
				<polygon points="86,86 94,94 82,90" fill="currentColor"/>
				<!-- Bottom-Left Barbed Corner -->
				<path d="M14 64 L14 86 L36 86 L30 80 L20 80 L20 70 Z" fill="currentColor"/>
				<polygon points="14,86 6,94 18,90" fill="currentColor"/>
			`
		},

		// 15. Fullscreen Exit: 4 Inward Barbed Corner Scepters
		fullscreen_exit: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Top-Left Inward -->
				<path d="M38 16 L38 38 L16 38 L22 32 L32 32 L32 22 Z" fill="currentColor"/>
				<polygon points="38,38 46,46 34,42" fill="currentColor"/>
				<!-- Top-Right Inward -->
				<path d="M62 16 L62 38 L84 38 L78 32 L68 32 L68 22 Z" fill="currentColor"/>
				<polygon points="62,38 54,46 66,42" fill="currentColor"/>
				<!-- Bottom-Right Inward -->
				<path d="M62 84 L62 62 L84 62 L78 68 L68 68 L68 78 Z" fill="currentColor"/>
				<polygon points="62,62 54,54 66,58" fill="currentColor"/>
				<!-- Bottom-Left Inward -->
				<path d="M38 84 L38 62 L16 62 L22 68 L32 68 L32 78 Z" fill="currentColor"/>
				<polygon points="38,62 46,54 34,58" fill="currentColor"/>
			`
		},

		// 16. Order Site: Gothic Cyber-Anvil with Ascending Blade
		order_site: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Gothic Box Portal -->
				<path d="M46 22 L22 22 L18 78 L78 82 L82 54 L74 54 L72 74 L26 70 L28 30 L46 30 Z" fill="currentColor"/>
				<!-- Ascending Blade / Arrow NE -->
				<path d="M46 54 L76 24 L70 20 L88 12 L80 30 L76 24 L46 54 Z" fill="currentColor"/>
				<polygon points="88,12 96,4 84,10" fill="currentColor"/>
			`
		},

		// 17. Language: Gothic Rune Celestial Astrolabe with Barbed Cardinal Points
		lang: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<!-- Gothic Globe / Rune Portal -->
				<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="3"/>
				<ellipse cx="50" cy="50" rx="18" ry="38" fill="none" stroke="currentColor" stroke-width="2.5"/>
				<line x1="12" y1="50" x2="88" y2="50" stroke="currentColor" stroke-width="3"/>
				<!-- Cardinal Spikes -->
				<polygon points="50,12 46,2 54,2" fill="currentColor"/>
				<polygon points="50,88 46,98 54,98" fill="currentColor"/>
				<polygon points="12,50 2,46 2,54" fill="currentColor"/>
				<polygon points="88,50 98,46 98,54" fill="currentColor"/>
			`
		},

		// 18. Mic: Gothic Microphone with Barbed Cradle
		mic: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<rect x="42" y="14" width="16" height="34" rx="8" fill="none" stroke="currentColor" stroke-width="3"/>
				<line x1="42" y1="28" x2="58" y2="28" stroke="currentColor" stroke-width="2"/>
				<line x1="42" y1="36" x2="58" y2="36" stroke="currentColor" stroke-width="2"/>
				<path d="M28 36 C28 58 42 66 50 66 C58 66 72 58 72 36" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
				<polygon points="28,36 20,32 26,44" fill="currentColor"/>
				<polygon points="72,36 80,32 74,44" fill="currentColor"/>
				<line x1="50" y1="66" x2="50" y2="84" stroke="currentColor" stroke-width="3"/>
				<path d="M34 84 L50 80 L66 84 L50 92 Z" fill="currentColor"/>
			`
		},

		// 19. Speakers: Gothic Acoustic Horn with Barbed Soundwaves
		speakers: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<polygon points="18,36 32,36 54,18 54,82 32,64 18,64" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="miter"/>
				<polygon points="54,18 54,82 50,78 50,22" fill="currentColor"/>
				<path d="M66 34 C72 40 76 46 76 50 C76 54 72 60 66 66" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
				<polygon points="66,34 72,28 69,38" fill="currentColor"/>
				<polygon points="66,66 72,72 69,62" fill="currentColor"/>
				<path d="M78 22 C88 32 94 42 94 50 C94 58 88 68 78 78" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
				<polygon points="78,22 84,14 82,26" fill="currentColor"/>
				<polygon points="78,78 84,86 82,74" fill="currentColor"/>
			`
		},

		// 20. Palette: Gothic Alchemy Palette with Thorn Rim
		palette: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<path d="M50 14 C28 14 14 30 14 52 C14 74 32 86 48 86 C54 86 58 82 58 76 C58 72 56 68 60 64 C64 60 70 60 76 60 C86 60 92 52 92 42 C92 24 74 14 50 14 Z" fill="none" stroke="currentColor" stroke-width="3"/>
				<polygon points="50,14 47,4 53,4" fill="currentColor"/>
				<polygon points="14,52 4,50 6,56" fill="currentColor"/>
				<circle cx="34" cy="38" r="4.5" fill="currentColor"/>
				<circle cx="52" cy="28" r="4.5" fill="currentColor"/>
				<circle cx="70" cy="38" r="4.5" fill="currentColor"/>
				<circle cx="76" cy="50" r="4" fill="currentColor"/>
				<circle cx="42" cy="70" r="7" fill="none" stroke="currentColor" stroke-width="2.5"/>
			`
		},

		// 21. Settings: Gothic Razor Cogwheel
		settings: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" stroke-width="3"/>
				<circle cx="50" cy="50" r="6" fill="currentColor"/>
				<path d="M46 12 L50 2 L54 12 L50 18 Z" fill="currentColor"/>
				<path d="M46 88 L50 98 L54 88 L50 82 Z" fill="currentColor"/>
				<path d="M12 46 L2 50 L12 54 L18 50 Z" fill="currentColor"/>
				<path d="M88 46 L98 50 L88 54 L82 50 Z" fill="currentColor"/>
				<path d="M23 23 L16 16 L27 27 L28 22 Z" fill="currentColor"/>
				<path d="M77 77 L84 84 L73 73 L72 78 Z" fill="currentColor"/>
				<path d="M77 23 L84 16 L73 27 L78 28 Z" fill="currentColor"/>
				<path d="M23 77 L16 84 L27 73 L22 72 Z" fill="currentColor"/>
				<circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="2.5"/>
			`
		},

		// 22. Close: Gothic Crossed Daggers
		close: {
			viewBox: '0 0 100 100',
			type: 'fill',
			svg: `
				<path d="M22 22 L78 78 M78 22 L22 78" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
				<polygon points="50,50 42,42 46,38" fill="currentColor"/>
				<polygon points="50,50 58,58 54,62" fill="currentColor"/>
				<polygon points="50,50 58,42 54,38" fill="currentColor"/>
				<polygon points="50,50 42,58 46,62" fill="currentColor"/>
				<polygon points="22,22 14,16 16,28" fill="currentColor"/>
				<polygon points="78,22 86,16 84,28" fill="currentColor"/>
				<polygon points="22,78 14,84 16,72" fill="currentColor"/>
				<polygon points="78,78 86,84 84,72" fill="currentColor"/>
			`
		}
	}
};
