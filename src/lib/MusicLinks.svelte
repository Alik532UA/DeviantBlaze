<script>
	import { iconStyleStore } from './iconStyle.svelte.js';
	import { langStore } from './lang.svelte.js';
	import { ICONS } from './icons.js';

	const platforms = [
		{
			id: 'ytm',
			name: 'YouTube Music',
			url: 'https://music.youtube.com/watch?v=tlZPReIOTuQ&si=D8i77XIoe5O871U4',
			brandColor: '#FF0000',
			brandGlow: 'rgba(255, 0, 0, 0.65)'
		},
		{
			id: 'spotify',
			name: 'Spotify',
			url: 'https://open.spotify.com/album/6J3G38WFCEGf97AqrCp8Dq',
			brandColor: '#1ED760',
			brandGlow: 'rgba(30, 215, 96, 0.65)'
		},
		{
			id: 'apple',
			name: 'Apple Music',
			url: 'https://music.apple.com/ua/album/%D0%BD%D1%83%D0%BB%D1%8C/6805608429?i=6805608430',
			brandColor: '#FA243C',
			brandGlow: 'rgba(250, 36, 60, 0.65)'
		}
	];

	let { isExpanded = false, isShiftedUp = false } = $props();

	let style = $derived(iconStyleStore.current);
</script>

<div
	class="music-container"
	class:is-expanded={isExpanded}
	class:is-shifted-up={isShiftedUp}
>
	<h2 class="music-heading">
		{langStore.t('music_single_heading')}
	</h2>
	<nav
		class="music-links"
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
</div>

<style>
	.music-container {
		position: fixed;
		bottom: 2.25rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 50;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
		            bottom 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.music-container.is-expanded {
		bottom: 2.75rem;
	}

	.music-container.is-shifted-up {
		transform: translateX(-50%) translateY(-105px);
	}

	.music-heading {
		margin: 0 0 0.5rem 0;
		padding: 0;
		font-family: inherit;
		font-size: 0.82rem;
		font-weight: 500;
		letter-spacing: 0.06em;
		color: var(--fg-secondary);
		text-align: center;
		white-space: nowrap;
		pointer-events: auto;
		user-select: none;
		-webkit-user-select: none;
		opacity: 0.72;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
		transition: font-size 0.55s cubic-bezier(0.16, 1, 0.3, 1),
		            opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1),
		            margin-bottom 0.55s cubic-bezier(0.16, 1, 0.3, 1),
		            color 0.35s ease,
		            text-shadow 0.35s ease,
		            transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.music-container.is-expanded .music-heading {
		font-size: 1.05rem;
		font-weight: 600;
		letter-spacing: 0.07em;
		color: var(--fg-primary);
		opacity: 1;
		margin-bottom: 0.85rem;
		transform: translateY(-2px);
		text-shadow: 0 0 20px rgba(255, 255, 255, 0.35), 0 2px 10px rgba(0, 0, 0, 0.5);
	}

	:global([data-theme="light"]) .music-container.is-expanded .music-heading {
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.15);
	}

	.music-links {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2.25rem;
		padding: 0.25rem 1rem;
		pointer-events: auto;
		transition: gap 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.is-expanded .music-links {
		gap: 4.5rem;
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
		.music-container {
			bottom: 1.45rem;
			max-width: calc(100vw - 1rem);
			box-sizing: border-box;
		}

		.music-container.is-expanded {
			bottom: 1.85rem;
		}

		.music-container.is-shifted-up {
			transform: translateX(-50%) translateY(-115px);
		}

		.music-heading {
			font-size: 0.72rem;
			letter-spacing: 0.03em;
			margin-bottom: 0.35rem;
			opacity: 0.78;
			max-width: calc(100vw - 1.5rem);
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.music-container.is-expanded .music-heading {
			font-size: 0.86rem;
			margin-bottom: 0.55rem;
			opacity: 1;
			transform: translateY(-1px);
		}

		.music-links {
			gap: 1.6rem;
			opacity: 1 !important;
			max-width: calc(100vw - 1rem);
			box-sizing: border-box;
			padding: 0.2rem 0.5rem;
		}

		.is-expanded .music-links {
			gap: clamp(1.1rem, 5.5vw, 2.4rem);
		}

		.link-item {
			opacity: 1 !important;
			padding: 4px 6px;
			flex-shrink: 0;
			box-sizing: border-box;
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

		.is-expanded .music-icon {
			width: 50px;
			height: 50px;
		}

		.is-expanded .apple-classic {
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

		.is-expanded .link-sublabel {
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

		.tooltip {
			display: none;
		}
	}
</style>
