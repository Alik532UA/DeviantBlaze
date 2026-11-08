<script>
	import { siteUrl } from '#lib/config/site.js';

	let { onretry } = $props();
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
	role="alert"
>
	<div
		class="max-w-md w-full p-8 rounded-2xl bg-[#121214] border border-[#ff2a5f]/30 shadow-[0_0_50px_rgba(255,42,95,0.2)] text-center text-white font-sans"
	>
		<div
			class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ff2a5f]/10 border border-[#ff2a5f]/40 flex items-center justify-center text-[#ff2a5f] text-2xl font-bold"
		>
			⚡
		</div>
		<h2 class="text-2xl font-black tracking-tight mb-2 uppercase">Збій аудіосистеми</h2>
		<p class="text-sm text-neutral-300 mb-6 leading-relaxed">
			Виникла неочікувана помилка при рендерингу сцени або аудіовізуалізатора. Спробуйте
			перезапустити модуль або повернутися на головну сторінку.
		</p>
		<div class="flex gap-3 justify-center">
			<button
				type="button"
				class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2a5f] to-[#ff5277] hover:brightness-110 text-white font-bold text-sm tracking-wide uppercase transition cursor-pointer"
				onclick={onretry}
			>
				Перезапустити
			</button>
			<a
				href={siteUrl('/')}
				class="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-bold text-sm tracking-wide uppercase transition"
			>
				Головна
			</a>
		</div>
	</div>
</div>
