import type { Metadata } from "next";
import { ImportClient } from "./import-client";

export const metadata: Metadata = {
  title: "Імпорт BZVP | 23 ОМБр",
};

export default function BzvpImportPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Імпорт даних BZVP</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Завантажте Excel-файл з даними особового складу. Підтримуються .xlsx, .xls, .csv
        </p>
      </div>
      <ImportClient />
    </div>
  );
}
