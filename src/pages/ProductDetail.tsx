import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { storefrontApiRequest } from "@/lib/shopify";
import { toast } from "sonner";
import hatVideo from "@/assets/products/hat-og.mp4";
import hoodieImage from "@/assets/products/hoodie-og.png";

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const addItem = useCartStore(state => state.addItem);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [selectedImage, setSelectedImage] = useState<number>(0);

  const { data, isLoading } = useQuery({
    queryKey: ['product', handle],
    queryFn: async () => {
      const response = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
      return response.data.product;
    },
    enabled: !!handle,
  });

  const handleAddToCart = () => {
    if (!data) return;
    
    const variant = data.variants.edges[selectedVariant]?.node;
    if (!variant) return;

    addItem({
      product: { node: data },
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
      description: `${data.title} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PromoBanner />
        <Header />
        <main className="container mx-auto px-4 pt-[132px] pb-20">
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="w-full aspect-square rounded-lg" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <PromoBanner />
        <Header />
        <main className="container mx-auto px-4 pt-[132px] pb-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Link to="/shop">
              <Button>Back to Shop</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const variant = data.variants.edges[selectedVariant]?.node;
  const currentImage = data.images.edges[selectedImage]?.node.url;
  const isOGHat = data.title.toLowerCase().includes("meme militia og hat");
  const isOGHoodie = data.title.toLowerCase().includes("meme militia og hoodie");

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": data.title,
    "description": data.description,
    "image": data.images.edges.map(img => img.node.url),
    "offers": {
      "@type": "Offer",
      "url": `${window.location.origin}/product/${data.handle}`,
      "priceCurrency": variant?.price.currencyCode || "USD",
      "price": variant?.price.amount || "0",
      "availability": variant?.availableForSale 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Skill Stacker"
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PromoBanner />
      <Header />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border/50">
              {isOGHat ? (
                <video 
                  src={hatVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                  aria-label={data.title}
                />
              ) : isOGHoodie ? (
                <img 
                  src={hoodieImage} 
                  alt={data.title}
                  width="600"
                  height="600"
                  className="w-full h-full object-cover"
                />
              ) : currentImage ? (
                <img 
                  src={currentImage} 
                  alt={data.title}
                  width="600"
                  height="600"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            
            {data.images.edges.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {data.images.edges.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-primary shadow-glow' : 'border-border/50'
                    }`}
                  >
                    <img 
                      src={image.node.url} 
                      alt={`${data.title} ${idx + 1}`}
                      width="150"
                      height="150"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
              <p className="text-3xl font-bold text-primary mb-6">
                {variant?.price.currencyCode} ${parseFloat(variant?.price.amount || '0').toFixed(2)}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {data.description}
              </p>
            </div>
            
            {data.options.length > 0 && (
              <div className="space-y-4">
                {data.options.map((option, idx) => (
                  <div key={idx}>
                    <label className="text-sm font-medium mb-2 block">
                      {option.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value, valueIdx) => {
                        const variantIdx = data.variants.edges.findIndex(v =>
                          v.node.selectedOptions.some(opt => opt.value === value)
                        );
                        return (
                          <Button
                            key={valueIdx}
                            variant={selectedVariant === variantIdx ? "default" : "outline"}
                            onClick={() => setSelectedVariant(variantIdx)}
                            className={selectedVariant === variantIdx ? "shadow-glow" : ""}
                          >
                            {value}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              size="lg" 
              className="w-full shadow-glow-blue hover:shadow-glow"
              onClick={handleAddToCart}
              disabled={!variant?.availableForSale}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {variant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
