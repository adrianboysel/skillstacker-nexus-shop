import type { ShopifyProduct } from "@/stores/cartStore";

/**
 * PRODUCT ORDER CONFIGURATION
 * 
 * Edit this object to control the order of products across all pages.
 * Lower numbers appear first. Products not listed will appear last.
 */
export const PRODUCT_ORDER_CONFIG: Record<string, number> = {
  // Meme Militia products (featured first)
  "meme militia og hoodie": 1,
  "meme militia og hat": 2,
  "meme militia og t-shirt": 3,
  
  // Brand Hacker products
  "brand hacker t-shirt": 4,
  "brand hacker hat": 5,
  "brand hacker sticker pack": 6,
  
  // Skill Stacker products
  "skill stacker wizard t-shirt": 7,
  "flow": 8,
  "stack skills": 9,
  "stumpy meadows": 10,
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
