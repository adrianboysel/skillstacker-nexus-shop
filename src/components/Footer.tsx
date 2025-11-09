import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Youtube } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";
import moonpayLogo from "@/assets/moonpay-logo.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast({
        title: "Invalid email",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscribe-newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      toast({
        title: "Thanks for joining the movement",
        description: "You're officially part of Skill Stacker.",
      });
      setEmail("");
    } catch (error: any) {
      console.error("Footer newsletter subscription error:", error);
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-12 md:mb-16">
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-6 md:ml-[-65px]">
              <img src={logoWhite} alt="Skill Stacker" width="432" height="48" className="block h-10 md:h-12 w-auto object-contain mx-auto md:mx-0 md:ml-[10px] lg:ml-[5px] md:object-left" />
            </div>
            <p className="text-sm md:text-base text-muted-foreground mb-3 leading-relaxed text-center md:text-left">
              Built on Solana. Fueled by $STKR.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center md:text-left">
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
        
        {/* Newsletter Footer Signup */}
        <div className="mt-8 md:mt-12">
          <div className="rounded-lg border border-border/50 bg-card/40 p-6 md:p-8">
            <div className="text-center space-y-4 mb-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                BE FREE.{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  STAY IN THE LOOP
                </span>
              </h3>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                Get early access to drops, raw updates, and gear that doesn't apologize.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-background border-border h-12 text-base"
                required
                maxLength={255}
              />
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="shadow-glow hover:shadow-glow-blue transition-all"
              >
                {isSubmitting ? "Joining..." : "Join the Movement"}
              </Button>
            </form>
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
