<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/state';
	import JsonLd from '#lib/components/JsonLd.svelte';
	import { SITE_ORIGIN, siteUrl } from '#lib/config/site.js';
	import { migrateLegacyKeys } from '#lib/services/storage.js';
	import { iconStyleStore } from '#lib/iconStyle.svelte.js';
	import { logService } from '#lib/services/logService.svelte.js';
	import { freshLoad } from '#lib/utils/staleBuild.js';
	import ServiceBadge from '#lib/components/ServiceBadge.svelte';
	import ErrorFallback from '#lib/components/ErrorFallback.svelte';

	migrateLegacyKeys();

	beforeNavigate((navigation) => {
		if (!updated.current || navigation.willUnload || !navigation.to?.url) return;
		logService.info('app', 'new build - full navigation', { to: navigation.to.url.pathname });
		navigation.cancel();
		void freshLoad(navigation.to.url.href);
	});

	onMount(() => {
		const onRejection = (e) => logService.error('app', `Unhandled rejection: ${String(e.reason)}`);
		const onWindowError = (e) =>
			logService.error('app', `${e.message} at ${e.filename}:${e.lineno}`);
		window.addEventListener('unhandledrejection', onRejection);
		window.addEventListener('error', onWindowError);

		iconStyleStore.init();

		return () => {
			window.removeEventListener('unhandledrejection', onRejection);
			window.removeEventListener('error', onWindowError);
		};
	});

	let { children } = $props();

	let isHiddenPage = $derived(page.url.pathname.includes('beta-test-checklists'));

	const structuredData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': `${siteUrl('/')}#website`,
				url: siteUrl('/'),
				name: 'Deviant Blaze',
				description: 'Рок-гурт Deviant Blaze',
				inLanguage: 'uk-UA'
			},
			{
				'@type': 'MusicGroup',
				'@id': `${siteUrl('/')}#musicgroup`,
				name: 'Deviant Blaze',
				url: siteUrl('/'),
				image: `${SITE_ORIGIN}/DeviantBlaze/og-image.png`,
				description: 'Рок-гурт Deviant Blaze',
				genre: ['Rock', 'Symphonic Rock', 'Gothic Rock', 'Alternative Rock'],
				sameAs: ['https://t.me/Moyo_imya_polzovatelya', 'https://github.com/Alik532UA/DeviantBlaze']
			}
		]
	};
</script>

<svelte:head>
	{#if !isHiddenPage}
		<link rel="canonical" href={siteUrl('/')} />
		<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
	{/if}
</svelte:head>

{#if !isHiddenPage}
	<JsonLd schema={structuredData} />
{/if}

<svelte:boundary
	onerror={(error) =>
		logService.error('app', 'Render boundary caught error', { error: String(error) })}
>
	{@render children()}

	{#snippet failed(_, reset)}
		<ErrorFallback onretry={reset} />
	{/snippet}
</svelte:boundary>

<ServiceBadge />
