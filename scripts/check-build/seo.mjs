import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Теги з одним значенням на сторінку (§ 4.2, § 4.4); `og:locale:alternate` повторюється законно й сюди не входить. */
const SINGLE_OWNER = [
	'canonical',
	'robots',
	'description',
	'og:title',
	'og:description',
	'og:url',
	'og:image',
	'og:type',
	'og:locale',
	'twitter:card',
	'twitter:title',
	'twitter:description',
	'twitter:image'
];
/** Мета-теги з директивами для краулерів: загальний `robots` і тег окремого бота (Google, Bing, Yandex). */
const ROBOTS_META = new Set(['robots', 'googlebot', 'googlebot-news', 'bingbot', 'yandex']);

export function htmlFiles(dir, out = []) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) htmlFiles(full, out);
		else if (entry.endsWith('.html')) out.push(full);
	}
	return out;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
/** Сутності HTML і XML: `&amp;` в атрибуті й у `<loc>` — той самий `&` адреси. */
export const decodeEntities = (text) => text.replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, name) => ENTITIES[name]);
export const escapeXml = (text) => text.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[ch]);

/** Теги з іменем `name`: `>` усередині лапок тег не закриває (`content="a > b"`). */
const tagsOf = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, 'gi'))].map((m) => m[0]);

/**
 * Атрибути тега так, як їх читає браузер: ім'я без регістру, значення в подвійних, одинарних лапках
 * або без них, сутності розкодовані; з двох однакових атрибутів діє перший.
 */
function attrs(tag) {
	const out = Object.create(null);
	const body = tag.replace(/^<[\w-]+/, '').replace(/\/?>$/, '');
	for (const m of body.matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
		const name = m[1].toLowerCase();
		if (!(name in out)) out[name] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
	}
	return out;
}

const lower = (value) => (value ?? '').toLowerCase();

export function headOf(html) {
	// Закоментований тег (зокрема в app.html) і вміст <script> — не розмітка сторінки.
	const markup = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[\s\S]*?<\/script\s*>/gi, '');
	const links = tagsOf(markup, 'link').map(attrs);
	const metas = tagsOf(markup, 'meta').map(attrs);
	// `rel` — перелік токенів; `name` і `rel` порівнюються без регістру, як їх читає краулер.
	const hasRel = (a, token) => lower(a.rel).split(/\s+/).includes(token);
	const named = (key) => [
		...links.filter((a) => hasRel(a, key)).map((a) => a.href),
		...metas.filter((a) => lower(a.name) === key || lower(a.property) === key).map((a) => a.content)
	];
	// `none` = `noindex, nofollow`; тег окремого бота ховає сторінку від нього так само, як `robots` — від усіх.
	const directives = metas.filter((a) => ROBOTS_META.has(lower(a.name))).flatMap((a) => lower(a.content).split(',').map((d) => d.trim()));
	return {
		named,
		noindex: directives.includes('noindex') || directives.includes('none'),
		alternates: links.filter((a) => hasRel(a, 'alternate') && a.hreflang).map((a) => ({ lang: lower(a.hreflang), href: a.href }))
	};
}

/** Чи є файл для адреси, з точним регістром кожного сегмента (existsSync на Windows регістру не розрізняє). */
export function existsExact(root, relPath) {
	let dir = root;
	const parts = relPath.split('/').filter(Boolean);
	for (const [i, part] of parts.entries()) {
		if (!existsSync(dir) || !statSync(dir).isDirectory() || !readdirSync(dir).includes(part)) return false;
		dir = join(dir, part);
		if (i === parts.length - 1) return statSync(dir).isFile();
	}
	return false;
}

/** Адреса сторінки без origin і base → файл збірки саме цієї форми (з урахуванням кінцевого слеша). */
export const pageFileFor = (build, path) => {
	const clean = path.replace(/^\/+/, '');
	const file = clean === '' ? 'index.html' : clean.endsWith('/') ? `${clean}index.html` : /\.[a-z0-9]+$/i.test(clean) ? clean : `${clean}.html`;
	return existsExact(build, file) ? file : undefined;
};

/** Маршрут (`prerender.entries`, без форми слеша) → файл збірки будь-якої форми: форму запису дає trailingSlash проєкту. */
const routeFileFor = (build, route) => {
	const clean = route.replace(/^\/+|\/+$/g, '');
	const candidates = clean === '' ? ['index.html'] : [`${clean}/index.html`, `${clean}.html`, clean];
	return candidates.find((c) => existsExact(build, c));
};

export function checkSeo(build, policy) {
	const problems = [];
	const root = `${policy.origin}${policy.base}`;
	const pages = new Map();
	for (const file of htmlFiles(build)) {
		const rel = relative(build, file).split(sep).join('/');
		const html = readFileSync(file, 'utf8');
		pages.set(rel, { html, head: headOf(html) });
	}
	const toFile = (url) => (url?.startsWith(`${root}/`) ? pageFileFor(build, url.slice(root.length).replace(/[?#].*$/, '')) : undefined);

	for (const [rel, { html, head }] of pages) {
		// Абсолютних адрес, sveltekit-prerender і дублів мета-тегів не має ніхто, зокрема оболонка адаптера.
		if (html.includes('sveltekit-prerender')) problems.push(`${rel}: у HTML лишився sveltekit-prerender`);
		// `${SITE_ORIGIN}${base}/og.png` при відносному base: `https://host./og.png` або `https://host/App/../og.png`.
		if (/https?:\/\/[^"'\s<>/]+\.\.?\/|https?:\/\/[^"'\s<>]*\/\.{1,2}\//.test(html)) problems.push(`${rel}: абсолютний URL із ./ або ../ всередині`);
		for (const key of SINGLE_OWNER) {
			const n = head.named(key).length;
			if (n > 1) problems.push(`${rel}: ${key} трапляється ${n} рази — у тега два власники`);
		}
		// SPA-оболонка адаптера (404.html) — не сторінка: без вмісту, заголовка й canonical за побудовою.
		if ((policy.fallbackPages ?? []).includes(rel)) {
			if (head.named('canonical').length) problems.push(`${rel}: canonical на оболонці адаптера`);
			continue;
		}
		// Вміст — те, що в <main> (ACCESSIBILITY § 1: він один, у макеті): меню, підвал і табло макета дають понад 200
		// символів і сторінці, чий <main> тримає лише «Loading…» (SVELTEKIT-DATA § 2.5). Без <main> міряється все тіло.
		const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? '';
		const main = body.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i)?.[1];
		const text = (main ?? body)
			.replace(/<(script|style|template)\b[\s\S]*?<\/\1\s*>/gi, '')
			.replace(/<[^>]+>/g, '')
			.replace(/\s+/g, ' ')
			.trim();
		if (!(policy.shortPages ?? []).includes(rel) && text.length < 200) problems.push(`${rel}: ${main === undefined ? 'тіло' : '<main>'} майже порожнє (${text.length} симв. тексту)`);
		// Рахується <title> голови: inline-SVG у тілі має власний <title>, і це не другий заголовок сторінки.
		const headHtml = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
		if ((headHtml.match(/<title>/gi) ?? []).length !== 1 || /<title>\s*<\/title>/i.test(headHtml)) problems.push(`${rel}: <title> відсутній, порожній або подвійний`);
		// Будь-який тег, чий `type` — JSON-LD, за будь-якого порядку атрибутів, лапок і регістру (`id`, `nonce` поруч).
		for (const [, open = '', json = ''] of html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script\s*>/gi)) {
			if (lower(attrs(`<script${open}>`).type).trim() !== 'application/ld+json') continue;
			try {
				JSON.parse(json);
			} catch {
				problems.push(`${rel}: JSON-LD не розбирається як JSON (${json.slice(0, 30)}…)`);
			}
		}
		const canonical = head.named('canonical');
		if (head.noindex) {
			if (canonical.length) problems.push(`${rel}: canonical на сторінці з noindex`);
			continue;
		}
		if (canonical.length === 0) problems.push(`${rel}: немає canonical`);
		else if (!canonical[0].startsWith(`${root}/`)) problems.push(`${rel}: canonical не абсолютна або на чужий origin — ${canonical[0]}`);
		else if (!toFile(canonical[0])) problems.push(`${rel}: canonical ${canonical[0]} — файлу цієї форми адреси немає в build/ (кінцевий слеш — trailingSlash)`);

		if (head.alternates.length) {
			if (!head.alternates.some((a) => a.lang === 'x-default')) problems.push(`${rel}: hreflang без x-default`);
			if (!head.alternates.some((a) => a.href === canonical[0])) problems.push(`${rel}: hreflang не містить самої сторінки`);
			for (const { lang, href } of head.alternates) {
				const target = toFile(href);
				if (!target) {
					problems.push(`${rel}: hreflang ${lang} → ${href} — файлу цієї форми адреси немає в build/`);
					continue;
				}
				const back = pages.get(target)?.head.alternates ?? [];
				if (!back.some((a) => a.href === canonical[0])) problems.push(`${rel}: hreflang ${lang} → ${href} без зворотного посилання`);
			}
		}
	}

	const sitemapFile = join(build, 'sitemap.xml');
	const indexed = [...pages].filter(([rel, { head }]) => !head.noindex && !(policy.fallbackPages ?? []).includes(rel));
	if (!existsSync(sitemapFile)) {
		if (policy.expectsSitemap !== false && indexed.length) problems.push(`sitemap.xml: файлу немає в build/, а індексованих сторінок ${indexed.length} — крок generate-sitemap.mjs не виконався (§ 5)`);
		return problems;
	}
	const locs = [...readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeEntities(m[1].trim()));
	for (const loc of locs) {
		const target = toFile(loc);
		if (!target) problems.push(`sitemap: ${loc} — файлу цієї форми адреси немає в build/`);
		else if (pages.get(target)?.head.noindex) problems.push(`sitemap: ${loc} має noindex`);
	}
	for (const [rel, { head }] of indexed) {
		const canonical = head.named('canonical')[0];
		if (canonical && !locs.includes(canonical)) problems.push(`sitemap: немає ${canonical} (${rel})`);
	}
	return problems;
}

export function checkPrerenderEntries(build, policy) {
	return (policy.prerenderEntries ?? [])
		.filter((entry) => entry !== '*' && !entry.includes('['))
		.filter((entry) => !routeFileFor(build, entry))
		.map((entry) => `prerender.entries: ${entry} не збудувався — регістр або маршрут не існує`);
}
