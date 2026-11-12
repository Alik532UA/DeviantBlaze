import { describe, it, expect } from 'vitest';
import { chunkMissing } from './staleBuild.js';

describe('Stale Build Recovery (VERSIONING-v10 § 6)', () => {
	it('detects missing dynamically imported chunk errors', () => {
		const typeErr = new TypeError('Failed to fetch dynamically imported module');
		expect(chunkMissing(typeErr)).toBe(true);

		const genericErr = new Error('error loading dynamically imported chunk');
		expect(chunkMissing(genericErr)).toBe(true);
	});

	it('ignores unrelated regular errors', () => {
		const regularErr = new Error('AudioContext was not allowed to start');
		expect(chunkMissing(regularErr)).toBe(false);
	});
});
