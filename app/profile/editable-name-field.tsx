"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateProfile } from "@root/actions/profile";

interface Props {
  name: string | null;
}

export function EditableNameField({ name: initialName }: Props) {
  const { update: updateSession } = useSession();
  const [name, setName] = useState(initialName ?? "");
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!dirty) { setEditing(false); return; }
    setSaving(true);
    try {
      await updateProfile({ name });
      await updateSession({ name });
      toast.success("Ім'я оновлено");
      setEditing(false);
      setDirty(false);
    } catch {
      toast.error("Не вдалося оновити ім'я");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setName(initialName ?? "");
    setEditing(false);
    setDirty(false);
  }

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ім&apos;я</label>
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); setDirty(e.target.value !== (initialName ?? "")); }}
            className="h-9 text-sm"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
          />
          <Button variant="ghost" size="icon" className="size-8 shrink-0 text-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10" onClick={handleSave} disabled={saving}>
            <Check className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={handleCancel} disabled={saving}>
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 group">
          <div className="flex items-center gap-2 text-sm">
            <User className="size-4 text-muted-foreground/60" />
            <span>{initialName ?? "—"}</span>
          </div>
          <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
