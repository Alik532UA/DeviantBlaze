// @vitest-environment node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inlineScriptHash, asBrowserSees } from '../vite.config.js';

/**
 * Хеш інлайн-скрипта у CSP мусить збігатися з тим, що обчислить БРАУЗЕР (SECURITY-v10 § 6.3.1).
 */

const sha256 = (text) => `sha256-${createHash('sha256').update(text).digest('base64')}`;

function inlineScripts() {
	const html = readFileSync('src/app.html', 'utf8').replace(/<!--[\s\S]*?-->/g, (comment) =>
		' '.repeat(comment.length)
	);
	return [...html.matchAll(/<script\b(?![^>]*\ssrc\s*=)[^>]*>([\s\S]*?)<\/script\s*>/gi)].map(
		(m) => m[1] ?? ''
	);
}

describe('CSP: хеш інлайн-скрипта збігається з тим, що обчислить браузер', () => {
	it('перевірка жива: інлайн-скрипт знайдено і inlineScriptHash генерує валідний sha256', () => {
		const scripts = inlineScripts();
		expect(scripts.length, 'у app.html немає інлайн-скриптів').toBeGreaterThan(0);
		const hash = inlineScriptHash();
		expect(hash.startsWith('sha256-')).toBe(true);
	});

	it('кожен скрипт стоїть після %sveltekit.head% — мета-політика діє лише на те, що після неї', () => {
		const html = readFileSync('src/app.html', 'utf8').replace(/<!--[\s\S]*?-->/g, (comment) =>
			' '.repeat(comment.length)
		);
		const head = html.indexOf('%sveltekit.head%');
		expect(head, 'у app.html немає %sveltekit.head%').toBeGreaterThanOrEqual(0);
		const above = [...html.matchAll(/<script\b[^>]*>/g)]
			.filter((m) => (m.index ?? 0) < head)
			.map((m) => m[0]);
		expect(above, 'скрипт вище %sveltekit.head% політикою не покритий').toEqual([]);
	});

	it('%sveltekit.head% і %sveltekit.body% стоять по одному разу й поза коментарями', () => {
		const raw = readFileSync('src/app.html', 'utf8');
		const comments = [...raw.matchAll(/<!--[\s\S]*?-->/g)].map((m) => m[0]);
		for (const tag of ['%sveltekit.head%', '%sveltekit.body%']) {
			expect(
				comments.filter((comment) => comment.includes(tag)),
				`${tag} у коментарі app.html`
			).toEqual([]);
			expect(raw.split(tag).length - 1, `${tag} мусить стояти в app.html рівно один раз`).toBe(1);
		}
	});

	it('хеш з inlineScriptHash збігається з обчисленим браузерним хешем', () => {
		const scripts = inlineScripts();
		const expectedHash = sha256(asBrowserSees(scripts[0]));
		expect(inlineScriptHash()).toBe(expectedHash);
	});
});

