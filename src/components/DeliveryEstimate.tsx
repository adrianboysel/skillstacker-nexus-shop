import { Truck, MapPin } from "lucide-react";
import { useState } from "react";

interface DeliveryEstimateProps {
  productType?: string;
}

export const DeliveryEstimate = ({ productType = "default" }: DeliveryEstimateProps) => {
  const [expanded, setExpanded] = useState(false);
  
  // Calculate estimated delivery dates based on product type
  const getDeliveryEstimate = () => {
    const today = new Date();
    const minDays = 3;
    const maxDays = 5;
    
    // Add buffer for certain product types
    const bufferDays = productType === "canvas" ? 2 : 0;
    
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays + bufferDays);
    
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays + bufferDays);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    };
    
    return {
      range: `${minDays + bufferDays}-${maxDays + bufferDays}`,
      dates: `${formatDate(minDate)} - ${formatDate(maxDate)}`
    };
  };
  
  const estimate = getDeliveryEstimate();
  
  return (
    <div className="border border-border/50 rounded-lg p-4 bg-muted/20">
      <div 
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-shrink-0 mt-0.5">
          <Truck className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold">Estimated Delivery</h3>
            <span className="text-xs text-muted-foreground">
              {expanded ? "Hide" : "Details"}
            </span>
          </div>
          <p className="text-sm text-foreground font-medium">
            {estimate.range} business days
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {estimate.dates}
          </p>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border/30 space-y-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-primary" />
            <div>
              <p className="font-medium text-foreground mb-1">Shipping Zones</p>
              <ul className="space-y-1">
                <li>• US Standard: 3-5 business days</li>
                <li>• US Express: 2-3 business days</li>
                <li>• International: 7-14 business days</li>
              </ul>
            </div>
          </div>
          
          <p className="text-[11px]">
            Delivery times are estimates and may vary based on your location, 
            shipping method selected at checkout, and current order volume. 
            You'll receive tracking information once your order ships.
          </p>
        </div>
      )}
    </div>
  );
};
