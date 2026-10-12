import { logService } from '$lib/services/logService.svelte.js';

export const handleError = ({ error, event, status, message }) => {
	logService.error('app', `Client error: ${message}`, { error, status, url: event?.url?.href });
	return { message };
};
