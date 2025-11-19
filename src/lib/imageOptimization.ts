/**
 * Image Optimization Utilities
 * Helpers for improving Core Web Vitals and image loading performance
 */

/**
 * Get optimized Shopify image URL with size parameters
 * @param url - Original Shopify CDN image URL
 * @param width - Desired width in pixels
 * @param height - Desired height in pixels (optional)
 * @returns Optimized image URL with size parameters
 */
export const getOptimizedShopifyImage = (
  url: string,
  width: number,
  height?: number
): string => {
  if (!url || !url.includes('cdn.shopify.com')) {
    return url;
  }

  // Shopify CDN supports image transformations via URL parameters
  const sizeParam = height ? `${width}x${height}` : `${width}x`;
  
  // Remove existing size parameters if any
  const cleanUrl = url.split('?')[0];
  
  // Add size parameter before file extension
  const parts = cleanUrl.split('/');
  const filename = parts[parts.length - 1];
  const [name, ext] = filename.split(/\.(?=[^.]+$)/);
  
  parts[parts.length - 1] = `${name}_${sizeParam}.${ext}`;
  
  return parts.join('/');
};

/**
 * Generate responsive image srcset for different screen sizes
 * @param url - Original image URL
 * @param widths - Array of widths for different breakpoints
 * @returns srcSet string for responsive images
 */
export const generateResponsiveSrcSet = (
  url: string,
  widths: number[] = [400, 600, 800, 1200]
): string => {
  if (!url || !url.includes('cdn.shopify.com')) {
    return '';
  }

  return widths
    .map(width => `${getOptimizedShopifyImage(url, width)} ${width}w`)
    .join(', ');
};

/**
 * Calculate aspect ratio for image dimensions
 * @param width - Image width
 * @param height - Image height
 * @returns Aspect ratio as string (e.g., "16/9")
 */
export const getAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
};

/**
 * Preload critical images for better LCP scores
 * @param imageUrls - Array of critical image URLs to preload
 */
export const preloadCriticalImages = (imageUrls: string[]) => {
  if (typeof window === 'undefined') return;

  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  });
};
