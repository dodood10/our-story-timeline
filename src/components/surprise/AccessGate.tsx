import { Loader2, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/brand";
import { SurpriseShell } from "./SurpriseShell";

export function AccessGateLoading() {
  return (
    <SurpriseShell footer={false} mainClassName="flex items-center justify-center px-4 py-16">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </SurpriseShell>
  );
}

export function AccessGateDenied() {
  return (
    <SurpriseShell
      footer={false}
      showHeaderCta
      mainClassName="flex items-center justify-center px-4 py-16"
    >
      <div className="max-w-md w-full text-center bg-card border border-border rounded-3xl p-8 shadow-card">
        <Lock className="h-10 w-10 text-primary mx-auto" />
        <h1 className="font-display text-2xl mt-4">Acesso restrito</h1>
        <p className="text-muted-foreground mt-2">
          Você precisa de acesso ao <strong className="text-foreground">{BRAND_NAME}</strong> para
          usar o gerador.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link to="/surprise" search={{ plan: "premium" }}>
              Ver planos
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/auth/recover-access">Já comprei — recuperar acesso</Link>
          </Button>
        </div>
      </div>
    </SurpriseShell>
  );
}

export function AccessGateSurpriseBlocked() {
  return (
    <SurpriseShell
      footer={false}
      showHeaderCta
      mainClassName="flex items-center justify-center px-4 py-16"
    >
      <div className="max-w-md w-full text-center bg-card border border-border rounded-3xl p-8 shadow-card">
        <Lock className="h-10 w-10 text-primary mx-auto" />
        <h1 className="font-display text-2xl mt-4">Surpresa não incluída</h1>
        <p className="text-muted-foreground mt-2">
          O gerador do <strong className="text-foreground">{BRAND_NAME}</strong> não está incluído
          no que você comprou.
        </p>
        <Button asChild className="w-full mt-6">
          <Link to="/surprise" search={{ plan: "premium" }}>
            Ver planos da surpresa
          </Link>
        </Button>
      </div>
    </SurpriseShell>
  );
}
