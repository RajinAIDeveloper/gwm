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
    <PageContainer className="space-y-8 lg:space-y-10">
      <section className="market-panel market-grid overflow-hidden px-5 py-8 sm:px-7 sm:py-10 lg:px-10 lg:py-12">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,28rem)] lg:items-end">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Public marketplace</Badge>
              <Badge variant="secondary">{listings.length} live listings</Badge>
              {category ? <Badge>{formatListingCategory(category)}</Badge> : null}
            </div>
            <div className="max-w-4xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Source surplus textile stock with clearer supplier signals.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Review quantity, price, rating, and supplier history in one flow. The marketplace stays lean, but it
                should still feel fast, credible, and easy to scan on any screen size.
              </p>
            </div>
          </div>

          <div className="market-surface space-y-4 px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">At a glance</p>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div>
                <p className="text-3xl font-semibold text-foreground">{listings.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">Live listings ready for inquiry</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-foreground">{category ? 1 : LISTING_CATEGORIES.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">Categories currently visible</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-foreground">{search ? "Focused" : "Open"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search ? "Search term applied to the feed" : "Showing the full public inventory feed"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BuyerBrowseFilters initialCategory={category} initialSearch={search} />
      <BuyerBrowseResults category={category} listings={listings} search={search} />
    </PageContainer>
  );
}
