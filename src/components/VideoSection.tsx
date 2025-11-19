import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
interface VideoSectionProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  rotatingText?: string;
}
export const VideoSection = ({
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgxcQ",
  thumbnailUrl,
  title = "Watch the Video",
  rotatingText = "WATCH VIDEO • PLAY NOW • "
}: VideoSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);

  const extractYouTubeId = (url: string): string | null => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIdx = parts.indexOf('embed');
      if (embedIdx !== -1 && parts[embedIdx + 1]) return parts[embedIdx + 1];
      const liveIdx = parts.indexOf('live');
      if (liveIdx !== -1 && parts[liveIdx + 1]) return parts[liveIdx + 1];
      return u.searchParams.get('v');
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const loadYT = () =>
      new Promise<void>((resolve) => {
        if ((window as any).YT?.Player) return resolve();
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        (window as any).onYouTubeIframeAPIReady = () => resolve();
        document.body.appendChild(tag);
      });

    loadYT().then(() => {
      const YT = (window as any).YT;
      const id = extractYouTubeId(videoUrl);
      if (!playerContainerRef.current || !id) return;
      playerRef.current = new YT.Player(playerContainerRef.current, {
        videoId: id,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          showinfo: 0,
          playsinline: 1,
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === YT.PlayerState.ENDED) {
              playerRef.current?.destroy();
              playerRef.current = null;
              setIsPlaying(false);
            }
          },
        },
      });
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [isPlaying, videoUrl]);

  const handlePlay = () => {
    setIsPlaying(true);
  };
  return <section className="pt-2 md:pt-6 pb-8 md:pb-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Custom shape container with angled bottom-right corner */}
          <div className="relative w-full overflow-hidden bg-muted aspect-video md:aspect-[21/7]">
            <style>
              {`
                @media (min-width: 768px) {
                  .video-container {
                    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%) !important;
                  }
                }
              `}
            </style>
            {/* Solid black triangle in corner - desktop only */}
            <div className="hidden md:block absolute bottom-0 right-0 w-[80px] h-[80px] bg-background pointer-events-none z-10" style={{
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
            }} />
            <div className="video-container absolute inset-0">
            {!isPlaying ? <>
                {/* Thumbnail/Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-500/40 to-pink-500/40">
                  {thumbnailUrl && <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover opacity-70" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
                </div>

                {/* Left side text - hidden on mobile */}
                <div className="hidden md:block absolute left-8 md:left-12 top-1/2 -translate-y-1/2 z-20">
                  <div className="text-foreground/90 font-bold tracking-wider" style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
                  letterSpacing: '0.2em'
                }}>Featured Video</div>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button onClick={handlePlay} className="relative group/btn" aria-label="Play video">
                    {/* Rotating text circle */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
                      <svg className="w-44 h-44 md:w-80 md:h-80" viewBox="0 0 200 200" style={{
                      animation: 'spin 20s linear infinite'
                    }}>
                        <defs>
                          <path id="circlePath" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" />
                        </defs>
                        <text className="text-sm md:text-lg font-bold tracking-[0.35em] uppercase" fill="hsl(329 100% 59%)" stroke="hsl(0 0% 100%)" strokeWidth="0.5">
                          <textPath href="#circlePath" startOffset="0%">
                            {rotatingText.repeat(2)}
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
              </> : <div ref={playerContainerRef} className="absolute inset-0 w-full h-full" />}
            </div>
          </div>
        </div>
      </div>
    </section>;
};