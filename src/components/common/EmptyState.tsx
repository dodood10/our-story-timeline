import { Heart } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="mb-4 text-primary animate-float-heart">
        {icon ?? <Heart className="h-12 w-12" strokeWidth={1.5} />}
      </div>
      <h3 className="font-display text-2xl mb-2">{title}</h3>
      {description && <p className="text-muted-foreground max-w-md mb-6">{description}</p>}
      {action}
    </div>
  );
}
