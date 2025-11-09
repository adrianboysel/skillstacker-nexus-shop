import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import newsletterBg from "@/assets/newsletter-bg.jpg";

const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" });

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offsetY, setOffsetY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollPosition = window.scrollY;
        const elementTop = rect.top + scrollPosition;
        const viewportMiddle = scrollPosition + window.innerHeight / 2;
        
        // Calculate parallax offset - background moves slower than scroll
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const offset = (viewportMiddle - elementTop) * 0.3;
          setOffsetY(offset);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscribe-newsletter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

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
      console.error("Newsletter subscription error:", error);
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
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 border-y border-border/50 relative overflow-hidden"
    >
      <div 
        className="absolute inset-0 transition-transform duration-100 ease-out"
        style={{
          backgroundImage: `url(${newsletterBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${offsetY}px)`,
          willChange: 'transform',
        }}
      />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg border border-border/50 bg-card p-6 md:p-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl md:text-5xl font-bold">
                BE FREE.{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  STAY IN THE LOOP
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                This isn't just a newsletter—it's a statement.
              </p>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Get early access to drops, raw updates, and gear that doesn't apologize.<br />
                For those who lead, not follow.
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
      </div>
    </section>
  );
};
