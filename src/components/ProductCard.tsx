import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useCartStore, type ShopifyProduct } from "@/stores/cartStore";
import { toast } from "sonner";
import hatVideo from "@/assets/products/hat-og.mp4";
import hoodieImage from "@/assets/products/hoodie-og.png";

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { node } = product;
  
  const image = node.images.edges[0]?.node.url;
  const price = node.priceRange.minVariantPrice;
  const variant = node.variants.edges[0]?.node;
  
  // Check if this is the Meme Militia OG Hat to show video
  const isOGHat = node.title.toLowerCase().includes("meme militia og hat");
  const isOGHoodie = node.title.toLowerCase().includes("meme militia og hoodie");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!variant) return;

    addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: {
        amount: variant.price.amount,
        currencyCode: variant.price.currencyCode,
      },
      quantity: 1,
      selectedOptions: variant.selectedOptions,
    });

    toast.success("Added to cart", {
      description: `${node.title} has been added to your cart.`,
    });
  };

  return (
    <Link to={`/product/${node.handle}`}>
      <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-glow">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {isOGHat ? (
            <video 
              src={hatVideo}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              aria-label={node.title}
            />
          ) : isOGHoodie ? (
            <img 
              src={hoodieImage} 
              alt={node.title}
              width="403"
              height="403"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : image ? (
            <img 
              src={image} 
              alt={node.title}
              width="403"
              height="403"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
              {node.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {node.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {price.currencyCode} ${parseFloat(price.amount).toFixed(2)}
            </span>
            
            <Button 
              size="icon"
              onClick={handleAddToCart}
              className="shadow-glow-blue hover:shadow-glow"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};
