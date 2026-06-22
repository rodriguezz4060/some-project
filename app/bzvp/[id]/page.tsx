import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BzvpPdfWrapper } from "@/components/shared/bzvp/bzvp-pdf-wrapper";
import { BZVP_MOCK } from "@/components/shared/bzvp/mock";
import { BZVP_STATUS_CONFIG } from "@/components/shared/bzvp/constants";
import { cn } from "@root/lib/utils";
import type { BzvpPersonnel } from "@/components/shared/bzvp/types";

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0]).join("");
}

interface FieldProps {
  label: string;
  value?: string | null;
}

function Field({ label, value }: FieldProps) {
  if (!value) return null;
  return (
    <div>
      <span className="block text-[11px] uppercase tracking-widest text-muted-foreground/80">
        {label}
      </span>
      <span className="block text-sm font-medium mt-1 leading-snug">
        {value}
      </span>
    </div>
  );
}

export default async function BzvpProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = BZVP_MOCK.find((p) => p.id === id) as BzvpPersonnel | undefined;

  if (!person) {
    notFound();
  }

  const statusInfo = BZVP_STATUS_CONFIG[person.status];

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/bzvp"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        До списку БЗВП
      </Link>

      {/* Hero section: large photo + main data */}
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="shrink-0">
          <div className="size-44 rounded-xl ring-1 ring-primary/10 overflow-hidden bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
            {person.photo ? (
              <Image
                src={person.photo}
                alt={person.fullName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="text-primary font-semibold text-3xl">
                {getInitials(person.fullName)}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <Badge
            variant="outline"
            className={cn("font-medium", statusInfo.badge)}
          >
            {statusInfo.label}
          </Badge>

          <Field label="Військове звання" value={person.rank} />
          <Field label="ПІБ" value={person.fullName} />
          <Field
            label="Дата та місце народження"
            value={[person.birthDate, person.birthPlace].filter(Boolean).join(", ")}
          />
          <Field
            label="Серія та номер паспорту, коли і ким виданий"
            value={[person.passport, person.passportIssued].filter(Boolean).join(", ")}
          />
          <Field label="ІПН" value={person.tin} />
          <Field
            label="№ військового квитка, коли та ким виданий"
            value={[person.militaryId, person.militaryIdIssued].filter(Boolean).join(", ")}
          />
          <Field
            label="УБД та дата видачі"
            value={person.ubd === "Так" ? `Так, ${person.ubdDate}` : person.ubd}
          />
        </div>
      </div>

      {/* Rest of the fields in a card */}
      <Card className="relative">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-6">
          <Field
            label="Воєнна частина (В/ч) та роки проходження служби"
            value={[person.serviceUnit, person.serviceYears].filter(Boolean).join(", ")}
          />
          <Field label="Цивільна робота, фах" value={person.civilianJob} />
          <Field
            label="Які навчальні заклади закінчив, у якому році, спеціальність"
            value={person.education}
          />
          <Field label="Фактичне місце проживання" value={person.actualAddress} />
          <Field label="Місце прописки" value={person.registrationAddress} />
          <Field label="Посвідчення водія (категорія)" value={person.driverLicense} />
          <Field label="Судимість" value={person.criminalRecord} />
          <Field label="Приводи в поліцію / адмін-порушення" value={person.policeRecords} />
          <Field label="Склад сім'ї (члени родини), їх адреса проживання" value={person.family} />
          <Field
            label="Номера телефонів (особистий, близьких родичів)"
            value={[person.phone, person.relativePhones].filter(Boolean).join("; ")}
          />
          <Field label="Особисте розпорядження" value={person.personalOrder} />
          <Field label="Яким РТЦК та СП призваний" value={person.conscription} />
          <Field
            label="Стан здоров'я, скарги на здоров'я"
            value={[person.health, person.healthComplaints].filter(Boolean).join(". ")}
          />
          <Field label="Морально-психологічний стан" value={person.moralState} />
          <Field label="Група крові" value={person.bloodType} />
          <Field label="Розмір взуття" value={person.shoeSize} />
          <Field label="Особливі примітки" value={person.notes} />
        </CardContent>
        <div className="hidden md:block absolute top-6 bottom-6 left-1/2 -translate-x-1/2 w-px bg-border" />
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button variant="default" size="sm" disabled>
          Перевести в штат
        </Button>
        <BzvpPdfWrapper personnel={person} />
      </div>
    </div>
  );
}
