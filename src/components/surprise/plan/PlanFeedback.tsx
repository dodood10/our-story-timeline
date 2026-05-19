import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

export function PlanFeedback() {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  function vote(v: "up" | "down") {
    if (voted) return;
    setVoted(v);
    toast.success(v === "up" ? "Que bom! Obrigado." : "Obrigado pelo feedback.");
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-3 text-sm text-muted-foreground">
      <span>Esse plano te ajudou?</span>
      <button
        onClick={() => vote("up")}
        disabled={!!voted}
        className={`p-2 rounded-full hover:bg-muted transition ${voted === "up" ? "text-primary" : ""}`}
        aria-label="Sim"
      >
        <ThumbsUp className="h-4 w-4" />
      </button>
      <button
        onClick={() => vote("down")}
        disabled={!!voted}
        className={`p-2 rounded-full hover:bg-muted transition ${voted === "down" ? "text-destructive" : ""}`}
        aria-label="Não"
      >
        <ThumbsDown className="h-4 w-4" />
      </button>
    </div>
  );
}
