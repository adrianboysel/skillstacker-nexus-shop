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
  Star, 
  Gift, 
  History, 
  Loader2, 
  TrendingUp,
  ShoppingBag,
  RefreshCw,
  Info,
  LogIn
} from "lucide-react";

interface CustomerData {
  email: string;
  firstName: string;
  lastName: string;
  pointsBalance: number;
  lifetimePoints: number;
}

interface Transaction {
  id: string;
  orderId: string;
  pointsEarned: number;
  type: string;
  date: string;
  orderDetails: any;
}

const Rewards = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (session?.user?.email) {
        loadRewards(session.user.email);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        loadRewards(session.user.email);
      } else {
        setCustomer(null);
        setTransactions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadRewards = async (email: string) => {
    setIsLoadingRewards(true);

    try {
      const { data, error } = await supabase.functions.invoke('customer-rewards', {
        body: { email }
      });

      if (error) throw error;

      if (!data.success) {
        if (data.error?.includes('Authentication')) {
          toast.error("Please sign in to view your rewards");
        } else {
          // Customer might not have made a purchase yet
          setCustomer(null);
          setTransactions([]);
        }
        return;
      }

      setCustomer(data.customer);
      setTransactions(data.transactions || []);
    } catch (error: any) {
      console.error("Error fetching rewards:", error);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast.error("Please sign in to view your rewards");
      }
      setCustomer(null);
      setTransactions([]);
    } finally {
      setIsLoadingRewards(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getOrderNumber = (orderId: string) => {
    return orderId.replace('order_', '#').replace('refund_', 'Refund #');
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
        title="My Rewards | Skill Stacker Shop"
        description="Check your rewards points balance and activity. Earn points with every purchase at Skill Stacker Shop."
        keywords="rewards, points, loyalty program, skill stacker"
        canonicalUrl="/rewards"
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
            My Rewards
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Check your points balance and see your rewards activity
          </p>
        </div>

        {/* Not Logged In State */}
        {!user ? (
          <Card className="max-w-md mx-auto bg-card border-border">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-2">
                <LogIn className="w-6 h-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to view your rewards and points balance
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/auth')} className="w-full">
                Sign In to View Rewards
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Don't have an account? You can create one when you sign in.
              </p>
            </CardContent>
          </Card>
        ) : isLoadingRewards ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : customer ? (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome Message */}
            <div className="text-center mb-6">
              <p className="text-muted-foreground">
                Welcome back, <span className="text-foreground font-medium">
                  {customer.firstName || customer.email}
                </span>!
              </p>
            </div>

            {/* Points Balance Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Current Balance - Primary */}
              <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Available Points
                      </p>
                      <p className="text-4xl font-bold text-foreground">
                        {customer.pointsBalance.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-primary/20">
                      <Star className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lifetime Points - Secondary */}
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Lifetime Points Earned
                      </p>
                      <p className="text-2xl font-semibold text-foreground">
                        {customer.lifetimePoints.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-muted">
                      <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity History */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No points activity yet</p>
                    <p className="text-sm mt-1">
                      Make a purchase to start earning points!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx, index) => (
                      <div key={tx.id}>
                        {index > 0 && <Separator className="my-3" />}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              tx.type === 'refund' 
                                ? 'bg-destructive/20' 
                                : 'bg-primary/20'
                            }`}>
                              {tx.type === 'refund' ? (
                                <RefreshCw className="w-4 h-4 text-destructive" />
                              ) : (
                                <ShoppingBag className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {getOrderNumber(tx.orderId)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(tx.date)}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant={tx.pointsEarned >= 0 ? "default" : "destructive"}
                            className={tx.pointsEarned >= 0 
                              ? "bg-primary/20 text-primary hover:bg-primary/30" 
                              : ""
                            }
                          >
                            {tx.pointsEarned >= 0 ? '+' : ''}{tx.pointsEarned.toLocaleString()} pts
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="bg-muted/30 border-border">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground mb-2">
                      How Points Work
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Points are earned based on the products you purchase. Each product 
                      earns a fixed number of points, which are added to your balance 
                      when your order is completed. Refunded items will have their 
                      points deducted from your balance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* No Rewards Found State */
          <div className="max-w-md mx-auto text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Gift className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Rewards Found
            </h3>
            <p className="text-muted-foreground">
              We couldn't find a rewards account with your email. Points are 
              automatically created when you make your first purchase.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Rewards;
