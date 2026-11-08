import { logService } from '#lib/services/logService.svelte.js';
import { errorToMessageKey } from '#lib/errors/index.js';
import { chunkMissing, reloadOnce } from '#lib/utils/staleBuild.js';

export const handleError = ({ error, event }) => {
	const message = error instanceof Error ? error.message : String(error);
	if (message.includes('ResizeObserver loop')) return { message };

	const key = errorToMessageKey(error);
	logService.error('app', `Client error (${key}): ${message}`, {
		error,
		url: event?.url?.href
	});

	if (chunkMissing(error) && event?.url?.href && reloadOnce(event.url.href)) {
		logService.warn('app', 'stale build — reloading', { to: event.url.pathname });
	}

	return { message };
};
