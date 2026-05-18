import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMOTIONS, type Emotion } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Heart, Search } from "lucide-react";

export type EmotionFilter = Emotion | "all";

export function TimelineFilters({
  years,
  year,
  emotion,
  query,
  favoritesOnly,
  onYearChange,
  onEmotionChange,
  onQueryChange,
  onFavoritesChange,
}: {
  years: number[];
  year: string;
  emotion: EmotionFilter;
  query: string;
  favoritesOnly: boolean;
  onYearChange: (v: string) => void;
  onEmotionChange: (v: EmotionFilter) => void;
  onQueryChange: (v: string) => void;
  onFavoritesChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar memórias..."
          className="pl-8 h-9"
        />
      </div>
      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os anos</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={emotion} onValueChange={(v) => onEmotionChange(v as EmotionFilter)}>
        <SelectTrigger className="w-[170px] h-9">
          <SelectValue placeholder="Emoção" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as emoções</SelectItem>
          {EMOTIONS.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.emoji} {e.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Toggle
        pressed={favoritesOnly}
        onPressedChange={onFavoritesChange}
        aria-label="Apenas favoritos"
        className="h-9"
      >
        <Heart className={`h-4 w-4 mr-1 ${favoritesOnly ? "fill-current" : ""}`} /> Favoritos
      </Toggle>
    </div>
  );
}
