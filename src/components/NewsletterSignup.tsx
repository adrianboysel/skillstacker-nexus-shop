import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" });

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
    
    // Simulate API call - replace with actual newsletter API integration
    try {
      // TODO: Add newsletter service integration here (e.g., Mailchimp, ConvertKit, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "You're in!",
        description: "Welcome to the movement. Check your inbox.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-card/30 backdrop-blur-sm border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
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
    </section>
  );
};
