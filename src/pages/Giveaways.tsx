import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Gift, 
  Star, 
  Clock, 
  Ticket, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Minus,
  Plus,
  Trophy
} from "lucide-react";

interface Giveaway {
  id: string;
  title: string;
  description: string;
  prize_description: string;
  points_per_entry: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  max_entries_per_customer: number | null;
  image_url: string | null;
}

const Giveaways = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEntering, setIsEntering] = useState<string | null>(null);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [customerEntries, setCustomerEntries] = useState<Record<string, number>>({});
  const [customerBalance, setCustomerBalance] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [entryAmounts, setEntryAmounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadGiveaways();
  }, []);

  const loadGiveaways = async (customerEmail?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('giveaway-entries', {
        body: { 
          action: 'get_giveaways',
          email: customerEmail || email || undefined
        }
      });

      if (error) throw error;

      if (data.success) {
        setGiveaways(data.giveaways || []);
        setCustomerEntries(data.customerEntries || {});
        setCustomerBalance(data.customerBalance || 0);
        
        // Initialize entry amounts
        const amounts: Record<string, number> = {};
        data.giveaways?.forEach((g: Giveaway) => {
          amounts[g.id] = 1;
        });
        setEntryAmounts(amounts);
      }
    } catch (error: any) {
      console.error("Error loading giveaways:", error);
      toast.error("Failed to load giveaways");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    
    setIsLoading(true);
    await loadGiveaways(email.trim());
    setIsLoggedIn(true);
    setIsLoading(false);
    toast.success("Logged in successfully!");
  };

  const handleEnterGiveaway = async (giveaway: Giveaway) => {
    const entries = entryAmounts[giveaway.id] || 1;
    const pointsNeeded = giveaway.points_per_entry * entries;
    
    if (customerBalance < pointsNeeded) {
      toast.error(`You need ${pointsNeeded.toLocaleString()} points but only have ${customerBalance.toLocaleString()}`);
      return;
    }
    
    setIsEntering(giveaway.id);
    try {
      const { data, error } = await supabase.functions.invoke('giveaway-entries', {
        body: {
          action: 'enter_giveaway',
          email: email.trim(),
          giveawayId: giveaway.id,
          entryCount: entries
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(
          `You entered ${giveaway.title} with ${entries} ${entries === 1 ? 'entry' : 'entries'}!`,
          { description: `${data.pointsSpent.toLocaleString()} points spent` }
        );
        setCustomerBalance(data.newBalance);
        setCustomerEntries(prev => ({
          ...prev,
          [giveaway.id]: (prev[giveaway.id] || 0) + entries
        }));
        setEntryAmounts(prev => ({ ...prev, [giveaway.id]: 1 }));
      } else {
        toast.error(data.error || "Failed to enter giveaway");
      }
    } catch (error: any) {
      console.error("Error entering giveaway:", error);
      toast.error("Failed to enter giveaway");
    } finally {
      setIsEntering(null);
    }
  };

  const adjustEntryAmount = (giveawayId: string, delta: number) => {
    setEntryAmounts(prev => {
      const current = prev[giveawayId] || 1;
      const newAmount = Math.max(1, current + delta);
      return { ...prev, [giveawayId]: newAmount };
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return "Ending soon";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Giveaways | Skill Stacker Shop"
        description="Enter giveaways using your reward points. Win exclusive prizes from Skill Stacker Shop."
        keywords="giveaways, prizes, rewards, points, skill stacker"
        canonicalUrl="/giveaways"
      />
      <PromoBanner />
      <Header />
      
      <main className="container mx-auto px-4 py-12 pt-32 md:pt-40">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Giveaways
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Use your reward points to enter for a chance to win exclusive prizes
          </p>
        </div>

        {/* Login Section */}
        {!isLoggedIn ? (
          <Card className="max-w-md mx-auto mb-8 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Enter Your Email</CardTitle>
              <CardDescription>
                Use the same email from your purchases to access your points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="flex gap-3">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Points Balance */}
            <Card className="max-w-md mx-auto mb-8 bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Points Balance</p>
                    <p className="text-3xl font-bold text-foreground">
                      {customerBalance.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-primary/20">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 text-muted-foreground"
                  onClick={() => {
                    setIsLoggedIn(false);
                    setEmail("");
                    setCustomerBalance(0);
                    setCustomerEntries({});
                  }}
                >
                  Change email
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Giveaways List */}
        {isLoading && !isLoggedIn ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : giveaways.length === 0 ? (
          <Card className="max-w-md mx-auto bg-card border-border">
            <CardContent className="py-12 text-center">
              <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Active Giveaways
              </h3>
              <p className="text-muted-foreground">
                Check back soon for new giveaway opportunities!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {giveaways.map((giveaway) => {
              const entries = entryAmounts[giveaway.id] || 1;
              const pointsNeeded = giveaway.points_per_entry * entries;
              const canAfford = customerBalance >= pointsNeeded;
              const myEntries = customerEntries[giveaway.id] || 0;
              
              return (
                <Card key={giveaway.id} className="bg-card border-border overflow-hidden">
                  {giveaway.image_url && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img 
                        src={giveaway.image_url} 
                        alt={giveaway.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{giveaway.title}</CardTitle>
                      <Badge variant="outline" className="flex-shrink-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {getTimeRemaining(giveaway.end_date)}
                      </Badge>
                    </div>
                    {giveaway.prize_description && (
                      <CardDescription className="text-primary font-medium">
                        Prize: {giveaway.prize_description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {giveaway.description && (
                      <p className="text-sm text-muted-foreground">
                        {giveaway.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Points per entry:</span>
                      <span className="font-semibold text-primary">
                        {giveaway.points_per_entry.toLocaleString()}
                      </span>
                    </div>
                    
                    {myEntries > 0 && (
                      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-primary/10">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                          You have {myEntries} {myEntries === 1 ? 'entry' : 'entries'}
                        </span>
                      </div>
                    )}
                    
                    <Separator />
                    
                    {isLoggedIn ? (
                      <div className="space-y-3">
                        {/* Entry Amount Selector */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Entries:</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => adjustEntryAmount(giveaway.id, -1)}
                              disabled={entries <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{entries}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => adjustEntryAmount(giveaway.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Total Points */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total cost:</span>
                          <span className={`font-bold ${canAfford ? 'text-foreground' : 'text-destructive'}`}>
                            {pointsNeeded.toLocaleString()} points
                          </span>
                        </div>
                        
                        {/* Enter Button */}
                        <Button
                          className="w-full"
                          onClick={() => handleEnterGiveaway(giveaway)}
                          disabled={!canAfford || isEntering === giveaway.id}
                        >
                          {isEntering === giveaway.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Ticket className="w-4 h-4 mr-2" />
                          )}
                          {canAfford ? 'Enter Giveaway' : 'Insufficient Points'}
                        </Button>
                        
                        {!canAfford && (
                          <p className="text-xs text-center text-destructive">
                            You need {(pointsNeeded - customerBalance).toLocaleString()} more points
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          Enter your email above to participate
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Ends {formatDate(giveaway.end_date)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* How It Works */}
        <Card className="max-w-2xl mx-auto mt-12 bg-muted/30 border-border">
          <CardContent className="pt-6">
            <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              How Giveaways Work
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use your reward points to purchase giveaway entries</li>
              <li>• Each entry gives you one chance to win</li>
              <li>• More entries = more chances to win</li>
              <li>• Points are deducted immediately upon entry</li>
              <li>• Winners are selected randomly after the giveaway ends</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Giveaways;
