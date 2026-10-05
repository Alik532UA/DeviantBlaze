<script>
	const links = [
		{
			name: 'YouTube Music',
			url: 'https://music.youtube.com/channel/UCp97EB_HMto3E4bghq3jViA',
			icon: 'ytm'
		},
		{
			name: 'Spotify',
			url: 'https://open.spotify.com/artist/3UHW8Sd1RHc87Yilotw3Qs',
			icon: 'spotify'
		},
		{
			name: 'Apple Music',
			url: 'https://music.apple.com/ua/artist/deviant-blaze/1728765974',
			icon: 'apple'
		}
	];
</script>

<nav class="music-links" aria-label="Music Platforms">
	{#each links as item}
		<a
			href={item.url}
			target="_blank"
			rel="noopener noreferrer"
			class="link-item"
			aria-label={item.name}
		>
			<div class="icon-wrap">
				{#if item.icon === 'ytm'}
					<!-- YouTube Music Icon -->
					<svg class="music-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path
							d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"
						/>
					</svg>
				{:else if item.icon === 'spotify'}
					<!-- Spotify Icon -->
					<svg class="music-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path
							d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
						/>
					</svg>
				{:else if item.icon === 'apple'}
					<!-- Apple Music Note Icon -->
					<svg class="music-icon apple-icon" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
						<path
							d="M381.9 388.2c-6.4 27.4-27.2 42.8-55.1 48-24.5 4.5-44.9 5.6-64.5-10.2-23.9-20.1-24.2-53.4-2.7-74.4 17-16.2 40.9-19.5 76.8-25.8 6-1.1 11.2-2.5 15.6-7.4 6.4-7.2 4.4-4.1 4.4-163.2 0-11.2-5.5-14.3-17-12.3-8.2 1.4-185.7 34.6-185.7 34.6-10.2 2.2-13.4 5.2-13.4 16.7 0 234.7 1.1 223.9-2.5 239.5-4.2 18.2-15.4 31.9-30.2 39.5-16.8 9.3-47.2 13.4-63.4 10.4-43.2-8.1-58.4-58-29.1-86.6 17-16.2 40.9-19.5 76.8-25.8 6-1.1 11.2-2.5 15.6-7.4 10.1-11.5 1.8-256.6 5.2-270.2 .8-5.2 3-9.6 7.1-12.9 4.2-3.5 11.8-5.5 13.4-5.5 204-38.2 228.9-43.1 232.4-43.1 11.5-.8 18.1 6 18.1 17.6 .2 344.5 1.1 326-1.8 338.5z"
						/>
					</svg>
				{/if}
			</div>
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
		transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
	}

	/* 2x bigger icon: 44px */
	.music-icon {
		width: 44px;
		height: 44px;
		display: block;
		transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
	}

	/* Slightly match optical weight for Apple Music note */
	.apple-icon {
		width: 38px;
		height: 44px;
	}

	.link-item:hover .icon-wrap {
		color: var(--fg-primary);
		transform: translateY(-4px) scale(1.12);
	}

	.link-item:hover .music-icon {
		filter: drop-shadow(0 0 16px var(--fg-primary));
	}

	.link-item:focus-visible .icon-wrap {
		transform: scale(1.1);
		color: var(--fg-primary);
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
	}

	@media (max-width: 640px) {
		.music-links {
			bottom: 1.75rem;
			gap: 1.75rem;
		}

		.music-icon {
			width: 38px;
			height: 38px;
		}

		.apple-icon {
			width: 33px;
			height: 38px;
		}

		.tooltip {
			display: none;
		}
	}
</style>
