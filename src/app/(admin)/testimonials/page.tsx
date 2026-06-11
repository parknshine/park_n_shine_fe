"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Star, Check, Minus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTranslation } from "@/i18n";
import { useAdminTestimonials } from "@/features/admin/hooks";
import type {
  AdminTestimonial,
  CreateTestimonialPayload,
} from "@/features/admin/types";

function StarDisplay({ rating }: Readonly<{ rating: number }>) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
        />
      ))}
    </span>
  );
}

function AddManualModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: Readonly<{
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTestimonialPayload) => Promise<void>;
  isSubmitting: boolean;
}>) {
  const { t } = useTranslation("admin");
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState(0);
  const [title, setTitle] = useState("");

  const reset = () => {
    setAuthorName(""); setRating(5); setBody(""); setTitle(""); setFeatured(false); setOrder(0);
  };

  const handleSubmit = async () => {
    if (!authorName.trim()) { toast.error(t("testimonialsPage.toast.addFailed")); return; }
    if (!body.trim()) { toast.error(t("testimonialsPage.toast.addFailed")); return; }
    if (rating < 1 || rating > 5) { toast.error(t("testimonialsPage.toast.addFailed")); return; }
    try {
      await onSubmit({ authorName: authorName.trim(), rating, body: body.trim(), title: title.trim() || undefined, featured, order });
      toast.success(t("testimonialsPage.toast.addSuccess"));
      reset();
      onClose();
    } catch {
      toast.error(t("testimonialsPage.toast.addFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("testimonialsPage.add.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t("testimonialsPage.add.authorLabel")}</Label>
            <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Park & Shine User" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("testimonialsPage.add.ratingLabel")}</Label>
            <Input type="text" inputMode="numeric" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("testimonialsPage.add.bodyLabel")}</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("testimonialsPage.add.titleLabel")}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder={t("testimonialsPage.add.titlePlaceholder")}
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="add-featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            <Label htmlFor="add-featured">{t("testimonialsPage.add.featuredLabel")}</Label>
          </div>
          <div className="space-y-1.5">
            <Label>{t("testimonialsPage.add.orderLabel")}</Label>
            <Input type="text" inputMode="numeric" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>{t("testimonialsPage.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("testimonialsPage.add.submitting") : t("testimonialsPage.add.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditModal({
  testimonial,
  onClose,
  onSubmit,
  isSubmitting,
}: Readonly<{
  testimonial: AdminTestimonial | null;
  onClose: () => void;
  onSubmit: (id: string, payload: { authorName?: string; rating?: number; body?: string; title?: string | null; featured?: boolean; order?: number }) => Promise<void>;
  isSubmitting: boolean;
}>) {
  const { t } = useTranslation("admin");
  const [authorName, setAuthorName] = useState(testimonial?.authorName ?? "");
  const [rating, setRating] = useState(testimonial?.rating ?? 5);
  const [body, setBody] = useState(testimonial?.body ?? "");
  const [featured, setFeatured] = useState(testimonial?.featured ?? false);
  const [order, setOrder] = useState(testimonial?.order ?? 0);
  const [title, setTitle] = useState(testimonial?.title ?? "");

  if (!testimonial) return null;

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) { toast.error(t("testimonialsPage.toast.updateFailed")); return; }
    try {
      await onSubmit(testimonial.id, {
        authorName: authorName.trim(),
        rating,
        body: body.trim(),
        title: title.trim() || null,
        featured,
        order,
      });
      toast.success(t("testimonialsPage.toast.updateSuccess"));
      onClose();
    } catch {
      toast.error(t("testimonialsPage.toast.updateFailed"));
    }
  };

  return (
    <Dialog open={!!testimonial} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("testimonialsPage.edit.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>{t("testimonialsPage.add.authorLabel")}</Label>
            <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("testimonialsPage.add.ratingLabel")}</Label>
            <Input type="text" inputMode="numeric" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("testimonialsPage.add.bodyLabel")}</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("testimonialsPage.add.titleLabel")}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder={t("testimonialsPage.add.titlePlaceholder")}
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="edit-featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            <Label htmlFor="edit-featured">{t("testimonialsPage.add.featuredLabel")}</Label>
          </div>
          <div className="space-y-1.5">
            <Label>{t("testimonialsPage.add.orderLabel")}</Label>
            <Input type="text" inputMode="numeric" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("testimonialsPage.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("testimonialsPage.edit.submitting") : t("testimonialsPage.edit.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TestimonialRowActions({
  item,
  onEdit,
  onDelete,
}: Readonly<{
  item: AdminTestimonial;
  onEdit: (item: AdminTestimonial) => void;
  onDelete: (id: string) => void;
}>) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(item)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(item.id)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export default function TestimonialsPage() {
  const { t } = useTranslation("admin");
  const {
    testimonials,
    isLoading,
    create,
    isCreating,
    update,
    isUpdating,
    remove,
  } = useAdminTestimonials();

  const [filter, setFilter] = useState<"all" | "featured">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminTestimonial | null>(null);

  const displayed =
    filter === "featured" ? testimonials.filter((item) => item.featured) : testimonials;

  const handleCreate = async (payload: CreateTestimonialPayload) => {
    await create(payload);
  };

  const handleUpdate = async (
    id: string,
    payload: { authorName?: string; rating?: number; body?: string; title?: string | null; featured?: boolean; order?: number },
  ) => {
    await update({ id, payload });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("testimonialsPage.confirm.delete"))) return;
    try {
      await remove(id);
      toast.success(t("testimonialsPage.toast.deleteSuccess"));
    } catch {
      toast.error(t("testimonialsPage.toast.deleteFailed"));
    }
  };

  const handleToggleFeatured = (item: AdminTestimonial) => {
    update({ id: item.id, payload: { featured: !item.featured } });
  };

  const columns: ColumnDef<AdminTestimonial>[] = [
    {
      accessorKey: "authorName",
      header: t("testimonialsPage.table.author"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.authorName}</span>
      ),
    },
    {
      accessorKey: "rating",
      header: t("testimonialsPage.table.rating"),
      cell: ({ row }) => <StarDisplay rating={row.original.rating} />,
    },
    {
      accessorKey: "body",
      header: t("testimonialsPage.table.body"),
      cell: ({ row }) => (
        <p className="line-clamp-2 max-w-xs text-muted-foreground">{row.original.body}</p>
      ),
    },
    {
      id: "source",
      header: t("testimonialsPage.table.source"),
      cell: ({ row }) => (
        <Badge variant={row.original.bookingId ? "default" : "secondary"}>
          {row.original.bookingId
            ? t("testimonialsPage.source.booking")
            : t("testimonialsPage.source.manual")}
        </Badge>
      ),
    },
    {
      accessorKey: "featured",
      header: t("testimonialsPage.table.featured"),
      cell: ({ row }) => (
        <Button
          variant={row.original.featured ? "default" : "outline"}
          size="sm"
          onClick={() => handleToggleFeatured(row.original)}
          disabled={isUpdating}
        >
          {row.original.featured ? <Check className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
        </Button>
      ),
    },
    {
      accessorKey: "order",
      header: t("testimonialsPage.table.order"),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.order}</span>
      ),
    },
    {
      id: "actions",
      header: t("testimonialsPage.table.actions"),
      cell: ({ row }) => (
        <TestimonialRowActions
          item={row.original}
          onEdit={setEditTarget}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("testimonialsPage.title")}</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("testimonialsPage.addManual")}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          {t("testimonialsPage.filterAll")}
        </Button>
        <Button
          variant={filter === "featured" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("featured")}
        >
          {t("testimonialsPage.filterFeatured")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={displayed}
        isLoading={isLoading}
        emptyMessage={t("testimonialsPage.empty")}
        searchPlaceholder={t("testimonialsPage.search")}
      />

      <AddManualModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />

      <EditModal
        key={editTarget?.id ?? "none"}
        testimonial={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
        isSubmitting={isUpdating}
      />
    </div>
  );
}
