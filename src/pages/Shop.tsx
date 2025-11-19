import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { ProductCard } from "@/components/ProductCard";
import { storefrontApiRequest, PRODUCTS_QUERY } from "@/lib/shopify";
import type { ShopifyProduct } from "@/stores/cartStore";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  sortProductsByCustomOrder, 
  sortProductsByPrice, 
  sortProductsByName 
} from "@/lib/productSorting";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { slugToCategory, getCategoryDisplayName } from "@/lib/categorySlug";
import loveGangsterLogo from "@/assets/love-gangster-logo.png";

const Shop = () => {
  const { category: categorySlug } = useParams();
  const category = categorySlug ? slugToCategory(categorySlug) : '';
  const [sortBy, setSortBy] = useState<string>("custom");

  const { data, isLoading } = useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const response = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50 });
      let products = response.data.products.edges as ShopifyProduct[];
      
      // Filter by category if specified
      if (category) {
        // Map category names to Shopify productType values
        const categoryMap: { [key: string]: string[] } = {
          "shirts": ["T-Shirts", "Shirts"],
          "hats": ["Hats"],
          "hoodies": ["Hoodies"],
          "sweatshirts": ["Sweatshirts"],
          "canvas": ["Canvas", "Canvas Print", "Wall Art"],
          // Brand filters
          "skill stacker": ["skill stacker"],
          "brand butler": ["brand butler"],
          "brand hacker": ["brand hacker"],
          "meme militia": ["meme militia"],
          "love gangster": ["love gangster"],
        };
        
        const validTypes = categoryMap[category.toLowerCase()];
        if (validTypes) {
          products = products.filter((product) => 
            validTypes.some(type => 
              product.node.productType.toLowerCase().includes(type.toLowerCase()) ||
              product.node.title.toLowerCase().includes(category.toLowerCase()) ||
              product.node.tags?.some((tag: string) => tag.toLowerCase().includes(category.toLowerCase()))
            )
          );
        }
      } else {
        // When no category is selected, show only products tagged as "new"
        products = products.filter((product) => 
          product.node.tags?.some((tag: string) => tag.toLowerCase() === 'new')
        );
      }
      
      return products;
    },
  });

  const getCategoryTitle = () => {
    if (!category) return "All Products";
    const categoryMap: { [key: string]: string } = {
      "skill stacker": "Skill Stacker Merch",
      "brand butler": "Brand Butler Merch",
      "brand hacker": "Brand Hacker Merch",
      "meme militia": "Meme Militia Merch",
      "love gangster": "Love Gangster Merch",
      "canvas": "Canvas Collection",
      "shirts": "Shirts",
      "hats": "Hats",
      "hoodies": "Hoodies",
      "sweatshirts": "Sweatshirts",
    };
    return categoryMap[category.toLowerCase()] || getCategoryDisplayName(category);
  };

  const getCategoryH1 = () => {
    if (!category) return { main: "New Arrival", highlight: "Products", subtitle: "Exclusive drops from the creative collective behind the movement" };
    
    const h1Map: { [key: string]: { main: string; highlight: string; subtitle: string } } = {
      "skill stacker": {
        main: "Skill Stacker",
        highlight: "Official Merchandise",
        subtitle: "Premium Web3 apparel for developers, creators, and community builders"
      },
      "brand butler": {
        main: "Brand Butler",
        highlight: "Exclusive Collection",
        subtitle: "Elevate your brand game with premium merchandise and streetwear essentials"
      },
      "brand hacker": {
        main: "Brand Hacker",
        highlight: "Collection",
        subtitle: "Rock the tools and tactics that build legendary brands from the ground up"
      },
      "meme militia": {
        main: "Meme Militia",
        highlight: "Collection",
        subtitle: "Join the meme revolution with apparel that speaks your internet language"
      },
      "love gangster": {
        main: "Love Gangster",
        highlight: "Collection",
        subtitle: "Where love meets the streets. Bold designs for those who live by their own rules"
      },
    };
    
    return h1Map[category.toLowerCase()] || {
      main: getCategoryDisplayName(category),
      highlight: "Collection",
      subtitle: "Exclusive drops from the creative collective behind the movement"
    };
  };

  const sortedProducts = data ? (() => {
    switch (sortBy) {
      case "price-low":
        return sortProductsByPrice(data, 'asc');
      case "price-high":
        return sortProductsByPrice(data, 'desc');
      case "name":
        return sortProductsByName(data);
      case "custom":
      default:
        return sortProductsByCustomOrder(data);
    }
  })() : [];

  const getCanonicalUrl = () => {
    return category ? `/shop/${categorySlug}` : '/shop';
  };

  const getSeoTitle = () => {
    if (!category) return "Shop - Skill Stacker Merchandise";
    const title = getCategoryTitle();
    return `${title} - Skill Stacker Shop`;
  };

  const getSeoDescription = () => {
    if (!category) return "Browse our full collection of Skill Stacker merchandise. Find your favorite hoodies, hats, and t-shirts.";
    const title = getCategoryTitle();
    return `Shop ${title} from Skill Stacker. Premium quality Web3 merchandise and community apparel.`;
  };

  const getSeoKeywords = () => {
    const baseKeywords = "skill stacker shop, buy merchandise";
    if (!category) return `${baseKeywords}, hoodies, hats, t-shirts`;
    return `${baseKeywords}, ${category}, ${getCategoryTitle().toLowerCase()}, web3 apparel`;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={getSeoTitle()}
        description={getSeoDescription()}
        keywords={getSeoKeywords()}
        canonicalUrl={getCanonicalUrl()}
      />
      <PromoBanner />
      <Header />
      
      <main className="container mx-auto px-4 pt-[132px] pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 space-y-8">
            {category.toLowerCase() === 'love gangster' ? (
              <div className="text-center space-y-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-pink-500/10 to-transparent rounded-3xl blur-3xl -z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent rounded-3xl -z-10" />
                <img 
                  src={loveGangsterLogo} 
                  alt="Love Gangster Official Merchandise" 
                  className="w-48 h-48 mx-auto animate-pulse-scale drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                />
                <h1 className="text-4xl md:text-6xl font-bold animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                    {getCategoryH1().main}
                  </span>{" "}
                  <span className="text-white">{getCategoryH1().highlight}</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  {getCategoryH1().subtitle}
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold">
                  <span className="text-white">{getCategoryH1().main}</span>{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    {getCategoryH1().highlight}
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {getCategoryH1().subtitle}
                </p>
              </div>
            )}
            
            <div className="flex justify-center md:justify-end">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] bg-card border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="custom">Featured</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="w-full aspect-square rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : sortedProducts && sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProducts.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground mb-4">No products found</p>
              <p className="text-sm text-muted-foreground">
                {category 
                  ? `No ${getCategoryTitle().toLowerCase()} available yet.`
                  : "Create a product by telling me what you want to sell!"
                }
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Shop;
