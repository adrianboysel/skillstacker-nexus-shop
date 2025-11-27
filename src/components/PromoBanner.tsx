import { X } from "lucide-react";
import { useState } from "react";

export const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(() => {
    const stored = localStorage.getItem('black-friday-banner-visible');
    return stored !== 'false';
  });

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('black-friday-banner-visible', 'false');
  };

  if (!isVisible) return null;

  return (
    <div className="sticky top-0 z-50 bg-primary text-white py-1.5 px-4 text-center shadow-md animate-in slide-in-from-top duration-500">
      <div className="container mx-auto pr-8 sm:pr-0">
        <div className="text-[10px] sm:text-xs font-semibold leading-tight mb-0.5">
          Black Friday Sale 50% Off Everything - Use Code:
        </div>
        <div className="text-xs sm:text-sm font-extrabold bg-white/20 px-2 py-0.5 rounded inline-block">
          BLACKFRIDAY50
        </div>
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
