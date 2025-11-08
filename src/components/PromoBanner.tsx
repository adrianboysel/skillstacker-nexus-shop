import { X } from "lucide-react";
import { useState } from "react";
import moonpayLogo from "@/assets/moonpay-logo.png";

export const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(() => {
    const stored = localStorage.getItem('promo-banner-visible');
    return stored !== 'false';
  });

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('promo-banner-visible', 'false');
  };

  if (!isVisible) return null;

  return (
    <div className="sticky top-0 z-50 bg-primary text-white py-2 px-4 text-center shadow-md animate-in slide-in-from-top duration-500">
      <div className="container mx-auto flex items-center justify-center gap-1.5 sm:gap-2 pr-8 sm:pr-0">
        <span className="text-xs sm:text-sm md:text-base font-medium leading-tight">
          Crypto payments via
        </span>
        <img src={moonpayLogo} alt="MoonPay" width="79" height="20" className="h-3.5 sm:h-4 md:h-5 brightness-0 invert inline-block" />
      </div>
      <button
        onClick={handleClose}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 hover:bg-white/10 rounded p-1 transition-colors"
        aria-label="Close banner"
      >
        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>
    </div>
  );
};
