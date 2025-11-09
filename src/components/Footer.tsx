import { Link } from "react-router-dom";
import { CreditCard, Youtube } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import moonpayLogo from "@/assets/moonpay-logo.png";

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-12 md:mb-16">
          <div className="flex flex-col items-start">
            <div className="mb-6 ml-[-49px] md:ml-[-65px]">
              <img src={logoWhite} alt="Skill Stacker" width="432" height="48" className="block h-10 md:h-12 w-auto object-contain object-left ml-[2px] md:ml-[20px] lg:ml-[10px]" />
            </div>
            <p className="text-sm md:text-base text-muted-foreground mb-3 leading-relaxed">
              Built on Solana. Fueled by $STKR.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Where skills become capital — and style makes a statement.
            </p>
          </div>
          
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-base md:text-lg mb-6">Shop By Brand</h3>
            <ul className="space-y-3 flex flex-col items-center md:items-start">
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
          
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-base md:text-lg mb-6">Resources</h3>
            <ul className="space-y-3 flex flex-col items-center md:items-start">
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
        
        <div className="pt-8 md:pt-10 border-t border-border/50 flex flex-col items-center gap-6">
          {/* Payment Methods */}
          <div className="flex flex-col items-center gap-4 w-full">
            <h3 className="text-sm md:text-base font-semibold text-foreground">
              We Accept Credit Card and Crypto Payments
            </h3>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-background/50 border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Visa</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-background/50 border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Mastercard</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-background/50 border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">Amex</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-background/50 border border-border/30 hover:border-primary/50 hover:bg-primary/5 hover:shadow-glow transition-all cursor-pointer">
                <img src={moonpayLogo} alt="MoonPay" width="63" height="16" className="h-4 brightness-0 invert" loading="lazy" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-6 md:gap-8">
              <a href="https://www.youtube.com/@adrianboysel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-4 w-4" />
                YouTube
              </a>
              <a href="https://x.com/skillstkr" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                Follow on X
              </a>
            </div>
            
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Skill Stacker. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
