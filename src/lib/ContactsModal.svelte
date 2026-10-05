<script>
	import { fade, scale } from 'svelte/transition';
	import { iconStyleStore } from './iconStyle.svelte.js';
	import { ICONS } from './icons.js';

	let { isOpen = $bindable(false) } = $props();

	let style = $derived(iconStyleStore.current);

	function getIcon(name) {
		const set = ICONS[style] || ICONS.gothic;
		return set[name] || ICONS.gothic[name];
	}

	function onKeyDown(e) {
		if (isOpen && e.key === 'Escape') isOpen = false;
	}
</script>

<svelte:window onkeydown={onKeyDown} />

{#if isOpen}
	<div
		class="contacts-overlay"
		transition:fade={{ duration: 220 }}
		role="dialog"
		aria-modal="true"
		aria-label="Контакти Deviant Blaze"
		tabindex="-1"
	>
		<!-- Backdrop click dismiss button -->
		<button
			type="button"
			class="backdrop-dismiss"
			onclick={() => (isOpen = false)}
			aria-label="Закрити модальне вікно"
		></button>

		<div class="contacts-card" transition:scale={{ start: 0.95, duration: 220 }}>
			<button class="close-btn" class:is-gothic={style === 'gothic'} onclick={() => (isOpen = false)} aria-label="Закрити контакти">
				<svg
					viewBox={getIcon('gallery_close').viewBox}
					width="20"
					height="20"
					class="close-svg"
					class:close-svg--fill={getIcon('gallery_close').type === 'fill'}
					aria-hidden="true"
				>
					{@html getIcon('gallery_close').svg}
				</svg>
			</button>

			<div class="contacts-header">
				<span class="tag">Official Inquiries</span>
				<h2 class="title">Deviant Blaze</h2>
			</div>

			<div class="contacts-list">
				<div class="contact-item">
					<span class="label">Booking & Live</span>
					<a href="mailto:booking@deviantblaze.com" class="value">booking@deviantblaze.com</a>
				</div>

				<div class="contact-item">
					<span class="label">Management & PR</span>
					<a href="mailto:contact@deviantblaze.com" class="value">contact@deviantblaze.com</a>
				</div>

				<div class="contact-item">
					<span class="label">Music Streaming</span>
					<div class="stream-links">
						<a href="https://music.youtube.com/channel/UCp97EB_HMto3E4bghq3jViA" target="_blank" rel="noopener noreferrer">YouTube Music</a>
						<span>·</span>
						<a href="https://open.spotify.com/artist/3UHW8Sd1RHc87Yilotw3Qs" target="_blank" rel="noopener noreferrer">Spotify</a>
						<span>·</span>
						<a href="https://music.apple.com/ua/artist/deviant-blaze/1728765974" target="_blank" rel="noopener noreferrer">Apple Music</a>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.contacts-overlay {
		position: fixed;
		inset: 0;
		z-index: 200;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
	}

	.backdrop-dismiss {
		position: absolute;
		inset: 0;
		background: transparent;
		border: none;
		cursor: default;
		z-index: 1;
	}

	.contacts-card {
		position: relative;
		z-index: 2;
		width: min(90vw, 440px);
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 2.25rem 2rem;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
		color: var(--fg-primary);
	}

	.close-btn {
		position: absolute;
		top: 1.25rem;
		right: 1.25rem;
		background: none;
		border: none;
		color: var(--fg-secondary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		transition: color 0.2s, transform 0.2s;
	}

	.close-btn:hover {
		color: var(--fg-primary);
		transform: scale(1.1);
	}

	.close-svg {
		display: block;
		transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.close-svg:not(.close-svg--fill) {
		fill: none;
		stroke: currentColor;
	}

	.close-svg--fill {
		fill: currentColor;
	}

	.close-btn.is-gothic:hover .close-svg {
		transform: rotate(90deg) scale(1.15);
	}

	.contacts-header {
		margin-bottom: 2rem;
	}

	.tag {
		font-size: 0.72rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--fg-muted);
		display: block;
		margin-bottom: 0.4rem;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.contacts-list {
		display: flex;
		flex-direction: column;
		gap: 1.4rem;
	}

	.contact-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.label {
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-muted);
	}

	.value {
		font-size: 1.05rem;
		color: var(--fg-primary);
		text-decoration: none;
		transition: color 0.2s;
	}

	.value:hover {
		color: var(--fg-secondary);
		text-decoration: underline;
	}

	.stream-links {
		display: flex;
		gap: 0.5rem;
		font-size: 0.95rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.stream-links a {
		color: var(--fg-primary);
		text-decoration: none;
		transition: color 0.2s;
	}

	.stream-links a:hover {
		color: var(--fg-secondary);
	}

	.stream-links span {
		color: var(--fg-muted);
	}
</style>
