/**
 * Subdomain detection utilities for handling slowdating.makefriendsandsocialize.com
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
