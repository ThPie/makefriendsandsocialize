/**
 * Utility to optimize Google-hosted images (lh3.googleusercontent.com)
 * Documentation: https://developers.google.com/photos/library/guides/access-media-items#base-urls
 */

interface OptimizeGoogleImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    crop?: boolean;
}

export function optimizeGoogleImageUrl(url: string, options: OptimizeGoogleImageOptions = {}): string {
    if (!url || !url.includes('lh3.googleusercontent.com')) return url;

    // Remove existing parameters if any (e.g., =w800-h600)
    const base = url.split('=')[0];

    const params: string[] = [];

    if (options.width) params.push(`w${options.width}`);
    if (options.height) params.push(`h${options.height}`);
    if (options.quality) params.push(`q${options.quality}`);
    if (options.crop) params.push('c');

    // Default to WebP if possible (standard behavior for these URLs when no format specified)
    // or use -v to force specific versions if needed.

    return params.length > 0 ? `${base}=${params.join('-')}` : url;
}

/**
 * Generates a very low resolution URL for LQIP (Low Quality Image Placeholder)
 */
export function getLqipUrl(url: string): string {
    return optimizeGoogleImageUrl(url, { width: 20, quality: 20 });
}
