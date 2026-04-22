import type { ReactNode } from "react";

type ListingFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function ListingFormSection({ title, description, children }: ListingFormSectionProps) {
  return (
    <section className="market-panel px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">Marketplace section</p>
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h2>
        {description ? <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p> : null}
      </div>
      <div className="mt-6 lg:mt-7">{children}</div>
    </section>
  );
}

export { ListingFormSection };
