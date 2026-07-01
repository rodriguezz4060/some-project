"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@root/lib/utils";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FormProvider } from "@/components/ui/form";
import { TextField, TextareaField, SelectField } from "@/components/shared/form-fields";
import { toast } from "sonner";
import { createBzvp, updateBzvp } from "@root/actions/bzvp";
import { bzvpSchema } from "@root/lib/schemas/bzvp";
import { BZVP_STATUS_CONFIG, BZVP_STATUSES } from "@/components/shared/bzvp/constants";
import type { BzvpPersonnel } from "@/components/shared/bzvp/types";
import type { z } from "zod";

type FormValues = z.infer<typeof bzvpSchema>;

const DEFAULTS: FormValues = {
  rank: "", fullName: "", birthDate: "", status: "training",
  arrivalDate: "", trainingPeriod: "", specialization: "",
  birthPlace: "", photo: "", passport: "", passportIssued: "",
  tin: "", militaryId: "", militaryIdIssued: "",
  ubd: "Немає", ubdDate: "", serviceUnit: "", serviceYears: "",
  civilianJob: "", education: "", actualAddress: "", registrationAddress: "",
  driverLicense: "", criminalRecord: "Немає", policeRecords: "Немає",
  family: "", phone: "", relativePhones: "",
  personalOrder: "Без розпоряджень", conscription: "",
  health: "", healthComplaints: "", moralState: "",
  bloodType: "", shoeSize: "", notes: "",
};

function getDefaultValues(person?: BzvpPersonnel): FormValues {
  if (!person) return { ...DEFAULTS };
  return {
    ...DEFAULTS,
    rank: person.rank, fullName: person.fullName, birthDate: person.birthDate,
    status: person.status ?? "", arrivalDate: person.arrivalDate ?? "",
    trainingPeriod: person.trainingPeriod ?? "", specialization: person.specialization ?? "",
    birthPlace: person.birthPlace ?? "", photo: person.photo ?? "",
    passport: person.passport ?? "", passportIssued: person.passportIssued ?? "",
    tin: person.tin ?? "", militaryId: person.militaryId ?? "",
    militaryIdIssued: person.militaryIdIssued ?? "", ubd: person.ubd ?? "Немає",
    ubdDate: person.ubdDate ?? "", serviceUnit: person.serviceUnit ?? "",
    serviceYears: person.serviceYears ?? "", civilianJob: person.civilianJob ?? "",
    education: person.education ?? "", actualAddress: person.actualAddress ?? "",
    registrationAddress: person.registrationAddress ?? "",
    driverLicense: person.driverLicense ?? "", criminalRecord: person.criminalRecord ?? "Немає",
    policeRecords: person.policeRecords ?? "Немає", family: person.family ?? "",
    phone: person.phone ?? "", relativePhones: person.relativePhones ?? "",
    personalOrder: person.personalOrder ?? "Без розпоряджень",
    conscription: person.conscription ?? "", health: person.health ?? "",
    healthComplaints: person.healthComplaints ?? "", moralState: person.moralState ?? "",
    bloodType: person.bloodType ?? "", shoeSize: person.shoeSize ?? "",
    notes: person.notes ?? "",
  };
}

interface Props {
  initialData?: BzvpPersonnel;
}

export function BzvpForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(bzvpSchema) as unknown as Resolver<FormValues>,
    defaultValues: getDefaultValues(initialData),
  });

  const ubdWatched = useWatch({ control: form.control, name: "ubd" });

  const handleServerError = (err: unknown) => {
    const message = err instanceof Error ? err.message : "";
    toast.error(message || "Помилка при збереженні");
  };

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      if (isEdit) {
        const result = await updateBzvp(initialData.id!, data);
        toast.success("Анкету оновлено", {
          description: `${result.fullName} — зміни збережено`,
        });
        router.push(`/bzvp/${initialData.id!}`);
      } else {
        const result = await createBzvp(data);
        toast.success("Анкету збережено", {
          description: `${result.fullName} додано до списку БЗВП`,
        });
        router.push("/bzvp");
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
            <CardTitle>Основна інформація та документи</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <SelectField control={form.control} name="status" label="Статус" options={BZVP_STATUSES.map((s) => ({ value: s, label: BZVP_STATUS_CONFIG[s].label }))} />
            <TextField control={form.control} name="rank" label="Військове звання" placeholder="старший солдат" />
            <TextField control={form.control} name="fullName" label="ПІБ" placeholder="Ковальчук Андрій Петрович" />
            <TextField control={form.control} name="birthDate" label="Дата народження" type="date" />
            <TextField control={form.control} name="birthPlace" label="Місце народження" placeholder="м. Житомир" />
            <TextField control={form.control} name="photo" label="Фото (URL)" placeholder="https://example.com/photo.jpg" />
            <TextField control={form.control} name="passport" label="Серія та номер паспорту" placeholder="АА 123456" />
            <TextField control={form.control} name="passportIssued" label="Коли і ким виданий паспорт" placeholder="12.04.2016, Житомирським РУП" />
            <TextField control={form.control} name="tin" label="ІПН" placeholder="3000512345" />
            <TextField control={form.control} name="militaryId" label="№ військового квитка" placeholder="МК 789012" />
            <TextField control={form.control} name="militaryIdIssued" label="Коли та ким виданий військовий квиток" placeholder="15.06.2018, Житомирським РТЦК" />

            <div className="space-y-3">
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="ubd-check"
                  checked={ubdWatched === "Так"}
                  onCheckedChange={(checked) => {
                    form.setValue("ubd", checked ? "Так" : "Немає", { shouldDirty: true });
                    if (!checked) form.setValue("ubdDate", "", { shouldDirty: true });
                  }}
                />
                <Label htmlFor="ubd-check" className="cursor-pointer font-normal">
                  УБД (учасник бойових дій)
                </Label>
              </div>
              {ubdWatched === "Так" && <TextField control={form.control} name="ubdDate" label="Дата видачі посвідчення УБД" type="date" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Служба, адреси, правовий статус та сім&apos;я</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <TextField control={form.control} name="arrivalDate" label="Дата прибуття" placeholder="ДД.ММ.РРРР" />
            <TextField control={form.control} name="trainingPeriod" label="Період навчання" placeholder="01.03.2025 – 01.06.2025" />
            <TextField control={form.control} name="serviceUnit" label="Воєнна частина (В/ч)" placeholder="72 ОМБр" />
            <TextField control={form.control} name="serviceYears" label="Роки проходження служби" placeholder="2020-2024" />
            <TextField control={form.control} name="civilianJob" label="Цивільна робота, фах" placeholder="Електрик, ТОВ «Енергія»" />
            <TextareaField control={form.control} name="education" label="Які навчальні заклади закінчив, у якому році, спеціальність" placeholder="Житомирський політехнічний коледж, 2021, електромонтажник" />
            <TextField control={form.control} name="specialization" label="Спеціалізація" placeholder="Кулеметник, водій" />
            <TextField control={form.control} name="actualAddress" label="Фактичне місце проживання" placeholder="м. Житомир, вул. Перемоги 15, кв. 42" />
            <TextField control={form.control} name="registrationAddress" label="Місце прописки" placeholder="м. Житомир, вул. Перемоги 15, кв. 42" />
            <TextField control={form.control} name="driverLicense" label="Посвідчення водія (категорія)" placeholder="B, C" />
            <TextField control={form.control} name="criminalRecord" label="Судимість" placeholder="Немає" />
            <TextField control={form.control} name="policeRecords" label="Приводи в поліцію / адмін-порушення" placeholder="Немає" />
            <TextareaField control={form.control} name="family" label="Склад сім'ї (члени родини), їх адреса проживання" placeholder="Мати: Ковальчук О.М., м. Житомир..." />
            <TextField control={form.control} name="phone" label="Номер телефону (особистий)" placeholder="+380 50 111 22 33" type="tel" />
            <TextField control={form.control} name="relativePhones" label="Номери телефонів близьких родичів" placeholder="Мати: +380 67 111 22 33" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Додатково</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <TextField control={form.control} name="personalOrder" label="Особисте розпорядження" placeholder="Без розпоряджень" />
            <TextField control={form.control} name="conscription" label="Яким РТЦК та СП призваний" placeholder="Житомирським РТЦК та СП" />
            <TextareaField control={form.control} name="health" label="Стан здоров'я" placeholder="Задовільний" />
            <TextareaField control={form.control} name="healthComplaints" label="Скарги на здоров'я" placeholder="Немає" />
            <TextField control={form.control} name="moralState" label="Морально-психологічний стан" placeholder="Стабільний, стресостійкий" />
            <TextField control={form.control} name="bloodType" label="Група крові" placeholder="A(II) Rh+" />
            <TextField control={form.control} name="shoeSize" label="Розмір взуття" placeholder="43" />
            <TextareaField control={form.control} name="notes" label="Особливі примітки" placeholder="..." />
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
            onClick={() => router.push(isEdit ? `/bzvp/${initialData.id!}` : "/bzvp")}
            disabled={isLoading}
          >
            Скасувати
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
