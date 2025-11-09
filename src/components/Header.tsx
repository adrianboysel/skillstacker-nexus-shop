import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ChevronDown, Menu, Home, Store, X, Shirt, CircleDot, Frame, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";
import logoWhite from "@/assets/logo-white.png";
import { useState, useEffect } from "react";

const categories = [
  { name: "Shirts", value: "shirts", icon: Shirt },
  { name: "Hats", value: "hats", icon: CircleDot },
  { name: "Hoodies", value: "hoodies", icon: Shirt },
  { name: "Sweatshirts", value: "sweatshirts", icon: Shirt },
  { name: "Canvas", value: "canvas", icon: Frame },
];

const brands = [
  { name: "Skill Stacker", value: "skill stacker", icon: Tag },
  { name: "Meme Militia", value: "meme militia", icon: Tag },
  { name: "Brand Hacker", value: "brand hacker", icon: Tag },
  { name: "Brand Butler (Coming Soon)", value: "brand butler", icon: Tag },
];

export const Header = () => {
  const items = useCartStore(state => state.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkBanner = () => {
      const stored = localStorage.getItem('promo-banner-visible');
      setBannerVisible(stored !== 'false');
    };
    
    checkBanner();
    window.addEventListener('storage', checkBanner);
    
    // Poll for changes since localStorage events don't fire in same tab
    const interval = setInterval(checkBanner, 100);
    
    return () => {
      window.removeEventListener('storage', checkBanner);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .single();
        setIsAdmin(profile?.is_admin || false);
      }
    };
    
    checkAdmin();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleCategoryClick = (category: string) => {
    navigate(`/shop?category=${category}`);
    setMobileOpen(false);
  };

  const handleBrandClick = (brand: string) => {
    navigate(`/shop?category=${brand}`);
    setMobileOpen(false);
  };

  return (
    <header className={`fixed left-0 right-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl transition-all duration-300 ${bannerVisible ? 'top-[28px]' : 'top-0'}`}>
      <div className="container mx-auto pl-0 pr-3 sm:pr-4 md:pr-6 h-16 md:h-18 lg:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group mr-auto -ml-2 sm:-ml-1 md:-ml-0.5 lg:ml-0">
          <img src={logoWhite} alt="Skill Stacker" width="366" height="40" className="h-6 sm:h-7 md:h-8 lg:h-10 w-auto transition-transform group-hover:scale-105" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 absolute left-1/2 -translate-x-1/2">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Home
          </Link>
          
          <Link to="/shop" className="text-sm font-medium hover:text-primary transition-colors">
            New Arrivals
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors outline-none">
              Shop By Brand
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="center" 
              className="w-56 bg-card border-border z-[100] shadow-glow-blue"
            >
              {brands.map((brand) => {
                const IconComponent = brand.icon;
                return (
                  <DropdownMenuItem
                    key={brand.value}
                    onClick={() => handleBrandClick(brand.value)}
                    className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10"
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {brand.name}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors outline-none">
              Shop By Category
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="center" 
              className="w-56 bg-card border-border z-[100] shadow-glow-blue"
            >
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <DropdownMenuItem
                    key={category.value}
                    onClick={() => handleCategoryClick(category.value)}
                    className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10"
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {category.name}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Menu & Cart */}
        <div className="flex items-center gap-1 sm:gap-2">
          {isAdmin && (
            <Link to="/admin/inventory">
              <Button variant="ghost" size="sm" className="hidden md:flex hover:bg-primary/10">
                Admin
              </Button>
            </Link>
          )}
          
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 h-9 w-9 md:h-10 md:w-10">
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-primary/10 h-9 w-9 md:h-10 md:w-10"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[85vw] sm:w-80 bg-background/98 backdrop-blur-xl border-border/50 p-0"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  className="h-8 w-8 hover:bg-primary/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex flex-col p-6">
                {/* Home Link */}
                <Link 
                  to="/" 
                  className="flex items-center gap-3 px-4 py-4 text-base font-medium rounded-lg hover:bg-primary/10 transition-colors active:scale-[0.98]"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setMobileOpen(false);
                  }}
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                
                {/* New Arrivals */}
                <Link 
                  to="/shop" 
                  className="flex items-center gap-3 px-4 py-4 text-base font-medium rounded-lg hover:bg-primary/10 transition-colors active:scale-[0.98]"
                  onClick={() => setMobileOpen(false)}
                >
                  <Store className="h-5 w-5" />
                  New Arrivals
                </Link>
                
                {/* Shop By Brand - Collapsible */}
                <Collapsible open={brandsOpen} onOpenChange={setBrandsOpen} className="mt-6">
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-4 text-base font-semibold text-primary rounded-lg hover:bg-primary/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Shop By Brand
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform ${brandsOpen ? 'rotate-90' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-2">
                    {brands.map((brand) => {
                      const IconComponent = brand.icon;
                      return (
                        <button
                          key={brand.value}
                          onClick={() => handleBrandClick(brand.value)}
                          className="flex items-center gap-3 w-full text-left px-8 py-3 text-sm font-medium text-foreground rounded-lg hover:bg-primary/10 transition-colors active:scale-[0.98]"
                        >
                          <IconComponent className="h-4 w-4" />
                          {brand.name}
                        </button>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
                
                {/* Shop By Category - Collapsible */}
                <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen} className="mt-2">
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-4 text-base font-semibold text-primary rounded-lg hover:bg-primary/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Shop By Category
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform ${categoriesOpen ? 'rotate-90' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-2">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <button
                          key={category.value}
                          onClick={() => handleCategoryClick(category.value)}
                          className="flex items-center gap-3 w-full text-left px-8 py-3 text-sm font-medium text-foreground rounded-lg hover:bg-primary/10 transition-colors active:scale-[0.98]"
                        >
                          <IconComponent className="h-4 w-4" />
                          {category.name}
                        </button>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
