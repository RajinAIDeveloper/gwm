import type { ReactNode } from "react";

type ListingFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function ListingFormSection({ title, description, children }: ListingFormSectionProps) {
  return (
    <section className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
      <div className="max-w-2xl space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export { ListingFormSection };
