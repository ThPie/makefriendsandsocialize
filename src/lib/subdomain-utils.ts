/**
 * Subdomain detection and redirect utilities
 * Handles slowdating.makefriendsandsocialize.com/.ca and www-to-root redirects
 */

// Known TLDs for our domains
const KNOWN_TLDS = ['com', 'ca'];
const BASE_DOMAIN = 'makefriendsandsocialize';

/**
 * Gets the TLD from the current hostname (.com, .ca, etc.)
 */
export function getTLD(): string | null {
  const hostname = window.location.hostname;
  
  // Handle localhost and Lovable preview environments
  if (hostname === 'localhost' || hostname.includes('lovable.app')) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tld') || 'com';
  }
  
  const parts = hostname.split('.');
  const tld = parts[parts.length - 1];
  
  return KNOWN_TLDS.includes(tld) ? tld : null;
}

/**
 * Returns true if the user is on a .ca domain
 */
export function isCanadianDomain(): boolean {
  return getTLD() === 'ca';
}

/**
 * Gets the base domain (makefriendsandsocialize.com or .ca)
 */
export function getBaseDomain(): string {
  const tld = getTLD();
  return `${BASE_DOMAIN}.${tld || 'com'}`;
}

/**
 * Gets the equivalent Canadian (.ca) URL for the current page
 */
export function getEquivalentCanadianUrl(): string {
  const hostname = window.location.hostname;
  
  // Handle localhost and Lovable preview environments
  if (hostname === 'localhost' || hostname.includes('lovable.app')) {
    const url = new URL(window.location.href);
    url.searchParams.set('tld', 'ca');
    return url.toString();
  }
  
  // Replace .com with .ca in the hostname
  const canadianHostname = hostname.replace(/\.com$/, '.ca');
  return `https://${canadianHostname}${window.location.pathname}${window.location.search}${window.location.hash}`;
}

/**
 * Gets the equivalent .com URL for the current page
 */
export function getEquivalentComUrl(): string {
  const hostname = window.location.hostname;
  
  // Handle localhost and Lovable preview environments
  if (hostname === 'localhost' || hostname.includes('lovable.app')) {
    const url = new URL(window.location.href);
    url.searchParams.set('tld', 'com');
    return url.toString();
  }
  
  // Replace .ca with .com in the hostname
  const comHostname = hostname.replace(/\.ca$/, '.com');
  return `https://${comHostname}${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function getCurrentSubdomain(): string | null {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Handle localhost and Lovable preview/development environments
  if (hostname === 'localhost' || hostname.includes('lovable.app')) {
    // Check for query param override for testing
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('subdomain');
  }
  
  // Production: check if we have a subdomain
  // For makefriendsandsocialize.com or makefriendsandsocialize.ca, we expect:
  // - Root: ['makefriendsandsocialize', 'com'] (2 parts)
  // - Subdomain: ['slowdating', 'makefriendsandsocialize', 'com'] (3 parts)
  // - www: ['www', 'makefriendsandsocialize', 'com'] (3 parts, but www is ignored)
  
  const tld = parts[parts.length - 1];
  
  // Only process if we're on a known TLD
  if (!KNOWN_TLDS.includes(tld)) {
    return null;
  }
  
  // Check if the second-to-last part is our base domain
  if (parts.length >= 2 && parts[parts.length - 2] === BASE_DOMAIN) {
    // If we have more than 2 parts, the first part is the subdomain
    if (parts.length > 2) {
      const subdomain = parts[0];
      // Return the subdomain if it's not 'www'
      if (subdomain !== 'www') {
        return subdomain;
      }
    }
  }
  
  return null;
}

export function isSlowDatingSubdomain(): boolean {
  return getCurrentSubdomain() === 'slowdating';
}

/**
 * Redirects www subdomain to root domain to prevent CDN caching issues.
 * Supports both .com and .ca domains.
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
  const hostname = window.location.hostname;
  
  // In development, use query param
  if (hostname === 'localhost' || hostname.includes('lovable.app')) {
    return `${window.location.origin}?subdomain=${subdomain}`;
  }
  
  // In production, construct the subdomain URL with the correct TLD
  const baseDomain = getBaseDomain();
  return `https://${subdomain}.${baseDomain}`;
}

/**
 * Gets the slow dating subdomain URL
 */
export function getSlowDatingSubdomainUrl(): string {
  return getSubdomainBaseUrl('slowdating');
}
