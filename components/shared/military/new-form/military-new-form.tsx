"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { createZodResolver } from "@root/lib/utils";
import { parseZodErrorMessages } from "@root/lib/form-utils";
import { Save, Loader2 } from "lucide-react";
import { ArraySection } from "@/components/shared/array-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormProvider } from "@/components/ui/form";
import { TextField, NumberField, SelectField } from "@/components/shared/form-fields";
import { PositionFormFields } from "./position-form-fields";
import { MedicalFormFields } from "./medical-form-fields";
import { AchievementFormFields } from "./achievement-form-fields";
import { EquipmentFormFields } from "./equipment-form-fields";
import { ClothingSizesFields } from "./clothing-sizes-fields";
import { toast } from "sonner";
import { createMilitary, updateMilitary } from "@root/actions/military";
import { createMilitarySchema } from "@root/lib/schemas/military";
import { statusConfig } from "@/components/shared/military/constants";
import type { MilitaryPersonnel } from "@/components/shared/military/types";
import type { CreateMilitaryData } from "@root/lib/schemas/military";

const ALL_STATUSES = ["active", "on-mission", "wounded", "vacation", "reserve"] as const;
const RANK_OPTIONS = ["лейтенант", "старший лейтенант", "капітан", "майор", "полковник", "сержант"];

const DEFAULTS: CreateMilitaryData = {
  fullName: "", rank: "сержант", position: "", unit: "",
  status: "active", birthDate: "", photo: "",
  experience: undefined, missions: undefined, phone: "",
  email: "", lastActiveDays: undefined,
  medicalRecords: [], achievements: [], equipment: [],
  positionHistory: [],
  clothingSizes: { height: "", chest: "", waist: "", shoes: "", headgear: "", uniform: "" },
};

import { parseDate } from "@root/lib/utils/dates";

function getDefaultValues(person?: MilitaryPersonnel): CreateMilitaryData {
  if (!person) return { ...DEFAULTS };
  return {
    ...DEFAULTS,
    fullName: person.fullName,
    rank: person.rank,
    position: person.position,
    unit: person.unit,
    status: person.status,
    birthDate: person.birthDate,
    photo: person.photo ?? "",
    experience: person.experience ?? undefined,
    missions: person.missions ?? undefined,
    phone: person.phone ?? "",
    email: person.email ?? "",
    lastActiveDays: person.lastActiveDays ?? undefined,
    medicalRecords: person.medicalRecords?.map((r) => ({ ...r, notes: r.notes ?? "" })) ?? [],
    achievements: person.achievements?.map((a) => ({ ...a, description: a.description ?? "" })) ?? [],
    equipment: person.equipment?.map((e) => ({ ...e, serialNumber: e.serialNumber ?? "" })) ?? [],
    positionHistory: [...(person.positionHistory ?? [])]
      .sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate))
      .map((p) => ({ ...p, endDate: p.endDate ?? "" })),
    clothingSizes: person.clothingSizes
      ? { height: person.clothingSizes.height ?? "", chest: person.clothingSizes.chest ?? "", waist: person.clothingSizes.waist ?? "", shoes: person.clothingSizes.shoes ?? "", headgear: person.clothingSizes.headgear ?? "", uniform: person.clothingSizes.uniform ?? "" }
      : { height: "", chest: "", waist: "", shoes: "", headgear: "", uniform: "" },
  };
}

interface Props {
  initialData?: MilitaryPersonnel;
}

export function MilitaryForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateMilitaryData>({
    resolver: createZodResolver<CreateMilitaryData>(createMilitarySchema),
    defaultValues: getDefaultValues(initialData),
  });

  const medField = useFieldArray({ control: form.control, name: "medicalRecords" });
  const achField = useFieldArray({ control: form.control, name: "achievements" });
  const eqField = useFieldArray({ control: form.control, name: "equipment" });
  const posField = useFieldArray({ control: form.control, name: "positionHistory" });

  const handleServerError = (err: unknown) => {
    const msgs = parseZodErrorMessages(err);
    if (msgs) {
      toast.error(
        <div className="flex flex-col gap-0.5">
          {msgs.map((m, i) => <span key={i}>{m}</span>)}
        </div>,
      );
    }
  };

  async function onSubmit(data: CreateMilitaryData) {
    setIsLoading(true);
    try {
      if (isEdit) {
        await updateMilitary(initialData.id!, data);
        toast.success("Профіль оновлено", {
          description: `${data.fullName} — зміни збережено`,
        });
        router.push(`/military/${initialData.id!}`);
      } else {
        const result = await createMilitary(data);
        toast.success("Анкету збережено", {
          description: `${result.fullName} додано до списку`,
        });
        router.push("/military");
      }
    } catch (err) {
      handleServerError(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основна інформація</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <SelectField control={form.control} name="rank" label="Військове звання" options={RANK_OPTIONS} />
            <TextField control={form.control} name="fullName" label="ПІБ" placeholder="Ковальчук Андрій Петрович" />
            <TextField control={form.control} name="position" label="Посада" placeholder="Командир взводу" />
            <TextField control={form.control} name="unit" label="Підрозділ" placeholder="72 ОМБр" />
            <SelectField control={form.control} name="status" label="Статус" options={ALL_STATUSES.map((s) => ({ value: s, label: statusConfig[s]?.label ?? s }))} />
            <TextField control={form.control} name="birthDate" label="Дата народження" type="date" />
            <TextField control={form.control} name="photo" label="Фото (URL)" placeholder="https://example.com/photo.jpg" />
            <TextField control={form.control} name="phone" label="Номер телефону" placeholder="+380 50 111 22 33" type="tel" />
            <TextField control={form.control} name="email" label="Email" placeholder="andriy@example.com" type="email" />
            <NumberField control={form.control} name="missions" label="Кількість місій" />
            <NumberField control={form.control} name="experience" label="Досвід (років)" />
            <NumberField control={form.control} name="lastActiveDays" label="Днів з останньої активності" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Позиції</CardTitle>
          </CardHeader>
          <CardContent>
            <ArraySection
              title="Історія посад"
              fields={posField.fields}
              onAdd={posField.prepend}
              remove={posField.remove}
              defaultItem={{ position: "", unit: "", startDate: "", endDate: "" }}
              renderItem={(i) => <PositionFormFields control={form.control} index={i} />}
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
              fields={medField.fields}
              onAdd={medField.append}
              remove={medField.remove}
              renderItem={(i) => <MedicalFormFields control={form.control} index={i} />}
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
              fields={achField.fields}
              onAdd={achField.append}
              remove={achField.remove}
              renderItem={(i) => <AchievementFormFields control={form.control} index={i} />}
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
              fields={eqField.fields}
              onAdd={eqField.append}
              remove={eqField.remove}
              renderItem={(i) => <EquipmentFormFields control={form.control} index={i} />}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Розміри</CardTitle>
          </CardHeader>
          <CardContent>
            <ClothingSizesFields control={form.control} />
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
    </FormProvider>
  );
}
