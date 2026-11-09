import { MOEYS_EMBLEM_DATA_URI } from './moeysEmblemDataUri';
import {
  DEFAULT_FLOURISH_DATA_URI,
  resolveFlourishUrl,
  FLOURISH_DATA_URIS,
} from './flourishDataUris';

export {
  MOEYS_EMBLEM_DATA_URI,
  DEFAULT_FLOURISH_DATA_URI,
  resolveFlourishUrl,
  FLOURISH_DATA_URIS,
};

/**
 * Asset URL Resolver for GitHub Pages & Offline PWA
 * Ensures assets always load with the correct Vite base URL (e.g. /Student-Card/)
 */
export function getAssetUrl(path: string | undefined): string {
  if (!path) return '';
  if (
    path.startsWith('data:') ||
    path.startsWith('blob:') ||
    path.startsWith('http://') ||
    path.startsWith('https://')
  ) {
    return path;
  }

  const meta = import.meta as unknown as { env?: { BASE_URL?: string } };
  const base = meta.env?.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}

export const MOEYS_EMBLEM_PATH = 'images/moeys_emblem.svg';
export const DEFAULT_FLOURISH_PATH = 'images/flourishes/flourish_1_blue.png';

/**
 * Returns the MoEYS emblem URL with fallback to embedded SVG Data URI.
 * Guaranteed to NEVER return a broken image or 404!
 */
export function getMoeysEmblemUrl(): string {
  return MOEYS_EMBLEM_DATA_URI;
}

export function getDefaultFlourishUrl(): string {
  return DEFAULT_FLOURISH_DATA_URI;
}
