import type { ReactNode } from "react";

import { AppHeader } from "@/components/shared/app-header";

type SellerLayoutProps = {
  children: ReactNode;
};

export default function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pb-16 pt-8">{children}</main>
    </div>
  );
}
