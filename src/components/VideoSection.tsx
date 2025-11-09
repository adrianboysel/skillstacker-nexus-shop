import { useState } from "react";
import { Play } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface VideoSectionProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: string;
}

export const VideoSection = ({ 
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgxcQ",
  thumbnailUrl,
  title = "Watch the Video"
}: VideoSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Custom shape container with angled bottom-right corner */}
          <div 
            className="relative w-full overflow-hidden bg-muted"
            style={{
              aspectRatio: '21/7'
            }}
          >
            <style>
              {`
                @media (min-width: 768px) {
                  .video-container {
                    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%) !important;
                  }
                }
              `}
            </style>
            <div className="video-container absolute inset-0">
            {!isPlaying ? (
              <>
                {/* Thumbnail/Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-500/40 to-pink-500/40">
                  {thumbnailUrl && (
                    <img 
                      src={thumbnailUrl} 
                      alt={title}
                      className="w-full h-full object-cover opacity-70"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
                </div>

                {/* Left side text - hidden on mobile */}
                <div className="hidden md:block absolute left-8 md:left-12 top-1/2 -translate-y-1/2 z-20">
                  <div 
                    className="text-foreground/90 font-bold tracking-wider"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
                      letterSpacing: '0.2em'
                    }}
                  >
                    LAST YEAR'S CONFERENCE
                  </div>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={handlePlay}
                    className="relative group/btn"
                    aria-label="Play video"
                  >
                    {/* Rotating text circle */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg className="w-44 h-44 md:w-56 md:h-56 animate-spin-slow" viewBox="0 0 200 200">
                        <defs>
                          <path
                            id="circlePath"
                            d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
                          />
                        </defs>
                        <text className="text-[11px] md:text-sm fill-foreground font-bold tracking-[0.3em] uppercase">
                          <textPath href="#circlePath" startOffset="0%">
                            VIDEO WATCH • VIDEO WATCH • VIDEO WATCH • VIDEO WATCH • 
                          </textPath>
                        </text>
                      </svg>
                    </div>

                    {/* Play button */}
                    <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary flex items-center justify-center shadow-glow hover:shadow-glow-blue transition-all duration-300 group-hover/btn:scale-105">
                      <Play className="w-10 h-10 md:w-14 md:h-14 text-primary-foreground fill-current ml-1.5" />
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <iframe
                src={`${videoUrl}?autoplay=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
