import { X } from "lucide-react";
import { useState } from "react";
import moonpayLogo from "@/assets/moonpay-logo.png";

export const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="sticky top-0 z-50 bg-primary text-white py-1.5 px-4 text-center shadow-md">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <span className="text-sm md:text-base font-medium">
          Now accepting crypto payments via
        </span>
        <img src={moonpayLogo} alt="MoonPay" className="h-4 md:h-5 brightness-0 invert inline-block" />
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-white/10 rounded p-1 transition-colors"
        aria-label="Close banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
