import { Link, useRouterState } from "@tanstack/react-router";
import { NAV_ITEMS } from "./AppSidebar";
import { cn } from "@/lib/utils";

const MOBILE_ITEMS = NAV_ITEMS.filter((i) =>
  ["/", "/timeline", "/bucket-list", "/gallery", "/letters"].includes(i.to),
);

export function BottomBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur border-t border-border">
      <div className="flex items-stretch justify-around px-2 py-1 safe-bottom">
        {MOBILE_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-lg text-[10px] transition-colors min-w-0",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "fill-primary/20")} strokeWidth={1.8} />
              <span className="truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
