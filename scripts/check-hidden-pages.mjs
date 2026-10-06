import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { headOf } from './check-build/seo.mjs';

const BUILD = 'build';
const HIDDEN = Object.values(JSON.parse(readFileSync('src/lib/i18n/hidden-routes.json', 'utf8')));
const SHELLS = new Set(['404.html', '200.html']);

export function checkHiddenPages(build = BUILD) {
	const problems = [];
	const pages = [];

	(function walk(dir) {
		if (!existsSync(dir)) return;
		for (const entry of readdirSync(dir)) {
			const full = join(dir, entry);
			if (statSync(full).isDirectory()) {
				if (entry !== '_app') walk(full);
			} else if (entry.endsWith('.html')) {
				pages.push(relative(build, full).split('\\').join('/'));
			}
		}
	})(build);

	if (pages.length === 0) {
		problems.push('жодної сторінки в build/');
		return problems;
	}

	const isHidden = (page) => HIDDEN.some((slug) => page === `${slug}.html` || page.startsWith(`${slug}/`));
	const sitemap = existsSync(join(build, 'sitemap.xml')) ? readFileSync(join(build, 'sitemap.xml'), 'utf8') : '';
	const robots = existsSync(join(build, 'robots.txt')) ? readFileSync(join(build, 'robots.txt'), 'utf8') : '';

	for (const page of pages) {
		if (!/^[\x20-\x7e]*$/.test(page)) problems.push(`${page}: не-ASCII у назві маршруту`);
		if (SHELLS.has(page)) continue;
		const html = readFileSync(join(build, page), 'utf8');
		const head = headOf(html);
		const canonical = head.named('canonical').length > 0;
		const hreflang = head.alternates.length > 0;

		if (isHidden(page)) {
			if (!head.noindex) problems.push(`${page}: прихована без noindex`);
			if (canonical || hreflang) problems.push(`${page}: прихована з canonical/hreflang`);
		} else {
			if (!canonical || head.noindex) problems.push(`${page}: звичайна сторінка з noindex або без canonical`);
		}
	}

	for (const hidden of HIDDEN) {
		if (![`${hidden}.html`, `${hidden}/index.html`].some((p) => pages.includes(p))) {
			problems.push(`${hidden}: прихованої сторінки немає в збірці`);
		}
		if (sitemap.includes(hidden)) problems.push(`${hidden}: є в sitemap.xml`);
		if (robots.includes(hidden)) problems.push(`${hidden}: є в robots.txt — noindex без Disallow (§ 4.0)`);
	}

	return problems;
}

if (process.argv[1] && process.argv[1].endsWith('check-hidden-pages.mjs')) {
	const probs = checkHiddenPages();
	if (probs.length > 0) {
		console.error(`❌ check-hidden-pages: ${probs.length} problem(s) found:\n` + probs.map((p) => `  - ${p}`).join('\n'));
		process.exit(1);
	} else {
		console.log('✅ check-hidden-pages: OK');
	}
}
