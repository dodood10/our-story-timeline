import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AppProvider, useApp } from "@/hooks/useApp";
import { useAccess } from "@/hooks/useAccess";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomBar } from "@/components/layout/BottomBar";
import { OnboardingDialog } from "@/components/layout/OnboardingDialog";
import { CommandPalette, useCmdK } from "@/components/common/CommandPalette";
import { MemoryFormDialog } from "@/components/memories/MemoryFormDialog";
import { Toaster } from "@/components/ui/sonner";
import { Heart, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Tentar de novo
          </button>
          <a href="/" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Memory Lane — História do casal" },
      {
        name: "description",
        content:
          "Guarde memórias, cartas e momentos especiais. Surpresa romântica com plano personalizado por IA.",
      },
      { property: "og:title", content: "Método Surpresa Perfeita™ — Dia dos Namorados 2026" },
      {
        property: "og:description",
        content:
          "Monte uma surpresa inesquecível em casa, mesmo sem criatividade e gastando pouco.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Método Surpresa Perfeita™ — Dia dos Namorados 2026",
      },
      {
        name: "twitter:description",
        content:
          "Monte uma surpresa inesquecível em casa, mesmo sem criatividade e gastando pouco.",
      },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7794435d-7f69-4a31-a1cf-faa1159dc1c1/id-preview-54b887b2--0245b738-ed74-4eb8-a4d4-f0b4532ba2bf.lovable.app-1779072730436.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7794435d-7f69-4a31-a1cf-faa1159dc1c1/id-preview-54b887b2--0245b738-ed74-4eb8-a4d4-f0b4532ba2bf.lovable.app-1779072730436.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/icon-192.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="theme-romantic">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','965322166283607');fbq('track','PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=965322166283607&ev=PageView&noscript=1"
          />
        </noscript>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('ml.settings');if(s){var t=JSON.parse(s).theme||'romantic';document.documentElement.classList.remove('theme-romantic','theme-minimal','theme-modern');document.documentElement.classList.add('theme-'+t);}}catch(e){}if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js?v=2').then(function(reg){reg.update();function onWaiting(w){w&&w.postMessage({type:'SKIP_WAITING'});}onWaiting(reg.waiting);reg.addEventListener('updatefound',function(){onWaiting(reg.installing);});var reloaded=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(reloaded)return;reloaded=true;location.reload();});}).catch(function(){});});}})();`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <LayoutSwitch />
        <Toaster position="top-center" />
      </AppProvider>
    </QueryClientProvider>
  );
}

/** Routes that render a bare layout (no sidebar, no paywall). */
const MARKETING_PREFIXES = ["/", "/surprise", "/dev-unlock", "/termos", "/privacidade"];

function LayoutSwitch() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isMarketing = MARKETING_PREFIXES.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p),
  );

  if (isMarketing) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }
  return <AppShell />;
}

function AppShell() {
  const { hydrated, onboarded } = useApp();
  const { full } = useAccess();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [newMemoryOpen, setNewMemoryOpen] = useState(false);
  useCmdK(setPaletteOpen);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Heart className="h-10 w-10 text-primary animate-float-heart" />
      </div>
    );
  }

  if (!full) {
    return <FullAppPaywall />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <BottomBar />
      {!onboarded && <OnboardingDialog open />}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onNewMemory={() => setNewMemoryOpen(true)}
      />
      <MemoryFormDialog open={newMemoryOpen} onOpenChange={setNewMemoryOpen} />
    </div>
  );
}

function FullAppPaywall() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-soft">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-card text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-display text-3xl">Memory Lane completo</h1>
        <p className="text-muted-foreground mt-2">
          Linha do tempo, galeria, cartas seladas, mapa e muito mais — o app inteiro para guardar a
          história de vocês.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Em breve disponível como plano. Por enquanto, comece pela surpresa do Dia dos Namorados.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link to="/surprise">Criar minha surpresa romântica</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
