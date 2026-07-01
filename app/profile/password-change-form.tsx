"use client";

import { useState } from "react";
import { Eye, EyeOff, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { updateProfile } from "@root/actions/profile";

function PasswordInput({ value, onChange, placeholder, show, toggleShow, onEnter }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  show: boolean; toggleShow: () => void; onEnter?: () => void;
}) {
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} className="h-9 pr-9 text-sm"
        onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }} />
      <button type="button" onClick={toggleShow}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors">
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function PasswordChangeCard() {
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) { toast.error("Введіть поточний пароль"); return; }
    if (newPassword.length < 6) { toast.error("Новий пароль має бути не менше 6 символів"); return; }
    if (newPassword !== confirmPassword) { toast.error("Паролі не співпадають"); return; }
    setSaving(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      toast.success("Пароль змінено");
      setShowForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не вдалося змінити пароль");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Пароль</CardTitle>
        <CardDescription>{showForm ? "Введіть новий пароль" : "Оновіть пароль для входу"}</CardDescription>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput value={currentPassword} onChange={setCurrentPassword} placeholder="Поточний пароль" show={showCurrent} toggleShow={() => setShowCurrent(!showCurrent)} />
            <PasswordInput value={newPassword} onChange={setNewPassword} placeholder="Новий пароль" show={showNew} toggleShow={() => setShowNew(!showNew)} />
            <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Підтвердіть новий пароль" show={showConfirm} toggleShow={() => setShowConfirm(!showConfirm)} onEnter={() => { const f = document.querySelector("form"); if (f) f.requestSubmit(); }} />
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={saving}>{saving ? "Збереження..." : "Зберегти пароль"}</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setShowForm(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }} disabled={saving}>Скасувати</Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" className="w-full gap-2" onClick={() => setShowForm(true)}>
            <Key className="size-4" />Змінити пароль
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
