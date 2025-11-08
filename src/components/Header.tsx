import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ChevronDown, Menu } from "lucide-react";
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
import { useState } from "react";

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

  const handleCategoryClick = (category: string) => {
    navigate(`/shop?category=${category}`);
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-[28px] left-0 right-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group mr-auto ml-[-40px]">
          <img src={logoWhite} alt="Skill Stacker" width="366" height="40" className="h-10 transition-transform group-hover:scale-105" />
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
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card border-border">
              <nav className="flex flex-col gap-6 mt-8">
                <Link 
                  to="/" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
                
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground">Shop By Category</p>
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => handleCategoryClick(category.value)}
                      className="block w-full text-left text-lg font-medium hover:text-primary transition-colors"
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
