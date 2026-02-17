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
  mainClassName = "min-h-screen bg-gradient-subtle md:ml-64 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0",
  contentClassName = "px-4 py-4 md:p-8",
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
