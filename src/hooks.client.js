import { logService } from "#lib/services/logService.svelte.js";

export const handleError = ({ error, event }) => {
  const message = error instanceof Error ? error.message : String(error);
  logService.error("app", `Client error: ${message}`, {
    error,
    url: event?.url?.href,
  });
  return { message };
};
