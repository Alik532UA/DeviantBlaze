<script>
	/** @type {{ schema: object }} */
	let { schema } = $props();

	/**
	 * SECURITY § 5.3 & SEO § 3.2:
	 * Escape <, >, &, U+2028, and U+2029 to avoid HTML injection/XSS in JSON-LD.
	 */
	function jsonLdScript(data) {
		return JSON.stringify(data)
			.replace(/</g, '\\u003c')
			.replace(/>/g, '\\u003e')
			.replace(/&/g, '\\u0026')
			.replace(/\u2028/g, '\\u2028')
			.replace(/\u2029/g, '\\u2029');
	}
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${jsonLdScript(schema)}<\/script>`}
</svelte:head>
