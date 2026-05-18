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
          Você precisa de um plano do <strong className="text-foreground">{BRAND_NAME}</strong> para
          usar o gerador.
        </p>
        <Button asChild className="w-full mt-6">
          <Link to="/surprise" search={{ plan: "premium" }}>
            Ver planos
          </Link>
        </Button>
      </div>
    </SurpriseShell>
  );
}
