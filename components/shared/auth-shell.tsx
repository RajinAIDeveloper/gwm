import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  asideTitle: string;
  asideDescription: string;
  highlights: string[];
};

function AuthShell({
  eyebrow,
  title,
  description,
  children,
  asideTitle,
  asideDescription,
  highlights,
}: AuthShellProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">{eyebrow}</p>
        <div className="mt-5 max-w-lg space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
          <p className="text-base leading-7 text-muted-foreground">{description}</p>
        </div>

        <div className="mt-8">{children}</div>
      </div>

      <Card className="justify-between border border-border/70 bg-muted/30 py-0">
        <CardHeader className="px-6 pt-8 sm:px-8">
          <CardTitle className="text-2xl">{asideTitle}</CardTitle>
          <CardDescription className="max-w-md text-base leading-7">{asideDescription}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8 sm:px-8">
          <ul className="space-y-3">
            {highlights.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export { AuthShell };
