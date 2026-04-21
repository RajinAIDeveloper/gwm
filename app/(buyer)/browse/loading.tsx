import { PageContainer } from "@/components/shared/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrowseLoading() {
  return (
    <PageContainer className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-14 w-full max-w-2xl rounded-[2rem]" />
        <Skeleton className="h-5 w-full max-w-3xl rounded-full" />
      </div>

      <Skeleton className="h-44 w-full rounded-[2rem]" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[30rem] w-full rounded-[2rem]" />
        <Skeleton className="h-[30rem] w-full rounded-[2rem]" />
        <Skeleton className="h-[30rem] w-full rounded-[2rem]" />
      </div>
    </PageContainer>
  );
}
