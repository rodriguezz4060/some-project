import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BzvpPdfWrapper } from "@/components/shared/bzvp/pdf/bzvp-pdf-wrapper";
import { BZVP_MOCK } from "@/components/shared/bzvp/mock";
import { BZVP_STATUS_CONFIG } from "@/components/shared/bzvp/constants";
import { cn } from "@root/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const person = BZVP_MOCK.find((p) => p.id === id);
  return { title: person?.fullName ?? "Профіль БЗВП" };
}

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
      <span className="block text-xs uppercase tracking-widest text-muted-foreground/80">
        {label}
      </span>
      <span className="block text-base font-medium mt-1 leading-snug">
        {value}
      </span>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-4 pb-2 border-b border-border/40">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {children}
      </div>
    </div>
  );
}

export default async function BzvpProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = BZVP_MOCK.find((p) => p.id === id);

  if (!person) {
    notFound();
  }

  const statusInfo = BZVP_STATUS_CONFIG[person.status];

  return (
    <div>
      <div className="sticky top-[68px] z-10 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="px-6 py-3 flex items-center justify-between">
          <Link
            href="/bzvp"
            className="inline-flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            До списку БЗВП
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-foreground/80 hidden sm:inline">
              {person.fullName}
            </span>
            <Badge
              variant="outline"
              className={cn("font-medium text-xs", statusInfo.badge)}
            >
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-6 sm:flex-row pt-2">
          <div className="shrink-0 flex justify-center sm:justify-start">
            <div className="size-28 sm:size-36 md:size-44 rounded-xl ring-1 ring-primary/10 overflow-hidden bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
              {person.photo ? (
                <Image
                  src={person.photo}
                  alt={person.fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-primary font-semibold text-2xl sm:text-3xl md:text-4xl">
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

        <Card>
          <CardContent className="pt-6 space-y-8">
            <Section title="Служба та освіта">
              <Field
                label="Воєнна частина (В/ч) та роки служби"
                value={[person.serviceUnit, person.serviceYears].filter(Boolean).join(", ")}
              />
              <Field label="Цивільна робота, фах" value={person.civilianJob} />
              <Field label="Освіта" value={person.education} />
              <Field label="Яким РТЦК та СП призваний" value={person.conscription} />
            </Section>

            <Section title="Адреси та контакти">
              <Field label="Фактичне місце проживання" value={person.actualAddress} />
              <Field label="Місце прописки" value={person.registrationAddress} />
              <Field label="Телефон (особистий)" value={person.phone} />
              <Field label="Телефони близьких родичів" value={person.relativePhones} />
              <Field label="Склад сім'ї" value={person.family} />
            </Section>

            <Section title="Правовий статус">
              <Field label="Посвідчення водія (категорія)" value={person.driverLicense} />
              <Field label="Судимість" value={person.criminalRecord} />
              <Field label="Приводи в поліцію / адмін-порушення" value={person.policeRecords} />
              <Field label="Особисте розпорядження" value={person.personalOrder} />
            </Section>

            <Section title="Медицина">
              <Field
                label="Стан здоров'я"
                value={[person.health, person.healthComplaints].filter(Boolean).join(". ")}
              />
              <Field label="Морально-психологічний стан" value={person.moralState} />
              <Field label="Група крові" value={person.bloodType} />
              <Field label="Розмір взуття" value={person.shoeSize} />
              <Field label="Особливі примітки" value={person.notes} />
            </Section>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button variant="default" size="sm" disabled>
                  Перевести в штат
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              Функція ще не реалізована
            </TooltipContent>
          </Tooltip>
          <BzvpPdfWrapper personnel={person} />
        </div>
      </div>
    </div>
  );
}
