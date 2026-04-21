import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/shared/page-container";
import { BuyerBrowseFilters } from "@/components/buyer/buyer-browse-filters";
import { BuyerBrowseResults } from "@/components/buyer/buyer-browse-results";
import { formatListingCategory } from "@/components/shared/listing-card";
import { getPublicListings } from "@/lib/data/listings";
import { LISTING_CATEGORIES, type ListingCategory } from "@/types/domain";

type BrowsePageProps = {
  searchParams: Promise<{
    search?: string | string[];
    category?: string | string[];
  }>;
};

function getSingleValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function parseCategory(value: string): ListingCategory | undefined {
  return LISTING_CATEGORIES.includes(value as ListingCategory) ? (value as ListingCategory) : undefined;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const resolvedSearchParams = await searchParams;
  const search = getSingleValue(resolvedSearchParams.search).trim();
  const category = parseCategory(getSingleValue(resolvedSearchParams.category));
  const listings = await getPublicListings({
    search: search || undefined,
    category,
  });

  return (
    <PageContainer className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Public marketplace</Badge>
          <Badge variant="secondary">{listings.length} live listings</Badge>
          {category ? <Badge>{formatListingCategory(category)}</Badge> : null}
        </div>
        <div className="max-w-3xl space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Browse available garment waste stock.
          </h1>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Search current listings, review material details, and send a single inquiry when you find a match.
          </p>
        </div>
      </section>

      <BuyerBrowseFilters initialCategory={category} initialSearch={search} />
      <BuyerBrowseResults category={category} listings={listings} search={search} />
    </PageContainer>
  );
}
