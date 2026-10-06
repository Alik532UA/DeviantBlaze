<script>
	import '../app.css';
	import { asset } from '$app/paths';
	import { page } from '$app/state';
	import JsonLd from '#lib/components/JsonLd.svelte';
	import { SITE_ORIGIN, siteUrl } from '#lib/config/site.js';
	import { migrateLegacyKeys } from '#lib/services/storage.js';

	migrateLegacyKeys();

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
				sameAs: [
					'https://t.me/Moyo_imya_polzovatelya',
					'https://github.com/Alik532UA/DeviantBlaze'
				]
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

{@render children()}
