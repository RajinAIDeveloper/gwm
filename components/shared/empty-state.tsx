import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="market-panel border-dashed bg-card/75 px-6 py-12 text-center sm:px-10 sm:py-16">
      <div className="mx-auto max-w-md space-y-3">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">Nothing here yet</p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
      </div>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
