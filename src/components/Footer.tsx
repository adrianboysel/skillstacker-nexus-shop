import { Link } from "react-router-dom";
import { CreditCard } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-12 md:mb-16">
          <div className="flex flex-col items-start">
            <div className="mb-6 ml-[-6px]">
              <img src={logoWhite} alt="Skill Stacker" className="h-10 md:h-12" />
            </div>
            <p className="text-sm md:text-base text-muted-foreground mb-3 leading-relaxed">
              Built on Solana. Fueled by $STKR.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
              Where skills become capital — and style makes a statement.
            </p>
            
            {/* Payment Methods */}
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-3">Accepted Payments</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-background/50 border border-border/30">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Visa</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-background/50 border border-border/30">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Mastercard</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-background/50 border border-border/30">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium">Amex</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary/10 border border-primary/30">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs font-medium text-primary">MoonPay</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-base md:text-lg mb-6">Shop By Brand</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=skill stacker" className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors">
                  Skill Stacker
                </Link>
              </li>
              <li>
                <Link to="/shop?category=brand butler" className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors">
                  Brand Butler
                </Link>
              </li>
              <li>
                <Link to="/shop?category=brand hacker" className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors">
                  Brand Hacker
                </Link>
              </li>
              <li>
                <Link to="/shop?category=meme militia" className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors">
                  Meme Militia
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-base md:text-lg mb-6">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://skillstacker.io" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors">
                  Whitepaper
                </a>
              </li>
              <li>
                <a href="https://rugcheck.xyz" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors">
                  Rug Check
                </a>
              </li>
              <li>
                <a href="https://skillstacker.io" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors">
                  Buy $STKR
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 md:pt-10 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
          <p className="text-xs md:text-sm text-muted-foreground">
            © {new Date().getFullYear()} Skill Stacker. All rights reserved.
          </p>
          <div className="flex gap-6 md:gap-8">
            <a href="https://discord.gg/skillstacker" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
              Discord
            </a>
            <a href="https://twitter.com/skillstacker" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
              Follow on X
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
