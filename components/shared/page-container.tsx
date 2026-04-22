import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function PageContainer({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[112rem] px-4 sm:px-6 lg:px-10 2xl:px-14", className)}
      {...props}
    />
  );
}

export { PageContainer };
