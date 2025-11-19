/**
 * Category Slug Utilities
 * Convert between category names and URL-friendly slugs for SEO
 */

/**
 * Convert category name to URL-friendly slug
 * @param category - Category name (e.g., "Love Gangster")
 * @returns URL slug (e.g., "love-gangster")
 */
export const categoryToSlug = (category: string): string => {
  return category
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
};

/**
 * Convert URL slug back to category name
 * @param slug - URL slug (e.g., "love-gangster")
 * @returns Category name (e.g., "love gangster")
 */
export const slugToCategory = (slug: string): string => {
  return slug
    .toLowerCase()
    .replace(/-/g, ' ')
    .trim();
};

/**
 * Get display name for category
 * @param category - Category name or slug
 * @returns Human-readable display name
 */
export const getCategoryDisplayName = (category: string): string => {
  const normalized = category.includes('-') ? slugToCategory(category) : category.toLowerCase();
  
  const displayNames: { [key: string]: string } = {
    "skill stacker": "Skill Stacker",
    "brand butler": "Brand Butler",
    "brand hacker": "Brand Hacker",
    "meme militia": "Meme Militia",
    "love gangster": "Love Gangster",
    "shirts": "Shirts",
    "hats": "Hats",
    "hoodies": "Hoodies",
    "sweatshirts": "Sweatshirts",
    "canvas": "Canvas",
  };
  
  return displayNames[normalized] || normalized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * All valid category slugs for routing and validation
 */
export const VALID_CATEGORY_SLUGS = [
  'skill-stacker',
  'brand-butler',
  'brand-hacker',
  'meme-militia',
  'love-gangster',
  'shirts',
  'hats',
  'hoodies',
  'sweatshirts',
  'canvas',
] as const;

export type CategorySlug = typeof VALID_CATEGORY_SLUGS[number];
