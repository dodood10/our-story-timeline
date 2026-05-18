import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useApp } from "@/hooks/useApp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BUCKET_CATEGORIES, type BucketCategory } from "@/lib/types";
import { BucketItemCard, BucketAddInline } from "@/components/bucket/BucketItemCard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { Target } from "lucide-react";
import { celebrate, hearts } from "@/lib/confetti";
import { PageHeader } from "@/components/common/PageHeader";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";

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
  const { openConfirm, dialogProps: deleteDialogProps } = useConfirmDelete(deleteBucket);

  const total = bucket.length;
  const done = bucket.filter((b) => b.done).length;

  const handleToggle = useCallback((id: string) => {
    const item = bucket.find((b) => b.id === id);
    toggleBucket(id);
    if (item && !item.done) { celebrate(); hearts(); }
  }, [bucket, toggleBucket]);

  const handleDelete = useCallback((id: string) => openConfirm(id), [openConfirm]);

  const handlePhoto = useCallback((id: string, photo: string) => {
    const item = bucket.find((b) => b.id === id);
    if (!item) return;
    if (item.done) {
      toggleBucket(id);
      toggleBucket(id, photo);
    } else {
      toggleBucket(id, photo);
    }
  }, [bucket, toggleBucket]);

  return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
      <PageHeader
        icon={Target}
        title="Bucket List"
        subtitle={<>{done} de {total} sonhos realizados ✨</>}
        className="mb-6"
      />

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
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onPhoto={handlePhoto}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <ConfirmDialog
        {...deleteDialogProps}
        title="Remover esse sonho?"
        confirmLabel="Remover"
        destructive
      />
    </div>
  );

}
