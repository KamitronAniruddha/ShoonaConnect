/**
 * Utility to generate website links for ShoonaConnect.
 * 
 * In Google AI Studio:
 * - `ais-pre-*` is the Public Shared Live URL. It works for anyone on any phone without login,
 *   activated once the user clicks "Share" in the AI Studio top toolbar.
 * - `ais-dev-*` is the Direct Dev Session URL.
 */

export const PUBLIC_SHARED_APP_URL = 'https://ais-pre-nxhc6yybouoge73wuv5ija-710631563192.asia-southeast1.run.app';
export const DEV_APP_URL = 'https://ais-dev-nxhc6yybouoge73wuv5ija-710631563192.asia-southeast1.run.app';

export function getLiveWorkingAppUrl(pairCode?: string): string {
  let origin = PUBLIC_SHARED_APP_URL;

  if (typeof window !== 'undefined' && window.location) {
    const currentOrigin = window.location.origin;
    if (currentOrigin.includes('ais-dev-')) {
      origin = currentOrigin.replace('ais-dev-', 'ais-pre-');
    } else if (currentOrigin && !currentOrigin.includes('localhost')) {
      origin = currentOrigin;
    }
  }

  if (pairCode && pairCode.trim()) {
    const clean = encodeURIComponent(pairCode.trim().toUpperCase());
    return `${origin}/?pairCode=${clean}`;
  }

  return origin;
}

export function getDirectDevAppUrl(pairCode?: string): string {
  let origin = DEV_APP_URL;

  if (typeof window !== 'undefined' && window.location) {
    const currentOrigin = window.location.origin;
    if (currentOrigin && !currentOrigin.includes('localhost')) {
      origin = currentOrigin;
    }
  }

  if (pairCode && pairCode.trim()) {
    const clean = encodeURIComponent(pairCode.trim().toUpperCase());
    return `${origin}/?pairCode=${clean}`;
  }

  return origin;
}

export function isPrivateDevEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.origin.includes('ais-dev-');
}
