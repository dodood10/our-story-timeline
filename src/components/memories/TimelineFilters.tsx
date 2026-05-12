import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMOTIONS, type Emotion } from "@/lib/types";

export function TimelineFilters({
  years,
  year,
  emotion,
  onYearChange,
  onEmotionChange,
}: {
  years: number[];
  year: string;
  emotion: string;
  onYearChange: (v: string) => void;
  onEmotionChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Ano" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os anos</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={emotion} onValueChange={onEmotionChange}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Emoção" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as emoções</SelectItem>
          {EMOTIONS.map((e: { id: Emotion; emoji: string; label: string }) => (
            <SelectItem key={e.id} value={e.id}>{e.emoji} {e.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
