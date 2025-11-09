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
        <div className="max-w-6xl mx-auto">
          <AspectRatio ratio={21/9} className="bg-muted rounded-lg overflow-hidden relative group">
            {!isPlaying ? (
              <>
                {/* Thumbnail/Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/30 to-pink-500/30">
                  {thumbnailUrl && (
                    <img 
                      src={thumbnailUrl} 
                      alt={title}
                      className="w-full h-full object-cover opacity-60"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={handlePlay}
                    className="relative group/btn"
                    aria-label="Play video"
                  >
                    {/* Rotating text circle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-32 h-32 md:w-40 md:h-40 animate-spin-slow" viewBox="0 0 200 200">
                        <path
                          id="circlePath"
                          d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
                          fill="none"
                        />
                        <text className="text-xs md:text-sm fill-foreground/80 font-medium tracking-wider">
                          <textPath href="#circlePath" startOffset="0%">
                            {title.toUpperCase()} • {title.toUpperCase()} • 
                          </textPath>
                        </text>
                      </svg>
                    </div>

                    {/* Play button */}
                    <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary flex items-center justify-center shadow-glow hover:shadow-glow-blue transition-all duration-300 group-hover/btn:scale-110">
                      <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground fill-current ml-1" />
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
          </AspectRatio>
        </div>
      </div>
    </section>
  );
};
