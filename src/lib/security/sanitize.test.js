import { describe, expect, it } from 'vitest';
import { escapeHtml, sanitizeHtml, sanitizeSvg } from './sanitize.js';

describe('Security: Sanitization (SECURITY-v10 § 5.2)', () => {
	it('escapes standard HTML special characters', () => {
		const raw = `<script>alert("XSS & 'injection'")</script>`;
		const escaped = escapeHtml(raw);
		expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS &amp; &#39;injection&#39;&quot;)&lt;/script&gt;');
		expect(escaped).not.toContain('<');
		expect(escaped).not.toContain('>');
	});

	it('strips script tags from SVG', () => {
		const maliciousSvg = `<svg><script>alert(1)</script><circle cx="10" cy="10" r="5"/></svg>`;
		const cleaned = sanitizeSvg(maliciousSvg);
		expect(cleaned).not.toContain('<script');
		expect(cleaned).toContain('<circle');
	});

	it('strips event handlers (onload, onclick, onerror)', () => {
		const maliciousSvg = `<svg onload="alert('pwn')" onclick="doHarm()"><image href="x" onerror="evil()"/></svg>`;
		const cleaned = sanitizeSvg(maliciousSvg);
		expect(cleaned).not.toMatch(/on\w+\s*=/i);
	});

	it('strips javascript: protocol pseudo-URLs', () => {
		const malicious = `<a href="javascript:alert(1)">link</a>`;
		const cleaned = sanitizeHtml(malicious);
		expect(cleaned).not.toContain('javascript:');
	});

	it('handles empty or nullish values gracefully', () => {
		expect(escapeHtml('')).toBe('');
		// @ts-expect-error testing null input
		expect(escapeHtml(null)).toBe('');
		expect(sanitizeSvg('')).toBe('');
		expect(sanitizeHtml('')).toBe('');
	});
});

