<script>
	import { iconStyleStore } from './iconStyle.svelte.js';
	import { ICONS } from './icons.js';

	const platforms = [
		{
			id: 'ytm',
			name: 'YouTube Music',
			url: 'https://music.youtube.com/channel/UCp97EB_HMto3E4bghq3jViA',
			brandColor: '#FF0000',
			brandGlow: 'rgba(255, 0, 0, 0.65)'
		},
		{
			id: 'spotify',
			name: 'Spotify',
			url: 'https://open.spotify.com/artist/3UHW8Sd1RHc87Yilotw3Qs',
			brandColor: '#1ED760',
			brandGlow: 'rgba(30, 215, 96, 0.65)'
		},
		{
			id: 'apple',
			name: 'Apple Music',
			url: 'https://music.apple.com/ua/artist/deviant-blaze/1728765974',
			brandColor: '#FA243C',
			brandGlow: 'rgba(250, 36, 60, 0.65)'
		}
	];

	let { isExpanded = false, isShiftedUp = false } = $props();

	let style = $derived(iconStyleStore.current);
</script>

<nav
	class="music-links"
	class:is-expanded={isExpanded}
	class:is-shifted-up={isShiftedUp}
	aria-label="Music Platforms"
>
	{#each platforms as item}
		{@const iconData = ICONS[style]?.[item.id] || ICONS.gothic[item.id]}
		<a
			href={item.url}
			target="_blank"
			rel="noopener noreferrer"
			class="link-item platform-{item.id}"
			style="--brand-color: {item.brandColor}; --brand-glow: {item.brandGlow};"
			aria-label={item.name}
		>
			<div class="icon-wrap">
				{#key style}
					<svg
						class="music-icon"
						class:apple-classic={item.id === 'apple' && style === 'classic'}
						viewBox={iconData.viewBox}
						aria-hidden="true"
					>
						{@html iconData.svg}
					</svg>
				{/key}
			</div>
			<span class="link-sublabel">{item.name}</span>
			<span class="tooltip">{item.name}</span>
		</a>
	{/each}
</nav>

<style>
	.music-links {
		position: fixed;
		bottom: 2.75rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 2.25rem;
		padding: 0.5rem 1rem;
		transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
		            gap 0.6s cubic-bezier(0.16, 1, 0.3, 1),
		            bottom 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.music-links.is-expanded {
		bottom: 3.25rem;
		gap: 4.5rem;
	}

	.music-links.is-shifted-up {
		transform: translateX(-50%) translateY(-105px);
	}

	.link-item {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-decoration: none;
		outline: none;
	}

	.icon-wrap {
		/* No circle container, completely borderless & clean */
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
		            color 0.28s cubic-bezier(0.16, 1, 0.3, 1);
	}

	/* Normal icon: 44px; Expanded: 88px */
	.music-icon {
		width: 44px;
		height: 44px;
		display: block;
		transition: width 0.45s cubic-bezier(0.16, 1, 0.3, 1),
		            height 0.45s cubic-bezier(0.16, 1, 0.3, 1),
		            transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
		            filter 0.28s cubic-bezier(0.16, 1, 0.3, 1);
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
	}

	.is-expanded .music-icon {
		width: 88px;
		height: 88px;
	}

	.apple-classic {
		width: 38px;
		height: 44px;
	}

	.is-expanded .apple-classic {
		width: 76px;
		height: 88px;
	}

	.link-sublabel {
		display: block;
		margin-top: 10px;
		font-size: 0.92rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--fg-primary);
		opacity: 0;
		max-height: 0;
		overflow: hidden;
		transform: translateY(6px);
		transition: opacity 0.4s ease, transform 0.4s ease, max-height 0.4s ease;
		pointer-events: none;
		white-space: nowrap;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
	}

	.is-expanded .link-sublabel {
		opacity: 1;
		max-height: 28px;
		transform: translateY(0);
	}

	.is-expanded .tooltip {
		display: none;
	}

	/* On hover: color icon in its official brand color and add matching glowing aura */
	.link-item:hover .icon-wrap {
		color: var(--brand-color);
		transform: translateY(-4px) scale(1.14);
	}

	.link-item:hover .music-icon {
		filter: drop-shadow(0 0 20px var(--brand-glow));
	}

	.link-item:focus-visible .icon-wrap {
		transform: scale(1.1);
		color: var(--brand-color);
	}

	.link-item:active .icon-wrap {
		transform: translateY(-1px) scale(1.02);
	}

	.tooltip {
		position: absolute;
		bottom: calc(100% + 14px);
		padding: 5px 12px;
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.04em;
		white-space: nowrap;
		background: var(--bg-secondary);
		color: var(--fg-primary);
		border: 1px solid var(--border);
		border-radius: 6px;
		pointer-events: none;
		opacity: 0;
		transform: translateY(6px) scale(0.95);
		transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
	}

	.link-item:hover .tooltip {
		opacity: 1;
		transform: translateY(0) scale(1);
		border-color: var(--brand-color);
	}

	@media (max-width: 768px), (pointer: coarse) {
		.music-links {
			bottom: 1.75rem;
			gap: 1.75rem;
			opacity: 1 !important;
			max-width: calc(100vw - 1rem);
			box-sizing: border-box;
		}

		.music-links.is-expanded {
			bottom: 1.75rem;
			gap: 0.4rem 0.6rem;
			width: calc(100vw - 1rem);
			max-width: 380px;
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			justify-items: center;
		}

		.music-links.is-expanded .link-item {
			width: 100%;
			min-width: 0;
			box-sizing: border-box;
		}

		.music-links.is-expanded .music-icon {
			width: 50px;
			height: 50px;
		}

		.music-links.is-expanded .apple-classic {
			width: 44px;
			height: 50px;
		}

		.link-sublabel {
			font-size: 0.72rem;
			letter-spacing: 0.01em;
			margin-top: 6px;
			width: 100%;
			text-align: center;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.music-links.is-expanded .link-sublabel {
			font-size: 0.72rem;
			letter-spacing: 0.01em;
			margin-top: 6px;
			max-height: 24px;
			width: 100%;
			text-align: center;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.music-links.is-shifted-up {
			transform: translateX(-50%) translateY(-115px);
		}

		.link-item {
			opacity: 1 !important;
		}

		.icon-wrap {
			opacity: 1 !important;
			color: var(--fg-primary);
		}

		.music-icon {
			width: 38px;
			height: 38px;
			opacity: 1 !important;
		}

		.apple-classic {
			width: 33px;
			height: 38px;
		}

		.tooltip {
			display: none;
		}
	}
</style>
