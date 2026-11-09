import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AudioGraphManager } from './audioGraphManager.js';

describe('Web Audio Graph Lifecycle & Resource Management', () => {
	let manager;

	beforeEach(() => {
		manager = new AudioGraphManager();
	});

	afterEach(() => {
		manager.destroy();
	});

	it('initializes with null state before user interaction', () => {
		expect(manager.ctx).toBeNull();
		expect(manager.isUnlocked).toBe(false);
	});

	it('cleans up resources cleanly on destroy without throwing', () => {
		expect(() => manager.destroy()).not.toThrow();
		expect(manager.ctx).toBeNull();
		expect(manager.analyser).toBeNull();
		expect(manager.masterGain).toBeNull();
	});
});
