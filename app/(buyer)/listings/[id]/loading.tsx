import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ListingDetailLoading() {
  return (
    <PageContainer className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48 rounded-full" />
        <Skeleton className="h-12 w-full max-w-3xl rounded-[2rem]" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-full" />
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(22rem,1fr)]">
        <div className="space-y-8">
          <Skeleton className="h-[26rem] w-full rounded-[2rem]" />
          <Skeleton className="h-80 w-full rounded-[2rem]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-[2rem]" />
          <Skeleton className="h-80 w-full rounded-[2rem]" />
        </div>
      </div>
    </PageContainer>
  );
}
