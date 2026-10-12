<script>
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — Помилка</title>
</svelte:head>

<main class="error-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; color: #fff;">
	<h1 style="font-size: 3rem; margin-bottom: 1rem;">{page.status}</h1>
	<p style="font-size: 1.25rem; opacity: 0.8;">{page.error?.message || 'Сторінку не знайдено'}</p>
	<a href="{page.url.origin}/DeviantBlaze" style="margin-top: 2rem; color: #ff5533; text-decoration: underline;">Повернутися на головну</a>
</main>
