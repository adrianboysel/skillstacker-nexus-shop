import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
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
  Trophy,
  LogIn
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
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEntering, setIsEntering] = useState<string | null>(null);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [customerEntries, setCustomerEntries] = useState<Record<string, number>>({});
  const [customerBalance, setCustomerBalance] = useState<number>(0);
  const [entryAmounts, setEntryAmounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
      loadGiveaways(session?.user?.email);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        loadGiveaways(session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadGiveaways = async (customerEmail?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('giveaway-entries', {
        body: { 
          action: 'get_giveaways',
          email: customerEmail || undefined
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
      // Still show giveaways even if customer data fails
      setGiveaways([]);
    }
  };

  const handleEnterGiveaway = async (giveaway: Giveaway) => {
    if (!user?.email) {
      toast.error("Please sign in to enter giveaways");
      navigate('/auth');
      return;
    }

    const entries = entryAmounts[giveaway.id] || 1;
    const pointsNeeded = giveaway.points_per_entry * entries;
    
    if (customerBalance < pointsNeeded) {
      toast.error(`You need ${pointsNeeded.toLocaleString()} entries but only have ${customerBalance.toLocaleString()}`);
      return;
    }
    
    setIsEntering(giveaway.id);
    try {
      const { data, error } = await supabase.functions.invoke('giveaway-entries', {
        body: {
          action: 'enter_giveaway',
          email: user.email,
          giveawayId: giveaway.id,
          entryCount: entries
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(
          `You entered ${giveaway.title} with ${entries} ${entries === 1 ? 'submission' : 'submissions'}!`,
          { description: `${data.pointsSpent.toLocaleString()} entries spent` }
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
      if (error.message?.includes('401') || error.message?.includes('Authentication')) {
        toast.error("Please sign in to enter giveaways");
        navigate('/auth');
      } else {
        toast.error("Failed to enter giveaway");
      }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Giveaways | Skill Stacker Shop"
        description="Enter giveaways using your reward entries. Win exclusive prizes from Skill Stacker Shop."
        keywords="giveaways, prizes, rewards, entries, skill stacker"
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
            Use your reward entries to enter for a chance to win exclusive prizes
          </p>
        </div>

        {/* Auth Status Section */}
        {!user ? (
          <Card className="max-w-md mx-auto mb-8 bg-card border-border">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-2">
                <LogIn className="w-6 h-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">Sign In to Enter</CardTitle>
              <CardDescription>
                Sign in to see your entries balance and enter giveaways
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/auth')} className="w-full">
                Sign In
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Points Balance */
          <Card className="max-w-md mx-auto mb-8 bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Entries Balance</p>
                  <p className="text-3xl font-bold text-foreground">
                    {customerBalance.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/20">
                  <Star className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Signed in as {user.email}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Giveaways List */}
        {giveaways.length === 0 ? (
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
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {giveaways.map((giveaway) => {
              const entries = entryAmounts[giveaway.id] || 1;
              const pointsNeeded = giveaway.points_per_entry * entries;
              const canAfford = customerBalance >= pointsNeeded;
              const myEntries = customerEntries[giveaway.id] || 0;
              
              return (
                <Card key={giveaway.id} className="bg-card border-border overflow-hidden">
                  {giveaway.image_url && (
                    <div className="aspect-square bg-muted overflow-hidden">
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
                      <span className="text-muted-foreground">Entries per submission:</span>
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
                    
                    {user ? (
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
                        
                        {/* Total Entries */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total cost:</span>
                          <span className={`font-bold ${canAfford ? 'text-foreground' : 'text-destructive'}`}>
                            {pointsNeeded.toLocaleString()} entries
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
                          {canAfford ? 'Enter Giveaway' : 'Insufficient Entries'}
                        </Button>
                        
                        {!canAfford && (
                          <p className="text-xs text-center text-destructive">
                            You need {(pointsNeeded - customerBalance).toLocaleString()} more entries
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate('/auth')}
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign in to enter
                        </Button>
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
              <li>• Use your reward entries to purchase giveaway submissions</li>
              <li>• Each submission gives you one chance to win</li>
              <li>• More submissions = more chances to win</li>
              <li>• Entries are deducted immediately upon submission</li>
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
