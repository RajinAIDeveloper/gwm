import type { ReactNode } from "react";

import { AppHeader } from "@/components/shared/app-header";
import { SiteFooter } from "@/components/shared/site-footer";

type BuyerLayoutProps = {
  children: ReactNode;
};

export default function BuyerLayout({ children }: BuyerLayoutProps) {
  return (
    <div className="market-shell">
      <AppHeader />
      <main className="relative z-10 flex-1 pb-20 pt-6 sm:pt-8 lg:pt-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
