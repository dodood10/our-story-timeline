import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { NAV_ITEMS } from "./AppSidebar";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const MOBILE_PRIMARY = ["/app", "/timeline", "/bucket-list", "/gallery", "/letters"] as const;

const MORE_ITEMS = NAV_ITEMS.filter(
  (i) => !MOBILE_PRIMARY.includes(i.to as (typeof MOBILE_PRIMARY)[number]),
);

export function BottomBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryItems = NAV_ITEMS.filter((i) =>
    MOBILE_PRIMARY.includes(i.to as (typeof MOBILE_PRIMARY)[number]),
  );
  const moreActive = MORE_ITEMS.some((i) => pathname === i.to);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur border-t border-border">
      <div className="flex items-stretch justify-around px-1 py-1 safe-bottom">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-lg text-[10px] transition-colors min-w-0 flex-1",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "fill-primary/20")} strokeWidth={1.8} />
              <span className="truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Mais páginas"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-lg text-[10px] transition-colors min-w-0 flex-1",
                moreActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <MoreHorizontal className="h-5 w-5" strokeWidth={1.8} />
              <span>Mais</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8">
            <SheetHeader>
              <SheetTitle>Mais</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm",
                      active && "border-primary bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
