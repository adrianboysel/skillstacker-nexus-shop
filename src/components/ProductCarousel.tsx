import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import hatVideo from "@/assets/products/hat-og.mp4";
import hoodieImage from "@/assets/products/hoodie-og-new.jpg";
import shirtImage from "@/assets/products/shirt-og-new.png";

interface CarouselProduct {
  id: string;
  title: string;
  handle: string;
  price: string;
  image?: string;
  video?: string;
  isVideo?: boolean;
}

const products: CarouselProduct[] = [
  {
    id: "1",
    title: "Meme Militia OG Hoodie",
    handle: "meme-militia-og-hoodie",
    price: "65.00",
    image: hoodieImage,
  },
  {
    id: "2",
    title: "Meme Militia OG Hat",
    handle: "meme-militia-og-hat",
    price: "35.00",
    video: hatVideo,
    isVideo: true,
  },
  {
    id: "3",
    title: "Meme Militia OG Shirt",
    handle: "meme-militia-og-shirt",
    price: "45.00",
    image: shirtImage,
  },
];

export const ProductCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const currentProduct = products[currentIndex];

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Main Carousel Container */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border/50 shadow-glow">
        {/* Product Images */}
        <div className="relative w-full h-full">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentIndex
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              {product.isVideo ? (
                <video
                  src={product.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                  aria-label={product.title}
                />
              ) : (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background hover:border-primary/50 transition-all shadow-lg"
          aria-label="Previous product"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background hover:border-primary/50 transition-all shadow-lg"
          aria-label="Next product"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Product Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-8">
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                {currentProduct.title}
              </h3>
              <p className="text-3xl font-bold text-primary">
                ${currentProduct.price}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link to={`/product/${currentProduct.handle}`} className="flex-1">
                <Button size="lg" className="w-full shadow-glow hover:shadow-glow-blue">
                  View Details
                </Button>
              </Link>
              <Link to={`/product/${currentProduct.handle}`}>
                <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-20 md:bottom-28 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/50 hover:bg-muted-foreground"
              }`}
              aria-label={`Go to product ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Auto-play Indicator */}
      {isAutoPlaying && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Auto-playing
        </div>
      )}
    </div>
  );
};
