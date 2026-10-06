/**
 * Storage Namespace Prefix (STORAGE-NAMESPACE-v10 § 1)
 * Guaranteed unique prefix per application on shared GitHub Pages origin (alik532ua.github.io).
 */

const PROJECT_PREFIX = 'deviantblaze_';

/** Environment qualifier: production uses project prefix, dev builds use -dev_ */
const ENV = import.meta.env.VITE_ENV ?? 'prod';

export const STORAGE_PREFIX = ENV === 'prod' ? PROJECT_PREFIX : `${PROJECT_PREFIX.slice(0, -1)}-${ENV}_`;
