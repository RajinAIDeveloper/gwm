import { cn } from "@/lib/utils";

type RatingStarsProps = {
  average: number | null;
  count: number;
  className?: string;
};

function RatingStars({ average, count, className }: RatingStarsProps) {
  if (!average || count === 0) {
    return <p className={cn("text-sm text-muted-foreground", className)}>No ratings yet</p>;
  }

  const filledStars = Math.round(average);

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <span className="tracking-[0.15em] text-amber-500" aria-hidden="true">
        {"★★★★★".slice(0, filledStars)}
        <span className="text-muted">{"★★★★★".slice(filledStars)}</span>
      </span>
      <span className="font-medium text-foreground">{average.toFixed(1)}</span>
      <span className="text-muted-foreground">({count} rating{count === 1 ? "" : "s"})</span>
    </div>
  );
}

export { RatingStars };
