import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Gift,
  ShoppingBag
} from "lucide-react";
import { Link } from "react-router-dom";

const FreeEntry = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Free Entry Method | Skill Stacker Giveaway"
        description="Learn how to enter Skill Stacker giveaways without making a purchase. No purchase necessary to participate."
        keywords="free entry, no purchase necessary, giveaway entry, sweepstakes"
        canonicalUrl="/free-entry"
      />
      <PromoBanner />
      <Header />
      
      <main className="container mx-auto px-4 py-12 pt-32 md:pt-40">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Free Entry Method
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            No purchase is necessary to enter or win. Here's how you can participate in our giveaways for free.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Free Entry Instructions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                How to Request Free Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                To receive free entries without making a purchase, send a handwritten request by mail following these instructions:
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Write Your Request</h3>
                    <p className="text-sm text-muted-foreground">
                      On a 3" x 5" card or piece of paper, hand print your full name, complete mailing address (no P.O. Boxes), email address, date of birth, and the name of the giveaway you wish to enter.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Mail Your Request</h3>
                    <p className="text-sm text-muted-foreground">
                      Place your handwritten request in a #10 envelope with proper postage and mail to the address specified in the Official Rules for the specific giveaway.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Receive Your Entries</h3>
                    <p className="text-sm text-muted-foreground">
                      Upon receipt and verification, free entries will be credited to your account. Limit one free entry request per outer mailing envelope.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Important:</strong> Requests must be handwritten (not typed or photocopied), mailed separately, and received by the entry deadline specified in the Official Rules.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Other Ways to Earn */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Other Ways to Earn Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                While no purchase is necessary to enter, you can also earn entries through:
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Making purchases:</strong> Earn entries automatically when you shop at Skill Stacker Shop
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Rewards program:</strong> Accumulate entries through our customer rewards program
                  </span>
                </li>
              </ul>
              
              <div className="pt-4">
                <Link to="/rewards">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Learn About Rewards Program
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Legal Disclaimers */}
          <Card className="bg-muted/30 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>Entries obtained through purchase and free entry methods have equal odds of winning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>Entries have no cash value and cannot be redeemed for cash or merchandise</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>Must be 18 years or older and a legal U.S. resident to participate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>Void where prohibited by law</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>All entries are subject to verification and the Official Rules</span>
                </li>
              </ul>
              
              <div className="pt-2">
                <a 
                  href="https://storage.googleapis.com/msgsndr/Rx2NKvjRAshrTTGyKfC1/media/69409f000212340a7df25437.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Complete Official Rules
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center pt-4">
            <Link to="/giveaways">
              <Button size="lg">
                <Gift className="w-4 h-4 mr-2" />
                View Active Giveaways
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreeEntry;
