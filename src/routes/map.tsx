import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useApp } from "@/hooks/useApp";
import type { Coords } from "@/lib/types";
import { EmptyState } from "@/components/common/EmptyState";
import { Map as MapIcon } from "lucide-react";
import { formatDatePT } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Mapa — Memory Lane" },
      { name: "description", content: "Os lugares onde construíram memórias." },
    ],
  }),
  component: MapPage,
});

// fix default marker icons (CDN)
const heartIcon = L.divIcon({
  className: "",
  html: `<div style="background:oklch(0.68 0.16 0);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)">♥</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface Pin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  date: string;
  location: string;
}

const COORDS_KEY = "ml.geocodedLocations";

function loadCache(): Record<string, Coords | null> {
  try {
    return JSON.parse(localStorage.getItem(COORDS_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveCache(c: Record<string, Coords | null>) {
  localStorage.setItem(COORDS_KEY, JSON.stringify(c));
}

async function geocode(query: string): Promise<Coords | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { "Accept-Language": "pt-BR" } },
    );
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data[0]) return null;
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {
    return null;
  }
}

function FitBounds({ pins }: { pins: Pin[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    const b = L.latLngBounds(pins.map((p) => [p.lat, p.lng] as Coords));
    map.fitBounds(b, { padding: [40, 40], maxZoom: 12 });
  }, [pins, map]);
  return null;
}

function MapPage() {
  const { memories, updateMemory } = useApp();
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const withLocation = useMemo(
    () => memories.filter((m) => m.location?.trim() || m.coords),
    [memories],
  );

  const locationKey = useMemo(
    () =>
      withLocation.map((m) => `${m.id}:${m.location ?? ""}:${m.coords?.join(",") ?? ""}`).join("|"),
    [withLocation],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const cache = loadCache();
        const next: Pin[] = [];
        for (const m of withLocation) {
          let coords = m.coords;
          if (!coords && m.location) {
            const key = m.location.toLowerCase();
            if (key in cache) {
              coords = cache[key] ?? undefined;
            } else {
              await new Promise((r) => setTimeout(r, 1100));
              const c = await geocode(m.location);
              cache[key] = c;
              saveCache(cache);
              if (c) {
                coords = c;
              } else {
                toast.error(`Não localizei: ${m.location}`);
              }
            }
            if (coords && !m.coords) {
              updateMemory(m.id, { coords });
            }
          }
          if (coords) {
            next.push({
              id: m.id,
              lat: coords[0],
              lng: coords[1],
              title: m.title,
              date: formatDatePT(m.date),
              location: m.location ?? "",
            });
          }
        }
        if (alive) {
          setPins(next);
          setLoading(false);
        }
      } catch {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [locationKey, updateMemory, withLocation]);

  return (
    <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">
      <PageHeader
        icon={MapIcon}
        title="Mapa das memórias"
        subtitle={
          <>
            {pins.length} {pins.length === 1 ? "lugar" : "lugares"} no mapa
            {loading && " · localizando..."}
          </>
        }
        className="mb-6"
        action={
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem(COORDS_KEY);
              toast.success("Cache limpo. Recarregue a página.");
            }}
          >
            Recalcular localizações
          </Button>
        }
      />

      {withLocation.length === 0 ? (
        <EmptyState
          title="Nenhum lugar marcado"
          description="Adicione uma localização nas memórias para vê-las no mapa."
        />
      ) : (
        <div className="rounded-2xl overflow-hidden border border-border shadow-card h-[70vh]">
          {mounted && (
            <MapContainer
              center={[-15.78, -47.92]}
              zoom={3}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {pins.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={heartIcon}>
                  <Popup>
                    <div className="space-y-0.5">
                      <p className="font-display text-base">{p.title}</p>
                      <p className="text-xs opacity-70">{p.date}</p>
                      <p className="text-xs opacity-70">📍 {p.location}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              <FitBounds pins={pins} />
            </MapContainer>
          )}
        </div>
      )}
    </div>
  );
}
