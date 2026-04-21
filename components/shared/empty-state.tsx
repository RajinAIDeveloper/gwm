import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
      <div className="mx-auto max-w-md space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
