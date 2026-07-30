import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import logoWhite from "@/assets/logo-white.png";

// 30 days from July 30, 2026
const LAUNCH_DATE = new Date("2026-08-29T00:00:00Z").getTime();

const getRemaining = () => {
  const diff = Math.max(0, LAUNCH_DATE - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const UnderConstruction = () => {
  const [time, setTime] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <SEO
        title="Under Construction - Skill Stacker Shop"
        description="The Skill Stacker Shop is getting an upgrade. Our store reopens soon — check back for exclusive drops of official Skill Stacker apparel and collectibles."
        keywords="skill stacker, coming soon, under construction, shop"
        canonicalUrl="/"
      />

      <img src={logoWhite} alt="Skill Stacker logo" className="w-40 md:w-56 mb-10" />

      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
        We're{" "}
        <span
          className="bg-gradient-primary bg-clip-text text-transparent animate-gradient-shift"
          style={{ backgroundSize: "200% 200%" }}
        >
          under construction
        </span>
      </h1>

      <p className="text-base md:text-xl text-muted-foreground max-w-xl mb-12">
        The shop is temporarily closed while we build something better. New drops
        of Skill Stacker clothing, art, and collectibles are on the way.
      </p>

      <div className="grid grid-cols-4 gap-3 md:gap-6 mb-12">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="min-w-[70px] md:min-w-[110px] rounded-lg border border-border/50 bg-card/50 px-3 py-4 md:px-6 md:py-6"
          >
            <div className="text-2xl md:text-5xl font-bold text-primary tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] md:text-sm uppercase tracking-widest text-muted-foreground mt-1">
              {unit.label}
            </div>
          </div>
        ))}
      </div>

      <a
        href="https://skillstacker.io"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        Learn about $STKR at skillstacker.io
      </a>
    </div>
  );
};

export default UnderConstruction;