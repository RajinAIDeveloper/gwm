import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerLoading() {
  return (
    <PageContainer className="space-y-6">
      <Skeleton className="h-40 w-full rounded-[2rem]" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96 w-full rounded-[2rem]" />
        <Skeleton className="h-96 w-full rounded-[2rem]" />
      </div>
    </PageContainer>
  );
}
