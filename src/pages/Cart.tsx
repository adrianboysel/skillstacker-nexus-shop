import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PromoBanner } from "@/components/PromoBanner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { Minus, Plus, Trash2, ExternalLink, Loader2, ShoppingCart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Cart = () => {
  const { items, isLoading, updateQuantity, removeItem, createCheckout } = useCartStore();
  
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const currencyCode = items[0]?.price.currencyCode || 'USD';

  const handleCheckout = async () => {
    try {
      await createCheckout();
      const checkoutUrl = useCartStore.getState().checkoutUrl;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PromoBanner />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-[156px] pb-20">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
        
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Add some items from the shop to get started!</p>
            <Link to="/shop">
              <Button size="lg" className="shadow-glow-blue">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-6 p-6 rounded-lg border border-border/50 bg-card/50">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.product.node.images?.edges?.[0]?.node && (
                      <img
                        src={item.product.node.images.edges[0].node.url}
                        alt={item.product.node.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">{item.product.node.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.selectedOptions.map(option => option.value).join(' • ')}
                    </p>
                    <p className="font-bold text-primary">
                      {item.price.currencyCode} ${parseFloat(item.price.amount).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(item.variantId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 p-6 rounded-lg border border-border/50 bg-card/50 space-y-6">
                <h2 className="text-2xl font-bold">Order Summary</h2>
                
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{currencyCode} ${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-sm text-muted-foreground">Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {currencyCode} ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={handleCheckout}
                    className="w-full shadow-glow-blue hover:shadow-glow" 
                    size="lg"
                    disabled={items.length === 0 || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Checkout...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Checkout with Shopify
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;
