/**
 * Scalable Audio Media & Album Schema Validator.
 * Validates dynamic track, album, and playlist manifests before loading into Web Audio graph.
 */

/**
 * @param {unknown} track
 * @returns {track is import('../types/audio').TrackMetadata}
 */
export function validateTrack(track) {
	if (!track || typeof track !== 'object') return false;
	const t = /** @type {Record<string, unknown>} */ (track);

	if (typeof t.id !== 'string' || !t.id.trim()) return false;
	if (typeof t.title !== 'string' || !t.title.trim()) return false;
	if (typeof t.audioSrc !== 'string' || !t.audioSrc.trim()) return false;
	if (typeof t.duration !== 'number' || t.duration <= 0) return false;

	return true;
}

/**
 * @param {unknown} album
 * @returns {album is import('../types/audio').AlbumMetadata}
 */
export function validateAlbum(album) {
	if (!album || typeof album !== 'object') return false;
	const a = /** @type {Record<string, unknown>} */ (album);

	if (typeof a.id !== 'string' || !a.id.trim()) return false;
	if (typeof a.title !== 'string' || !a.title.trim()) return false;
	if (!Array.isArray(a.tracks) || a.tracks.length === 0) return false;

	return a.tracks.every((track) => validateTrack(track));
}
