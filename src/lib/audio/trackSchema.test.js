import { describe, it, expect } from 'vitest';
import { validateTrack, validateAlbum } from './trackSchema.js';

describe('Scalable Audio Media & Album Schema (AUDIO-SCALE-v10)', () => {
	it('validates correct track payload', () => {
		const validTrack = {
			id: 'track-01',
			title: 'Neon Horizon',
			artist: 'Deviant Blaze',
			album: 'Reignition',
			year: 2026,
			duration: 214,
			audioSrc: '/audio/neon-horizon.mp3'
		};

		expect(validateTrack(validTrack)).toBe(true);
	});

	it('rejects invalid or incomplete track payload', () => {
		expect(validateTrack(null)).toBe(false);
		expect(validateTrack({ id: '', title: 'No ID' })).toBe(false);
		expect(
			validateTrack({ id: '1', title: 'Zero Duration', audioSrc: '/a.mp3', duration: 0 })
		).toBe(false);
	});

	it('validates complete album metadata containing valid tracks', () => {
		const validAlbum = {
			id: 'album-01',
			title: 'Reignition',
			year: 2026,
			coverSrc: '/images/album-cover.webp',
			tracks: [
				{
					id: 'track-01',
					title: 'Neon Horizon',
					artist: 'Deviant Blaze',
					album: 'Reignition',
					year: 2026,
					duration: 214,
					audioSrc: '/audio/neon-horizon.mp3'
				}
			]
		};

		expect(validateAlbum(validAlbum)).toBe(true);
	});
});
