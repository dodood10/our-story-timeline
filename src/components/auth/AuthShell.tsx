import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-soft">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary">
            <Heart className="h-8 w-8" />
            <span className="font-display text-2xl">Memory Lane</span>
          </Link>
          <h1 className="font-display text-3xl mt-6">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
        </div>
        <div className="bg-card border border-border rounded-3xl p-8 shadow-card">{children}</div>
      </div>
    </div>
  );
}
