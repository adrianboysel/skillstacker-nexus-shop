/**
 * Category Content Configuration
 * SEO-optimized content for each category landing page
 */

export interface CategoryContent {
  slug: string;
  h1: string;
  title: string;
  description: string;
  longDescription: string;
  keywords: string[];
  featuredProducts?: string[]; // Product titles or handles to feature
}

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  "love-gangster": {
    slug: "love-gangster",
    h1: "Love Gangster Collection",
    title: "Love Gangster Merch - Street Style Meets Bold Expression",
    description: "Where love meets the streets. Bold designs for those who live by their own rules.",
    longDescription: "Discover the Love Gangster Collection - a bold fusion of street culture and authentic self-expression. Our exclusive merchandise features premium quality apparel designed for those who dare to be different. From statement hoodies to iconic hats, each piece tells a story of confidence and individuality.",
    keywords: ["love gangster", "street fashion", "bold apparel", "statement clothing", "urban style", "authentic merch"],
    featuredProducts: ["love gangster flexfit hat"]
  },
  "skill-stacker": {
    slug: "skill-stacker",
    h1: "Skill Stacker Official Merch",
    title: "Skill Stacker Merchandise - Learn, Build, Scale",
    description: "Official Skill Stacker merchandise for builders, creators, and lifelong learners.",
    longDescription: "Represent the Skill Stacker community with premium merchandise designed for entrepreneurs, developers, and creators. Our collection celebrates the journey of continuous learning and skill development. Wear your commitment to growth with pride.",
    keywords: ["skill stacker", "developer merch", "entrepreneur clothing", "learning community", "tech apparel", "creator merch"],
    featuredProducts: ["skill stacker wizard t-shirt"]
  },
  "brand-butler": {
    slug: "brand-butler",
    h1: "Brand Butler Collection",
    title: "Brand Butler Merch - Build Your Brand with Style",
    description: "Premium merchandise for brand builders and marketing professionals.",
    longDescription: "The Brand Butler Collection offers premium apparel and accessories for brand builders, marketers, and creative professionals. Each piece is crafted to reflect the professionalism and creativity required in today's branding landscape.",
    keywords: ["brand butler", "branding merch", "marketing apparel", "professional clothing", "creative wear"],
    featuredProducts: []
  },
  "brand-hacker": {
    slug: "brand-hacker",
    h1: "Brand Hacker Collection",
    title: "Brand Hacker Merch - Hack Your Way to Success",
    description: "Bold merchandise for brand hackers who break the mold and create new paths.",
    longDescription: "The Brand Hacker Collection is designed for innovators who challenge conventional branding strategies. Our merchandise celebrates the rebellious spirit of those who hack their way to brand success through creativity and unconventional thinking.",
    keywords: ["brand hacker", "innovative branding", "creative disruption", "marketing innovation", "brand strategy"],
    featuredProducts: ["brand hacker t-shirt", "brand hacker hat", "brand hacker sticker pack"]
  },
  "meme-militia": {
    slug: "meme-militia",
    h1: "Meme Militia Collection",
    title: "Meme Militia Merch - Join the Cultural Revolution",
    description: "Exclusive drops from the creative collective behind the meme movement.",
    longDescription: "Join the Meme Militia - a cultural movement that celebrates internet culture, creativity, and community. Our exclusive collection features limited edition pieces that capture the spirit of digital expression and collective creativity.",
    keywords: ["meme militia", "meme culture", "internet fashion", "digital community", "creative collective", "limited edition"],
    featuredProducts: ["meme militia og hoodie", "meme militia og hat", "meme militia og t-shirt"]
  },
  "shirts": {
    slug: "shirts",
    h1: "Premium T-Shirts & Shirts Collection",
    title: "T-Shirts & Shirts - Quality Apparel for Every Style",
    description: "Discover our collection of premium t-shirts and shirts featuring unique designs.",
    longDescription: "Explore our curated selection of premium t-shirts and shirts, crafted from high-quality materials and featuring exclusive designs. From casual everyday wear to statement pieces, find the perfect shirt to express your style.",
    keywords: ["t-shirts", "premium shirts", "quality apparel", "graphic tees", "casual wear", "comfortable clothing"],
    featuredProducts: []
  },
  "hats": {
    slug: "hats",
    h1: "Hats & Headwear Collection",
    title: "Hats - Premium Headwear for Every Occasion",
    description: "Complete your look with our collection of premium hats and headwear.",
    longDescription: "Our hat collection features premium headwear from snapbacks to flexfit caps. Each piece is designed for comfort and style, making them perfect for everyday wear or special occasions.",
    keywords: ["hats", "headwear", "caps", "snapbacks", "flexfit", "accessories", "premium hats"],
    featuredProducts: []
  },
  "hoodies": {
    slug: "hoodies",
    h1: "Hoodies & Sweatshirts Collection",
    title: "Hoodies - Comfort Meets Style",
    description: "Stay cozy and stylish with our premium hoodie collection.",
    longDescription: "Discover ultimate comfort with our premium hoodie collection. Made from high-quality materials, our hoodies combine warmth, comfort, and style. Perfect for layering or wearing solo, each piece is designed to last.",
    keywords: ["hoodies", "sweatshirts", "comfort wear", "premium hoodies", "casual fashion", "cozy apparel"],
    featuredProducts: []
  },
  "sweatshirts": {
    slug: "sweatshirts",
    h1: "Sweatshirts Collection",
    title: "Sweatshirts - Classic Comfort for Every Day",
    description: "Timeless sweatshirts designed for comfort and versatility.",
    longDescription: "Our sweatshirt collection offers classic comfort with modern style. Perfect for any season, these versatile pieces are wardrobe essentials that combine quality craftsmanship with timeless design.",
    keywords: ["sweatshirts", "casual wear", "comfortable clothing", "everyday essentials", "quality sweatshirts"],
    featuredProducts: []
  },
  "canvas": {
    slug: "canvas",
    h1: "Canvas Art Collection",
    title: "Canvas Prints - Transform Your Space",
    description: "Premium canvas prints featuring stunning designs for your walls.",
    longDescription: "Transform your space with our premium canvas art collection. Each piece is professionally printed on high-quality canvas material, ready to hang and make a statement in any room.",
    keywords: ["canvas prints", "wall art", "home decor", "art prints", "premium canvas", "interior design"],
    featuredProducts: ["flow", "stack skills", "stumpy meadows"]
  },
  "all": {
    slug: "all",
    h1: "New Arrival Products",
    title: "Shop All - Latest Releases",
    description: "Explore our latest product releases and new arrivals across all collections.",
    longDescription: "Browse our newest releases featuring the latest designs across all collections. From fresh apparel drops to exclusive limited editions, discover what's new in our store.",
    keywords: ["new arrivals", "latest products", "new releases", "shop all", "latest drops"],
    featuredProducts: []
  }
};

export const getCategoryContent = (categorySlug?: string): CategoryContent => {
  if (!categorySlug) {
    return CATEGORY_CONTENT["all"];
  }
  
  return CATEGORY_CONTENT[categorySlug] || CATEGORY_CONTENT["all"];
};
