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
  LogIn,
  Info,
  ExternalLink
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
                        className="w-full h-full object-cover object-top"
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
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          Entry cost:
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-left p-3">
                              <p className="text-sm leading-relaxed">
                                Entries are used to participate in giveaways.<br /><br />
                                One submission equals one entry attempt.<br /><br />
                                No purchase is necessary to obtain entries.<br /><br />
                                Entries have no cash value and do not guarantee winning.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </span>
                        <span className="font-semibold text-primary">
                          {giveaway.points_per_entry.toLocaleString()} entries
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Each submission uses entries from your balance. Entries have no cash value and do not guarantee winning.
                      </p>
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
                        
                        {/* No Purchase Necessary Link */}
                        <a 
                          href="https://storage.googleapis.com/msgsndr/Rx2NKvjRAshrTTGyKfC1/media/69409f000212340a7df25437.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          No purchase necessary. Free entry method available.
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-3 text-center py-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate('/auth')}
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign in to enter
                        </Button>
                        
                        {/* No Purchase Necessary Link - visible to logged out users */}
                        <a 
                          href="https://storage.googleapis.com/msgsndr/Rx2NKvjRAshrTTGyKfC1/media/69409f000212340a7df25437.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          No purchase necessary. Free entry method available.
                        </a>
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
              <li>• Use your reward entries to submit giveaway entries</li>
              <li>• Each submission gives you one chance to win</li>
              <li>• Entries are spent from your balance upon submission</li>
              <li>• Entries have no cash value and do not guarantee winning</li>
              <li>• Winners are selected randomly after the giveaway ends</li>
              <li>• No purchase is necessary to obtain entries</li>
            </ul>
            <a 
              href="https://storage.googleapis.com/msgsndr/Rx2NKvjRAshrTTGyKfC1/media/69409f000212340a7df25437.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-4"
            >
              <ExternalLink className="w-3 h-3" />
              View Official Rules
            </a>
          </CardContent>
        </Card>

        {/* How The Winner Is Chosen Section */}
        <section className="mt-20 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            HOW THE WINNER IS CHOSEN
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Side - Process */}
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-muted mb-4">
                  <svg className="w-10 h-10 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="1.5"/>
                    <line x1="8" y1="21" x2="16" y2="21" strokeWidth="1.5"/>
                    <line x1="12" y1="17" x2="12" y2="21" strokeWidth="1.5"/>
                  </svg>
                </div>
                <p className="text-sm md:text-base font-semibold text-foreground uppercase tracking-wide">
                  3rd Party Sweepstakes Firm Does<br />
                  A Computer Random Drawing To<br />
                  Pick The Winner
                </p>
                <p className="text-xs text-muted-foreground mt-2">(Usually Takes 5-7 Business Days)</p>
              </div>
              
              {/* Arrow Down */}
              <div className="flex justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              
              {/* Step 2 */}
              <div className="text-center">
                <p className="text-sm md:text-base font-semibold text-foreground uppercase tracking-wide">
                  We Announce The Winner<br />
                  On All Of Our Social Media<br />
                  Pages + Email
                </p>
              </div>
              
              {/* Arrow Down */}
              <div className="flex justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              
              {/* Step 3 */}
              <div className="flex items-center justify-center gap-4">
                <div className="p-3 rounded-full bg-muted">
                  <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm md:text-base font-semibold text-foreground uppercase tracking-wide">
                    We Contact The Winner<br />
                    Through A Phone Call<br />
                    To Notify Them
                  </p>
                </div>
              </div>
              
              {/* Warning */}
              <p className="text-center text-destructive text-xs font-medium">
                * WE WILL NEVER CONTACT THE WINNER<br />
                ASKING FOR PAYMENT OF ANY KIND
              </p>
            </div>
            
            {/* Right Side - Trust Badges */}
            <div className="space-y-8 md:space-y-14 md:pt-8">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0" />
                <span className="text-foreground font-medium">
                  Drawing is handled by a Sweepstakes Firm
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0" />
                <span className="text-foreground font-medium">
                  100% Satisfaction Guarantee
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0" />
                <span className="text-foreground font-medium">
                  No subscription required
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0" />
                <span className="text-foreground font-medium">
                  High Quality Apparel & Products
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0" />
                <span className="text-foreground font-medium">
                  Bonded and Insured
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Giveaways;
