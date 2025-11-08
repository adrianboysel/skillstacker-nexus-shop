import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ChevronDown, Menu, Home, Store, X } from "lucide-react";
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
import { useCartStore } from "@/stores/cartStore";
import logoWhite from "@/assets/logo-white.png";
import { useState, useEffect } from "react";

const categories = [
  { name: "All Products", value: "" },
  { name: "Skill Stacker Merch", value: "skill stacker" },
  { name: "Brand Butler Merch", value: "brand butler" },
  { name: "Brand Hacker Merch", value: "brand hacker" },
  { name: "Meme Militia Merch", value: "meme militia" },
];

export const Header = () => {
  const items = useCartStore(state => state.items);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

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

  const handleCategoryClick = (category: string) => {
    navigate(`/shop?category=${category}`);
    setMobileOpen(false);
  };

  return (
    <header className={`fixed left-0 right-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl transition-all duration-300 ${bannerVisible ? 'top-[28px]' : 'top-0'}`}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group mr-auto md:ml-[-40px]">
          <img src={logoWhite} alt="Skill Stacker" width="366" height="40" className="h-7 sm:h-8 md:h-10 transition-transform group-hover:scale-105" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors outline-none">
              Shop By
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="center" 
              className="w-56 bg-card border-border z-[100] shadow-glow-blue"
            >
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.value}
                  onClick={() => handleCategoryClick(category.value)}
                  className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10"
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Menu & Cart */}
        <div className="flex items-center gap-2">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-primary/10"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
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
                  onClick={() => setMobileOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                
                {/* Categories */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 px-4 mb-3">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Shop By Category
                    </p>
                  </div>
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => handleCategoryClick(category.value)}
                      className="block w-full text-left px-4 py-4 text-base font-medium rounded-lg hover:bg-primary/10 transition-colors active:scale-[0.98]"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
