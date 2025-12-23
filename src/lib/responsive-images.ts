/**
 * Utility functions for generating responsive image URLs
 */

/**
 * Generate responsive srcSet for Google Photos URLs
 * Google Photos supports dynamic sizing via =w{width} parameter
 */
export const getGooglePhotosSrcSet = (baseUrl: string, widths: number[] = [400, 600, 800, 1200]): string => {
  // Remove any existing size parameter
  const cleanUrl = baseUrl.replace(/=w\d+.*$/, '').replace(/=s\d+.*$/, '');
  
  return widths
    .map(w => `${cleanUrl}=w${w} ${w}w`)
    .join(', ');
};

/**
 * Generate responsive srcSet for Unsplash URLs
 * Unsplash supports w= param for sizing
 */
export const getUnsplashSrcSet = (
  baseUrl: string, 
  widths: number[] = [100, 200, 400],
  options: { fit?: string; crop?: string } = {}
): string => {
  const { fit = 'crop', crop = 'face' } = options;
  
  // Parse the base URL to handle existing params
  const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://images.unsplash.com${baseUrl}`);
  
  return widths
    .map(w => {
      url.searchParams.set('w', w.toString());
      url.searchParams.set('fit', fit);
      if (crop) url.searchParams.set('crop', crop);
      return `${url.toString()} ${w}w`;
    })
    .join(', ');
};

/**
 * Generate optimized Unsplash URL with specific dimensions
 */
export const getUnsplashUrl = (
  baseUrl: string,
  width: number,
  height?: number,
  options: { fit?: string; crop?: string; q?: number } = {}
): string => {
  const { fit = 'crop', crop = 'face', q = 80 } = options;
  
  try {
    const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://images.unsplash.com${baseUrl}`);
    url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('fit', fit);
    if (crop) url.searchParams.set('crop', crop);
    url.searchParams.set('q', q.toString());
    url.searchParams.set('auto', 'format'); // Auto-serve WebP when supported
    return url.toString();
  } catch {
    return baseUrl;
  }
};

/**
 * Generate sizes attribute for common layouts
 */
export const getSizesForLayout = (layout: 'full' | 'half' | 'third' | 'avatar'): string => {
  switch (layout) {
    case 'full':
      return '100vw';
    case 'half':
      return '(max-width: 640px) 100vw, 50vw';
    case 'third':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'avatar':
      return '48px';
    default:
      return '100vw';
  }
};
