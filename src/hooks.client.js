import { logService } from '#lib/services/logService.svelte.js';
import { errorToMessageKey } from '#lib/errors/index.js';

export const handleError = ({ error, event }) => {
	const message = error instanceof Error ? error.message : String(error);
	const key = errorToMessageKey(error);
	logService.error('app', `Client error (${key}): ${message}`, {
		error,
		url: event?.url?.href
	});
	return { message };
};
