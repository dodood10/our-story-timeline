import { Loader2, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function AccessGateLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
    </div>
  );
}

export function AccessGateDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-card border border-border rounded-3xl p-8 shadow-card">
        <Lock className="h-10 w-10 text-primary mx-auto" />
        <h1 className="font-display text-2xl mt-4">Acesso restrito</h1>
        <p className="text-muted-foreground mt-2">Você precisa de um plano para usar o gerador.</p>
        <Button asChild className="w-full mt-6">
          <Link to="/surprise">Ver planos</Link>
        </Button>
      </div>
    </div>
  );
}
