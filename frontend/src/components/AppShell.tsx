import type { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";

interface AppShellProps {
  children: ReactNode;
  rootClassName?: string;
  mainClassName?: string;
  contentClassName?: string;
}

export const AppShell = ({
  children,
  rootClassName = "min-h-screen bg-background",
  mainClassName = "ml-64 min-h-screen bg-gradient-subtle",
  contentClassName = "p-8",
}: AppShellProps) => {
  return (
    <div className={rootClassName}>
      <Navigation />
      <main className={mainClassName}>
        <div className={contentClassName}>{children}</div>
      </main>
    </div>
  );
};
