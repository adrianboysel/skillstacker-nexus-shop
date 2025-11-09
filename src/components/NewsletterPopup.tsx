import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" });

const POPUP_DELAY = 30000; // 30 seconds
const STORAGE_KEY = "newsletter-popup-dismissed";

export const NewsletterPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already dismissed or subscribed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, POPUP_DELAY);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

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
      
      // Close and remember
      localStorage.setItem(STORAGE_KEY, "true");
      setIsOpen(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-card via-card to-card/80 border-primary/20">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold text-center">
            Don't Miss Out! ⚡
          </DialogTitle>
          <DialogDescription className="text-center text-base space-y-2">
            <p className="text-foreground font-medium">
              Join the <span className="bg-gradient-primary bg-clip-text text-transparent">movement</span>
            </p>
            <p className="text-muted-foreground">
              Get early access to exclusive drops, limited releases, and gear that doesn't apologize.
            </p>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 text-base bg-background border-border"
            required
            maxLength={255}
          />
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 shadow-glow hover:shadow-glow-blue"
            >
              {isSubmitting ? "Joining..." : "Join Now"}
            </Button>
          </div>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-2">
          For those who lead, not follow.
        </p>
      </DialogContent>
    </Dialog>
  );
};
