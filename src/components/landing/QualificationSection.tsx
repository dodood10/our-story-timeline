import { Check, X } from "lucide-react";
import { qualification } from "@/lib/landing-content";

export function QualificationSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-3xl sm:text-4xl text-center">{qualification.title}</h2>
        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div>
            <p className="font-medium mb-4">Esse método é pra você se:</p>
            <ul className="space-y-3">
              {qualification.forYou.map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium mb-4">NÃO compre se:</p>
            <ul className="space-y-3">
              {qualification.notForYou.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
