import type { ReactNode } from "react";

import { AppHeader } from "@/components/shared/app-header";
import { PageContainer } from "@/components/shared/page-container";
import { SiteFooter } from "@/components/shared/site-footer";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(245,245,244,0.55),rgba(255,255,255,1))]">
      <AppHeader />
      <main className="flex-1 py-10 sm:py-14">
        <PageContainer>{children}</PageContainer>
      </main>
      <SiteFooter />
    </div>
  );
}
