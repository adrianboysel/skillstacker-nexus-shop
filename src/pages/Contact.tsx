import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent!", {
      description: "We'll get back to you as soon as possible.",
    });
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Contact Skill Stacker - Get in Touch with Our Team"
        description="Have questions about Skill Stacker, $STKR token, or our merchandise? Contact us through our form, join our Discord community, or follow us on X (Twitter). We're here to help."
        keywords="contact skill stacker, customer support, discord community, skill stacker help, web3 support, community contact, get in touch"
        canonicalUrl="/contact"
      />
      <Header />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold">
              Get in{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Have questions? We'd love to hear from you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="p-8 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-background/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-background/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="bg-background/50 resize-none"
                  />
                </div>
                
                <Button type="submit" className="w-full shadow-glow-blue hover:shadow-glow">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </div>
            
            {/* Community Links */}
            <div className="space-y-6">
              <div className="p-8 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Join Our Community</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with thousands of creators and builders in our Discord server.
                </p>
                <Button asChild variant="outline" className="w-full border-primary/50 hover:bg-primary/10">
                  <a href="https://discord.gg/skillstacker" target="_blank" rel="noopener noreferrer">
                    Join Discord
                  </a>
                </Button>
              </div>
              
              <div className="p-8 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
                <svg className="h-12 w-12 text-primary mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <h3 className="text-xl font-bold mb-2">Follow on X</h3>
                <p className="text-muted-foreground mb-4">
                  Stay updated with the latest news, drops, and announcements.
                </p>
                <Button asChild variant="outline" className="w-full border-secondary/50 hover:bg-secondary/10">
                  <a href="https://twitter.com/skillstacker" target="_blank" rel="noopener noreferrer">
                    Follow Us
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
