"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="glass-card rounded-2xl border-dashed py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-7 w-7 text-primary/60" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-[12px] text-muted-foreground/70">{description}</p>
        </div>
        {action && (
          <Button
            onClick={action.onClick}
            variant="outline"
            size="sm"
            className="mt-2 touch-manipulation"
          >
            {action.label}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
