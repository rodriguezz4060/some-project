"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createMilitary, updateMilitary } from "@root/actions/military";
import { statusConfig } from "@/components/shared/military/constants";
import type { MilitaryPersonnel, StatusType, MedicalRecord, Achievement, Equipment, PositionEntry, ClothingSizes } from "@/components/shared/military/types";

const ALL_STATUSES: StatusType[] = ["active", "on-mission", "wounded", "vacation", "reserve"];
const RANK_OPTIONS = ["лейтенант", "старший лейтенант", "капітан", "майор", "полковник", "сержант"];

interface FormData {
  fullName: string;
  rank: string;
  position: string;
  unit: string;
  status: string;
  birthDate: string;
  photo: string;
  experience: string;
  missions: string;
  phone: string;
  email: string;
  lastActiveDays: string;
  medicalRecords: MedicalRecord[];
  achievements: Achievement[];
  equipment: Equipment[];
  positionHistory: PositionEntry[];
  clothingSizes: ClothingSizes;
}

function emptyMedicalRecord(): MedicalRecord {
  return { condition: "", diagnosisDate: "", status: "active", notes: "" };
}

function emptyAchievement(): Achievement {
  return { name: "", date: "", type: "medal", description: "" };
}

function emptyEquipment(): Equipment {
  return { name: "", type: "weapon", serialNumber: "", issuedDate: "" };
}

function emptyPositionEntry(): PositionEntry {
  return { position: "", unit: "", startDate: "", endDate: "" };
}

const emptyClothingSizes: ClothingSizes = {
  height: "", chest: "", waist: "", shoes: "", headgear: "", uniform: "",
};

function formDataFromPerson(person: MilitaryPersonnel): FormData {
  return {
    fullName: person.fullName,
    rank: person.rank,
    position: person.position,
    unit: person.unit,
    status: person.status,
    birthDate: person.birthDate,
    photo: person.photo ?? "",
    experience: person.experience?.toString() ?? "",
    missions: person.missions?.toString() ?? "",
    phone: person.phone ?? "",
    email: person.email ?? "",
    lastActiveDays: person.lastActiveDays?.toString() ?? "",
    medicalRecords: person.medicalRecords?.map((r) => ({ ...r })) ?? [],
    achievements: person.achievements?.map((a) => ({ ...a })) ?? [],
    equipment: person.equipment?.map((e) => ({ ...e })) ?? [],
    positionHistory: person.positionHistory?.map((p) => ({ ...p })) ?? [],
    clothingSizes: { ...emptyClothingSizes, ...person.clothingSizes },
  };
}

const emptyForm: FormData = {
  fullName: "",
  rank: "сержант",
  position: "",
  unit: "",
  status: "active",
  birthDate: "",
  photo: "",
  experience: "",
  missions: "",
  phone: "",
  email: "",
  lastActiveDays: "",
  medicalRecords: [],
  achievements: [],
  equipment: [],
  positionHistory: [],
  clothingSizes: { ...emptyClothingSizes },
};

interface FormFieldProps {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

function FormField({ label, id, value, onChange, placeholder, type = "text" }: FormFieldProps) {
  const fieldId = id ?? label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="placeholder:text-muted-foreground/40"
      />
    </div>
  );
}

function ArraySection<T>({
  title,
  items,
  onItemsChange,
  renderItem,
  createEmpty,
}: {
  title: string;
  items: T[];
  onItemsChange: (items: T[]) => void;
  renderItem: (item: T, index: number, onChange: (item: T) => void) => React.ReactNode;
  createEmpty: () => T;
}) {
  const [keys, setKeys] = useState<number[]>(() => items.map((_, i) => i));
  const nextKey = useRef(items.length);

  const addItem = () => {
    const k = nextKey.current++;
    setKeys([...keys, k]);
    onItemsChange([...items, createEmpty()]);
  };

  const removeItem = (index: number) => {
    setKeys(keys.filter((_, i) => i !== index));
    onItemsChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
          <Plus className="size-3.5" /> Додати
        </Button>
      </div>
      {items.map((item, index) => (
        <div key={keys[index]} className="relative border border-border/40 rounded-lg p-4 pt-7">
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
          {renderItem(item, index, (updated) => {
            onItemsChange(items.map((it, i) => (i === index ? updated : it)));
          })}
        </div>
      ))}
    </div>
  );
}

function renderPositionItem(item: PositionEntry, index: number, onChange: (item: PositionEntry) => void) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <FormField label="Посада" value={item.position} onChange={(v) => onChange({ ...item, position: v })} placeholder="Командир взводу" />
      <FormField label="Підрозділ" value={item.unit} onChange={(v) => onChange({ ...item, unit: v })} placeholder="72 ОМБр" />
      <FormField label="Дата початку" value={item.startDate} onChange={(v) => onChange({ ...item, startDate: v })} type="date" />
      <FormField label="Дата закінчення" value={item.endDate ?? ""} onChange={(v) => onChange({ ...item, endDate: v })} type="date" />
    </div>
  );
}

function renderMedicalItem(item: MedicalRecord, index: number, onChange: (item: MedicalRecord) => void) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <FormField label="Діагноз" value={item.condition} onChange={(v) => onChange({ ...item, condition: v })} placeholder="Захворювання / травма" />
      <div className="space-y-1.5">
        <Label htmlFor={`med-status-${index}`}>Статус</Label>
        <Select
          value={item.status}
          onValueChange={(v) => onChange({ ...item, status: v as "active" | "resolved" })}
        >
          <SelectTrigger id={`med-status-${index}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Активний</SelectItem>
            <SelectItem value="resolved">Вирішено</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <FormField label="Дата діагнозу" value={item.diagnosisDate} onChange={(v) => onChange({ ...item, diagnosisDate: v })} type="date" />
      <FormField label="Нотатки" value={item.notes ?? ""} onChange={(v) => onChange({ ...item, notes: v })} placeholder="..." />
    </div>
  );
}

function renderAchievementItem(item: Achievement, index: number, onChange: (item: Achievement) => void) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <FormField label="Назва" value={item.name} onChange={(v) => onChange({ ...item, name: v })} placeholder="Орден «За мужність»" />
      <div className="space-y-1.5">
        <Label htmlFor={`ach-type-${index}`}>Тип</Label>
        <Select
          value={item.type}
          onValueChange={(v) => onChange({ ...item, type: v as "medal" | "commendation" | "certificate" })}
        >
          <SelectTrigger id={`ach-type-${index}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medal">Медаль</SelectItem>
            <SelectItem value="commendation">Відзнака</SelectItem>
            <SelectItem value="certificate">Грамота</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <FormField label="Дата" value={item.date} onChange={(v) => onChange({ ...item, date: v })} type="date" />
      <FormField label="Опис" value={item.description ?? ""} onChange={(v) => onChange({ ...item, description: v })} placeholder="..." />
    </div>
  );
}

function renderEquipmentItem(item: Equipment, index: number, onChange: (item: Equipment) => void) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <FormField label="Назва" value={item.name} onChange={(v) => onChange({ ...item, name: v })} placeholder="M4A1" />
      <div className="space-y-1.5">
        <Label htmlFor={`eq-type-${index}`}>Тип</Label>
        <Select
          value={item.type}
          onValueChange={(v) => onChange({ ...item, type: v as "weapon" | "armor" | "gear" })}
        >
          <SelectTrigger id={`eq-type-${index}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weapon">Зброя</SelectItem>
            <SelectItem value="armor">Броня</SelectItem>
            <SelectItem value="gear">Спорядження</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <FormField label="Серійний номер" value={item.serialNumber ?? ""} onChange={(v) => onChange({ ...item, serialNumber: v })} placeholder="SN-123456" />
      <FormField label="Дата видачі" value={item.issuedDate} onChange={(v) => onChange({ ...item, issuedDate: v })} type="date" />
    </div>
  );
}

interface Props {
  initialData?: MilitaryPersonnel;
}

export function MilitaryForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<FormData>(
    initialData ? formDataFromPerson(initialData) : { ...emptyForm },
  );

  const updateField = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateClothingSize = (key: keyof ClothingSizes, value: string) => {
    setForm((prev) => ({ ...prev, clothingSizes: { ...prev.clothingSizes, [key]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      fullName: form.fullName,
      rank: form.rank,
      position: form.position,
      unit: form.unit,
      status: form.status,
      birthDate: form.birthDate,
      photo: form.photo || undefined,
      experience: form.experience ? Number(form.experience) : undefined,
      missions: form.missions ? Number(form.missions) : undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      lastActiveDays: form.lastActiveDays ? Number(form.lastActiveDays) : undefined,
      medicalRecords: form.medicalRecords.filter((r) => r.condition).map((r) => ({
        ...r,
        notes: r.notes || undefined,
      })),
      achievements: form.achievements.filter((a) => a.name).map((a) => ({
        ...a,
        description: a.description || undefined,
      })),
      equipment: form.equipment.filter((e) => e.name).map((e) => ({
        ...e,
        serialNumber: e.serialNumber || undefined,
      })),
      positionHistory: form.positionHistory.filter((p) => p.position).map((p) => ({
        ...p,
        endDate: p.endDate || undefined,
      })),
      clothingSizes: Object.values(form.clothingSizes).some((v) => v)
        ? form.clothingSizes
        : undefined,
    };

    try {
      if (isEdit) {
        await updateMilitary(initialData.id!, payload);
        setIsLoading(false);
        toast.success("Профіль оновлено", {
          description: `${form.fullName} — зміни збережено`,
        });
        router.push(`/military/${initialData.id!}`);
      } else {
        const result = await createMilitary(payload);
        setIsLoading(false);
        toast.success("Анкету збережено", {
          description: `${result.fullName} додано до списку`,
        });
        router.push("/military");
      }
    } catch {
      setIsLoading(false);
      toast.error("Помилка при збереженні");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основна інформація</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rank">Військове звання</Label>
            <Select
              value={form.rank}
              onValueChange={(v) => updateField("rank", v)}
            >
              <SelectTrigger id="rank">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANK_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FormField
            label="ПІБ"
            value={form.fullName}
            onChange={(v) => updateField("fullName", v)}
            placeholder="Ковальчук Андрій Петрович"
          />
          <FormField
            label="Посада"
            value={form.position}
            onChange={(v) => updateField("position", v)}
            placeholder="Командир взводу"
          />
          <FormField
            label="Підрозділ"
            value={form.unit}
            onChange={(v) => updateField("unit", v)}
            placeholder="72 ОМБр"
          />
          <div className="space-y-1.5">
            <Label htmlFor="status">Статус</Label>
            <Select
              value={form.status}
              onValueChange={(v) => updateField("status", v)}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusConfig[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FormField
            label="Дата народження"
            value={form.birthDate}
            onChange={(v) => updateField("birthDate", v)}
            type="date"
          />
          <FormField
            label="Фото (URL)"
            value={form.photo}
            onChange={(v) => updateField("photo", v)}
            placeholder="https://example.com/photo.jpg"
          />
          <FormField
            label="Номер телефону"
            value={form.phone}
            onChange={(v) => updateField("phone", v)}
            placeholder="+380 50 111 22 33"
            type="tel"
          />
          <FormField
            label="Email"
            value={form.email}
            onChange={(v) => updateField("email", v)}
            placeholder="andriy@example.com"
            type="email"
          />
          <FormField
            label="Кількість місій"
            value={form.missions}
            onChange={(v) => updateField("missions", v)}
            type="number"
          />
          <FormField
            label="Досвід (років)"
            value={form.experience}
            onChange={(v) => updateField("experience", v)}
            type="number"
          />
          <FormField
            label="Днів з останньої активності"
            value={form.lastActiveDays}
            onChange={(v) => updateField("lastActiveDays", v)}
            type="number"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Позиції</CardTitle>
        </CardHeader>
        <CardContent>
          <ArraySection
            title="Історія посад"
            items={form.positionHistory}
            onItemsChange={(items) => setForm((prev) => ({ ...prev, positionHistory: items }))}
            createEmpty={emptyPositionEntry}
            renderItem={renderPositionItem}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Медицина</CardTitle>
        </CardHeader>
        <CardContent>
          <ArraySection
            title="Медичні записи"
            items={form.medicalRecords}
            onItemsChange={(items) => setForm((prev) => ({ ...prev, medicalRecords: items }))}
            createEmpty={emptyMedicalRecord}
            renderItem={renderMedicalItem}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Нагороди</CardTitle>
        </CardHeader>
        <CardContent>
          <ArraySection
            title="Нагороди та відзнаки"
            items={form.achievements}
            onItemsChange={(items) => setForm((prev) => ({ ...prev, achievements: items }))}
            createEmpty={emptyAchievement}
            renderItem={renderAchievementItem}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Майно</CardTitle>
        </CardHeader>
        <CardContent>
          <ArraySection
            title="Спорядження та зброя"
            items={form.equipment}
            onItemsChange={(items) => setForm((prev) => ({ ...prev, equipment: items }))}
            createEmpty={emptyEquipment}
            renderItem={renderEquipmentItem}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Розміри</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
          <FormField label="Зріст (см)" value={form.clothingSizes.height ?? ""} onChange={(v) => updateClothingSize("height", v)} placeholder="180" />
          <FormField label="Обхват грудей (см)" value={form.clothingSizes.chest ?? ""} onChange={(v) => updateClothingSize("chest", v)} placeholder="96" />
          <FormField label="Обхват талії (см)" value={form.clothingSizes.waist ?? ""} onChange={(v) => updateClothingSize("waist", v)} placeholder="80" />
          <FormField label="Розмір взуття" value={form.clothingSizes.shoes ?? ""} onChange={(v) => updateClothingSize("shoes", v)} placeholder="43" />
          <FormField label="Головний убір" value={form.clothingSizes.headgear ?? ""} onChange={(v) => updateClothingSize("headgear", v)} placeholder="56" />
          <FormField label="Форма одягу" value={form.clothingSizes.uniform ?? ""} onChange={(v) => updateClothingSize("uniform", v)} placeholder="48/4" />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" size="lg" disabled={isLoading} className="gap-2">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isLoading ? "Збереження..." : (isEdit ? "Зберегти зміни" : "Зберегти анкету")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push(isEdit ? `/military/${initialData.id!}` : "/military")}
          disabled={isLoading}
        >
          Скасувати
        </Button>
      </div>
    </form>
  );
}
