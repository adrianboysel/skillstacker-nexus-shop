import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, ArrowLeft, Ruler, Expand, Star, Info, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { storefrontApiRequest } from "@/lib/shopify";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import hatVideo from "@/assets/products/hat-og.mp4";
import hoodieImage from "@/assets/products/hoodie-og-new.jpg";
import shirtImage from "@/assets/products/shirt-og-new.png";
import { ImageLightbox } from "@/components/ImageLightbox";
import { formatDescription } from "@/lib/formatDescription";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ProductReviews } from "@/components/ProductReviews";
import { DeliveryEstimate } from "@/components/DeliveryEstimate";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      productType
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
      rewardPoints: metafield(namespace: "rewards", key: "points_value") {
        value
        type
      }
    }
  }
`;

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const addItem = useCartStore(state => state.addItem);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);

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
      quantity: quantity,
      selectedOptions: variant.selectedOptions,
    });

    toast.success("Added to cart", {
      description: `${quantity}x ${data.title} has been added to your cart.`,
    });
    
    // Reset quantity after adding
    setQuantity(1);
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

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
  const isOGShirt = data.title.toLowerCase().includes("meme militia og shirt");

  // Get all available images (limit to 5)
  const displayImages = data.images.edges.slice(0, 5);

  // Determine product type for size guide
  const getProductType = () => {
    const title = data.title.toLowerCase();
    const shopifyType = data.productType?.toLowerCase() || "";
    
    if (title.includes("sticker") || shopifyType.includes("sticker")) return "sticker";
    if (title.includes("canvas") || title.includes("print") || shopifyType.includes("canvas")) return "canvas";
    if (title.includes("hat") || title.includes("cap") || shopifyType.includes("hat")) return "hat";
    if (title.includes("kids hoodie") || title.includes("kids relax hood")) return "kids-hoodie";
    if (title.includes("future soldier kids") || title.includes("kids classic tee")) return "kids-tee";
    if (title.includes("hoodie") || title.includes("sweatshirt") || shopifyType.includes("hoodie")) return "hoodie";
    if (title.includes("shirt") || title.includes("tee") || title.includes("t-shirt") || shopifyType.includes("shirt")) return "shirt";
    return "default";
  };

  const productType = getProductType();
  const isSticker = productType === "sticker";
  const showSizeGuide = productType !== "canvas" && !isSticker;

  // Size guide data by product type
  const sizeGuides = {
    hat: {
      headers: ["Size", "Head Circumference (in)", "Head Circumference (cm)"],
      rows: [
        ["One Size", "22-24", "56-61"],
      ],
      note: "Adjustable strap fits most head sizes comfortably."
    },
    "kids-hoodie": {
      headers: ["Size", "Body Width (in)", "Body Length (in)"],
      rows: [
        ["2", "14-1/4", "15-1/4"],
        ["4", "15-1/4", "17"],
        ["6", "16-1/2", "18-1/2"],
      ],
      note: "Please note measurements can vary within 2.5 inches, this is within our tolerance."
    },
    "kids-tee": {
      headers: ["Size", "Body Width (in)", "Body Length (in)"],
      rows: [
        ["8", "16-1/2", "20-3/4"],
        ["10", "17-1/4", "22"],
        ["12", "18", "23-1/4"],
        ["14", "19", "25-1/4"],
        ["16", "19-3/4", "26-3/4"],
      ],
      note: "Please note measurements can vary within 1 inch, this is within our tolerance."
    },
    shirt: {
      headers: ["Size", "Chest (in)", "Length (in)", "Shoulder (in)"],
      rows: [
        ["S", "18", "28", "15.5"],
        ["M", "20", "29", "17"],
        ["L", "22", "30", "18.5"],
        ["XL", "24", "31", "20"],
        ["2XL", "26", "32", "21.5"],
        ["3XL", "28", "33", "23"],
      ],
      note: "All measurements are approximate. Lay your favorite shirt flat and compare measurements."
    },
    hoodie: {
      headers: ["Size", "Chest (in)", "Length (in)", "Sleeve (in)"],
      rows: [
        ["S", "20", "27", "33"],
        ["M", "22", "28", "34"],
        ["L", "24", "29", "35"],
        ["XL", "26", "30", "36"],
        ["2XL", "28", "31", "37"],
        ["3XL", "30", "32", "38"],
      ],
      note: "Hoodies are designed for a relaxed fit. For a tighter fit, consider sizing down."
    },
    default: {
      headers: ["Size", "Chest (in)", "Length (in)", "Sleeve (in)"],
      rows: [
        ["S", "18", "28", "15.5"],
        ["M", "20", "29", "17"],
        ["L", "22", "30", "18.5"],
        ["XL", "24", "31", "20"],
        ["2XL", "26", "32", "21.5"],
      ],
      note: "All measurements are approximate and may vary slightly."
    }
  };

  const currentSizeGuide = sizeGuides[productType as keyof typeof sizeGuides];

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
      <SEO 
        title={`${data.title} - Skill Stacker Shop`}
        description={`Buy ${data.title} from Skill Stacker. ${data.description?.substring(0, 100) || 'Premium quality merchandise for the Web3 generation.'}${data.description && data.description.length > 100 ? '...' : ''}`}
        keywords={`${data.title}, skill stacker merchandise, ${data.productType?.toLowerCase()}, web3 apparel, buy ${data.productType?.toLowerCase()}, meme militia gear`}
        ogImage={data.images.edges[0]?.node.url}
        ogType="product"
        canonicalUrl={`/product/${data.handle}`}
      />
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
            <div 
              className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border/50 cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
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
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                />
              ) : isOGShirt ? (
                <img 
                  src={shirtImage} 
                  alt={data.title}
                  width="600"
                  height="600"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="w-full h-full object-contain"
                />
              ) : currentImage ? (
                <img 
                  src={currentImage} 
                  alt={data.title}
                  width="600"
                  height="600"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
              
              {/* Zoom Overlay */}
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex items-center gap-2 text-foreground">
                  <Expand className="h-6 w-6" />
                  <span className="text-sm font-medium">Click to zoom</span>
                </div>
              </div>
            </div>
            
            {displayImages.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {displayImages.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-primary/50 ${
                      selectedImage === idx ? 'border-primary shadow-glow' : 'border-border/50'
                    }`}
                  >
                    <img 
                      src={image.node.url} 
                      alt={`${data.title} ${idx + 1}`}
                      width="150"
                      height="150"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Lightbox */}
          <ImageLightbox
            images={displayImages.map(img => ({
              url: isOGHat ? hatVideo : (isOGHoodie ? hoodieImage : (isOGShirt ? shirtImage : img.node.url)),
              alt: img.node.altText || data.title
            }))}
            initialIndex={selectedImage}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            isVideo={isOGHat}
            videoSrc={isOGHat ? hatVideo : undefined}
          />
          
          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
              <p className="text-3xl font-bold text-primary mb-2">
                {variant?.price.currencyCode} ${parseFloat(variant?.price.amount || '0').toFixed(2)}
              </p>
              {data.rewardPoints?.value && parseInt(data.rewardPoints.value, 10) > 0 && (
                <p className="text-sm text-primary flex items-center gap-1.5 mb-6">
                  <Star className="h-4 w-4 fill-primary" />
                  Earn {parseInt(data.rewardPoints.value, 10).toLocaleString()} points with this purchase
                </p>
              )}
              <div className="text-muted-foreground leading-relaxed space-y-3">
                {formatDescription(data.description).map((sentence, idx) => (
                  <p key={idx}>{sentence}</p>
                ))}
              </div>
            </div>
            
            {data.options.length > 0 && (
              <div className="space-y-4">
                {data.options
                  .filter(option => !(isSticker && option.name.toLowerCase() === 'style'))
                  .map((option, idx) => (
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
            
            {/* Size Guide */}
            {showSizeGuide && (
              <Collapsible open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between px-0 hover:bg-transparent"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Ruler className="h-4 w-4" />
                      Size Guide
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {sizeGuideOpen ? "Hide" : "Show"}
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3 text-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-border/50">
                            {currentSizeGuide.headers.map((header, idx) => (
                              <th key={idx} className={`pb-2 font-medium ${idx < currentSizeGuide.headers.length - 1 ? 'pr-4' : ''}`}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {currentSizeGuide.rows.map((row, rowIdx) => (
                            <tr 
                              key={rowIdx} 
                              className={rowIdx < currentSizeGuide.rows.length - 1 ? "border-b border-border/30" : ""}
                            >
                              {row.map((cell, cellIdx) => (
                                <td 
                                  key={cellIdx} 
                                  className={`py-2 ${cellIdx < row.length - 1 ? 'pr-4' : ''}`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {currentSizeGuide.note}
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {/* Delivery Estimate */}
            <DeliveryEstimate productType={productType} />
            
            {/* Reward Points Display */}
            {(() => {
              // Get reward points from metafield, or calculate from price as fallback (100 pts per $1, rounded to nearest 10)
              const metafieldPoints = data.rewardPoints?.value ? parseInt(data.rewardPoints.value, 10) : 0;
              const variantPrice = parseFloat(variant?.price.amount || '0');
              const calculatedPoints = Math.round(Math.round(variantPrice * 100) / 10) * 10;
              const rewardPoints = metafieldPoints > 0 ? metafieldPoints : calculatedPoints;
              
              if (rewardPoints <= 0) return null;
              
              const totalPoints = rewardPoints * quantity;
              
              return (
                <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-primary/10 border border-primary/20">
                  <Star className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">
                    Earn <span className="text-primary font-bold">{totalPoints.toLocaleString()}</span> entries with this purchase
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="ml-auto p-1 hover:bg-primary/10 rounded-full transition-colors">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[250px]">
                      <p className="text-xs">
                        Entries are added to your account after purchase and can be used for giveaways.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })()}
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={incrementQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
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

        {/* Reviews Section */}
        <div className="mt-20">
          <ProductReviews 
            productHandle={data.handle}
            reviews={[]}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
