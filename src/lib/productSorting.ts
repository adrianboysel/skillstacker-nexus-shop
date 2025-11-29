import type { ShopifyProduct } from "@/stores/cartStore";

/**
 * PRODUCT ORDER CONFIGURATION
 * 
 * Edit this object to control the order of products across all pages.
 * Lower numbers appear first. Products not listed will appear last.
 */
export const PRODUCT_ORDER_CONFIG: Record<string, number> = {
  // Featured new arrivals (top priority)
  "skill stacker wizard t-shirt": 1,
  "warrior in training kids relax hoodie": 2,
  "kids hoodie": 2,
  "king bomber jacket": 3,
  "meme militia bomber jacket": 3,
  "future soldier kids classic tee": 4,
  
  // Love Gangster products
  "love gangster": 5,
  
  // Canvas Prints
  "flow": 6,
  "stack skills": 7,
  "stumpy meadows": 8,
  
  // Meme Militia products
  "meme militia og hoodie": 9,
  "meme militia og hat": 10,
  "meme militia og t-shirt": 11,
  
  // Brand Hacker products
  "brand hacker t-shirt": 12,
  "brand hacker hat": 13,
  "brand hacker sticker pack": 14,
};

/**
 * Get the sort priority for a product
 */
const getSortPriority = (title: string): number => {
  const lowerTitle = title.toLowerCase();
  
  // Check for exact match first
  if (PRODUCT_ORDER_CONFIG[lowerTitle]) {
    return PRODUCT_ORDER_CONFIG[lowerTitle];
  }
  
  // Check for partial matches
  for (const [key, priority] of Object.entries(PRODUCT_ORDER_CONFIG)) {
    if (lowerTitle.includes(key) || key.includes(lowerTitle)) {
      return priority;
    }
  }
  
  // Default priority for products not in config
  return 999;
};

/**
 * Sort products by custom order defined in PRODUCT_ORDER_CONFIG
 */
export const sortProductsByCustomOrder = (products: ShopifyProduct[]): ShopifyProduct[] => {
  return [...products].sort((a, b) => {
    const priorityA = getSortPriority(a.node.title);
    const priorityB = getSortPriority(b.node.title);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same priority, sort alphabetically
    return a.node.title.localeCompare(b.node.title);
  });
};

/**
 * Sort products by price
 */
export const sortProductsByPrice = (products: ShopifyProduct[], direction: 'asc' | 'desc'): ShopifyProduct[] => {
  return [...products].sort((a, b) => {
    const priceA = parseFloat(a.node.priceRange.minVariantPrice.amount);
    const priceB = parseFloat(b.node.priceRange.minVariantPrice.amount);
    return direction === 'asc' ? priceA - priceB : priceB - priceA;
  });
};

/**
 * Sort products by name
 */
export const sortProductsByName = (products: ShopifyProduct[]): ShopifyProduct[] => {
  return [...products].sort((a, b) => a.node.title.localeCompare(b.node.title));
};
