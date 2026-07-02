"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createUser, updateUser } from "@root/actions/users";
import { ROLES, RoleBadge } from "@/components/shared/admin/role-constants";

interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

interface Props {
  user?: User;
  onClose: () => void;
}

interface FormState {
  error?: string;
  success?: boolean;
}

async function createAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await createUser({
      email: formData.get("email") as string,
      name: formData.get("name") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as "admin" | "moderator" | "user",
    });
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Невідома помилка" };
  }
}

async function updateAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await updateUser(Number(formData.get("id")), {
      name: formData.get("name") as string,
      role: formData.get("role") as "admin" | "moderator" | "user",
      password: (formData.get("password") as string) || undefined,
    });
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Невідома помилка" };
  }
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function UserFormDialog({ user, onClose }: Props) {
  const isEdit = !!user;
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role ?? "user");

  const [state, formAction, pending] = useActionState(
    isEdit ? updateAction : createAction,
    { error: undefined, success: false },
  );

  useEffect(() => {
    if (state.success) {
      toast.success(isEdit ? "Користувача оновлено" : "Користувача створено");
      router.refresh();
      onClose();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.success, state.error, isEdit, router, onClose]);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              {isEdit ? (
                <ShieldCheck className="size-5 text-primary" />
              ) : (
                <User className="size-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isEdit ? "Редагувати користувача" : "Новий користувач"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEdit
                  ? "Змініть дані облікового запису"
                  : "Створіть новий обліковий запис"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form action={formAction} className="px-6 pb-0">
          {isEdit && <input type="hidden" name="id" value={user.id} />}

          <div className="space-y-4">
            {/* Основна інформація */}
            <div>
              <h4 className="text-[11px] font-semibold text-muted-foreground/60 tracking-widest uppercase mb-3">
                Основна інформація
              </h4>
              <div className="space-y-3">
                <FormField label="Електронна пошта">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 pointer-events-none" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      defaultValue={user?.email ?? ""}
                      disabled={isEdit}
                      placeholder="email@example.com"
                      className="pl-9"
                    />
                  </div>
                </FormField>

                <FormField label="Ім'я">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 pointer-events-none" />
                    <Input
                      id="name"
                      name="name"
                      required
                      defaultValue={user?.name ?? ""}
                      placeholder="Ім'я користувача"
                      className="pl-9"
                    />
                  </div>
                </FormField>
              </div>
            </div>

            {/* Пароль */}
            <div>
              <h4 className="text-[11px] font-semibold text-muted-foreground/60 tracking-widest uppercase mb-3">
                {isEdit ? "Зміна пароля" : "Пароль"}
              </h4>
              <FormField
                label={isEdit ? "Новий пароль (необов'язково)" : "Пароль"}
              >
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required={!isEdit}
                    minLength={6}
                    placeholder={isEdit ? "Залиште порожнім, щоб не змінювати" : "Мінімум 6 символів"}
                    className="pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </FormField>
            </div>

            {/* Роль */}
            <div>
              <h4 className="text-[11px] font-semibold text-muted-foreground/60 tracking-widest uppercase mb-3">
                Рівень доступу
              </h4>
              <div className="space-y-2">
                <Select
                  name="role"
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue>
                      <RoleBadge role={selectedRole} />
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <SelectItem key={opt.value} value={opt.value} className="py-3">
                          <div className="flex items-start gap-3">
                            <Icon className={`size-5 mt-0.5 ${opt.color}`} />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{opt.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {opt.description}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {selectedRole && (
                  <div className="rounded-lg border bg-muted/30 px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      {ROLES.find((r) => r.value === selectedRole)?.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 py-4 mt-4 border-t mb-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin mr-1.5" />}
              {isEdit ? "Зберегти" : "Створити"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
