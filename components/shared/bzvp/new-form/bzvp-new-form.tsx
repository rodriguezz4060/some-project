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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormProvider,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { createBzvp, updateBzvp } from "@root/actions/bzvp";
import { bzvpSchema } from "@root/lib/schemas/bzvp";
import { BZVP_STATUS_CONFIG, BZVP_STATUSES } from "@/components/shared/bzvp/constants";
import type { BzvpPersonnel } from "@/components/shared/bzvp/types";
import type { z } from "zod";

type FormValues = z.infer<typeof bzvpSchema>;

function getDefaultValues(person?: BzvpPersonnel): FormValues {
  if (!person) {
    return {
      rank: "",
      fullName: "",
      birthDate: "",
      status: "training",
      arrivalDate: "",
      trainingPeriod: "",
      specialization: "",
      birthPlace: "",
      photo: "",
      passport: "",
      passportIssued: "",
      tin: "",
      militaryId: "",
      militaryIdIssued: "",
      ubd: "Немає",
      ubdDate: "",
      serviceUnit: "",
      serviceYears: "",
      civilianJob: "",
      education: "",
      actualAddress: "",
      registrationAddress: "",
      driverLicense: "",
      criminalRecord: "Немає",
      policeRecords: "Немає",
      family: "",
      phone: "",
      relativePhones: "",
      personalOrder: "Без розпоряджень",
      conscription: "",
      health: "",
      healthComplaints: "",
      moralState: "",
      bloodType: "",
      shoeSize: "",
      notes: "",
    };
  }
  return {
    rank: person.rank,
    fullName: person.fullName,
    birthDate: person.birthDate,
    birthPlace: person.birthPlace ?? "",
    photo: person.photo ?? "",
    passport: person.passport ?? "",
    passportIssued: person.passportIssued ?? "",
    tin: person.tin ?? "",
    militaryId: person.militaryId ?? "",
    militaryIdIssued: person.militaryIdIssued ?? "",
    ubd: person.ubd ?? "Немає",
    ubdDate: person.ubdDate ?? "",
    serviceUnit: person.serviceUnit ?? "",
    serviceYears: person.serviceYears ?? "",
    civilianJob: person.civilianJob ?? "",
    education: person.education ?? "",
    actualAddress: person.actualAddress ?? "",
    registrationAddress: person.registrationAddress ?? "",
    driverLicense: person.driverLicense ?? "",
    criminalRecord: person.criminalRecord ?? "Немає",
    policeRecords: person.policeRecords ?? "Немає",
    family: person.family ?? "",
    phone: person.phone ?? "",
    relativePhones: person.relativePhones ?? "",
    personalOrder: person.personalOrder ?? "Без розпоряджень",
    conscription: person.conscription ?? "",
    health: person.health ?? "",
    healthComplaints: person.healthComplaints ?? "",
    moralState: person.moralState ?? "",
    bloodType: person.bloodType ?? "",
    shoeSize: person.shoeSize ?? "",
    notes: person.notes ?? "",
    status: person.status ?? "",
    arrivalDate: person.arrivalDate ?? "",
    trainingPeriod: person.trainingPeriod ?? "",
    specialization: person.specialization ?? "",
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

  function field(name: keyof FormValues, label: string, opts?: { placeholder?: string; type?: string; multiline?: boolean }) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field: f, fieldState }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              {opts?.multiline ? (
                <Textarea {...f} value={f.value ?? ""} placeholder={opts?.placeholder} rows={3}
                  className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} />
              ) : (
                <Input {...f} value={f.value ?? ""} type={opts?.type ?? "text"} placeholder={opts?.placeholder}
                  className={cn("placeholder:text-muted-foreground/40", fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основна інформація та документи</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field: f, fieldState }) => (
                <FormItem>
                  <FormLabel>Статус</FormLabel>
                  <Select onValueChange={f.onChange} value={f.value ?? ""}>
                    <FormControl>
                      <SelectTrigger className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BZVP_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {BZVP_STATUS_CONFIG[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {field("rank", "Військове звання", { placeholder: "старший солдат" })}
            {field("fullName", "ПІБ", { placeholder: "Ковальчук Андрій Петрович" })}
            {field("birthDate", "Дата народження", { type: "date" })}
            {field("birthPlace", "Місце народження", { placeholder: "м. Житомир" })}
            {field("photo", "Фото (URL)", { placeholder: "https://example.com/photo.jpg" })}
            {field("passport", "Серія та номер паспорту", { placeholder: "АА 123456" })}
            {field("passportIssued", "Коли і ким виданий паспорт", { placeholder: "12.04.2016, Житомирським РУП" })}
            {field("tin", "ІПН", { placeholder: "3000512345" })}
            {field("militaryId", "№ військового квитка", { placeholder: "МК 789012" })}
            {field("militaryIdIssued", "Коли та ким виданий військовий квиток", { placeholder: "15.06.2018, Житомирським РТЦК" })}

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
              {ubdWatched === "Так" && field("ubdDate", "Дата видачі посвідчення УБД", { type: "date" })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Служба, адреси, правовий статус та сім&apos;я</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {field("arrivalDate", "Дата прибуття", { placeholder: "ДД.ММ.РРРР" })}
            {field("trainingPeriod", "Період навчання", { placeholder: "01.03.2025 – 01.06.2025" })}
            {field("serviceUnit", "Воєнна частина (В/ч)", { placeholder: "72 ОМБр" })}
            {field("serviceYears", "Роки проходження служби", { placeholder: "2020-2024" })}
            {field("civilianJob", "Цивільна робота, фах", { placeholder: "Електрик, ТОВ «Енергія»" })}
            {field("education", "Які навчальні заклади закінчив, у якому році, спеціальність", { placeholder: "Житомирський політехнічний коледж, 2021, електромонтажник", multiline: true })}
            {field("specialization", "Спеціалізація", { placeholder: "Кулеметник, водій" })}
            {field("actualAddress", "Фактичне місце проживання", { placeholder: "м. Житомир, вул. Перемоги 15, кв. 42" })}
            {field("registrationAddress", "Місце прописки", { placeholder: "м. Житомир, вул. Перемоги 15, кв. 42" })}
            {field("driverLicense", "Посвідчення водія (категорія)", { placeholder: "B, C" })}
            {field("criminalRecord", "Судимість", { placeholder: "Немає" })}
            {field("policeRecords", "Приводи в поліцію / адмін-порушення", { placeholder: "Немає" })}
            {field("family", "Склад сім'ї (члени родини), їх адреса проживання", { placeholder: "Мати: Ковальчук О.М., м. Житомир...", multiline: true })}
            {field("phone", "Номер телефону (особистий)", { placeholder: "+380 50 111 22 33", type: "tel" })}
            {field("relativePhones", "Номери телефонів близьких родичів", { placeholder: "Мати: +380 67 111 22 33" })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Додатково</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {field("personalOrder", "Особисте розпорядження", { placeholder: "Без розпоряджень" })}
            {field("conscription", "Яким РТЦК та СП призваний", { placeholder: "Житомирським РТЦК та СП" })}
            {field("health", "Стан здоров'я", { placeholder: "Задовільний", multiline: true })}
            {field("healthComplaints", "Скарги на здоров'я", { placeholder: "Немає", multiline: true })}
            {field("moralState", "Морально-психологічний стан", { placeholder: "Стабільний, стресостійкий" })}
            {field("bloodType", "Група крові", { placeholder: "A(II) Rh+" })}
            {field("shoeSize", "Розмір взуття", { placeholder: "43" })}
            {field("notes", "Особливі примітки", { placeholder: "...", multiline: true })}
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
