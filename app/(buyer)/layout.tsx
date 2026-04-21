import type { ReactNode } from "react";

import { AppHeader } from "@/components/shared/app-header";
import { SiteFooter } from "@/components/shared/site-footer";

type BuyerLayoutProps = {
  children: ReactNode;
};

export default function BuyerLayout({ children }: BuyerLayoutProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(250,250,249,0.9),rgba(255,255,255,1))]">
      <AppHeader />
      <main className="flex-1 pb-16 pt-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
