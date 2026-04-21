"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type ImageGalleryProps = {
  images: string[];
  title: string;
};

function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? null;
  const isMainImage = activeIndex === 0;

  return (
    <div className="space-y-4">
      <div
        aria-label={activeImage ? `${title} image ${activeIndex + 1}` : `${title} image placeholder`}
        className="h-80 rounded-[2rem] border border-border/70 bg-muted"
        style={activeImage ? { backgroundImage: `url(${activeImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
        {!activeImage ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image available</div>
        ) : null}
      </div>
      {activeImage ? (
        <p className="text-sm text-muted-foreground">
          {isMainImage ? "Main image" : `Detail image ${activeIndex}`}
        </p>
      ) : null}

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              className={cn(
                "h-20 rounded-2xl border border-border/70 bg-muted transition-colors",
                index === activeIndex ? "border-foreground/50 ring-2 ring-ring/30" : "hover:border-foreground/30",
              )}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <span
                className="block h-full w-full rounded-[calc(1rem-1px)] bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
              <span className="sr-only">{index === 0 ? "View main image" : `View detail image ${index}`}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export { ImageGallery };
