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
    <div className="space-y-5">
      <div
        aria-label={activeImage ? `${title} image ${activeIndex + 1}` : `${title} image placeholder`}
        className="market-grid relative aspect-[4/3] min-h-[18rem] overflow-hidden rounded-[2rem] border border-border/70 bg-muted sm:aspect-[16/10] sm:min-h-[24rem] 2xl:min-h-[32rem]"
        style={activeImage ? { backgroundImage: `url(${activeImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/18 via-transparent to-transparent" />
        {activeImage ? (
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="market-pill border-white/25 bg-black/30 text-white">
              {isMainImage ? "Main image" : `Detail image ${activeIndex}`}
            </span>
          </div>
        ) : null}
        {!activeImage ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image available</div>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              className={cn(
                "group relative h-24 overflow-hidden rounded-[1.35rem] border border-border/70 bg-muted transition-all sm:h-28",
                index === activeIndex
                  ? "border-primary/40 ring-4 ring-primary/15"
                  : "hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md",
              )}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <span className="absolute inset-0 bg-gradient-to-t from-foreground/18 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
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
