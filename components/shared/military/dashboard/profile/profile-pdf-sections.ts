export type PdfSectionId =
  | "personal"
  | "contacts"
  | "positionHistory"
  | "achievements"
  | "equipment"
  | "medical"
  | "clothingSizes";

export interface PdfSectionDef {
  id: PdfSectionId;
  label: string;
}

export const PDF_SECTIONS: PdfSectionDef[] = [
  { id: "personal", label: "Основні дані" },
  { id: "contacts", label: "Контакти" },
  { id: "positionHistory", label: "Історія посад" },
  { id: "achievements", label: "Нагороди та відзнаки" },
  { id: "equipment", label: "Майно держави" },
  { id: "medical", label: "Медичні записи" },
  { id: "clothingSizes", label: "Розміри одягу" },
];

export const ALL_SECTIONS: PdfSectionId[] = PDF_SECTIONS.map((s) => s.id);
