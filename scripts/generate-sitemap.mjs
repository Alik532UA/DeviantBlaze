import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { escapeXml, headOf, htmlFiles } from './check-build/seo.mjs';

const BUILD = 'build';

const urls = htmlFiles(BUILD)
	.map((file) => headOf(readFileSync(file, 'utf8')))
	.filter((head) => !head.noindex)
	.map((head) => head.named('canonical')[0])
	.filter((url) => url !== undefined)
	.sort();

const body = [...new Set(urls)].map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n');
writeFileSync(
	join(BUILD, 'sitemap.xml'),
	`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
);
console.log(`sitemap.xml: ${urls.length} адреса(и)`);
