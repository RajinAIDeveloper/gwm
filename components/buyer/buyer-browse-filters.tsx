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
      description="Use a text search and a single category filter to narrow the current marketplace listings."
      title="Find material"
    >
      <form action="/browse" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem_auto] lg:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Search</span>
          <Input defaultValue={initialSearch} name="search" placeholder="Cotton, offcuts, knit, trim" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Category</span>
          <select
            className="h-11 w-full rounded-4xl border border-input bg-input/30 px-4 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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

        <div className="flex flex-wrap gap-3">
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
