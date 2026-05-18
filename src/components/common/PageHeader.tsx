import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ icon: Icon, title, subtitle, action, className }: PageHeaderProps) {
  const content = (
    <>
      <h1 className="font-display text-3xl sm:text-4xl flex items-center gap-2">
        <Icon className="h-7 w-7 text-primary" /> {title}
      </h1>
      {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
    </>
  );

  return (
    <header className={cn(action && "flex flex-wrap items-end justify-between gap-3", className)}>
      {action ? <div>{content}</div> : content}
      {action}
    </header>
  );
}
