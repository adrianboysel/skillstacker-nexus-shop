import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold">
              About{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Skill Stacker
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Where learning pays dividends
            </p>
          </div>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <div className="p-8 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                Skill Stacker is the Web3 education and creator ecosystem built on Solana and powered by the $STKR token. We're revolutionizing the way creators monetize their skills, turning knowledge into capital in the new digital economy.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4">The $STKR Token</h2>
              <p className="text-muted-foreground leading-relaxed">
                $STKR is the fuel that powers our ecosystem. Built on Solana for lightning-fast transactions and minimal fees, $STKR enables creators to stake their reputation, earn rewards for quality content, and participate in the governance of the platform.
              </p>
            </div>
            
            <div className="p-8 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4">Meme Militia</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Meme Militia is the creative collective behind our exclusive merchandise drops. More than just apparel, each piece represents membership in a community of builders, creators, and innovators who are shaping the future of the digital economy.
              </p>
            </div>
          </div>
          
          <div className="text-center pt-8">
            <Link to="/shop">
              <Button size="lg" className="group shadow-glow-blue hover:shadow-glow">
                Shop the Collection
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
