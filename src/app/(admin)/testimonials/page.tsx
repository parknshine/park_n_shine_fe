"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, Pencil, Trash2, Star, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

      {(() => {
        if (isLoading) {
          return <p className="text-sm text-muted-foreground">{t("testimonialsPage.loading")}</p>;
        }
        if (displayed.length === 0) {
          return <p className="text-sm text-muted-foreground">{t("testimonialsPage.empty")}</p>;
        }
        return (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">{t("testimonialsPage.table.author")}</th>
                  <th className="px-4 py-2 text-left font-medium">{t("testimonialsPage.table.rating")}</th>
                  <th className="px-4 py-2 text-left font-medium">{t("testimonialsPage.table.body")}</th>
                  <th className="px-4 py-2 text-left font-medium">{t("testimonialsPage.table.source")}</th>
                  <th className="px-4 py-2 text-left font-medium">{t("testimonialsPage.table.featured")}</th>
                  <th className="px-4 py-2 text-left font-medium">{t("testimonialsPage.table.order")}</th>
                  <th className="px-4 py-2 text-right font-medium">{t("testimonialsPage.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{item.authorName}</td>
                    <td className="px-4 py-3"><StarDisplay rating={item.rating} /></td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="line-clamp-2 text-muted-foreground">{item.body}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.bookingId ? "default" : "secondary"}>
                        {item.bookingId
                          ? t("testimonialsPage.source.booking")
                          : t("testimonialsPage.source.manual")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant={item.featured ? "default" : "outline"}
                        size="sm"
                        onClick={() => update({ id: item.id, payload: { featured: !item.featured } })}
                        disabled={isUpdating}
                      >
                        {item.featured ? <Check className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                      </Button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.order}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditTarget(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}

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
