import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { ProductCard } from "@/components/ProductCard";
import { storefrontApiRequest, PRODUCTS_QUERY } from "@/lib/shopify";
import type { ShopifyProduct } from "@/stores/cartStore";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Shop = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const [sortBy, setSortBy] = useState<string>("custom");

  const { data, isLoading } = useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const response = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50 });
      let products = response.data.products.edges as ShopifyProduct[];
      
      // Filter by category if specified
      if (category) {
        products = products.filter((product) => 
          product.node.title.toLowerCase().includes(category.toLowerCase())
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
    };
    return categoryMap[category.toLowerCase()] || "Products";
  };

  const sortedProducts = data ? [...data].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.node.priceRange.minVariantPrice.amount) - 
               parseFloat(b.node.priceRange.minVariantPrice.amount);
      case "price-high":
        return parseFloat(b.node.priceRange.minVariantPrice.amount) - 
               parseFloat(a.node.priceRange.minVariantPrice.amount);
      case "name":
        return a.node.title.localeCompare(b.node.title);
      case "custom":
      default:
        // Custom sort: Hoodie, Hat, Shirt
        const titleA = a.node.title.toLowerCase();
        const titleB = b.node.title.toLowerCase();
        
        const getOrder = (title: string) => {
          if (title.includes("hoodie")) return 1;
          if (title.includes("hat")) return 2;
          if (title.includes("shirt") || title.includes("t-shirt")) return 3;
          return 4;
        };
        
        return getOrder(titleA) - getOrder(titleB);
    }
  }) : [];

  return (
    <div className="min-h-screen bg-background">
      <PromoBanner />
      <Header />
      
      <main className="container mx-auto px-4 pt-[132px] pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold">
                {getCategoryTitle()}{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Collection
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Exclusive drops from the creative collective behind the movement.
              </p>
            </div>
            
            <div className="flex justify-end">
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
