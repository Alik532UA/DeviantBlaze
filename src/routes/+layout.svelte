<script>
	import '../app.css';
	import { asset } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={asset('favicon.svg')} />
</svelte:head>

{@render children()}
