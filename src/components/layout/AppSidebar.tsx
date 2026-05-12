import { Link, useRouterState } from "@tanstack/react-router";
import {
  Heart,
  Clock,
  Target,
  Image as ImageIcon,
  Mail,
  BarChart3,
  Trophy,
  Gift,
  Settings as SettingsIcon,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  emoji: string;
}

import { Map as MapIcon } from "lucide-react";

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Início", icon: Home, emoji: "🏠" },
  { to: "/timeline", label: "Linha do Tempo", icon: Clock, emoji: "⏱️" },
  { to: "/bucket-list", label: "Bucket List", icon: Target, emoji: "🎯" },
  { to: "/gallery", label: "Galeria", icon: ImageIcon, emoji: "📸" },
  { to: "/map", label: "Mapa", icon: MapIcon, emoji: "🗺️" },
  { to: "/letters", label: "Cartas", icon: Mail, emoji: "💌" },
  { to: "/stats", label: "Estatísticas", icon: BarChart3, emoji: "📊" },
  { to: "/milestones", label: "Conquistas", icon: Trophy, emoji: "🏆" },
  { to: "/gift-ideas", label: "Ideias de Presente", icon: Gift, emoji: "🎁" },
  { to: "/settings", label: "Configurações", icon: SettingsIcon, emoji: "⚙️" },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-border bg-sidebar">
      <div className="px-6 py-6 flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary fill-primary/20" strokeWidth={1.8} />
        <div>
          <p className="font-display text-xl leading-tight">Memory Lane</p>
          <p className="text-xs text-muted-foreground">Sua história, lado a lado</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground/75 hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 text-xs text-muted-foreground border-t border-border">
        Feito com <Heart className="inline h-3 w-3 text-primary fill-primary" /> para vocês
      </div>
    </aside>
  );
}
