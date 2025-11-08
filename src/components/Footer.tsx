import { Link } from "react-router-dom";
import logoWhite from "@/assets/logo-white.png";

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <img src={logoWhite} alt="Skill Stacker" className="h-10 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Built on Solana. Fueled by $STKR.
            </p>
            <p className="text-sm text-muted-foreground">
              Where skills become capital — and style makes a statement.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Shop By Brand</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=skill stacker" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Skill Stacker
                </Link>
              </li>
              <li>
                <Link to="/shop?category=brand butler" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Brand Butler
                </Link>
              </li>
              <li>
                <Link to="/shop?category=brand hacker" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Brand Hacker
                </Link>
              </li>
              <li>
                <Link to="/shop?category=meme militia" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Meme Militia
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://skillstacker.io" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Whitepaper
                </a>
              </li>
              <li>
                <a href="https://rugcheck.xyz" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Rug Check
                </a>
              </li>
              <li>
                <a href="https://skillstacker.io" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Buy $STKR
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Skill Stacker. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="https://discord.gg/skillstacker" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Discord
            </a>
            <a href="https://twitter.com/skillstacker" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Follow on X
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
