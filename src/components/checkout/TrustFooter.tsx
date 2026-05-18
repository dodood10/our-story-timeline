import { Lock, Zap, ShieldCheck, Mail } from "lucide-react";

const ITEMS = [
  { icon: Lock, label: "Pagamento seguro" },
  { icon: Zap, label: "Acesso imediato" },
  { icon: ShieldCheck, label: "Garantia de 7 dias" },
  { icon: Mail, label: "Suporte por e-mail" },
] as const;

export function TrustFooter() {
  return (
    <footer className="py-8 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-6 sm:gap-10 text-xs text-muted-foreground">
        {ITEMS.map(({ icon: Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
            {label}
          </span>
        ))}
      </div>
    </footer>
  );
}
