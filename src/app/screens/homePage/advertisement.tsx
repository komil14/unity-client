import { useEffect, useState } from "react";

const VIDEOS = [
  "/uploads/advertisment/video1.mp4",
  "/uploads/advertisment/video2.mp4",
  "/uploads/advertisment/video3.mp4",
  "/uploads/advertisment/video4.mp4",
];

export default function AdvertisementSection() {
  const [selectedVideo, setSelectedVideo] = useState<string>("");

  useEffect(() => {
    // Select a random video on component mount
    const randomIndex = Math.floor(Math.random() * VIDEOS.length);
    setSelectedVideo(VIDEOS[randomIndex]);
  }, []);

  if (!selectedVideo) return null;

  return (
    <section className="mb-7">
      <div className="relative w-full h-[500px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <video
          key={selectedVideo}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={selectedVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Optional overlay badge */}
        <div className="absolute top-4 right-4">
          <div className="inline-flex items-center rounded-full bg-background/80 backdrop-blur px-3 py-1.5 text-xs font-semibold text-foreground border border-border">
            Advertisement
          </div>
        </div>
      </div>
    </section>
  );
}
