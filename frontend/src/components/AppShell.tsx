import type { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  rootClassName?: string;
  mainClassName?: string;
  contentClassName?: string;
}

export const AppShell = ({
  children,
  rootClassName,
  mainClassName,
  contentClassName,
}: AppShellProps) => {
  const baseRootClassName = "min-h-screen bg-background overflow-x-hidden";
  const baseMainClassName =
    "min-h-screen bg-gradient-subtle md:ml-64 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 overflow-x-hidden";
  const baseContentClassName = "w-full max-w-full px-4 py-4 md:p-8";

  return (
    <div className={cn(baseRootClassName, rootClassName)}>
      <Navigation />
      <main className={cn(baseMainClassName, mainClassName)}>
        <div className={cn(baseContentClassName, contentClassName)}>{children}</div>
      </main>
    </div>
  );
};
