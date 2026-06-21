"use client";

import { useState, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ProfilePdfDocument } from "./profile-pdf-document";
import { PDF_SECTIONS, ALL_SECTIONS } from "./profile-pdf-sections";
import type { PdfSectionId } from "./profile-pdf-sections";
import type { MilitaryPersonnel } from "../../types";

interface Props {
  personnel: MilitaryPersonnel;
}

export function ProfilePdfButton({ personnel }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<PdfSectionId[]>([...ALL_SECTIONS]);

  const toggleSection = useCallback((id: PdfSectionId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => (prev.length === ALL_SECTIONS.length ? [] : [...ALL_SECTIONS]));
  }, []);

  const handleDownload = useCallback(async () => {
    setIsLoading(true);
    try {
      const pdfInstance = pdf(
        <ProfilePdfDocument personnel={personnel} sections={selected} />,
      );
      const blob = await pdfInstance.toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${personnel.fullName.replace(/\s+/g, "_")}_особова_справа.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [personnel, selected]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <FileDown className="size-4" />
          PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Експорт PDF</DialogTitle>
          <DialogDescription>
            Виберіть розділи для включення в документ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-4">
          <Label className="flex cursor-pointer items-center gap-2 pb-1 border-b border-border">
            <Checkbox
              checked={selected.length === ALL_SECTIONS.length}
              onCheckedChange={toggleAll}
            />
            <span className="text-sm font-medium">Усі розділи</span>
          </Label>

          {PDF_SECTIONS.map((section) => (
            <Label
              key={section.id}
              className="flex cursor-pointer items-center gap-2"
            >
              <Checkbox
                checked={selected.includes(section.id)}
                onCheckedChange={() => toggleSection(section.id)}
              />
              <span className="text-sm">{section.label}</span>
            </Label>
          ))}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" disabled={isLoading}>
              Скасувати
            </Button>
          </DialogClose>
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={isLoading || selected.length === 0}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? "Генерація..." : "Завантажити PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
