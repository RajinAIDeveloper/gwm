import Link from "next/link";

import { ListingFormSection } from "@/components/shared/listing-form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LISTING_CATEGORIES, type ListingCategory } from "@/types/domain";
import { formatListingCategory } from "@/components/shared/listing-card";

type BuyerBrowseFiltersProps = {
  initialSearch: string;
  initialCategory?: ListingCategory;
};

export function BuyerBrowseFilters({ initialSearch, initialCategory }: BuyerBrowseFiltersProps) {
  return (
    <ListingFormSection
      description="Search by fabric, scrap type, or supplier signal. Keep the filter model lean and fast."
      title="Refine marketplace feed"
    >
      <form action="/browse" className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem_auto] xl:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Search</span>
          <Input
            className="h-12 rounded-3xl border-border/70 bg-background/80 px-5"
            defaultValue={initialSearch}
            name="search"
            placeholder="Cotton jersey, offcuts, knit, trim"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Category</span>
          <select
            className="h-12 w-full rounded-3xl border border-border/70 bg-background/80 px-5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            defaultValue={initialCategory ?? ""}
            name="category"
          >
            <option value="">All categories</option>
            {LISTING_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {formatListingCategory(category)}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-3 xl:justify-end">
          <Button size="lg" type="submit">
            Apply filters
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/browse">Reset</Link>
          </Button>
        </div>
      </form>
    </ListingFormSection>
  );
}
