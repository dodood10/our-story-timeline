import { Link } from "@tanstack/react-router";
import { footer } from "@/lib/landing-content";

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {footer.brand} · {footer.tagline}
        </p>
        <div className="flex gap-4">
          <Link to="/termos" className="hover:text-foreground transition">
            Termos de Uso
          </Link>
          <Link to="/privacidade" className="hover:text-foreground transition">
            Política de Privacidade
          </Link>
          {import.meta.env.DEV && (
            <Link to="/dev-unlock" className="hover:text-foreground transition">
              Acesso de teste
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
