/**
 * Subdomain detection and redirect utilities
 * Handles slowdating.makefriendsandsocialize.com and www-to-root redirects
 */

export function getCurrentSubdomain(): string | null {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Handle localhost and Lovable preview/development environments
  if (hostname === 'localhost' || hostname.includes('lovable.app')) {
    // Check for query param override for testing
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('subdomain');
  }
  
  // Production: check if first part is a known subdomain
  // For makefriendsandsocialize.com, we expect: slowdating.makefriendsandsocialize.com
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Return the subdomain if it's not 'www'
    if (subdomain !== 'www') {
      return subdomain;
    }
  }
  
  return null;
}

export function isSlowDatingSubdomain(): boolean {
  return getCurrentSubdomain() === 'slowdating';
}

/**
 * Redirects www subdomain to root domain to prevent CDN caching issues.
 * Returns true if a redirect was triggered, false otherwise.
 */
export function redirectWwwToRoot(): boolean {
  const hostname = window.location.hostname;
  
  // Only run in production (not localhost or lovable.app preview)
  if (hostname === 'localhost' || hostname.includes('lovable.app')) {
    return false;
  }
  
  // Check if currently on www subdomain
  if (hostname.startsWith('www.')) {
    const rootDomain = hostname.replace('www.', '');
    const newUrl = `https://${rootDomain}${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(newUrl); // Use replace() to avoid back-button loop
    return true;
  }
  
  return false;
}

/**
 * Published host for password reset and auth flows.
 * This ensures reset links always land on a host that serves the actual app.
 */
const PUBLISHED_HOST = 'https://makefriendsandsocializecom.lovable.app';

/**
 * Redirects vanity preview hosts (preview--*.lovable.app) to the published host.
 * This prevents blank pages caused by Lovable gate/login screens on preview hosts.
 * Preserves pathname, search, and hash (critical for auth tokens).
 * Returns true if a redirect was triggered, false otherwise.
 */
export function redirectVanityPreviewToPublished(): boolean {
  const hostname = window.location.hostname;
  
  // Only run on Lovable preview hosts
  if (!hostname.endsWith('.lovable.app')) {
    return false;
  }
  
  // Check if on a vanity preview host (preview--*.lovable.app)
  // but NOT on id-preview-- (that's the dev preview which works fine)
  // and NOT already on the published host
  if (hostname.startsWith('preview--') && !hostname.startsWith('id-preview--')) {
    // Already on published host? No redirect needed
    if (hostname === 'makefriendsandsocializecom.lovable.app') {
      return false;
    }
    
    // Redirect to published host, preserving path, search, and hash
    const newUrl = `${PUBLISHED_HOST}${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(newUrl);
    return true;
  }
  
  return false;
}

/**
 * Returns the published host URL for use in auth redirects.
 */
export function getPublishedHost(): string {
  return PUBLISHED_HOST;
}

export function getSubdomainBaseUrl(subdomain: string): string {
  // In development, use query param
  if (window.location.hostname === 'localhost' || window.location.hostname.includes('lovable.app')) {
    return `${window.location.origin}?subdomain=${subdomain}`;
  }
  
  // In production, construct the subdomain URL
  const parts = window.location.hostname.split('.');
  const baseDomain = parts.slice(-2).join('.'); // e.g., makefriendsandsocialize.com
  return `https://${subdomain}.${baseDomain}`;
}
