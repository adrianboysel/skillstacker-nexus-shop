import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { ProductCard } from "@/components/ProductCard";
import { VideoSection } from "@/components/VideoSection";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Skeleton } from "@/components/ui/skeleton";
import { storefrontApiRequest, PRODUCTS_QUERY } from "@/lib/shopify";
import type { ShopifyProduct } from "@/stores/cartStore";
import { sortProductsByCustomOrder } from "@/lib/productSorting";
import { SEO } from "@/components/SEO";
import heroBg from "@/assets/hero-bg.webp";
import heroVideo from "@/assets/meme-bg-2.mp4";
import videoThumbnail from "@/assets/video-thumbnail.jpg";
import wizardFlying from "@/assets/wizard-flying.webp";
const Home = () => {
  const {
    data: allProducts,
    isLoading
  } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const response = await storefrontApiRequest(PRODUCTS_QUERY, {
        first: 10
      });
      return response.data.products.edges as ShopifyProduct[];
    }
  });

  // Sort products and take first 3 for featured section
  const products = allProducts ? sortProductsByCustomOrder(allProducts).slice(0, 3) : [];
  return <div className="min-h-screen bg-background">
      <SEO 
        title="Skill Stacker Shop - Premium Merchandise"
        description="Shop exclusive Skill Stacker merchandise including hoodies, hats, and t-shirts. Join the movement and stack your skills in style."
        keywords="skill stacker, merchandise, hoodies, hats, t-shirts, shop"
        canonicalUrl="/"
      />
      <PromoBanner />
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[90px] sm:pt-[100px] md:pt-[152px] pb-4 md:pb-6 lg:pb-16">
        <div className="absolute inset-0 z-0 bg-black">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-2 sm:space-y-8 -mt-[75px] md:mt-0">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">For people building the future{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}>and looking like it.</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">Limited drops of official Skill Stacker clothing, art, and collectibles designed for the Web3 generation. Stack skills. Stack style.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center -mb-[37px] md:mb-0">
              <Link to="/shop">
                <Button size="lg" className="group shadow-glow hover:shadow-glow-blue transition-all">
                  Enter the Store
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="https://skillstacker.io" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                  Learn About $STKR
                </Button>
              </a>
            </div>
          </div>
        </div>
        
        {/* Floating Wizard */}
        <img 
          src={wizardFlying} 
          alt="Skill Stacker Wizard" 
          className="hidden md:block absolute w-48 lg:w-56"
          style={{ 
            bottom: '52px',
            right: '241px',
            animation: 'slide-in-right 0.8s ease-out 0.5s both, float 4s ease-in-out 1.3s infinite'
          }}
        />
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Video Section */}
      <VideoSection 
        videoUrl="https://www.youtube.com/embed/Tw7LEpmiq5Q" 
        thumbnailUrl={videoThumbnail}
        title="Watch the Video" 
      />

      {/* Featured Products Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">
                Best Selling{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}>
                  Products
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Our most popular items from the collection
              </p>
            </div>

            {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => <div key={i} className="space-y-4 animate-fade-in">
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>)}
              </div> : products && products.length > 0 ? <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {products.slice(0, 3).map((product, idx) => <div key={product.node.id} className="animate-fade-in" style={{
                animationDelay: `${idx * 0.1}s`
              }}>
                      <ProductCard product={product} />
                    </div>)}
                </div>
                
                <div className="text-center">
                  <Link to="/shop">
                    <Button size="lg" variant="outline" className="group border-primary/50 hover:bg-primary/10">
                      View All Products
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </> : <div className="text-center py-12">
                <p className="text-muted-foreground mb-6">No products yet. Ready to add your first product?</p>
                <p className="text-sm text-muted-foreground">Tell me what you want to create!</p>
              </div>}
          </div>
        </div>
      </section>
      
      {/* Newsletter Signup */}
      <NewsletterSignup />
      
      <Footer />
    </div>;
};
export default Home;