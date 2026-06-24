"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { BzvpPersonnel, BzvpStatus } from "../types";

interface FormData {
  rank: string;
  fullName: string;
  birthDate: string;
  birthPlace: string;
  photo: string;
  passport: string;
  passportIssued: string;
  tin: string;
  militaryId: string;
  militaryIdIssued: string;
  ubd: string;
  ubdDate: string;
  serviceUnit: string;
  serviceYears: string;
  civilianJob: string;
  education: string;
  actualAddress: string;
  registrationAddress: string;
  driverLicense: string;
  criminalRecord: string;
  policeRecords: string;
  family: string;
  phone: string;
  relativePhones: string;
  personalOrder: string;
  conscription: string;
  health: string;
  healthComplaints: string;
  moralState: string;
  bloodType: string;
  shoeSize: string;
  notes: string;
}

const emptyForm: FormData = {
  rank: "",
  fullName: "",
  birthDate: "",
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

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  type = "text",
}: FieldProps) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="placeholder:text-muted-foreground/40"
        />
      )}
    </div>
  );
}

export function BzvpNewForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [ubdChecked, setUbdChecked] = useState(false);

  const updateField = useCallback((key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleUbdToggle = useCallback(
    (checked: boolean) => {
      setUbdChecked(checked);
      setForm((prev) => ({
        ...prev,
        ubd: checked ? "Так" : "Немає",
        ubdDate: checked ? prev.ubdDate : "",
      }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      const today = new Date().toISOString().split("T")[0];
      const newPerson: BzvpPersonnel = {
        ...form,
        id: `bzvp-${Date.now()}`,
        status: "training" as BzvpStatus,
        arrivalDate: today,
        specialization: "",
        trainingPeriod: "",
      };

      const existing = JSON.parse(
        localStorage.getItem("bzvp_personnel") || "[]",
      ) as BzvpPersonnel[];
      existing.push(newPerson);
      localStorage.setItem("bzvp_personnel", JSON.stringify(existing));

      await new Promise((r) => setTimeout(r, 500));

      setIsLoading(false);
      toast.success("Анкету збережено", {
        description: `${newPerson.fullName} додано до списку БЗВП`,
      });
      router.push("/bzvp");
    },
    [form, router],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основна інформація та документи</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <FormField
            label="Військове звання"
            value={form.rank}
            onChange={(v) => updateField("rank", v)}
            placeholder="старший солдат"
          />
          <FormField
            label="ПІБ"
            value={form.fullName}
            onChange={(v) => updateField("fullName", v)}
            placeholder="Ковальчук Андрій Петрович"
          />
          <FormField
            label="Дата народження"
            value={form.birthDate}
            onChange={(v) => updateField("birthDate", v)}
            type="date"
          />
          <FormField
            label="Місце народження"
            value={form.birthPlace}
            onChange={(v) => updateField("birthPlace", v)}
            placeholder="м. Житомир"
          />
          <FormField
            label="Фото (URL)"
            value={form.photo}
            onChange={(v) => updateField("photo", v)}
            placeholder="https://example.com/photo.jpg"
          />
          <FormField
            label="Серія та номер паспорту"
            value={form.passport}
            onChange={(v) => updateField("passport", v)}
            placeholder="АА 123456"
          />
          <FormField
            label="Коли і ким виданий паспорт"
            value={form.passportIssued}
            onChange={(v) => updateField("passportIssued", v)}
            placeholder="12.04.2016, Житомирським РУП"
          />
          <FormField
            label="ІПН"
            value={form.tin}
            onChange={(v) => updateField("tin", v)}
            placeholder="3000512345"
          />
          <FormField
            label="№ військового квитка"
            value={form.militaryId}
            onChange={(v) => updateField("militaryId", v)}
            placeholder="МК 789012"
          />
          <FormField
            label="Коли та ким виданий військовий квиток"
            value={form.militaryIdIssued}
            onChange={(v) => updateField("militaryIdIssued", v)}
            placeholder="15.06.2018, Житомирським РТЦК"
          />

          <div className="space-y-3">
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="ubd-check"
                checked={ubdChecked}
                onCheckedChange={handleUbdToggle}
              />
              <Label htmlFor="ubd-check" className="cursor-pointer font-normal">
                УБД (учасник бойових дій)
              </Label>
            </div>
            {ubdChecked && (
              <FormField
                label="Дата видачі посвідчення УБД"
                value={form.ubdDate}
                onChange={(v) => updateField("ubdDate", v)}
                type="date"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Служба, адреси, правовий статус та сім&apos;я</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <FormField
            label="Воєнна частина (В/ч)"
            value={form.serviceUnit}
            onChange={(v) => updateField("serviceUnit", v)}
            placeholder="72 ОМБр"
          />
          <FormField
            label="Роки проходження служби"
            value={form.serviceYears}
            onChange={(v) => updateField("serviceYears", v)}
            placeholder="2020-2024"
          />
          <FormField
            label="Цивільна робота, фах"
            value={form.civilianJob}
            onChange={(v) => updateField("civilianJob", v)}
            placeholder="Електрик, ТОВ «Енергія»"
          />
          <FormField
            label="Які навчальні заклади закінчив, у якому році, спеціальність"
            value={form.education}
            onChange={(v) => updateField("education", v)}
            placeholder="Житомирський політехнічний коледж, 2021, електромонтажник"
            multiline
          />
          <FormField
            label="Фактичне місце проживання"
            value={form.actualAddress}
            onChange={(v) => updateField("actualAddress", v)}
            placeholder="м. Житомир, вул. Перемоги 15, кв. 42"
          />
          <FormField
            label="Місце прописки"
            value={form.registrationAddress}
            onChange={(v) => updateField("registrationAddress", v)}
            placeholder="м. Житомир, вул. Перемоги 15, кв. 42"
          />
          <FormField
            label="Посвідчення водія (категорія)"
            value={form.driverLicense}
            onChange={(v) => updateField("driverLicense", v)}
            placeholder="B, C"
          />
          <FormField
            label="Судимість"
            value={form.criminalRecord}
            onChange={(v) => updateField("criminalRecord", v)}
            placeholder="Немає"
          />
          <FormField
            label="Приводи в поліцію / адмін-порушення"
            value={form.policeRecords}
            onChange={(v) => updateField("policeRecords", v)}
            placeholder="Немає"
          />
          <FormField
            label="Склад сім'ї (члени родини), їх адреса проживання"
            value={form.family}
            onChange={(v) => updateField("family", v)}
            placeholder="Мати: Ковальчук О.М., м. Житомир..."
            multiline
          />
          <FormField
            label="Номер телефону (особистий)"
            value={form.phone}
            onChange={(v) => updateField("phone", v)}
            placeholder="+380 50 111 22 33"
            type="tel"
          />
          <FormField
            label="Номери телефонів близьких родичів"
            value={form.relativePhones}
            onChange={(v) => updateField("relativePhones", v)}
            placeholder="Мати: +380 67 111 22 33"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Додатково</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <FormField
            label="Особисте розпорядження"
            value={form.personalOrder}
            onChange={(v) => updateField("personalOrder", v)}
            placeholder="Без розпоряджень"
          />
          <FormField
            label="Яким РТЦК та СП призваний"
            value={form.conscription}
            onChange={(v) => updateField("conscription", v)}
            placeholder="Житомирським РТЦК та СП"
          />
          <FormField
            label="Стан здоров'я"
            value={form.health}
            onChange={(v) => updateField("health", v)}
            placeholder="Задовільний"
            multiline
          />
          <FormField
            label="Скарги на здоров'я"
            value={form.healthComplaints}
            onChange={(v) => updateField("healthComplaints", v)}
            placeholder="Немає"
            multiline
          />
          <FormField
            label="Морально-психологічний стан"
            value={form.moralState}
            onChange={(v) => updateField("moralState", v)}
            placeholder="Стабільний, стресостійкий"
          />
          <FormField
            label="Група крові"
            value={form.bloodType}
            onChange={(v) => updateField("bloodType", v)}
            placeholder="A(II) Rh+"
          />
          <FormField
            label="Розмір взуття"
            value={form.shoeSize}
            onChange={(v) => updateField("shoeSize", v)}
            placeholder="43"
          />
          <FormField
            label="Особливі примітки"
            value={form.notes}
            onChange={(v) => updateField("notes", v)}
            placeholder="..."
            multiline
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" size="lg" disabled={isLoading} className="gap-2">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isLoading ? "Збереження..." : "Зберегти анкету"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/bzvp")}
          disabled={isLoading}
        >
          Скасувати
        </Button>
      </div>
    </form>
  );
}
