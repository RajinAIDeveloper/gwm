import type { ReactNode } from "react";

import { AppHeader } from "@/components/shared/app-header";
import { SiteFooter } from "@/components/shared/site-footer";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(245,245,244,0.7),rgba(255,255,255,1))]">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
