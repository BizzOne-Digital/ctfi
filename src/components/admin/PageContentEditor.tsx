"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { Input, Textarea, Label, FormRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { LoadingState } from "@/components/ui/States";
import { apiGet, apiSend, ApiError } from "@/lib/admin-client";
import { cn } from "@/lib/utils";

interface SectionItem {
  title?: string;
  description?: string;
  imageMediaId?: string;
  icon?: string;
}

interface Section {
  key: string;
  order: number;
  visible: boolean;
  heading?: string;
  subheading?: string;
  body?: string;
  ctaText?: string;
  ctaLink?: string;
  imageMediaId?: string;
  items: SectionItem[];
}

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Banner",
  intro: "Introduction",
  services_preview: "Services Preview",
  why_choose: "Why Choose Us",
  featured_gallery: "Featured Gallery",
  appointment_cta: "Appointment Call-to-Action",
  social: "Social Media",
  mission: "Mission",
  philosophy: "Photography Philosophy",
  owner: "Meet the Photographer",
  cta: "Call-to-Action",
};

const LIST_SECTIONS = new Set(["why_choose", "featured_gallery"]);
const IMAGE_SECTIONS = new Set(["hero", "intro", "mission", "philosophy", "owner"]);

export function PageContentEditor({ page }: { page: "home" | "about" }) {
  const [sections, setSections] = React.useState<Section[] | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const load = React.useCallback(async () => {
    try {
      const res = await apiGet<{ content: { sections: Section[] } }>(`/api/admin/content/${page}`);
      setSections(res.content.sections);
    } catch {
      toast.error("Unable to load page content.");
    }
  }, [page]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (!sections) return <LoadingState label="Loading content…" />;

  function updateSection(key: string, patch: Partial<Section>) {
    setSections((prev) => prev?.map((s) => (s.key === key ? { ...s, ...patch } : s)) ?? null);
  }

  async function save() {
    if (!sections) return;
    setSaving(true);
    try {
      await apiSend(`/api/admin/content/${page}`, "PUT", { sections });
      toast.success("Page content saved.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save content.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      {[...sections]
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const isOpen = expanded[section.key] ?? true;
          return (
            <div key={section.key} className="rounded-xl border border-border bg-surface">
              <div className="flex items-center justify-between px-5 py-4">
                <button
                  className="flex items-center gap-2 text-left"
                  onClick={() => setExpanded((prev) => ({ ...prev, [section.key]: !isOpen }))}
                >
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="font-heading text-base font-semibold text-foreground">
                    {SECTION_LABELS[section.key] ?? section.key}
                  </span>
                </button>
                <button
                  onClick={() => updateSection(section.key, { visible: !section.visible })}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                    section.visible ? "bg-primary/10 text-primary" : "bg-secondary text-muted"
                  )}
                >
                  {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {section.visible ? "Visible" : "Hidden"}
                </button>
              </div>

              {isOpen && (
                <div className="border-t border-border p-5">
                  <FormRow>
                    <Label>Heading</Label>
                    <Input
                      value={section.heading ?? ""}
                      onChange={(e) => updateSection(section.key, { heading: e.target.value })}
                    />
                  </FormRow>
                  <FormRow>
                    <Label>Subheading</Label>
                    <Textarea
                      rows={2}
                      value={section.subheading ?? ""}
                      onChange={(e) => updateSection(section.key, { subheading: e.target.value })}
                    />
                  </FormRow>
                  <FormRow>
                    <Label>Body Text</Label>
                    <Textarea
                      rows={4}
                      value={section.body ?? ""}
                      onChange={(e) => updateSection(section.key, { body: e.target.value })}
                    />
                  </FormRow>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormRow>
                      <Label>Button Text</Label>
                      <Input
                        value={section.ctaText ?? ""}
                        onChange={(e) => updateSection(section.key, { ctaText: e.target.value })}
                      />
                    </FormRow>
                    <FormRow>
                      <Label>Button Link</Label>
                      <Input
                        value={section.ctaLink ?? ""}
                        onChange={(e) => updateSection(section.key, { ctaLink: e.target.value })}
                      />
                    </FormRow>
                  </div>

                  {IMAGE_SECTIONS.has(section.key) && (
                    <FormRow>
                      <ImagePicker
                        label="Image"
                        folder={section.key === "hero" ? "hero" : "general"}
                        value={section.imageMediaId}
                        onChange={(id) => updateSection(section.key, { imageMediaId: id })}
                      />
                    </FormRow>
                  )}

                  {LIST_SECTIONS.has(section.key) && (
                    <ItemsEditor
                      items={section.items}
                      withImages={section.key === "featured_gallery"}
                      onChange={(items) => updateSection(section.key, { items })}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}

      <Button onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save Page Content"}
      </Button>
    </div>
  );
}

function ItemsEditor({
  items,
  withImages,
  onChange,
}: {
  items: SectionItem[];
  withImages: boolean;
  onChange: (items: SectionItem[]) => void;
}) {
  function update(i: number, patch: Partial<SectionItem>) {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }

  return (
    <div>
      <Label>{withImages ? "Photos" : "Items"}</Label>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 rounded-lg border border-border p-3">
            {withImages && (
              <ImagePicker
                label=""
                folder="hero"
                value={item.imageMediaId}
                onChange={(id) => update(i, { imageMediaId: id })}
              />
            )}
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Title"
                value={item.title ?? ""}
                onChange={(e) => update(i, { title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                rows={2}
                value={item.description ?? ""}
                onChange={(e) => update(i, { description: e.target.value })}
              />
            </div>
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="h-fit rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => onChange([...items, { title: "", description: "" }])}
      >
        <Plus className="h-4 w-4" /> Add {withImages ? "Photo" : "Item"}
      </Button>
    </div>
  );
}
