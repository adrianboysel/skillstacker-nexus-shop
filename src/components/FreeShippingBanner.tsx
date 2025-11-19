import { Truck, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FreeShippingBannerProps {
  currentTotal: number;
  threshold?: number;
  currencyCode?: string;
}

export const FreeShippingBanner = ({ 
  currentTotal, 
  threshold = 150, 
  currencyCode = "USD" 
}: FreeShippingBannerProps) => {
  const remaining = threshold - currentTotal;
  const progress = Math.min((currentTotal / threshold) * 100, 100);
  const hasReachedThreshold = currentTotal >= threshold;

  return (
    <div className="rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 mb-8">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {hasReachedThreshold ? (
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {hasReachedThreshold ? (
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                🎉 You've unlocked free shipping!
              </p>
              <p className="text-xs text-muted-foreground">
                Your order qualifies for free standard shipping
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                {remaining > 0 && (
                  <>
                    Add{" "}
                    <span className="text-primary">
                      {currencyCode} ${remaining.toFixed(2)}
                    </span>{" "}
                    more for free shipping
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Free standard shipping on orders over {currencyCode} ${threshold}
              </p>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
