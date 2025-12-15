import { Link } from "react-router-dom";
import logoWhite from "@/assets/logo-white.png";

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main Footer Grid - 4 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Column 1: Company */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="https://skillstacker.io" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Whitepaper
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Shop By Brand */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              Shop By Brand
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop/skill-stacker" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Skill Stacker
                </Link>
              </li>
              <li>
                <Link to="/shop/brand-butler" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Brand Butler
                </Link>
              </li>
              <li>
                <Link to="/shop/brand-hacker" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Brand Hacker
                </Link>
              </li>
              <li>
                <Link to="/shop/meme-militia" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Meme Militia
                </Link>
              </li>
              <li>
                <Link to="/shop/love-gangster" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Love Gangster
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: My Account */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              My Account
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/rewards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  My Rewards
                </Link>
              </li>
              <li>
                <Link to="/giveaways" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Giveaways
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <a href="https://skillstacker.io" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Buy $STKR
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal Disclaimer */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-4">
              Skill Stacker Giveaway®
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              * NO PURCHASE NECESSARY TO ENTER OR WIN. A PURCHASE WILL NOT INCREASE YOUR CHANCES OF WINNING. Open to legal residents of the 50 United States, the District of Columbia, and Canada where permitted by law. Void where prohibited. Must be age of majority in state/province of residence at the time of entry. Promotion dates, entry methods, prize descriptions, and odds of winning are disclosed in the Official Rules. Odds of winning depend upon the total number of eligible purchase and non-purchase entries received. Skill-testing question required if a Canadian resident is selected as a potential winner. See Official Rules for full details including how*
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={logoWhite} alt="Skill Stacker" width="200" height="24" className="h-6 w-auto object-contain" />
          </div>
          
          <div className="flex items-center gap-6">
            <a href="https://www.youtube.com/@adrianboysel" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              YouTube
            </a>
            <a href="https://x.com/skillstkr" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Follow on X
            </a>
          </div>
          
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Skill Stacker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
