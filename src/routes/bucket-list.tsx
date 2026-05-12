import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/hooks/useApp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BUCKET_CATEGORIES, type BucketCategory } from "@/lib/types";
import { BucketItemCard, BucketAddInline } from "@/components/bucket/BucketItemCard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { Target } from "lucide-react";
import { celebrate, hearts } from "@/lib/confetti";

export const Route = createFileRoute("/bucket-list")({
  head: () => ({
    meta: [
      { title: "Bucket List — Memory Lane" },
      { name: "description", content: "Sonhos e experiências que vocês querem viver juntos." },
    ],
  }),
  component: BucketListPage,
});

function BucketListPage() {
  const { bucket, addBucket, toggleBucket, deleteBucket } = useApp();
  const [tab, setTab] = useState<BucketCategory>("travel");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const total = bucket.length;
  const done = bucket.filter((b) => b.done).length;

  function onToggle(id: string) {
    const item = bucket.find((b) => b.id === id);
    toggleBucket(id);
    if (item && !item.done) {
      celebrate();
      hearts();
    }
  }

  return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl flex items-center gap-2">
          <Target className="h-7 w-7 text-primary" /> Bucket List
        </h1>
        <p className="text-muted-foreground mt-1">
          {done} de {total} sonhos realizados ✨
        </p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as BucketCategory)}>
        <TabsList className="grid grid-cols-4 w-full mb-4">
          {BUCKET_CATEGORIES.map((c) => (
            <TabsTrigger key={c.id} value={c.id} className="text-xs sm:text-sm">
              <span className="mr-1">{c.emoji}</span>
              <span className="hidden sm:inline">{c.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {BUCKET_CATEGORIES.map((c) => {
          const items = bucket.filter((b) => b.category === c.id);
          return (
            <TabsContent key={c.id} value={c.id} className="space-y-4">
              <BucketAddInline onAdd={(title) => addBucket({ title, category: c.id })} />
              {items.length === 0 ? (
                <EmptyState
                  title={`Nenhum sonho em ${c.label}`}
                  description="Adicione algo que vocês querem viver juntos."
                />
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <BucketItemCard
                      key={item.id}
                      item={item}
                      onToggle={() => onToggle(item.id)}
                      onDelete={() => setConfirmId(item.id)}
                      onPhoto={(p) => toggleBucket(item.id) /* noop */ || addPhotoTo(item.id, p)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(v) => !v && setConfirmId(null)}
        title="Remover esse sonho?"
        confirmLabel="Remover"
        destructive
        onConfirm={() => { if (confirmId) deleteBucket(confirmId); setConfirmId(null); }}
      />
    </div>
  );

  function addPhotoTo(id: string, photo: string) {
    // mark photo on already-done item without toggling done off
    const item = bucket.find((b) => b.id === id);
    if (!item) return;
    // toggle off + on hack would lose done state; instead update via a different path:
    // We just set done=true and pass photo — toggleBucket flips state, so call twice if needed.
    if (item.done) {
      // turn off, then on with photo (results in done=true with new photo)
      toggleBucket(id); // now done=false
      toggleBucket(id, photo); // now done=true with photo
    } else {
      toggleBucket(id, photo);
    }
  }
}
