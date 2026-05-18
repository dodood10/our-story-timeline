import { EMOTIONS, type Emotion } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EmotionPicker({
  value,
  onChange,
}: {
  value: Emotion | undefined;
  onChange: (e: Emotion) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {EMOTIONS.map((e) => {
        const active = value === e.id;
        return (
          <button
            key={e.id}
            type="button"
            aria-label={e.label}
            aria-pressed={active}
            onClick={() => onChange(e.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all",
              active
                ? "border-primary bg-primary/10 scale-105"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            <span className="text-2xl">{e.emoji}</span>
            <span className="text-[11px] text-muted-foreground">{e.label}</span>
          </button>
        );
      })}
    </div>
  );
}
