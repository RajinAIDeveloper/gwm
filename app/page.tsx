import { AppHeader } from "@/components/shared/app-header";
import MarketingLandingPage from "@/app/(marketing)/landing-page";
import { SiteFooter } from "@/components/shared/site-footer";

export default function Home() {
  return (
    <div className="market-shell">
      <AppHeader />
      <main className="relative z-10 flex-1">
        <MarketingLandingPage />
      </main>
      <SiteFooter />
    </div>
  );
}
